import axios from 'axios'
import yts from 'yt-search'
import { checkReg } from '../lib/checkReg.js'

// Control de descargas activas
let descargaActiva = false

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender]

    if (await checkReg(m, user)) return

    if (!text) {
        await m.react('🤔')
        return m.reply(`> ¿Qué video desea descargar hoy, cielo?`)
    }

    // Verificar si ya hay una descarga en curso
    if (descargaActiva) {
        await m.react('⏳')
        return m.reply(`> ⏳ *¡Paciencia, corazón!* Ya estoy procesando un video. Espera a que termine.`)
    }

    try {
        descargaActiva = true
        await m.react('🎬')

        let videoUrl = text;
        let videoInfo = null;

        if (!text.includes('youtu.be') && !text.includes('youtube.com')) {
            const search = await yts(text);
            if (!search.videos.length) {
                descargaActiva = false
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

        // RESTRICCIÓN DE DURACIÓN: 10 MINUTOS (600 segundos)
        if (duration.seconds > 600) {
            descargaActiva = false
            await m.react('❌');
            return m.reply(`> 🌪️ *El video es muy largo, corazón. Máximo 10 minutos.*`);
        }

        const videoDetails = `> 🎬 *「🌱」 ${title}*\n\n` +
            `> 🍃 *Canal:* » ${author.name}\n` +
            `> ⚘ *Duración:* » ${duration.timestamp}\n` +
            `> 🌼 *Vistas:* » ${(views || 0).toLocaleString()}\n` +
            `> 🍀 *Publicado:* » ${ago || 'Reciente'}\n` +
            `> 🌿 *Enlace:* » ${url}`;

        await conn.sendMessage(m.chat, {
            image: { url: thumbnail },
            caption: videoDetails
        }, { quoted: m });

        await m.react('⬇️');

        // === API PARA VIDEO ===
        const apiResponse = await axios.get(`https://api-aswin-sparky.koyeb.app/api/downloader/ytv?url=${encodeURIComponent(videoUrl)}`, {
            timeout: 30000
        });
        
        if (!apiResponse.data?.status || !apiResponse.data?.data?.url) {
            throw new Error('Servicio no disponible');
        }

        const videoDownloadUrl = apiResponse.data.data.url;

        const videoResponse = await axios.get(videoDownloadUrl, { 
            responseType: 'arraybuffer',
            timeout: 90000 // 90 segundos para videos largos
        });

        const videoData = videoResponse.data;

        // ENVIAR COMO VIDEO NORMAL
        await conn.sendMessage(m.chat, {
            video: videoData,
            caption: `> ✅ *¡Video descargado, corazón!*\n> 🎬 ${title}`,
            mimetype: 'video/mp4'
        }, { quoted: m });

        await m.react('✅');

    } catch (error) {
        console.error('[Video Error]:', error.message);
        await m.react('❌');
        await m.reply(`> 🌪️ *Vaya drama...* Hubo un fallo técnico y no pude obtener el video.`);
    } finally {
        // Siempre liberar el control de descarga
        descargaActiva = false
    }
}

handler.help = ['ytv']
handler.tags = ['downloader']  
handler.command = ['play2', 'ytmp4']
handler.group = true

export default handler