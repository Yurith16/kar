import axios from 'axios'
import yts from 'yt-search'
import { checkReg } from '../lib/checkReg.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender]

    if (await checkReg(m, user)) return

    if (!text) {
        await m.react('🤔')
        return m.reply(`> ¿Qué melodía desea probar hoy, cielo?`)
    }

    try {
        await m.react('🎧')

        let videoUrl = text;
        let videoInfo = null;

        if (!text.includes('youtu.be') && !text.includes('youtube.com')) {
            const search = await yts(text);
            if (!search.videos.length) {
                await m.react('💨');
                return m.reply(`> ⚡ *Cariño, no encontré nada.*`);
            }
            videoInfo = search.videos[0];
            videoUrl = videoInfo.url;
        } else {
            const videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('youtu.be/')[1]?.split('?')[0];
            const search = await yts({ videoId });
            videoInfo = search.videos[0];
        }

        const { title, author, duration, views, ago, thumbnail, url } = videoInfo;

        if (duration.seconds > 1800) {
            await m.react('❌');
            return m.reply(`> 🌪️ *Vaya drama...* La melodía excede los 30 minutos permitidos, corazón.`);
        }

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

        // SOLO LA API DE ANANTA QUE YA FUNCIONA
        const apiUrl = `https://api.ananta.qzz.io/api/yt-dl?url=${encodeURIComponent(videoUrl)}&format=mp3`;
        const { data: res } = await axios.get(apiUrl, {
            headers: { "x-api-key": "antebryxivz14" },
            responseType: 'arraybuffer',
            timeout: 30000 
        });

        if (!res || res.byteLength < 1000) throw new Error('API Error');

        const safeTitle = `${title.substring(0, 50)}`.replace(/[<>:"/\\|?*]/g, '');

        await conn.sendMessage(m.chat, {
            document: res,
            mimetype: 'audio/mpeg',
            fileName: `${safeTitle}.mp3`
        }, { quoted: m });

        await m.react('✅');

    } catch (e) {
        console.error('Error en KarBot Play:', e);
        await m.react('❌');
        await m.reply(`> 🌪️ *Vaya drama...* Hubo un fallo técnico y no pude obtener tu música. Inténtalo más tarde.`);
    }
}

handler.help = ['play']
handler.tags = ['downloader']  
handler.command = ['play']
handler.group = true

export default handler