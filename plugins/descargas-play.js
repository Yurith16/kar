import axios from 'axios'
import yts from 'yt-search'
import { checkReg } from '../lib/checkReg.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender]

    // 1. Verificación de registro
    if (await checkReg(m, user)) return

    // 2. Reacción de duda y ayuda si no hay texto
    if (!text) {
        await m.react('🤔')
        return m.reply(`> ¿Qué melodía desea probar hoy, cielo?`)
    }

    try {
        // Reacción inicial de procesamiento
        await m.react('🎧')

        let videoUrl = text;
        let videoInfo = null;

        // Búsqueda en YouTube
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

        // --- RESTRICCIÓN DE MEDIA HORA (1800 SEGUNDOS) ---
        if (duration.seconds > 1800) {
            await m.react('❌');
            return m.reply(`> 🌪️ *Vaya drama...* La melodía excede los 30 minutos permitidos, corazón.`);
        }

        // --- DISEÑO DE DETALLES KARBOT ---
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

        let audioData;
        let success = false;

        // === MOTOR 1: API PRINCETECHN ===
        try {
            const apiUrl = `https://api.princetechn.com/api/download/yta?apikey=prince&url=${encodeURIComponent(videoUrl)}`;
            const { data } = await axios.get(apiUrl);

            if (data.success && data.result?.download_url) {
                const audioResponse = await axios.get(data.result.download_url, { responseType: 'arraybuffer' });
                audioData = audioResponse.data;
                success = true;
            }
        } catch (e) {
            console.log('API PrinceTechn falló...');
        }

        // === MOTOR 2: API ANANTA (Backup) ===
        if (!success) {
            try {
                const resAnanta = await axios({
                    method: 'get',
                    url: `https://api.ananta.qzz.io/api/yt-mp3?url=${encodeURIComponent(videoUrl)}`,
                    headers: { "x-api-key": "antebryxivz14" },
                    responseType: 'arraybuffer',
                    timeout: 30000 
                });
                if (resAnanta.data) {
                    audioData = resAnanta.data;
                    success = true;
                }
            } catch (e) {
                console.log('API Ananta falló...');
            }
        }

        if (success && audioData) {
            const safeTitle = `${title.substring(0, 50)}`.replace(/[<>:"/\\|?*]/g, '');

            await conn.sendMessage(m.chat, {
                document: audioData,
                mimetype: 'audio/mpeg',
                fileName: `${safeTitle}.mp3`
            }, { quoted: m });

            await m.react('✅');
        } else {
            throw new Error('Sin audio');
        }

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