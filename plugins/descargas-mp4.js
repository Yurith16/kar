const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');
const { checkReg } = require('../lib/checkReg.js');

ffmpeg.setFfmpegPath(ffmpegPath);

const activeVideoDownloads = new Map();

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    if (await checkReg(m, user)) return;

    // Validación de argumentos: .mp4 <url> <calidad>
    if (!args[0]) {
        await m.react('🧐');
        return m.reply(`> *𝚈𝚃𝙼𝙿𝟺 𝙰𝙳𝚅𝙰𝙽𝙲𝙴𝙳*\n> Uso: ${usedPrefix + command} <url> <calidad>\n> Ejemplo: ${usedPrefix + command} https://youtu.be/... 720`);
    }

    if (activeVideoDownloads.has(userId)) {
        await m.react('⏳');
        return m.reply(`> *¡Espera!* Ya tengo un proceso tuyo en marcha.`);
    }

    const url = args[0];
    let quality = args[1] || '360'; // Calidad por defecto
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const tempRaw = path.join(tmpDir, `raw_v_${Date.now()}.mp4`);
    const tempFixed = path.join(tmpDir, `fixed_v_${Date.now()}.mp4`);

    await m.react('⏳');

    try {
        activeVideoDownloads.set(userId, true);
        
        // 1. Obtener metadatos para validar duración
        const apiInfo = `https://api.ananta.qzz.io/api/yt-dl?url=${encodeURIComponent(url)}&format=${quality}`;
        const headers = { "x-api-key": "antebryxivz14" };
        
        const response = await axios.get(apiInfo, { headers, timeout: 60000 });
        if (!response.data || !response.data.success) throw new Error('API_ERROR');

        const { download_url, title, duration_seconds } = response.data.data;
        const durationMin = (duration_seconds || 0) / 60;

        // 2. Validación de Calidad vs Duración
        // Videos > 30 min solo permiten 360p o menos
        if (durationMin > 30 && parseInt(quality) > 360) {
            activeVideoDownloads.delete(userId);
            return m.reply(`> *Restricción de Calidad*\n> Los videos mayores a 30 minutos solo se permiten en *360p* o inferior para asegurar el envío.`);
        }

        await m.react('📥');

        // 3. Descarga por Stream
        const videoRes = await axios({
            method: 'get',
            url: download_url,
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const writer = fs.createWriteStream(tempRaw);
        videoRes.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        // Límite de 650MB
        if (fs.statSync(tempRaw).size > 650 * 1024 * 1024) throw new Error('TOO_LARGE');

        await m.react('⚙️');

        // 4. Procesamiento FFmpeg para evitar formatos inusuales
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
                .on('error', reject)
                .save(tempFixed);
        });

        await m.react('📦');

        const stats = fs.statSync(tempFixed);
        const fileSizeMB = stats.size / (1024 * 1024);
        const caption = `> *「🌱」 ${title}*\n> *⏱️ Duración:* ${Math.floor(durationMin)} min\n> *📊 Calidad:* ${quality}p`;

        // 5. Envío según peso (Límite 80MB para video normal)
        if (fileSizeMB > 80) {
            await conn.sendMessage(m.chat, {
                document: fs.readFileSync(tempFixed),
                caption: caption,
                mimetype: 'video/mp4',
                fileName: `${title}.mp4`
            }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, {
                video: fs.readFileSync(tempFixed),
                caption: caption,
                mimetype: 'video/mp4'
            }, { quoted: m });
        }

        await m.react('✅');

    } catch (e) {
        console.error('[MP4 Advanced Error]:', e.message);
        await m.react('❌');
        let errMsg = `> Error al procesar el video.`;
        if (e.message === 'TOO_LARGE') errMsg = `> El video excede los 650MB permitidos.`;
        m.reply(errMsg);
    } finally {
        activeVideoDownloads.delete(userId);
        if (fs.existsSync(tempRaw)) try { fs.unlinkSync(tempRaw); } catch {}
        if (fs.existsSync(tempFixed)) try { fs.unlinkSync(tempFixed); } catch {}
    }
};

handler.help = ['ytmp4 <url> <calidad>'];
handler.tags = ['downloader'];
handler.command = /^(ytmp4|vdl)$/i;
handler.register = true;

module.exports = handler;