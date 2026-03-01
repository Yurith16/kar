const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const { checkReg } = require('../lib/checkReg.js');

// Control de descargas activas por usuario (máximo 3)
const activeAudioDownloads = new Map();

// Axios optimizado
const axiosFast = axios.create({
    timeout: 300000,
    httpAgent: new (require('http').Agent)({ keepAlive: true, maxSockets: 20 }),
    httpsAgent: new (require('https').Agent)({ keepAlive: true, maxSockets: 20 }),
    headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity
});

// API PrinceTech (única)
const princeScraper = async (videoUrl) => {
    const apiUrl = `https://api.princetechn.com/api/download/yta?apikey=prince&url=${encodeURIComponent(videoUrl)}`;
    const response = await axiosFast.get(apiUrl, { timeout: 60000 });
    if (!response.data?.success) throw new Error('API_ERROR');
    return {
        title: response.data.result.title,
        download_url: response.data.result.download_url,
        thumbnail: response.data.result.thumbnail
    };
};

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    if (await checkReg(m, user)) return;

    const input = args[0] || text;

    if (!input) {
        await m.react('🧐');
        return m.reply(`> Ingresa el enlace de YouTube o nombre para buscar.`);
    }

    // Permitir hasta 3 descargas simultáneas por usuario
    const userDownloads = activeAudioDownloads.get(userId) || 0;
    if (userDownloads >= 3) {
        return m.reply(`> 🎵 *Ya tienes 3 descargas activas, espera un momento.*`);
    }

    try {
        // Incrementar contador de descargas del usuario
        activeAudioDownloads.set(userId, userDownloads + 1);
        await m.react('🔍');

        let videoUrl = input;
        let searchData = null;

        // Búsqueda rápida
        if (!input.includes('youtu.be') && !input.includes('youtube.com')) {
            const search = await yts(input);
            if (!search.videos.length) {
                activeAudioDownloads.set(userId, userDownloads);
                await m.react('💨');
                return m.reply(`> 🎵 *No encontré nada, corazón.*`);
            }
            const video = search.videos[0];
            videoUrl = video.url;
            searchData = {
                title: video.title,
                thumbnail: video.thumbnail,
                url: video.url
            };
        } else {
            const videoId = videoUrl.split('v=')[1]?.split('&')[0] || 
                            videoUrl.split('youtu.be/')[1]?.split('?')[0];
            if (!videoId) {
                activeAudioDownloads.set(userId, userDownloads);
                await m.react('💨');
                return m.reply(`> 🎵 *Enlace inválido, corazón.*`);
            }
            const search = await yts({ videoId });
            searchData = {
                title: search.title,
                thumbnail: search.thumbnail,
                url: videoUrl
            };
        }

        // Límite 3 horas
        const info = await yts(videoUrl);
        if (info?.duration?.seconds > 10800) {
            activeAudioDownloads.set(userId, userDownloads);
            await m.react('❌');
            return m.reply(`> 🎵 *El audio excede las 3 horas permitidas, corazón.*`);
        }

        await m.react('📥');

        // Descargar con PrinceTech
        const result = await princeScraper(videoUrl);

        // Descargar directo a buffer (sin archivo temporal)
        const response = await axiosFast({
            method: 'get',
            url: result.download_url,
            responseType: 'arraybuffer',
            timeout: 300000
        });

        const audioBuffer = Buffer.from(response.data);
        const safeTitle = (result.title || searchData.title).substring(0, 50).replace(/[<>:"/\\|?*]/g, '');
        const sizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(1);

        // Límite 650MB
        if (audioBuffer.length > 650 * 1024 * 1024) {
            throw new Error('TOO_LARGE');
        }

        await m.react('📦');

        // Enviar directo como documento (sin conversión)
        await conn.sendMessage(m.chat, {
            document: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${safeTitle}.mp3`,
            caption: searchData.url,
            contextInfo: {
                externalAdReply: {
                    title: `𝚈𝚘𝚞𝚃𝚞𝚋𝚎 𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍`,
                    body: `${searchData.title} • ${sizeMB} MB`,
                    thumbnailUrl: searchData.thumbnail,
                    sourceUrl: searchData.url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        await m.react('✅');

    } catch (e) {
        console.error('[YTMP3 Error]:', e.message);
        await m.react('❌');
        let msg = `> 🎵 *No pude procesar el audio, corazón.*`;
        if (e.message === 'TOO_LARGE') msg = `> 🎵 *Error:* El audio es demasiado pesado (máximo 650MB).`;
        m.reply(msg);
    } finally {
        // Decrementar contador
        const current = activeAudioDownloads.get(userId) || 1;
        activeAudioDownloads.set(userId, current - 1);
        if (activeAudioDownloads.get(userId) <= 0) activeAudioDownloads.delete(userId);
    }
};

handler.help = ['ytmp3 <url/texto>'];
handler.tags = ['downloader'];
handler.command = /^(ytmp3|audio|song)$/i;
handler.group = true;

module.exports = handler;