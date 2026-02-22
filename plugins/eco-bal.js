const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    if (await checkReg(m, user)) return

    // --- REACCIÓN AL MENSAJE (¡Ahora sí!) ---
    const reacciones = ['🏛️', '💰', '🏦', '💹', '💳', '✨', '💎']
    await m.react(reacciones.getRandom())

    let cartera = (user.coin || 0)
    let banco = (user.bank || 0)
    let total = cartera + banco
    let emji = ["🍃", "🌿", "🍀", "🌱", "☘️"].getRandom()

    let txt = `> 🏦 *「 𝙱𝙰𝙻𝙰𝙽𝙲𝙴 𝙵𝙸𝙽𝙰𝙽𝙲𝙸𝙴𝚁𝙾 」*\n\n`
    txt += `> ${emji} *Cartera:* » ${cartera.toLocaleString()} 🪙\n`
    txt += `> ${emji} *Banco:* » ${banco.toLocaleString()} 🪙\n`
    txt += `> ${emji} *Total:* » ${total.toLocaleString()} 🪙\n\n`

    txt += `> 💎 *「 𝙰𝙲𝚃𝙸𝚅𝙾𝚂 𝙴𝚂𝙿𝙴𝙲𝙸𝙰𝙻𝙴𝚂 」*\n\n`
    txt += `> 💎 *Diamonds:* » ${(user.diamond || 0).toLocaleString()}\n`
    txt += `> 🔥 *HotPass:* » ${(user.hotpass || 0).toLocaleString()}\n\n`
    txt += `> ${emji} *𝙺𝙰𝚁 𝚂𝙸𝚂𝚃𝙴𝙼𝙰 𝙳𝚄𝙰𝙻*`

    // --- ENVIAR CON DISEÑO SEGURO ---
    let messageOptions = { text: txt }
    if (global.rcanal && global.rcanal.contextInfo) {
        messageOptions.contextInfo = global.rcanal.contextInfo
    }

    await conn.sendMessage(m.chat, messageOptions, { quoted: m })
}

handler.help = ['bal']
handler.tags = ['economy']
handler.command = /^(bal|balance|cartera|wallet)$/i
handler.register = true
module.exports = handler