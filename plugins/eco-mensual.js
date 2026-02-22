const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  // Cooldown de 30 días (1 mes)
  let cooldown = 2592000000 
  let time = (user.lastmonthly || 0) + cooldown
  if (new Date() - (user.lastmonthly || 0) < cooldown) {
      await m.react('⏳')
      return m.reply(`> ⏳ *¡Vaya drama, todavía no toca!*\n> 📅 Vuelve en: **${msToTime(time - new Date())}**`)
  }

  // Recompensas Generosas
  let coinHasil = Math.floor(Math.random() * 25000) + 15000 
  let expHasil = Math.floor(Math.random() * 30000) + 10000
  let diamondHasil = Math.floor(Math.random() * 100) + 50
  let hotpassHasil = 500

  // Reacción temática de éxito
  const emjisNaturaleza = ['🌿', '🍃', '🍀', '🌱', '🌼', '🌸', '🌺', '🌹', '🌷']
  await m.react('🎁')

  // Actualización de datos
  user.coin = (user.coin || 0) + coinHasil
  user.exp = (user.exp || 0) + expHasil
  user.diamond = (user.diamond || 0) + diamondHasil
  user.hotpass = (user.hotpass || 0) + hotpassHasil
  user.lastmonthly = new Date() * 1

  let h = emjisNaturaleza.getRandom()

  // Construcción del mensaje (Diseño limpio y elegante)
  let txt = `> ${h} *「 𝚁𝙴𝙲𝙾𝙼𝙿𝙴𝙽𝚂𝙰 𝙼𝙴𝙽𝚂𝚄𝙰𝙻 」* ${h}\n\n`
  txt += `> 💰 *Coin:* » +${coinHasil.toLocaleString()}\n`
  txt += `> ✨ *Exp:* » +${expHasil.toLocaleString()}\n`
  txt += `> 💎 *Diamond:* » +${diamondHasil}\n`
  txt += `> 🔥 *HotPass:* » +${hotpassHasil}\n\n`
  txt += `> ✨ *¡Menudo botín te has llevado, cielo!*`

  // --- ENVIAR CON DISEÑO SEGURO ---
  let messageOptions = { text: txt }
  if (global.rcanal && global.rcanal.contextInfo) {
      messageOptions.contextInfo = global.rcanal.contextInfo
  }

  await conn.sendMessage(m.chat, messageOptions, { quoted: m })
}

handler.help = ['monthly']
handler.tags = ['economy']
handler.command = /^(monthly|mensual)$/i
handler.register = true

module.exports = handler

function msToTime(duration) {
    let days = Math.floor(duration / (1000 * 60 * 60 * 24))
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    return `${days} días y ${hours}h`
}