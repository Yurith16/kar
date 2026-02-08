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

        // RESTRICCIÓN DE 15 MINUTOS (900 segundos)
        if (duration.seconds > 900) {
            await m.react('❌');
            return m.reply(`> 🌪️ *La melodía excede los 15 minutos permitidos, corazón.*`);
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

        // === API SIN NOMBRE VISIBLE ===
        const apiResponse = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/song?search=${encodeURIComponent(videoUrl)}`, {
            timeout: 30000
        });
        
        if (!apiResponse.data?.status || !apiResponse.data?.data?.url) {
            throw new Error('Servicio no disponible');
        }

        const audioResponse = await axios.get(apiResponse.data.data.url, { 
            responseType: 'arraybuffer',
            timeout: 60000 
        });

        const audioData = audioResponse.data;

        const safeTitle = `${title.substring(0, 50)}`.replace(/[<>:"/\\|?*]/g, '');

        // ENVIAR COMO DOCUMENTO
        await conn.sendMessage(m.chat, {
            document: audioData,
            mimetype: 'audio/mpeg',
            fileName: `${safeTitle}.mp3`
        }, { quoted: m });

        await m.react('✅');

    } catch (error) {
        console.error('[Play Error]:', error.message); // Solo en consola
        await m.react('❌');
        await m.reply(`> 🌪️ *Vaya drama...* Hubo un fallo técnico y no pude obtener tu música. Inténtalo más tarde.`);
    }
}

handler.help = ['play']
handler.tags = ['downloader']  
handler.command = ['play', 'ytmp3']
handler.group = true

export default handler