const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { checkReg } = require('../lib/checkReg.js');

const activeAudioDownloads = new Map();

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    if (await checkReg(m, user)) return;

    if (!args[0]) {
        await m.react('🧐');
        return m.reply(`> *𝚈𝚃𝙼𝙿𝟹 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*\n> Ingresa el enlace de YouTube para descargar el audio.`);
    }

    if (activeAudioDownloads.has(userId)) {
        await m.react('⏳');
        return m.reply(`> *¡Espera!* Ya tengo una descarga tuya en proceso.`);
    }

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const tempAudio = path.join(tmpDir, `audio_${Date.now()}.mp3`);

    await m.react('⏳');

    try {
        activeAudioDownloads.set(userId, true);
        const url = args[0];
        
        // Configuración de la API de Ananta
        const api = `https://api.ananta.qzz.io/api/yt-dl?url=${encodeURIComponent(url)}&format=mp3`;
        const headers = { "x-api-key": "antebryxivz14" };

        const response = await axios.get(api, { headers, timeout: 100000 });
        
        if (!response.data || response.data.success !== true) {
            throw new Error('API_ERROR');
        }

        const { download_url, title } = response.data.data;
        if (!download_url) throw new Error('NO_URL');

        await m.react('📥');

        // Descarga mediante stream para soportar mixes largos sin colapsar
        const res = await axios({
            method: 'get',
            url: download_url,
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const writer = fs.createWriteStream(tempAudio);
        res.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const stats = fs.statSync(tempAudio);
        if (stats.size > 650 * 1024 * 1024) { // Límite 650MB
            throw new Error('TOO_LARGE');
        }

        await m.react('📦');

        // Envío como documento sin caption
        await conn.sendMessage(m.chat, {
            document: fs.readFileSync(tempAudio),
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
        }, { quoted: m });

        await m.react('✅');

    } catch (e) {
        console.error('[YT Audio Error]:', e.message);
        await m.react('❌');
        
        let msg = `> Error al procesar el audio. El enlace podría estar protegido o la API saturada.`;
        if (e.message === 'TOO_LARGE') msg = `> *Error:* El mix es demasiado pesado (máximo 650MB).`;
        
        m.reply(msg);
    } finally {
        activeAudioDownloads.delete(userId);
        if (fs.existsSync(tempAudio)) {
            try { fs.unlinkSync(tempAudio); } catch (err) {}
        }
    }
};

handler.help = ['ytmp3 <url>'];
handler.tags = ['downloader'];
handler.command = /^(ytmp3|audio|song)$/i;
handler.register = true;

module.exports = handler;