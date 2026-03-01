const axios = require('axios');
const yts = require('yt-search');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const { checkReg } = require('../lib/checkReg.js');
const descargas = require('./descargas-activas.js');

ffmpeg.setFfmpegPath(ffmpegPath);

const apis = [
    {
        name: 'PrinceTech',
        url: (videoUrl) => `https://api.princetechn.com/api/download/ytv?apikey=prince&url=${encodeURIComponent(videoUrl)}`,
        process: (data) => data?.result?.download_url ? {
            title: data.result.title,
            download_url: data.result.download_url,
            thumbnail: data.result.thumbnail
        } : null
    },
    {
        name: 'Ananta',
        url: (videoUrl) => `https://api.ananta.qzz.io/api/yt-dl?url=${encodeURIComponent(videoUrl)}&format=360`,
        headers: { "x-api-key": "antebryxivz14" },
        process: (data) => data?.success ? {
            title: data.data.title,
            download_url: data.data.download_url,
            thumbnail: data.data.thumbnail
        } : null
    }
];

const downloadVideo = async (videoUrl) => {
    for (const api of apis) {
        try {
            const config = { timeout: 60000 };
            if (api.headers) config.headers = api.headers;
            const { data } = await axios.get(api.url(videoUrl), config);
            const result = api.process(data);
            if (result?.download_url) return result;
        } catch (e) {
            continue;
        }
    }
    throw new Error('APIs fallaron');
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

            const isValid = await new Promise((resolve) => {
                ffmpeg.ffprobe(outputPath, (err) => resolve(!err));
            });

            if (isValid) return stats.size;
            throw new Error('Corrupto');

        } catch (e) {
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            if (i === maxRetries - 1) throw e;
            await new Promise(r => setTimeout(r, 2000));
        }
    }
};

let handler = async (m, { conn, text }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];
    if (await checkReg(m, user)) return;
    if (!text) return m.reply(`> 🎬 *¿Qué video deseas ver, cielo?*`);
    if (descargas.tieneDescargasActivas(userId)) return m.reply(`> 🎬 *Espera, ya proceso uno.*`);

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const tempRaw = path.join(tmpDir, `raw_${Date.now()}`);
    const tempFixed = path.join(tmpDir, `vid_${Date.now()}.mp4`);

    try {
        descargas.registrarDescarga(userId, 'play2');
        await m.react('🔍');

        let videoUrl = text, videoInfo;
        if (!text.includes('youtu.be') && !text.includes('youtube.com')) {
            const search = await yts(text);
            if (!search.videos.length) throw new Error('No encontrado');
            videoInfo = search.videos[0];
            videoUrl = videoInfo.url;
        } else {
            const videoId = videoUrl.split('v=')[1]?.split('&')[0] || 
                            videoUrl.split('youtu.be/')[1]?.split('?')[0];
            if (!videoId) throw new Error('URL inválida');
            videoInfo = await yts({ videoId });
        }

        const { title, duration, thumbnail, url } = videoInfo;
        if (duration.seconds > 1800) throw new Error('Muy largo');

        const statusMsg = await conn.sendMessage(m.chat, {
            text: `> ⏳ *Verificando contenido...*`
        }, { quoted: m });

        await m.react('📥');

        const result = await downloadVideo(videoUrl);

        await conn.sendMessage(m.chat, {
            text: `> 📥 *Descargando...*`,
            edit: statusMsg.key
        });

        const rawSize = await downloadWithRetry(result.download_url, tempRaw);

        await conn.sendMessage(m.chat, {
            text: `> ⚙️ *Convirtiendo...* 0%`,
            edit: statusMsg.key
        });

        let lastPercent = 0;
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
                .on('progress', (p) => {
                    const current = Math.floor(p.percent / 10) * 10;
                    if (current > lastPercent && current <= 100) {
                        lastPercent = current;
                        console.log(`[FFmpeg] ${current}%`);
                        conn.sendMessage(m.chat, {
                            text: `> ⚙️ *Convirtiendo...* ${current}%`,
                            edit: statusMsg.key
                        }).catch(() => {});
                    }
                })
                .on('end', () => {
                    conn.sendMessage(m.chat, {
                        text: `> ✅ *Conversión completada*`,
                        edit: statusMsg.key
                    }).catch(() => {});
                    resolve();
                })
                .on('error', reject)
                .save(tempFixed);
        });

        if (!fs.existsSync(tempFixed) || fs.statSync(tempFixed).size === 0) throw new Error('Error');

        const buffer = fs.readFileSync(tempFixed);
        const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);

        // NO eliminar mensaje de estado, se queda en el chat

        await conn.sendMessage(m.chat, {
            document: buffer,
            mimetype: 'video/mp4',
            fileName: `${title.substring(0,50).replace(/[<>:"/\\|?*]/g,'')}.mp4`,
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

    } catch (e) {
        console.error('[play2]', e.message);
        await m.react('❌');
        m.reply(`> 🎬 *Error: ${e.message || 'No pude procesarlo'}*`);
    } finally {
        descargas.finalizarDescarga(userId);
        [tempRaw, tempFixed].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
    }
};

handler.tags = ['downloader'];
handler.help = ['play2'];
handler.command = ['play2', 'video'];
handler.group = true;
module.exports = handler;