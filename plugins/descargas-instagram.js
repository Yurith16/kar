const axios = require('axios');
const { checkReg } = require('../lib/checkReg.js');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender];

    // 1. Verificación de Registro
    if (await checkReg(m, user)) return;

    if (!args[0]) {
        await m.react('🧐');
        return m.reply(`> *𝙸𝙽𝚂𝚃𝙰𝙶𝚁𝙰𝙼 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁*\n> Ingresa un enlace de Instagram para descargar el video.`);
    }

    if (!args[0].includes('instagram.com')) {
        await m.react('⚠️');
        return m.reply(`> *𝙴𝙽𝙻𝙰𝙲𝙴 𝙸𝙽𝚅Á𝙻𝙸𝙳𝙾*\n> El enlace debe ser de Instagram.`);
    }

    await m.react('⏳');

    try {
        const url = args[0];
        const api = `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`;

        const response = await axios.get(api, { timeout: 30000 });

        if (!response.data || response.data.status !== true) {
            throw new Error('API_ERROR');
        }

        const mediaData = response.data.data;
        const videoItem = mediaData.find(item => item.type === 'video');

        if (!videoItem) {
            await m.react('📸');
            return m.reply(`> No se encontró un video en este enlace.`);
        }

        await m.react('📥');

        // Descargamos el video a un buffer para asegurar el envío normal
        const videoBuffer = await axios.get(videoItem.url, { responseType: 'arraybuffer' });

        await conn.sendMessage(m.chat, {
            video: Buffer.from(videoBuffer.data),
            caption: `> *Aquí tienes el video.*`,
            mimetype: 'video/mp4'
        }, { quoted: m });

        await m.react('✅');

    } catch (e) {
        console.error('[IG Error]:', e.message);
        await m.react('❌');
        m.reply(`> Error al procesar la descarga. Intenta de nuevo.`);
    }
};

handler.help = ['instagram <url>'];
handler.tags = ['downloader'];
handler.command = /^(instagram|ig|igdl|reels|igvideo)$/i;
handler.register = true;

module.exports = handler;