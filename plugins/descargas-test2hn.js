const axios = require('axios');
const yts = require('yt-search');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const { checkReg } = require('../lib/checkReg.js');

ffmpeg.setFfmpegPath(ffmpegPath);

const activeVideoDownloads = new Map();
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
            if (stats.size > 650 * 1024 * 1024) throw new Error('PESO_EXCEDIDO');

            const isValid = await new Promise((resolve) => {
                ffmpeg.ffprobe(outputPath, (err) => resolve(!err));
            });

            if (isValid) return stats.size;
            throw new Error('Corrupto');

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

    if (!text) return m.reply(`> 🎬 *¿Qué video deseas ver?*`);

    if (activeVideoDownloads.has(userId)) {
        return m.reply(`> ⏳ *Espera, ya proceso uno.*`);
    }

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    tempRaw = path.join(tmpDir, `raw_${Date.now()}`);
    tempFixed = path.join(tmpDir, `vid_${Date.now()}.mp4`);

    try {
        activeVideoDownloads.set(userId, true);
        await m.react('🔍');

        let videoUrl = text;
        let videoInfo;

        if (!text.includes('youtu.be') && !text.includes('youtube.com')) {
            const search = await yts(text);
            if (!search.videos.length) throw new Error('No encontrado');
            videoInfo = search.videos[0];
            videoUrl = videoInfo.url;
        } else {
            const videoId = extractYouTubeId(text);
            if (!videoId) throw new Error('URL inválida');
            videoInfo = await yts({ videoId });
            videoUrl = `https://youtu.be/${videoId}`;
        }

        const { title, duration, thumbnail, url } = videoInfo;

        if (duration.seconds > 7200) throw new Error('Muy largo');

        const statusMsg = await conn.sendMessage(m.chat, {
            text: `> ⏳ *Procesando...*`
        }, { quoted: m });

        await m.react('📥');

        const apiUrl = `http://217.154.161.167:12377/play2?url=${encodeURIComponent(videoUrl)}`;

        let apiRes;
        try {
            apiRes = await axios.get(apiUrl, { timeout: 30000 });
        } catch (e) {
            throw new Error('API_NO_RESPONDE');
        }

        if (!apiRes.data?.ytdl) throw new Error('SIN_LINK_DESCARGA');

        const downloadUrl = apiRes.data.ytdl;

        await downloadWithRetry(downloadUrl, tempRaw);

        let lastPercent = -30;

        await new Promise((resolve, reject) => {
            ffmpeg(tempRaw)
                .videoCodec('libx264')
                .audioCodec('aac')
                .size('360x?')
                .outputOptions([
                    '-preset ultrafast',
                    '-movflags +faststart',
                    '-threads 0',
                    '-pix_fmt yuv420p'
                ])
                .on('progress', async (p) => {
                    const percent = Math.floor(p.percent);
                    const displayPercent = Math.floor(percent / 30) * 30;

                    if (displayPercent >= lastPercent + 30 && displayPercent <= 90) {
                        lastPercent = displayPercent;
                        console.log(`[FFmpeg] ${displayPercent}%`);
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
            mimetype: 'video/mp4',
            fileName: `${title.substring(0, 50).replace(/[<>:"/\\|?*]/g, '')}.mp4`,
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

        cleanFiles([tempFixed]);
        tempFixed = null;

    } catch (e) {
        console.error('[play2]', e.message);
        await m.react('❌');

        let errorMsg = 'No pude procesarlo';
        if (e.message === 'Muy largo') errorMsg = 'Máximo 2 horas';
        else if (e.message === 'PESO_EXCEDIDO') errorMsg = 'Máximo 650MB';
        else if (e.message === 'No encontrado') errorMsg = 'No encontré resultados';
        else if (e.message === 'URL inválida') errorMsg = 'URL inválida';
        else if (e.message === 'SIN_LINK_DESCARGA') errorMsg = 'No pude obtener el link';
        else if (e.message === 'API_NO_RESPONDE') errorMsg = 'La API no responde';
        else if (e.message.includes('FFmpeg')) errorMsg = 'Error de conversión';

        m.reply(`> 🎬 *Error: ${errorMsg}*`);

    } finally {
        activeVideoDownloads.delete(userId);
        cleanFiles([tempRaw, tempFixed]);
    }
};

handler.tags = ['downloader'];
handler.help = ['play2', 'video'];
handler.command = ['play2', 'video'];
handler.group = true;

module.exports = handler;