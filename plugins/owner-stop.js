const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Guardar información del chat para el mensaje de detención
function saveStopInfo(chatId) {
    const stopFile = path.join(ROOT, 'temp', 'stop_info.json');
    const info = {
        chatId: chatId,
        timestamp: Date.now(),
        type: 'stop'
    };

    const tempDir = path.join(ROOT, 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(stopFile, JSON.stringify(info, null, 2));
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    // Verificar si es owner (basado en global.owner)
    const senderNumber = m.sender.split('@')[0];
    const isOwner = global.owner.map(v => v[0]).includes(senderNumber);

    if (!isOwner) {
        await m.react('🚫');
        return m.reply(`> 🚫 *Solo el owner puede usar este comando.*`);
    }

    // Guardar información para posible reconexión (opcional)
    saveStopInfo(m.chat);

    await m.react('🛑');

    // Mensaje de detención
    try {
        await conn.reply(
            m.chat,
            `*⚙️ 𝙺𝙰𝚁𝙱𝙾𝚃 ⚙️*\n\n` +
            `> 🛑 𝙳𝙴𝚃𝙴𝙽𝙸𝙴𝙽𝙳𝙾 𝙴𝙻 𝙱𝙾𝚃\n\n` +
            `> 👤 *Usuario:* @${m.sender.split('@')[0]}\n` +
            `> ⏰ *Hora:* ${new Date().toLocaleString('es-ES', { timeZone: 'America/Tegucigalpa' })}\n\n` +
            `> 🔴 𝙴𝙻 𝙱𝙾𝚃 𝚂𝙴 𝙷𝙰 𝙳𝙴𝚃𝙴𝙽𝙸𝙳𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙰𝙼𝙴𝙽𝚃𝙴\n` +
            `> 🟢 𝙿𝙰𝚁𝙰 𝚁𝙴𝙸𝙽𝙸𝙲𝙸𝙰𝚁𝙻𝙾, 𝚄𝚂𝙰 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 𝙳𝙴 𝙸𝙽𝙸𝙲𝙸𝙾`,
            m,
            { mentions: [m.sender] }
        );
    } catch {}

    // Pequeño delay y salir
    setTimeout(() => {
        try { 
            console.log('🛑 Bot detenido por comando stop');
            process.exit(0); 
        } catch {}
    }, 2000);
};

// Función opcional para mensaje cuando se intenta reconectar (si aplica)
async function sendStopMessage(conn) {
    const stopFile = path.join(ROOT, 'temp', 'stop_info.json');

    if (fs.existsSync(stopFile)) {
        try {
            const info = JSON.parse(fs.readFileSync(stopFile, 'utf8'));

            // Si quieres enviar un mensaje cuando el bot se reinicie después de un stop
            // (esto normalmente no aplica porque el bot se detuvo, pero por si acaso)

            fs.unlinkSync(stopFile);
        } catch (error) {
            console.error('❌ ERROR STOP:', error);
        }
    }
}

handler.help = ['stop', 'detener'];
handler.tags = ['owner'];
handler.command = /^(stop|detener|apagar)$/i;

module.exports = handler;