const { checkReg } = require('../lib/checkReg.js');
const karimg = require('./main-karimg.js');

let handler = async (m, { conn }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    if (await checkReg(m, user)) return;

    try {
        await m.react('⚙️');

        // Ping fijo
        const ping = 150;
        let speed = '⚡ Rápido';

        // Uptime real
        const uptime = process.uptime();
        const horas = Math.floor(uptime / 3600);
        const minutos = Math.floor((uptime % 3600) / 60);
        const segundos = Math.floor(uptime % 60);

        let tiempoActivo = '';
        if (horas > 0) tiempoActivo += `${horas}h `;
        if (minutos > 0) tiempoActivo += `${minutos}m `;
        tiempoActivo += `${segundos}s`;

        // Enviar mensaje vacío con externalAdReply (solo se ve la imagen)
        await conn.sendMessage(m.chat, {
            text: '‎', // Carácter invisible (zero-width space)
            contextInfo: {
                externalAdReply: {
                    title: `𝚂𝚈𝚂𝚃𝙴𝙼 𝚂𝚃𝙰𝚃𝚄𝚂`,
                    body: `Ping: ${ping}ms • Speed: ${speed} • Activo: ${tiempoActivo}`,
                    thumbnailUrl: karimg.url,
                    sourceUrl: '',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        await m.react('✅');

    } catch (error) {
        await m.react('❌');
        m.reply(`> ⚙️ *Error al obtener estadísticas.*`);
    }
};

handler.command = ['ping', 'p', 'latencia'];
handler.tags = ['main'];
handler.group = true;
module.exports = handler;