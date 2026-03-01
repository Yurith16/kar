const axios = require('axios');
const yts = require('yt-search');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const { checkReg } = require('../lib/checkReg.js');

ffmpeg.setFfmpegPath(ffmpegPath);

const activeAudioDownloads = new Map();
const lastUsage = new Map();

function extractYouTubeId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function escapeMetadata(str) {
    return str
        .replace(/"/g, '\\"')
        .replace(/'/g, "\\'")
        .replace(/:/g, '\\:')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .substring(0, 50);
}

const cleanFiles = (files) => {
    files.forEach(f => {
        try {
            if (fs.existsSync(f)) fs.unlinkSync(f);
        } catch (e) {}
    });
};

const downloadWithRetry = async (url, outputPath, maxRetries = 2) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await axios({ 
                url: url, 
                method: 'GET', 
                responseType: 'stream', 
                timeout: 300000 
            });

            const writer = fs.createWriteStream(outputPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const stats = fs.statSync(outputPath);
            if (stats.size === 0) throw new Error('Vacío');
            if (stats.size > 200 * 1024 * 1024) throw new Error('PESO_EXCEDIDO');

            return stats.size;

        } catch (e) {
            cleanFiles([outputPath]);
            if (i === maxRetries - 1) throw e;
            await new Promise(r => setTimeout(r, 2000));
        }
    }
};

let handler = async (m, { conn, text }) => {
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

    let tempRaw = null;
    let tempFixed = null;

    if (!text) return m.reply(`> 🎵 *¿Qué música buscas?*`);

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    tempRaw = path.join(tmpDir, `raw_audio_${Date.now()}`);
    tempFixed = path.join(tmpDir, `audio_${Date.now()}.mp3`);

    try {
        activeAudioDownloads.set(userId, true);
        await m.react('🔍');

        let videoUrl = text;
        let videoInfo;

        if (!text.includes('youtu.be') && !text.includes('youtube.com')) {
            const search = await yts(text + ' audio oficial');
            if (!search.videos.length) {
                const search2 = await yts(text + ' lyric video');
                if (!search2.videos.length) throw new Error('No encontrado');
                videoInfo = search2.videos[0];
            } else {
                const musicResults = search.videos.filter(v => {
                    const isShort = v.seconds < 600;
                    const hasMusicKeywords = /(audio|lyric|official|música|song|track)/i.test(v.title);
                    return isShort || hasMusicKeywords;
                });

                videoInfo = musicResults[0] || search.videos[0];
            }
            videoUrl = videoInfo.url;
        } else {
            const videoId = extractYouTubeId(text);
            if (!videoId) throw new Error('URL inválida');
            videoInfo = await yts({ videoId });
            videoUrl = `https://youtu.be/${videoId}`;
        }

        const { title, duration, thumbnail, url } = videoInfo;

        if (duration.seconds > 18000) throw new Error('Muy largo');

        const statusMsg = await conn.sendMessage(m.chat, {
            text: `> ⏳ *Procesando...*`
        }, { quoted: m });

        await m.react('📥');

        const apiUrl = `http://217.154.161.167:12377/play?url=${encodeURIComponent(videoUrl)}`;

        let apiRes;
        try {
            apiRes = await axios.get(apiUrl, { timeout: 30000 });
        } catch (e) {
            throw new Error('API_NO_RESPONDE');
        }

        if (!apiRes.data?.ytdl) throw new Error('SIN_LINK_DESCARGA');

        const downloadUrl = apiRes.data.ytdl;

        await downloadWithRetry(downloadUrl, tempRaw);

        const safeTitle = escapeMetadata(title);

        let lastPercent = -30;

        await new Promise((resolve, reject) => {
            ffmpeg(tempRaw)
                .audioCodec('libmp3lame')
                .audioBitrate('320k')
                .audioChannels(2)
                .audioFrequency(48000)
                .format('mp3')
                .outputOption('-metadata', `title=${safeTitle}`)
                .outputOption('-metadata', `artist=YouTube`)
                .on('progress', async (p) => {
                    const percent = Math.floor(p.percent);
                    const displayPercent = Math.floor(percent / 30) * 30;

                    if (displayPercent >= lastPercent + 30 && displayPercent <= 90) {
                        lastPercent = displayPercent;
                        console.log(`[FFmpeg Audio] ${displayPercent}%`);
                        try {
                            await conn.sendMessage(m.chat, {
                                text: `> ⚙️ *Procesando...* ${displayPercent}%`,
                                edit: statusMsg.key
                            });
                        } catch (e) {}
                    }
                })
                .on('end', async () => {
                    try {
                        await conn.sendMessage(m.chat, {
                            text: `> ✅ *Listo*`,
                            edit: statusMsg.key
                        });
                    } catch (e) {}
                    resolve();
                })
                .on('error', reject)
                .save(tempFixed);
        });

        if (!fs.existsSync(tempFixed) || fs.statSync(tempFixed).size === 0) {
            throw new Error('Error');
        }

        cleanFiles([tempRaw]);
        tempRaw = null;

        const buffer = fs.readFileSync(tempFixed);
        const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);

        await m.react('📤');

        await conn.sendMessage(m.chat, {
            document: buffer,
            mimetype: 'audio/mpeg',
            fileName: `${title.substring(0, 50).replace(/[<>:"/\\|?*]/g, '')}.mp3`,
            caption: url,
            contextInfo: {
                externalAdReply: {
                    title: `𝚈𝚘𝚞𝚃𝚞𝚋𝚎 𝙼𝚞𝚜𝚒𝚌`,
                    body: `${title} • ${sizeMB} MB • 320kbps`,
                    thumbnailUrl: thumbnail,
                    sourceUrl: url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        await m.react('✅');

        cleanFiles([tempFixed]);
        tempFixed = null;

    } catch (e) {
        console.error('[play]', e.message);
        await m.react('❌');

        let errorMsg = 'No pude procesarlo';
        if (e.message === 'Muy largo') errorMsg = 'Máximo 5 horas';
        else if (e.message === 'PESO_EXCEDIDO') errorMsg = 'Archivo muy pesado';
        else if (e.message === 'No encontrado') errorMsg = 'No encontré música';
        else if (e.message === 'URL inválida') errorMsg = 'URL inválida';
        else if (e.message === 'SIN_LINK_DESCARGA') errorMsg = 'No pude obtener el link';
        else if (e.message === 'API_NO_RESPONDE') errorMsg = 'La API no responde';
        else if (e.message.includes('FFmpeg')) errorMsg = 'Error de conversión';

        m.reply(`> 🎵 *Error: ${errorMsg}*`);

    } finally {
        activeAudioDownloads.delete(userId);
        cleanFiles([tempRaw, tempFixed]);
    }
};

handler.tags = ['downloader'];
handler.help = ['play', 'ytmp3'];
handler.command = ['play', 'ytmp3'];
handler.group = true;

module.exports = handler;