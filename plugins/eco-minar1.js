const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  // Validaciones iniciales
  if ((user.health || 0) <= 20) {
      return m.reply(`> 🤒 *Estás muy débil, corazón.* Usa *.curar* antes de entrar a la mina.`)
  }

  if ((user.pico || 0) < 1 || (user.agua || 0) < 1) {
    return m.reply(`> ⛏️ *¡Drama en la mina!* Te falta un Pico o Agua.\n> 🛒 *Visita la tienda con:* .comprar`)
  }

  // Cooldown independiente para la mina 1 (5 minutos)
  let cooldown = 300000 
  if (new Date() - (user.lastmine1 || 0) < cooldown) {
      await m.react('⏳')
      let tiempoRestante = Math.ceil((user.lastmine1 + cooldown - new Date()) / 1000 / 60)
      return m.reply(`> ⏳ *No tan rápido.* La mina 1 se está regenerando. Vuelve en: **${tiempoRestante}m**`)
  }

  // Gasto de recursos base
  let healthLost = Math.floor(Math.random() * 10) + 10
  user.health -= healthLost
  user.pico -= 1
  user.agua -= 1
  user.lastmine1 = new Date() * 1

  // Recompensas base
  let coin = Math.floor(Math.random() * 1500) + 500
  let exp = Math.floor(Math.random() * 800) + 200
  let dmd = Math.floor(Math.random() * 2) // Puede dar 0 o 1 diamante

  user.coin = (user.coin || 0) + coin
  user.exp = (user.exp || 0) + exp
  user.diamond = (user.diamond || 0) + dmd

  await m.react('⛏️')

  let h = ["🍃", "🌿", "🍀", "🌱", "☘️"].getRandom()
  let txt = `> ${h} *「 𝙼𝙸𝙽𝙴𝚁𝙸𝙰: 𝙽𝙸𝚅𝙴𝙻 𝟷 」* ${h}\n\n`
  txt += `> 🪙 *Kryons:* » +${coin.toLocaleString()}\n`
  txt += `> ✨ *Exp:* » +${exp.toLocaleString()}\n`
  txt += `> 💎 *Diamond:* » +${dmd}\n\n`
  txt += `> 📉 *Gastos:* -1 Pico, -1 Agua, -${healthLost}% Salud\n`
  txt += `> ❤️ *Salud:* » ${user.health}%`

  // Envío seguro
  let messageOptions = { text: txt }
  if (global.rcanal && global.rcanal.contextInfo) {
      messageOptions.contextInfo = global.rcanal.contextInfo
  }

  await conn.sendMessage(m.chat, messageOptions, { quoted: m })
}

handler.help = ['minar']
handler.tags = ['economy']
handler.command = /^(minar|mine)$/i
handler.register = true

module.exports = handler