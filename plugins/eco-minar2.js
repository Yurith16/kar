const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  // Validaciones de salud y suministros
  if ((user.health || 0) <= 35) return m.reply(`> 🤒 *Nivel 2 requiere más energía.* Usa *.curar* primero.`)
  if ((user.pico || 0) < 2 || (user.agua || 0) < 2) {
    return m.reply(`> ⛏️ *¡Drama en la mina 2!* Te faltan 2 Picos o 2 Aguas.\n> 🛒 *Visita la tienda con:* .comprar`)
  }

  // Cooldown independiente
  let cooldown = 300000 
  if (new Date() - (user.lastmine2 || 0) < cooldown) {
      await m.react('⏳')
      return m.reply(`> ⏳ La mina 2 se está regenerando. Vuelve en: **${Math.floor((user.lastmine2 + cooldown - new Date()) / 1000 / 60)}m**`)
  }

  // Gasto de recursos (Doble que nivel 1)
  let healthLost = Math.floor(Math.random() * 15) + 20
  user.health -= healthLost
  user.pico -= 2
  user.agua -= 2
  user.lastmine2 = new Date() * 1

  // Recompensas +5%
  let coin = Math.floor((Math.random() * 2500 + 1000) * 1.05)
  let exp = Math.floor((Math.random() * 1200 + 500) * 1.05)
  let dmd = Math.floor(Math.random() * 3) + 1 

  user.coin += coin
  user.exp += exp
  user.diamond += dmd

  await m.react('⛏️')
  let txt = `> 🍃 *「 𝙼𝙸𝙽𝙴𝚁𝙸𝙰: 𝙽𝙸𝚅𝙴𝙻 𝟸 」*\n\n`
  txt += `> 🪙 *Kryons:* » +${coin.toLocaleString()}\n`
  txt += `> ✨ *Exp:* » +${exp.toLocaleString()}\n`
  txt += `> 💎 *Diamond:* » +${dmd}\n\n`
  txt += `> ❤️ *Salud:* » ${user.health}%`

  let messageOptions = { text: txt }
  if (global.rcanal?.contextInfo) messageOptions.contextInfo = global.rcanal.contextInfo
  await conn.sendMessage(m.chat, messageOptions, { quoted: m })
}

handler.help = ['minar2']
handler.tags = ['economy']
handler.command = /^(minar2|mine2)$/i
handler.register = true
module.exports = handler