import fetch from 'node-fetch'
import cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

// =================================================================
// 🔥 CONFIGURACIÓN KARBOT - MENSAJES ATREVIDOS XVIDEOS 🔥
// =================================================================
const NSFW_ATREVIDO_XVIDEOS = {
    buscando_descargando: "🤫 ¡Espera! Estoy entrando a Xvideos para succionar ese clip prohibido. *Mantenlo en secreto*. ⏳",
    exito: "🔥 *¡Aquí está tu placer!* El objeto del deseo fue entregado. ¡A disfrutar! 😉",
    sin_argumentos: "🥵 Veo que tienes prisa. Para empezar la acción, dame el *enlace* directo. ¡No seas tímido! 😌",
    error_no_encontrado: "❌ Falló la descarga... el video parece ser demasiado *esquivo* o el enlace es inválido. 😈",
    error_nsfw_off: "⛔ ¡ALTO! El burdel digital está cerrado. El modo prohibido está apagado. 😞",
    error_general: "💔 Algo se ha roto en el proceso... Me han *pillado* o la conexión falló. 🥺",
};

/**
 * Scraper de Xvideos
 */
async function xvideosdl(url) {
    return new Promise((resolve, reject) => {
        fetch(url, { method: "get" })
            .then((res) => res.text())
            .then((res) => {
                let $ = cheerio.load(res, { xmlMode: false });
                let url_high = $("#html5video > #html5video_base > div > a").attr("href");

                if (!url_high) {
                    const scriptText = $("body script").get().map((s) => $(s).html()).join("");
                    const urlMatch = scriptText.match(/setVideoUrlHigh\('(.*?)'\)/i);
                    if (urlMatch && urlMatch[1]) {
                        url_high = urlMatch[1].replace(/\\/g, "");
                    }
                }

                if (!url_high) return reject(new Error("No URL found"));

                const title = $("meta[property='og:title']").attr("content") || "Video Xvideos";
                resolve({ status: 200, result: { title, url: url_high } });
            })
            .catch(reject);
    });
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Verificación NSFW en Base de Datos de Karbot
    let chat = global.db.data.chats[m.chat];
    if (!chat.nsfw) {
        await conn.sendMessage(m.chat, { react: { text: '🔞', key: m.key } });
        return m.reply(`╭━━━〔 🔞 𝙽𝚂𝙵𝚆 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾 〕━━━⬣\n║\n║ ⚠️ ${NSFW_ATREVIDO_XVIDEOS.error_nsfw_off}\n║ 𝙰𝚌𝚝í𝚟𝚊𝚕𝚘 𝚌𝚘𝚗: *${usedPrefix}on nsfw*\n║\n╰━━━━━━━━━━━━━━━━━━━━━━⬣`);
    }

    let link = args[0];
    if (!link || !link.startsWith("http")) {
        await conn.sendMessage(m.chat, { react: { text: '🥵', key: m.key } });
        return m.reply(`> ✦ *Error:* » ${NSFW_ATREVIDO_XVIDEOS.sin_argumentos}\n> ⴵ *Ejemplo:* » ${usedPrefix}${command} https://www.xvideos.com/video70389849/...`);
    }

    // 2. Reacción de inicio
    await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });
    m.reply(`> 💫 *Estado:* » ${NSFW_ATREVIDO_XVIDEOS.buscando_descargando}`);

    try {
        const res = await xvideosdl(link);
        const downloadUrl = res.result.url;
        const videoTitle = res.result.title;

        // 3. Reacción de proceso
        await conn.sendMessage(m.chat, { react: { text: "👅", key: m.key } });

        const finalCaption = `╭━━〔 🔥 *𝚇𝚅𝙸𝙳𝙴𝙾𝚂 𝙳𝙻* 〕━━╮\n║\n║ 🫦 ${NSFW_ATREVIDO_XVIDEOS.exito}\n║\n║ 🎬 *𝚃í𝚝𝚞𝚕𝚘:* ${videoTitle}\n║\n╰━━━━━━━━━━━━━━━━━━━━━━⬣`;

        // 4. Reacción de subida
        await conn.sendMessage(m.chat, { react: { text: "⬆️", key: m.key } });

        // Enviar como video directamente usando la URL de los servidores de Xvideos
        await conn.sendMessage(m.chat, {
            video: { url: downloadUrl },
            caption: finalCaption,
            mimetype: 'video/mp4',
            fileName: `${videoTitle}.mp4`
        }, { quoted: m });

        // 5. Reacción final de éxito
        await conn.sendMessage(m.chat, { react: { text: "💦", key: m.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`> 💔 *Fallo:* » ${NSFW_ATREVIDO_XVIDEOS.error_no_encontrado}`);
    }
};

handler.help = ['xvideosdl <link>'];
handler.tags = ['NSFW'];
handler.command = /^(xvideosdl|xvdl|xvideos)$/i;

export default handler;