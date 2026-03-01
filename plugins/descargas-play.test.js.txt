const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const { checkReg } = require('../lib/checkReg.js');

// Control de descargas activas por usuario (máximo 3)
const activeAudioDownloads = new Map();

const ytdlScraper = async (videoUrl) => {
    const apiUrl = `https://api.princetechn.com/api/download/yta?apikey=prince&url=${encodeURIComponent(videoUrl)}`;
    const response = await axios.get(apiUrl);
    if (!response.data?.success) throw new Error('API_ERROR');
    return {
        title: response.data.result.title,
        download_url: response.data.result.download_url,
        thumbnail: response.data.result.thumbnail
    };
};

let handler = async (m, { conn, text }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    if (await checkReg(m, user)) return;
    if (!text) return m.reply(`> 🎵 *¿Qué melodía deseas escuchar, tesoro?*`);

    // Permitir hasta 3 descargas simultáneas por usuario
    const userDownloads = activeAudioDownloads.get(userId) || 0;
    if (userDownloads >= 3) {
        return m.reply(`> 🎵 *Ya tienes 3 descargas activas, espera un momento.*`);
    }

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const tempAudio = path.join(tmpDir, `audio_${Date.now()}.mp3`);

    try {
        // Incrementar contador de descargas del usuario
        activeAudioDownloads.set(userId, userDownloads + 1);
        await m.react('🔍');

        let videoUrl = text;
        let videoInfo = null;

        // Buscar o usar URL directa
        if (!text.includes('youtu.be') && !text.includes('youtube.com')) {
            const search = await yts(text);
            if (!search.videos.length) {
                activeAudioDownloads.set(userId, userDownloads);
                await m.react('💨');
                return m.reply(`> 🎵 *No encontré nada, corazón.*`);
            }
            videoInfo = search.videos[0];
            videoUrl = videoInfo.url;
        } else {
            const videoId = videoUrl.split('v=')[1]?.split('&')[0] || 
                            videoUrl.split('youtu.be/')[1]?.split('?')[0];
            if (!videoId) {
                activeAudioDownloads.set(userId, userDownloads);
                await m.react('💨');
                return m.reply(`> 🎵 *Enlace inválido, corazón.*`);
            }
            const search = await yts({ videoId });
            videoInfo = search;
        }

        const { title, duration, thumbnail, url } = videoInfo;

        // Límite 3 horas
        if (duration.seconds > 10800) {
            activeAudioDownloads.set(userId, userDownloads);
            await m.react('❌');
            return m.reply(`> 🎵 *La melodía excede las 3 horas permitidas, corazón.*`);
        }

        await m.react('📥');

        // Obtener URL de descarga
        const result = await ytdlScraper(videoUrl);

        // Descargar directo a buffer (más rápido, sin archivo temporal intermedio)
        const response = await axios({ 
            url: result.download_url, 
            method: 'GET', 
            responseType: 'arraybuffer',
            timeout: 300000
        });

        const audioBuffer = Buffer.from(response.data);
        const safeTitle = (result.title || title).substring(0, 50).replace(/[<>:"/\\|?*]/g, '');
        const sizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(1);

        await m.react('📦');

        // Enviar directo como documento (sin conversión)
        await conn.sendMessage(m.chat, {
            document: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${safeTitle}.mp3`,
            caption: url,
            contextInfo: {
                externalAdReply: {
                    title: `𝚈𝚘𝚞𝚃𝚞𝚋𝚎 𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍`,
                    body: `${title} • ${sizeMB} MB`,
                    thumbnailUrl: thumbnail,
                    sourceUrl: url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        await m.react('✅');

    } catch (error) {
        console.error('[play Error]:', error.message);
        await m.react('❌');
        await m.reply(`> 🎵 *No pude procesar el audio, corazón.*`);
    } finally {
        // Decrementar contador
        const current = activeAudioDownloads.get(userId) || 1;
        activeAudioDownloads.set(userId, current - 1);
        if (activeAudioDownloads.get(userId) <= 0) activeAudioDownloads.delete(userId);

        // Limpiar archivo si existe
        try { if (fs.existsSync(tempAudio)) fs.unlinkSync(tempAudio); } catch {}
    }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = ['play'];
handler.group = true;

module.exports = handler;