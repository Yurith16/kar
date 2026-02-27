const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const { checkReg } = require('../lib/checkReg.js');

// Control de descargas activas por usuario
const activeAudioDownloads = new Map();

// Scraper usando la API de PrinceTech
const ytdlScraper = async (videoUrl) => {
    try {
        console.log(`[YTDL] Solicitando info para: ${videoUrl}`);
        
        // Construir URL de la API
        const apiUrl = `https://api.princetechn.com/api/download/yta?apikey=prince&url=${encodeURIComponent(videoUrl)}`;
        
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
        console.error('[YTDL Error Detallado]:', error);
        throw new Error(`Error al procesar: ${error.message}`);
    }
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    if (await checkReg(m, user)) return;

    if (!text) {
        await m.react('🤔');
        return m.reply(`> ¿Qué melodía desea escuchar hoy, cielo?`);
    }

    if (activeAudioDownloads.has(userId)) {
        await m.react('⏳');
        return m.reply(`> ⏳ *¡Paciencia, corazón!* Estoy procesando tu audio.`);
    }

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const tempAudio = path.join(tmpDir, `audio_${Date.now()}.mp3`);

    try {
        activeAudioDownloads.set(userId, true);
        await m.react('🔍');

        let videoUrl = text;
        let videoInfo = null;

        // Si no es URL, buscar en YouTube
        if (!text.includes('youtu.be') && !text.includes('youtube.com')) {
            const search = await yts(text);
            if (!search.videos.length) {
                activeAudioDownloads.delete(userId);
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
                activeAudioDownloads.delete(userId);
                await m.react('💨');
                return m.reply(`> ⚡ *Enlace inválido, corazón.*`);
            }
            const search = await yts({ videoId });
            videoInfo = search;
        }

        const { title, author, duration, views, ago, thumbnail, url } = videoInfo;

        // Restricción de 15 minutos
        if (duration.seconds > 900) {
            await m.react('❌');
            activeAudioDownloads.delete(userId);
            return m.reply(`> 🌪️ *La melodía excede los 15 minutos permitidos, corazón.*`);
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

        await m.react('📥');

        // Obtener URL de descarga de la API
        const result = await ytdlScraper(videoUrl);
        const downloadUrl = result.download_url;

        // Descargar el audio
        const response = await axios({ 
            url: downloadUrl, 
            method: 'GET', 
            responseType: 'stream', 
            timeout: 120000
        });
        
        const writer = fs.createWriteStream(tempAudio);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await m.react('📦');

        const audioBuffer = fs.readFileSync(tempAudio);
        const safeTitle = title.substring(0, 50).replace(/[<>:"/\\|?*]/g, '');

        await conn.sendMessage(m.chat, {
            document: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${safeTitle}.mp3`
        }, { quoted: m });

        await m.react('✅');

    } catch (error) {
        console.error('[KarBot Audio Error]:', error.message);
        await m.react('❌');
        await m.reply(`> 🌪️ *Vaya drama...* No pude procesar el audio. Inténtalo más tarde, cielo.`);
    } finally {
        activeAudioDownloads.delete(userId);
        if (fs.existsSync(tempAudio)) fs.unlinkSync(tempAudio);
    }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = ['play'];
handler.group = true;

module.exports = handler;