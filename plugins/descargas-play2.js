const axios = require('axios');
const yts = require('yt-search');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const { checkReg } = require('../lib/checkReg.js');
const descargas = require('./descargas-activas.js');

ffmpeg.setFfmpegPath(ffmpegPath);

const ytdlVideoScraper = async (videoUrl) => {
    try {
        const apiUrl = `https://api.princetechn.com/api/download/ytv?apikey=prince&url=${encodeURIComponent(videoUrl)}`;
        const { data } = await axios.get(apiUrl);
        if (!data?.success) throw new Error('Error en API');
        return data.result;
    } catch (error) {
        throw new Error(`Error al procesar: ${error.message}`);
    }
};

let handler = async (m, { conn, text }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    if (await checkReg(m, user)) return;
    if (!text) {
        await m.react('🤔');
        return m.reply(`> ¿Qué video desea ver hoy, cielo?`);
    }

    if (descargas.tieneDescargasActivas(userId)) {
        await m.react('⏳');
        return m.reply(`> ⏳ *Ya tienes una descarga activa, espera.*`);
    }

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

        const { title, author, duration, views, ago, thumbnail, url } = videoInfo;
        if (duration.seconds > 1800) throw new Error('Excede 30min');

        await conn.sendMessage(m.chat, {
            image: { url: thumbnail },
            caption: `> 🎬 *「🌱」 ${title}*\n\n> 🍃 *Canal:* ${author.name}\n> ⚘ *Duración:* ${duration.timestamp}\n> 🌼 *Vistas:* ${(views || 0).toLocaleString()}\n> 🍀 *Publicado:* ${ago || 'Reciente'}`
        }, { quoted: m });

        await m.react('📥');
        const result = await ytdlVideoScraper(videoUrl);
        const response = await axios({ url: result.download_url, method: 'GET', responseType: 'stream', timeout: 300000 });

        const writer = fs.createWriteStream(tempRaw);
        response.data.pipe(writer);
        await new Promise(r => writer.on('finish', r));

        await m.react('⚙️');
        await new Promise((r) => {
            ffmpeg(tempRaw)
                .videoCodec('libx264').audioCodec('aac')
                .size('?360x?') // 👈 Cambiado a 360p para mejor rendimiento
                .on('end', r).on('error', r)
                .save(tempFixed);
        });

        await m.react('📦');
        const finalVideo = fs.existsSync(tempFixed) ? tempFixed : tempRaw;
        await conn.sendMessage(m.chat, {
            video: fs.readFileSync(finalVideo),
            caption: `> ✅ *Video: ${title.substring(0, 30)}...*`,
            mimetype: 'video/mp4'
        }, { quoted: m });

        await m.react('✅');

    } catch (error) {
        console.error(error.message);
        await m.react('❌');
        await m.reply(`> 🌪️ *Error: ${error.message || 'Intenta luego'}*`);
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