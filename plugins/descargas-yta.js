const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { checkReg } = require('../lib/checkReg.js');

const activeAudioDownloads = new Map();

const ytdlScraper = async (videoUrl) => {
    const apiUrl = `https://api.princetechn.com/api/download/yta?apikey=prince&url=${encodeURIComponent(videoUrl)}`;
    const response = await axios.get(apiUrl);
    if (!response.data || !response.data.success) throw new Error('Error en API');
    return response.data.result;
};

let handler = async (m, { conn, text }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];
    if (await checkReg(m, user)) return;

    if (!text) return; // No necesita reply porque viene del botón

    if (activeAudioDownloads.has(userId)) {
        await m.react('⏳');
        return m.reply(`> ⏳ *¡Paciencia, corazón!* Ya estoy bajando una melodía para ti.`);
    }

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const tempAudio = path.join(tmpDir, `audio_${Date.now()}.mp3`);

    try {
        activeAudioDownloads.set(userId, true);
        await m.react('📥');

        const result = await ytdlScraper(text);
        const response = await axios({ 
            url: result.download_url, 
            method: 'GET', 
            responseType: 'stream', 
            timeout: 120000 
        });

        const writer = fs.createWriteStream(tempAudio);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const safeTitle = result.title.substring(0, 50).replace(/[<>:"/\\|?*]/g, '');

        await conn.sendMessage(m.chat, {
            document: fs.readFileSync(tempAudio),
            mimetype: 'audio/mpeg',
            fileName: `${safeTitle}.mp3`
        }, { quoted: m });

        await m.react('✅');

    } catch (error) {
        await m.react('❌');
        await m.reply(`> 🌪️ *Vaya drama...* No pude procesar el audio, cielo.`);
    } finally {
        activeAudioDownloads.delete(userId);
        if (fs.existsSync(tempAudio)) fs.unlinkSync(tempAudio);
    }
};

handler.command = ['getaud'];
module.exports = handler;