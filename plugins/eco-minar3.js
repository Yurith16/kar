const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  // Validaciones de salud y suministros (Nivel Crítico)
  if ((user.health || 0) <= 55) return m.reply(`> 🤒 *¡Peligro!* Minar aquí con poca salud es un suicidio. Usa *.curar*.`)
  if ((user.pico || 0) < 3 || (user.agua || 0) < 3) {
    return m.reply(`> ⛏️ *¡Drama en la mina 3!* Te faltan 3 Picos o 3 Aguas.\n> 🛒 *Visita la tienda con:* .comprar`)
  }

  // Cooldown independiente
  let cooldown = 300000 
  if (new Date() - (user.lastmine3 || 0) < cooldown) {
      await m.react('⏳')
      return m.reply(`> ⏳ La mina 3 es profunda y lenta. Vuelve en: **${Math.floor((user.lastmine3 + cooldown - new Date()) / 1000 / 60)}m**`)
  }

  // Gasto de recursos (Triple que nivel 1)
  let healthLost = Math.floor(Math.random() * 20) + 35
  user.health -= healthLost
  user.pico -= 3
  user.agua -= 3
  user.lastmine3 = new Date() * 1

  // Recompensas +10%
  let coin = Math.floor((Math.random() * 5000 + 2500) * 1.10)
  let exp = Math.floor((Math.random() * 2000 + 1000) * 1.10)
  let dmd = Math.floor(Math.random() * 5) + 2

  user.coin += coin
  user.exp += exp
  user.diamond += dmd

  await m.react('⛏️')
  let txt = `> 🍀 *「 𝙼𝙸𝙽𝙴𝚁𝙸𝙰: 𝙽𝙸𝚅𝙴𝙻 𝟹 」*\n\n`
  txt += `> 🪙 *Kryons:* » +${coin.toLocaleString()}\n`
  txt += `> ✨ *Exp:* » +${exp.toLocaleString()}\n`
  txt += `> 💎 *Diamond:* » +${dmd}\n\n`
  txt += `> ❤️ *Salud:* » ${user.health < 0 ? 0 : user.health}%`

  let messageOptions = { text: txt }
  if (global.rcanal?.contextInfo) messageOptions.contextInfo = global.rcanal.contextInfo
  await conn.sendMessage(m.chat, messageOptions, { quoted: m })
}

handler.help = ['minar3']
handler.tags = ['economy']
handler.command = /^(minar3|mine3)$/i
handler.register = true
module.exports = handler