const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  // Cooldown de 1 hora
  let cooldown = 3600000 
  let time = (user.lasthourly || 0) + cooldown
  if (new Date() - (user.lasthourly || 0) < cooldown) {
      await m.react('⏳')
      return m.reply(`> ⏳ *¡Un momento, corazón!* Vuelve en:\n> 🕒 *${msToTime(time - new Date())}*`)
  }

  // Recompensas
  let coinHasil = Math.floor(Math.random() * 600) + 200
  let expHasil = Math.floor(Math.random() * 500) + 100
  let diamondHasil = Math.floor(Math.random() * 2)

  // Reacción temática
  const emjisNaturaleza = ['🌿', '🍃', '🍀', '🌱', '🌼', '🌸', '🌺', '🌹', '🌷']
  await m.react(emjisNaturaleza.getRandom())

  // Actualización de datos
  user.coin = (user.coin || 0) + coinHasil
  user.exp = (user.exp || 0) + expHasil
  user.diamond = (user.diamond || 0) + diamondHasil
  user.lasthourly = new Date() * 1

  let h = emjisNaturaleza.getRandom()

  // Construcción del texto (Sin la frase de Sistema Dual)
  let txt = `> ${h} *「 𝚁𝙴𝙲𝙾𝙼𝙿𝙴𝙽𝚂𝙰 𝚇 𝙷𝙾𝚁𝙰 」* ${h}\n\n`
  txt += `> 💰 *Coin:* » +${coinHasil.toLocaleString()}\n`
  txt += `> ✨ *Exp:* » +${expHasil.toLocaleString()}\n`
  txt += `> 💎 *Diamond:* » +${diamondHasil}\n\n`
  txt += `> ✨ *Regalito extra para que florezcas.*`

  // --- ENVIAR CON DISEÑO SEGURO ---
  let messageOptions = { text: txt }
  if (global.rcanal && global.rcanal.contextInfo) {
      messageOptions.contextInfo = global.rcanal.contextInfo
  }

  await conn.sendMessage(m.chat, messageOptions, { quoted: m })
}

handler.help = ['hourly']
handler.tags = ['economy']
handler.command = /^(hourly|hora|recompensahora)$/i
handler.register = true

module.exports = handler

function msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let seconds = Math.floor((duration / 1000) % 60)
    return `${minutes}m ${seconds}s`
}