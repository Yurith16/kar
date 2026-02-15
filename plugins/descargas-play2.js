const axios = require('axios');
const yts = require('yt-search');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const { checkReg } = require('../lib/checkReg.js');

// Configuración de FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

// Control de descargas activas por usuario
const activeVideoDownloads = new Map();

// Scraper usando la API de PrinceTech para videos
const ytdlVideoScraper = async (videoUrl) => {
    try {
        console.log(`[YTDL-Video] Solicitando info para: ${videoUrl}`);
        
        // Construir URL de la API para video
        const apiUrl = `https://api.princetechn.com/api/download/ytv?apikey=prince&url=${encodeURIComponent(videoUrl)}`;
        
        const response = await axios.get(apiUrl);
        
        if (!response.data || !response.data.success) {
            throw new Error('Error en la respuesta de la API');
        }
        
        const result = response.data.result;
        
        return {
            title: result.title,
            thumbnail: result.thumbnail,
            duration: result.duration,
            quality: result.quality,
            download_url: result.download_url,
            download_status: 'ready'
        };
        
    } catch (error) {
        console.error('[YTDL-Video Error Detallado]:', error);
        throw new Error(`Error al procesar: ${error.message}`);
    }
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    if (await checkReg(m, user)) return;

    if (!text) {
        await m.react('🤔');
        return m.reply(`> ¿Qué video desea ver hoy, cielo?`);
    }

    if (activeVideoDownloads.has(userId)) {
        await m.react('⏳');
        return m.reply(`> ⏳ *¡Paciencia, corazón!* Estoy procesando tu video.`);
    }

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const tempRaw = path.join(tmpDir, `raw_video_${Date.now()}`);
    const tempProcessed = path.join(tmpDir, `video_${Date.now()}.mp4`);

    try {
        activeVideoDownloads.set(userId, true);
        await m.react('🔍');

        let videoUrl = text;
        let videoInfo = null;

        // Si no es URL, buscar en YouTube
        if (!text.includes('youtu.be') && !text.includes('youtube.com')) {
            const search = await yts(text);
            if (!search.videos.length) {
                activeVideoDownloads.delete(userId);
                await m.react('💨');
                return m.reply(`> ⚡ *Cariño, no encontré nada.*`);
            }
            videoInfo = search.videos[0];
            videoUrl = videoInfo.url;
        } else {
            // Es una URL directa
            const videoId = videoUrl.split('v=')[1]?.split('&')[0] || 
                            videoUrl.split('youtu.be/')[1]?.split('?')[0] ||
                            videoUrl.split('/').pop().split('?')[0];
            
            if (!videoId) {
                activeVideoDownloads.delete(userId);
                await m.react('💨');
                return m.reply(`> ⚡ *Enlace inválido, corazón.*`);
            }
            const search = await yts({ videoId });
            videoInfo = search;
        }

        const { title, author, duration, views, ago, thumbnail, url } = videoInfo;

        // Restricción de 30 minutos
        if (duration.seconds > 1800) {
            await m.react('❌');
            activeVideoDownloads.delete(userId);
            return m.reply(`> 🌪️ *El video excede los 30 minutos permitidos, corazón.*`);
        }

        // --- MISMO DISEÑO DE PLAY ---
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

        await m.react('📥');

        // Obtener URL de descarga de la API
        const result = await ytdlVideoScraper(videoUrl);
        const downloadUrl = result.download_url;

        // Descargar el video sin procesar
        const response = await axios({ 
            url: downloadUrl, 
            method: 'GET', 
            responseType: 'stream', 
            timeout: 300000 // 5 minutos para videos grandes
        });
        
        const writer = fs.createWriteStream(tempRaw);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await m.react('⚙️');

        // Procesar con ffmpeg para garantizar compatibilidad con WhatsApp
        await new Promise((resolve, reject) => {
            ffmpeg(tempRaw)
                .videoCodec('libx264')
                .audioCodec('aac')
                .audioBitrate(128)
                .videoBitrate(1024)
                .size('?720x?') // Mantener proporción, altura máxima 720p
                .autopad()
                .on('end', resolve)
                .on('error', (err) => {
                    console.error('[FFmpeg Error]:', err);
                    // Si falla la conversión, intentar enviar el original
                    resolve();
                })
                .save(tempProcessed);
        });

        await m.react('📦');

        // Verificar si el procesado existe, si no usar el raw
        const finalVideoPath = fs.existsSync(tempProcessed) ? tempProcessed : tempRaw;
        const videoBuffer = fs.readFileSync(finalVideoPath);
        const safeTitle = title.substring(0, 50).replace(/[<>:"/\\|?*]/g, '');

        await conn.sendMessage(m.chat, {
            video: videoBuffer, // Usamos video en lugar de document para mejor compatibilidad
            caption: `> ✅ *Video procesado: ${title.substring(0, 30)}...*`,
            mimetype: 'video/mp4'
        }, { quoted: m });

        await m.react('✅');

    } catch (error) {
        console.error('[KarBot Video Error]:', error.message);
        await m.react('❌');
        await m.reply(`> 🌪️ *Vaya drama...* No pude procesar el video. Inténtalo más tarde, cielo.`);
    } finally {
        activeVideoDownloads.delete(userId);
        // Limpieza de archivos
        if (fs.existsSync(tempRaw)) fs.unlinkSync(tempRaw);
        if (fs.existsSync(tempProcessed)) fs.unlinkSync(tempProcessed);
    }
};

handler.help = ['play2'];
handler.tags = ['downloader'];
handler.command = ['play2', 'video'];
handler.group = true;

module.exports = handler;