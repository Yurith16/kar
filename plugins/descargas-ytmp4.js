const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const { checkReg } = require('../lib/checkReg.js');
// 👇 AGREGADO: Importar sistema global de descargas
const descargas = require('./descargas-activas.js');

ffmpeg.setFfmpegPath(ffmpegPath);

// 👇 ELIMINADO: const activeVideoDownloads = new Map(); (ahora es global)

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    if (await checkReg(m, user)) return;

    if (!args[0]) {
        await m.react('🧐');
        return m.reply(`> *𝚈𝚃𝙼𝙿𝟺 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*\n> Ingresa un enlace de YouTube para descargar el video.`);
    }

    // 👇 MODIFICADO: Usar sistema global en lugar de local
    if (descargas.tieneDescargasActivas(userId)) {
        await m.react('⏳');
        return m.reply(`> *¡Espera!* Ya tengo un proceso tuyo en marcha. Ten paciencia.`);
    }

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const tempRaw = path.join(tmpDir, `raw_v_${Date.now()}.mp4`);
    const tempFixed = path.join(tmpDir, `fixed_v_${Date.now()}.mp4`);

    await m.react('⏳');

    try {
        // 👇 AGREGADO: Registrar descarga global
        descargas.registrarDescarga(userId, 'mp4');

        const url = args[0];
        const api = `https://api-aswin-sparky.koyeb.app/api/downloader/ytv?url=${encodeURIComponent(url)}`;

        const response = await axios.get(api, { timeout: 60000 });
        if (!response.data || response.data.status !== true) throw new Error('API_ERROR');

        const data = response.data.data;
        const downloadUrl = data.dl_url || data.downloadUrl || data.url;
        const { title, duration } = data;

        if (!downloadUrl) throw new Error('NO_URL');

        await m.react('📥');

        const videoRes = await axios({
            method: 'get',
            url: downloadUrl,
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        // Límite de seguridad de 650MB
        const totalSize = parseInt(videoRes.headers['content-length'], 10);
        if (totalSize > 650 * 1024 * 1024) {
            // 👇 MODIFICADO: Usar sistema global
            descargas.finalizarDescarga(userId);
            return m.reply(`> *Error:* El video supera el límite de 650MB.`);
        }

        const writer = fs.createWriteStream(tempRaw);
        videoRes.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await m.react('⚙️');

        // Procesamiento FFmpeg para máxima compatibilidad
        await new Promise((resolve, reject) => {
            ffmpeg(tempRaw)
                .outputOptions([
                    '-vcodec libx264',
                    '-acodec aac',
                    '-pix_fmt yuv420p',
                    '-preset superfast',
                    '-movflags +faststart'
                ])
                .on('end', resolve)
                .on('error', (err) => {
                    console.error('FFmpeg Error:', err);
                    reject(err);
                })
                .save(tempFixed);
        });

        await m.react('📦');

        const stats = fs.statSync(tempFixed);
        const fileSizeInBytes = stats.size;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
        const caption = `> *「🌱」 ${title}*\n> *⏱️ Duración:* ${duration || 'Desconocida'}`;

        if (fileSizeInMB > 80) {
            // Envío como DOCUMENTO si pesa más de 80MB
            await conn.sendMessage(m.chat, {
                document: fs.readFileSync(tempFixed),
                caption: caption,
                mimetype: 'video/mp4',
                fileName: `${title}.mp4`
            }, { quoted: m });
        } else {
            // Envío como VIDEO NORMAL
            await conn.sendMessage(m.chat, {
                video: fs.readFileSync(tempFixed),
                caption: caption,
                mimetype: 'video/mp4'
            }, { quoted: m });
        }

        await m.react('✅');

    } catch (e) {
        console.error('[YT Video Error]:', e.message);
        await m.react('❌');
        m.reply(`> Error al procesar el video. Intenta con otro enlace.`);
    } finally {
        // 👇 MODIFICADO: Usar sistema global en lugar de local
        descargas.finalizarDescarga(userId);
        if (fs.existsSync(tempRaw)) try { fs.unlinkSync(tempRaw); } catch {}
        if (fs.existsSync(tempFixed)) try { fs.unlinkSync(tempFixed); } catch {}
    }
};

handler.help = ['mp4 <url>'];
handler.tags = ['downloader'];
handler.command = /^(mp4)$/i;
handler.register = true;

module.exports = handler;