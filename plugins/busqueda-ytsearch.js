const yts = require("yt-search");
const { checkReg } = require('../lib/checkReg.js');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    if (await checkReg(m, user)) return;

    if (!text) return m.reply(`> *「🧐」 YouTube Search*\n> ¿Qué desea buscar en YouTube?`);

    try {
        await m.react('🔍'); // buscando

        const results = await yts(text);

        if (!results || !results.videos.length) {
            await m.react('⚠️');
            return m.reply(`> No se encontraron resultados.`);
        }

        const videos = results.videos.slice(0, 5);

        await m.react('📥'); // descargando información

        for (const video of videos) {
            const { title, author, duration, views, ago, url, thumbnail } = video;
            
            const videoDetails = `> 🎵 *「🌱」 ${title}*\n\n` +
                `> 🍃 *Canal:* » ${author.name}\n` +
                `> ⚘ *Duración:* » ${duration.timestamp}\n` +
                `> 🌼 *Vistas:* » ${(views || 0).toLocaleString()}\n` +
                `> 🍀 *Publicado:* » ${ago || 'Reciente'}\n` +
                `> 🌿 *Enlace:* » ${url}`;

            await conn.sendMessage(m.chat, {
                image: { url: thumbnail },
                caption: videoDetails
            }, { quoted: m });
        }

        await m.react('✅'); // enviando (finalizado)

    } catch (e) {
        console.error(e);
        await m.react('✖️');
        m.reply(`> Lo siento, hubo un error.`);
    }
};

handler.help = ['yts <búsqueda>'];
handler.tags = ['downloader'];
handler.command = /^(yts|ytsearch)$/i;
handler.group = true;

module.exports = handler;