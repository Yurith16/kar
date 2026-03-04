/**
 * Song Downloader - Download audio from YouTube
 */

const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const APIs = require('../utils/api');
const { checkReg } = require('../lib/checkReg.js');

const activeDownloads = new Map();
const lastUsage = new Map();

const AXIOS_DEFAULTS = {
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
  }
};

let handler = async (m, { conn, text, args }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    // Sistema de registro
    if (await checkReg(m, user)) return;

    // Rate limiting: 5 segundos entre comandos
    const now = Date.now();
    const lastUse = lastUsage.get(userId) || 0;
    if (now - lastUse < 5000) {
        const wait = Math.ceil((5000 - (now - lastUse)) / 1000);
        return m.reply(`> ⏳ *Espera ${wait}s antes de usar el comando de nuevo.*`);
    }
    lastUsage.set(userId, now);

    if (activeDownloads.has(userId)) {
        return m.reply(`> ⏳ *Espera, ya proceso uno.*`);
    }

    const searchQuery = text || args.join(' ');

    if (!searchQuery || !searchQuery.trim()) {
        return m.reply(`> 🎵 *¿Qué canción deseas descargar?*`);
    }

    let video;

    try {
        activeDownloads.set(userId, true);
        await m.react('🔍');

        if (searchQuery.includes('youtube.com') || searchQuery.includes('youtu.be')) {
            video = { url: searchQuery };
            // Obtener info adicional
            const videoId = (searchQuery.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/) || [])[1];
            if (videoId) {
                const info = await yts({ videoId });
                video.title = info.title;
                video.thumbnail = info.thumbnail;
                video.timestamp = info.timestamp;
                video.duration = info.duration;
            }
        } else {
            const search = await yts(searchQuery);
            if (!search || !search.videos.length) throw new Error('No encontrado');
            video = search.videos[0];
        }

        // Validar duración (máximo 2 horas)
        if (video.duration && video.duration.seconds > 7200) {
            throw new Error('Muy largo');
        }

        const statusMsg = await conn.sendMessage(m.chat, {
            text: `> ⏳ *Procesando...*`
        }, { quoted: m });

        await m.react('📥');

        // Intentar múltiples APIs
        let audioData;
        let audioBuffer;
        let downloadSuccess = false;

        const apiMethods = [
            { name: 'EliteProTech', method: () => APIs.getEliteProTechDownloadByUrl(video.url) },
            { name: 'Yupra', method: () => APIs.getYupraDownloadByUrl(video.url) },
            { name: 'Okatsu', method: () => APIs.getOkatsuDownloadByUrl(video.url) },
            { name: 'Izumi', method: () => APIs.getIzumiDownloadByUrl(video.url) }
        ];

        for (const apiMethod of apiMethods) {
            try {
                audioData = await apiMethod.method();
                const audioUrl = audioData.download || audioData.dl || audioData.url || audioData.ytdl;

                if (!audioUrl) {
                    console.log(`[song] ${apiMethod.name} sin URL de descarga`);
                    continue;
                }

                // Descargar audio
                try {
                    const audioResponse = await axios.get(audioUrl, {
                        responseType: 'arraybuffer',
                        timeout: 90000,
                        maxContentLength: 100 * 1024 * 1024,
                        maxBodyLength: 100 * 1024 * 1024,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Accept': '*/*'
                        }
                    });
                    audioBuffer = Buffer.from(audioResponse.data);

                    if (audioBuffer && audioBuffer.length > 0) {
                        downloadSuccess = true;
                        break;
                    }
                } catch (downloadErr) {
                    console.log(`[song] Error descargando de ${apiMethod.name}:`, downloadErr.message);
                    continue;
                }
            } catch (apiErr) {
                console.log(`[song] ${apiMethod.name} API falló:`, apiErr.message);
                continue;
            }
        }

        if (!downloadSuccess || !audioBuffer) {
            throw new Error('SIN_LINK_DESCARGA');
        }

        // Verificar formato y convertir si es necesario
        let finalBuffer = audioBuffer;
        const firstBytes = audioBuffer.slice(0, 12);
        const hexSignature = firstBytes.toString('hex');
        const asciiSignature = firstBytes.toString('ascii', 4, 8);

        let fileExtension = 'mp3';

        if (asciiSignature === 'ftyp' || hexSignature.startsWith('000000')) {
            fileExtension = 'm4a';
        } else if (audioBuffer.toString('ascii', 0, 4) === 'OggS') {
            fileExtension = 'ogg';
        } else if (audioBuffer.toString('ascii', 0, 4) === 'RIFF') {
            fileExtension = 'wav';
        }

        // Si no es MP3, intentar convertir (si tienes la función toAudio)
        if (fileExtension !== 'mp3') {
            try {
                const { toAudio } = require('../utils/converter');
                finalBuffer = await toAudio(audioBuffer, fileExtension);
            } catch (convErr) {
                console.log('[song] Error conversión, usando buffer original');
                finalBuffer = audioBuffer;
            }
        }

        await conn.sendMessage(m.chat, {
            text: `> ✅ *Descarga completada, enviando...*`,
            edit: statusMsg.key
        });

        const sizeMB = (finalBuffer.length / 1024 / 1024).toFixed(1);

        await m.react('📤');

        // Enviar como documento MP3 (diseño play2)
        await conn.sendMessage(m.chat, {
            document: finalBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${(audioData.title || video.title || 'cancion').substring(0, 50).replace(/[<>:"/\\|?*]/g, '')}.mp3`,
            caption: video.url,
            contextInfo: {
                externalAdReply: {
                    title: `𝚈𝚘𝚞𝚃𝚞𝚋𝚎 𝙼𝚞𝚜𝚒𝚌`,
                    body: `${audioData.title || video.title || 'Canción'} • ${sizeMB} MB`,
                    thumbnailUrl: video.thumbnail,
                    sourceUrl: video.url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        await m.react('✅');

        // Cleanup
        try {
            const tempDir = path.join(__dirname, '../temp');
            if (fs.existsSync(tempDir)) {
                const files = fs.readdirSync(tempDir);
                const nowTime = Date.now();
                files.forEach(file => {
                    const filePath = path.join(tempDir, file);
                    try {
                        const stats = fs.statSync(filePath);
                        if (nowTime - stats.mtimeMs > 10000) {
                            if (file.endsWith('.mp3') || file.endsWith('.m4a') || file.endsWith('.ogg')) {
                                fs.unlinkSync(filePath);
                            }
                        }
                    } catch (e) {}
                });
            }
        } catch (cleanupErr) {}

    } catch (err) {
        console.error('[song]', err?.message || err);
        await m.react('❌');

        let errorMsg = 'No pude procesarlo';
        if (err?.message === 'Muy largo') errorMsg = 'Máximo 2 horas';
        else if (err?.message === 'No encontrado') errorMsg = 'No encontré resultados';
        else if (err?.message === 'SIN_LINK_DESCARGA') errorMsg = 'No pude obtener el link';
        else if (err?.message?.includes('blocked') || err?.response?.status === 451) {
            errorMsg = 'Contenido bloqueado o no disponible';
        }

        m.reply(`> 🎵 *Error: ${errorMsg}*`);

    } finally {
        activeDownloads.delete(userId);
    }
};

handler.help = ['play'];
handler.tags = ['media', 'downloader'];
handler.command = /^(play)$/i;
handler.register = true;
handler.group = true;

module.exports = handler;