const yts = require("yt-search");
const {
    proto,
    generateWAMessageFromContent,
    prepareWAMessageMedia,
} = require("@whiskeysockets/baileys");
const { checkReg } = require("../lib/checkReg.js");
const descargas = require('./descargas-activas.js');

let handler = async (m, { conn, text, usedPrefix }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    if (await checkReg(m, user)) return;

    if (!text) {
        await m.react("🤔");
        return m.reply(`> *¿Qué desea buscar hoy, tesoro?*`);
    }

    if (descargas.tieneDescargasActivas(userId)) {
        await m.react('⏳');
        return m.reply(`> ⏳ *Ya tienes una descarga activa, espera.*`);
    }

    try {
        descargas.registrarDescarga(userId, 'play');
        await m.react("🔍");

        const search = await yts(text);
        if (!search.videos.length) throw new Error("No encontrado");
        const video = search.videos[0];

        const { title, author, duration, views, ago, thumbnail, url } = video;

        const mediaMsg = await prepareWAMessageMedia(
            { image: { url: thumbnail } },
            { upload: conn.waUploadToServer },
        );

        const fullText =
            `> 🎬 *「🌱」 ${title}*\n\n` +
            `> 🍃 *Canal:* » ${author.name}\n` +
            `> ⚘ *Duración:* » ${duration.timestamp}\n` +
            `> 🌼 *Vistas:* » ${(views || 0).toLocaleString()}\n` +
            `> 🍀 *Publicado:* » ${ago || 'Reciente'}\n` +
            `> 🌿 *Enlace:* » ${url}`;

        const interactiveMessage = proto.Message.InteractiveMessage.fromObject({
            body: { text: fullText },
            footer: { text: `⚙️ 𝙺𝙰𝚁 𝚂𝙸𝚂𝚃𝙴𝙼𝙰 𝙳𝚄𝙰𝙻 ⚙️` },
            header: {
                hasMediaAttachment: true,
                imageMessage: mediaMsg.imageMessage,
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: `🎵 Audio`,
                            id: `${usedPrefix}getaud ${url}`,
                        }),
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: `📂 Audio Doc`,
                            id: `${usedPrefix}getaud ${url} doc`,
                        }),
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: `🎥 Video Doc`,
                            id: `${usedPrefix}getvid ${url}`,
                        }),
                    },
                ],
            },
        });

        const messageContent = generateWAMessageFromContent(
            m.chat,
            {
                viewOnceMessage: { message: { interactiveMessage } },
            },
            { userJid: conn.user.jid, quoted: m },
        );

        await conn.relayMessage(m.chat, messageContent.message, {
            messageId: messageContent.key.id,
        });
        await m.react("✅");

    } catch (error) {
        await m.react("❌");
        m.reply(`> *Error en la búsqueda:* ${error.message}`);
    } finally {
        descargas.finalizarDescarga(userId);
    }
};

handler.tags = ['downloader'];
handler.help = ["play"];
handler.command = ["play"];
handler.group = true;
module.exports = handler;