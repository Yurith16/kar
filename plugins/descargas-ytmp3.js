const axios = require('axios');
const yts = require('yt-search');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const { checkReg } = require('../lib/checkReg.js');

ffmpeg.setFfmpegPath(ffmpegPath);

const activeAudioDownloads = new Map();

// Axios optimizado para velocidad
const axiosFast = axios.create({
    timeout: 300000,
    httpAgent: new (require('http').Agent)({ keepAlive: true, maxSockets: 20 }),
    httpsAgent: new (require('https').Agent)({ keepAlive: true, maxSockets: 20 }),
    headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.0'
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity
});

// API Ananta (primaria)
const anantaScraper = async (videoUrl) => {
    const api = `https://api.ananta.qzz.io/api/yt-dl?url=${encodeURIComponent(videoUrl)}&format=mp3`;
    const headers = { "x-api-key": "antebryxivz14" };
    const response = await axiosFast.get(api, { headers, timeout: 60000 });
    if (!response.data?.success) throw new Error('API_ERROR');
    return {
        title: response.data.data.title,
        download_url: response.data.data.download_url,
        thumbnail: response.data.data.thumbnail
    };
};

// API PrinceTech (fallback)
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

// Descarga rápida en buffer (mejor que stream para audios)
const downloadFast = async (url, outputPath) => {
    const response = await axiosFast({
        method: 'get',
        url: url,
        responseType: 'arraybuffer',
        onDownloadProgress: (progress) => {
            if (progress.total) {
                const percent = Math.round((progress.loaded / progress.total) * 100);
                if (percent % 20 === 0) console.log(`[Download] ${percent}%`);
            }
        }
    });

    fs.writeFileSync(outputPath, Buffer.from(response.data));
    return response.data.length;
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

    if (activeAudioDownloads.has(userId)) {
        await m.react('⏳');
        return m.reply(`> 🎵 *¡Espera!* Ya tengo una descarga tuya en proceso.`);
    }

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const tempRaw = path.join(tmpDir, `raw_${Date.now()}.audio`);
    const tempFixed = path.join(tmpDir, `audio_${Date.now()}.mp3`);

    try {
        activeAudioDownloads.set(userId, true);
        await m.react('🔍');

        let videoUrl = input;
        let searchData = null;

        // Búsqueda rápida
        if (!input.includes('youtu.be') && !input.includes('youtube.com')) {
            const search = await yts(input);
            if (!search.videos.length) {
                activeAudioDownloads.delete(userId);
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
                activeAudioDownloads.delete(userId);
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
            activeAudioDownloads.delete(userId);
            await m.react('❌');
            return m.reply(`> 🎵 *El audio excede las 3 horas permitidas, corazón.*`);
        }

        await m.react('📥');

        // Intentar APIs con fallback
        let result;
        try {
            console.log('[YTMP3] Ananta...');
            result = await anantaScraper(videoUrl);
        } catch (e) {
            console.log('[YTMP3] PrinceTech...');
            result = await princeScraper(videoUrl);
        }

        // Descarga rápida en buffer
        console.log('[YTMP3] Descargando...');
        const downloadedSize = await downloadFast(result.download_url, tempRaw);

        if (downloadedSize > 650 * 1024 * 1024) {
            throw new Error('TOO_LARGE');
        }

        await m.react('⚙️');

        // Verificar si ya es MP3 compatible (evitar re-encodeo innecesario)
        const probe = await new Promise((resolve) => {
            ffmpeg.ffprobe(tempRaw, (err, metadata) => {
                if (err) resolve(null);
                else resolve(metadata);
            });
        });

        const audioCodec = probe?.streams?.find(s => s.codec_type === 'audio')?.codec_name;
        const isMP3 = audioCodec === 'mp3';

        console.log(`[YTMP3] Codec detectado: ${audioCodec || 'unknown'}, Re-encode: ${!isMP3}`);

        // FFmpeg optimizado - si ya es MP3, solo copiar y mejorar metadatos
        await new Promise((resolve, reject) => {
            const cmd = ffmpeg(tempRaw);

            if (isMP3) {
                // Ya es MP3, solo copiar stream (¡ultra rápido!)
                cmd.outputOptions([
                    '-c:a copy', // Copiar sin re-encodear
                    '-id3v2_version 4',
                    '-write_id3v1 1'
                ]);
            } else {
                // Re-encodear a máxima calidad
                cmd.audioCodec('libmp3lame')
                    .audioBitrate('320k')
                    .audioFrequency(48000)
                    .audioChannels(2)
                    .audioFilters([
                        'aresample=resampler=soxr:precision=28', // Resample de calidad
                        'volume=1.0' // Normalizar volumen
                    ])
                    .outputOptions([
                        '-q:a 0', // VBR máxima calidad
                        '-preset ultrafast',
                        '-threads 0',
                        '-id3v2_version 4',
                        '-write_id3v1 1'
                    ]);
            }

            cmd.on('start', (cmdLine) => console.log('[FFmpeg]', isMP3 ? 'Copiando MP3...' : 'Re-encodeando a 320k...'))
               .on('end', () => resolve())
               .on('error', reject)
               .save(tempFixed);
        });

        await m.react('📦');

        // Verificar y enviar
        if (!fs.existsSync(tempFixed) || fs.statSync(tempFixed).size === 0) {
            throw new Error('CONVERSION_ERROR');
        }

        const audioBuffer = fs.readFileSync(tempFixed);
        const safeTitle = (result.title || searchData.title).substring(0, 50).replace(/[<>:"/\\|?*]/g, '');
        const sizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(2);

        await conn.sendMessage(m.chat, {
            document: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${safeTitle}.mp3`,
            caption: searchData.url,
            contextInfo: {
                externalAdReply: {
                    title: `𝚈𝚘𝚞𝚃𝚞𝚋𝚎 𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍`,
                    body: `${searchData.title} • ${isMP3 ? 'Original' : '320kbps'} • ${sizeMB} MB`,
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
        activeAudioDownloads.delete(userId);
        [tempRaw, tempFixed].forEach(f => {
            try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {}
        });
    }
};

handler.help = ['ytmp3 <url/texto>'];
handler.tags = ['downloader'];
handler.command = /^(ytmp3|audio|song)$/i;
handler.group = true;

module.exports = handler;