const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  let name = conn.getName(m.sender)
  if (await checkReg(m, user)) return

  let h = ["🍃", "🌿", "🍀", "🌱", "☘️"].getRandom()
  let txt = `> ${h} *「 𝙸𝙽𝚅𝙴𝙽𝚃𝙰𝚁𝙸𝙾: ${name.toUpperCase()} 」* ${h}\n\n`
  txt += `> ❤️ *Salud:* » ${user.health || 0}%\n`
  txt += `> 🎖️ *Nivel:* » ${user.level || 1}\n\n`
  txt += `> ⛏️ *Picos:* » ${user.pico || 0}\n`
  txt += `> 💧 *Agua:* » ${user.agua || 0}\n`
  txt += `> 💊 *Medicina:* » ${user.medicina || 0}\n\n`
  txt += `> 💰 *Kryons:* » ${(user.coin || 0).toLocaleString()}\n`
  txt += `> 💎 *Diamonds:* » ${(user.diamond || 0).toLocaleString()}`

  let messageOptions = { text: txt }
  if (global.rcanal?.contextInfo) messageOptions.contextInfo = global.rcanal.contextInfo
  await conn.sendMessage(m.chat, messageOptions, { quoted: m })
}

handler.help = ['inv']
handler.command = /^(inv|inventario|items)$/i
handler.register = true
module.exports = handler