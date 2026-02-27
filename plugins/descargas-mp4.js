const axios = require('axios');
const yts = require('yt-search');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const { checkReg } = require('../lib/checkReg.js');
const descargas = require('./descargas-activas.js');

ffmpeg.setFfmpegPath(ffmpegPath);

// APIs de video con fallback
const apis = [
    {
        name: 'PrinceTech',
        url: (videoUrl) => `https://api.princetechn.com/api/download/ytv?apikey=prince&url=${encodeURIComponent(videoUrl)}`,
        process: (data) => data?.result ? {
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
    },
    {
        name: 'Aswin-Sparky',
        url: (videoUrl) => `https://api-aswin-sparky.koyeb.app/api/downloader/ytv?url=${encodeURIComponent(videoUrl)}`,
        process: (data) => {
            if (!data?.status) return null;
            const dl = data.data?.dl_url || data.data?.downloadUrl || data.data?.url;
            return dl ? {
                title: data.data.title,
                download_url: dl,
                thumbnail: data.data.thumbnail
            } : null;
        }
    }
];

// Intentar APIs en orden hasta que una funcione
const downloadVideo = async (videoUrl) => {
    for (const api of apis) {
        try {
            console.log(`[YTMP4] Intentando ${api.name}...`);
            const config = { timeout: 60000 };
            if (api.headers) config.headers = api.headers;

            const { data } = await axios.get(api.url(videoUrl), config);
            const result = api.process(data);

            if (result?.download_url) {
                console.log(`[YTMP4] ${api.name} OK`);
                return result;
            }
        } catch (e) {
            console.log(`[YTMP4] ${api.name} falló: ${e.message}`);
            continue;
        }
    }
    throw new Error('Todas las APIs fallaron');
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    if (await checkReg(m, user)) return;

    const input = text;

    if (!input) {
        await m.react('🧐');
        return m.reply(`> Ingresa el enlace de YouTube o nombre para buscar.`);
    }

    if (descargas.tieneDescargasActivas(userId)) {
        await m.react('⏳');
        return m.reply(`> 🎬 *¡Paciencia!* Ya estoy procesando tu video.`);
    }

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const tempRaw = path.join(tmpDir, `raw_${Date.now()}`);
    const tempFixed = path.join(tmpDir, `vid_${Date.now()}.mp4`);

    try {
        descargas.registrarDescarga(userId, 'ytmp4');
        await m.react('🔍');

        let videoUrl = input;
        let videoInfo = null;

        // Si no es URL, buscar en YouTube
        if (!input.includes('youtu.be') && !input.includes('youtube.com')) {
            const search = await yts(input);
            if (!search.videos.length) {
                descargas.finalizarDescarga(userId);
                await m.react('💨');
                return m.reply(`> 🎬 *No encontré nada.*`);
            }
            videoInfo = search.videos[0];
            videoUrl = videoInfo.url;
        } else {
            // Es URL, obtener info
            const videoId = videoUrl.split('v=')[1]?.split('&')[0] || 
                            videoUrl.split('youtu.be/')[1]?.split('?')[0] ||
                            videoUrl.split('/').pop().split('?')[0];

            if (!videoId) {
                descargas.finalizarDescarga(userId);
                await m.react('💨');
                return m.reply(`> 🎬 *Enlace inválido.*`);
            }

            const search = await yts({ videoId });
            videoInfo = search;
        }

        const { title, duration, thumbnail, url } = videoInfo;

        // Límite 30 minutos
        if (duration.seconds > 1800) {
            descargas.finalizarDescarga(userId);
            await m.react('❌');
            return m.reply(`> 🎬 *El video excede los 30 minutos permitidos.*`);
        }

        await m.react('📥');

        // Descargar con fallback de APIs
        const result = await downloadVideo(videoUrl);

        // Descargar video
        const response = await axios({ 
            url: result.download_url, 
            method: 'GET', 
            responseType: 'stream', 
            timeout: 300000 
        });

        const writer = fs.createWriteStream(tempRaw);
        response.data.pipe(writer);
        await new Promise(r => writer.on('finish', r));

        await m.react('⚙️');

        // FFmpeg ultrarrápido (igual que play2)
        await new Promise((resolve, reject) => {
            ffmpeg(tempRaw)
                .videoCodec('libx264')
                .audioCodec('aac')
                .videoBitrate('1000k')
                .audioBitrate('128k')
                .size('640x?') // 360p-640px ancho
                .fps(30)
                .outputOptions([
                    '-preset ultrafast',
                    '-tune fastdecode',
                    '-movflags +faststart',
                    '-threads 0',
                    '-crf 28',
                    '-pix_fmt yuv420p',
                    '-level 3.1'
                ])
                .on('start', (cmd) => console.log('[FFmpeg] Iniciando:', cmd))
                .on('progress', (progress) => {
                    if (progress.percent) {
                        console.log(`[FFmpeg] Progreso: ${Math.round(progress.percent)}%`);
                    }
                })
                .on('end', () => {
                    console.log('[FFmpeg] Conversión completada');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('[FFmpeg] Error:', err.message);
                    reject(err);
                })
                .save(tempFixed);
        });

        await m.react('📦');

        // Verificar archivo
        if (!fs.existsSync(tempFixed) || fs.statSync(tempFixed).size === 0) {
            throw new Error('Error en conversión');
        }

        // Enviar como documento con diseño impecable
        const videoBuffer = fs.readFileSync(tempFixed);
        const safeTitle = (result.title || title).substring(0, 50).replace(/[<>:"/\\|?*]/g, '');
        const sizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(2);

        await conn.sendMessage(m.chat, {
            document: videoBuffer,
            mimetype: 'video/mp4',
            fileName: `${safeTitle}.mp4`,
            caption: url,
            contextInfo: {
                externalAdReply: {
                    title: `𝚈𝚘𝚞𝚃𝚞𝚋𝚎 𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍`,
                    body: `${title} (${sizeMB} MB)`,
                    thumbnailUrl: thumbnail,
                    sourceUrl: url,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        await m.react('✅');

    } catch (error) {
        console.error('[YTMP4 Error]:', error.message);
        await m.react('❌');
        await m.reply(`> 🎬 *No pude procesar el video.*`);
    } finally {
        descargas.finalizarDescarga(userId);
        [tempRaw, tempFixed].forEach(f => {
            if (fs.existsSync(f)) fs.unlinkSync(f);
        });
    }
};

handler.help = ['ytmp4 <url/texto>'];
handler.tags = ['downloader'];
handler.command = /^(ytmp4|mp4|video)$/i;
handler.group = true;

module.exports = handler;