import axios from 'axios'
import yts from 'yt-search'
import { checkReg } from '../lib/checkReg.js'

// Mapa para gestionar las descargas activas y evitar el abuso
let descargasActivas = new Set()

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender]

    // 1. Verificación de registro (Estilo KarBot)
    if (await checkReg(m, user)) return

    // 2. Control de abuso (Una descarga a la vez)
    if (descargasActivas.has(m.sender)) {
        return m.reply(`> ⚠️ *𝗗𝗘𝗧𝗘𝗡𝗧𝗘:* No abuses, cielo. Ya tienes una descarga en proceso. Espera a que termine para pedir otra melodía.`)
    }

    // 3. Ayuda humanizada
    if (!text) return m.reply(`> ¿Qué melodía desea probar hoy, cielo?`)

    try {
        // Añadir a descargas activas
        descargasActivas.add(m.sender)

        // Secuencia de reacciones 🔍🎵⚡⚙️
        const reacciones = ['🔍', '🎵', '⚡', '⚙️']
        for (const reacc of reacciones) {
            await m.react(reacc)
        }

        let videoUrl = text;
        let videoInfo = null;

        // Búsqueda en YouTube si no es enlace
        if (!text.includes('youtu.be') && !text.includes('youtube.com')) {
            const search = await yts(text);
            if (!search.videos.length) {
                descargasActivas.delete(m.sender);
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

        // === MOTOR 1: API PRINCETECHN (La nueva solicitada) ===
        try {
            const apiUrl = `https://api.princetechn.com/api/download/yta?apikey=prince&url=${encodeURIComponent(videoUrl)}`;
            const { data } = await axios.get(apiUrl);

            if (data.success && data.result?.download_url) {
                const audioResponse = await axios.get(data.result.download_url, { responseType: 'arraybuffer' });
                audioData = audioResponse.data;
                success = true;
            }
        } catch (e) {
            console.log('API PrinceTechn falló, intentando motor secundario...');
        }

        // === MOTOR 2: API ANANTA (Backup 1) ===
        if (!success) {
            try {
                const resAnanta = await axios({
                    method: 'get',
                    url: `https://api.ananta.qzz.io/api/yt-mp3?url=${encodeURIComponent(videoUrl)}`,
                    headers: { "x-api-key": "antebryxivz14" },
                    捧responseType: 'arraybuffer',
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
            // Limpiar nombre de archivo
            const safeTitle = `${title.substring(0, 50)}`.replace(/[<>:"/\\|?*]/g, '');

            // Enviar el audio como documento sin caption extra
            await conn.sendMessage(m.chat, {
                document: audioData,
                mimetype: 'audio/mpeg',
                fileName: `${safeTitle}.mp3`
            }, { quoted: m });

            await m.react('🔥');
        } else {
            throw new Error('No se pudo obtener el audio de ninguna API');
        }

    } catch (e) {
        console.error('Error en KarBot Play:', e);
        await m.react('❌');
        await m.reply(`> 🌪️ *Vaya drama...* Hubo un fallo técnico y no pude obtener tu música. Inténtalo más tarde, cielo.`);
    } finally {
        // Quitar de descargas activas siempre
        descargasActivas.delete(m.sender);
    }
}

handler.help = ['play', 'musica', 'song']
handler.tags = ['downloader']  
handler.command = ['play', 'musica', 'song', 'test', 'prueba']
handler.group = true

export default handler