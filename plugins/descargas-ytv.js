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
    if (!text) return; // Viene del botón

    if (descargas.tieneDescargasActivas(userId)) {
        await m.react('⏳');
        return m.reply(`> ⏳ *Ya tienes una descarga activa, espera un momento, cielo.*`);
    }

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const tempRaw = path.join(tmpDir, `raw_${Date.now()}`);
    const tempFixed = path.join(tmpDir, `vid_${Date.now()}.mp4`);

    try {
        descargas.registrarDescarga(userId, 'getvid');
        await m.react('📥');

        const result = await ytdlVideoScraper(text);
        const response = await axios({ url: result.download_url, method: 'GET', responseType: 'stream', timeout: 300000 });

        const writer = fs.createWriteStream(tempRaw);
        response.data.pipe(writer);
        await new Promise(r => writer.on('finish', r));

        await m.react('⚙️');
        // Procesamos a 360p para optimizar peso
        await new Promise((r) => {
            ffmpeg(tempRaw)
                .videoCodec('libx264')
                .audioCodec('aac')
                .size('?x360') 
                .on('end', r)
                .on('error', r)
                .save(tempFixed);
        });

        await m.react('📦');
        const finalPath = fs.existsSync(tempFixed) ? tempFixed : tempRaw;
        const stats = fs.statSync(finalPath);
        const fileSizeInBytes = stats.size;
        const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);

        const videoTitle = result.title || 'video';

        // Si pesa más de 50MB se envía como documento
        if (fileSizeInMegabytes > 50) {
            await conn.sendMessage(m.chat, {
                document: fs.readFileSync(finalPath),
                mimetype: 'video/mp4',
                fileName: `${videoTitle}.mp4`,
                caption: `> 📦 *Peso:* ${fileSizeInMegabytes.toFixed(2)} MB\n> ⚠️ *Se envió como documento por superar los 50MB, corazón.*`
            }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, {
                video: fs.readFileSync(finalPath),
                caption: `> ✅ *¡Aquí tienes tu video, cielo!*`,
                mimetype: 'video/mp4'
            }, { quoted: m });
        }

        await m.react('✅');

    } catch (error) {
        console.error(error.message);
        await m.react('❌');
        await m.reply(`> 🌪️ *Hubo un drama con el video:* ${error.message}`);
    } finally {
        descargas.finalizarDescarga(userId);
        [tempRaw, tempFixed].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
    }
};

handler.command = ['getvid'];
handler.group = true;
module.exports = handler;