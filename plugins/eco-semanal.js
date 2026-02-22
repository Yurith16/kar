const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  let cooldown = 604800000 
  let time = (user.lastweekly || 0) + cooldown
  let h = ["🍃", "🌿", "🍀", "🌱", "☘️"].getRandom()

  if (new Date() - (user.lastweekly || 0) < cooldown) {
      await m.react('⏳')
      return m.reply(`> ⏳ *Paciencia, vida mía.* Tu recompensa semanal estará lista en: **${msToTime(time - new Date())}**`)
  }

  // Recompensas balanceadas
  let coinHasil = Math.floor(Math.random() * 7000) + 5000 
  let expHasil = Math.floor(Math.random() * 8000) + 4000
  let diamondHasil = Math.floor(Math.random() * 30) + 15
  let hotpassHasil = 100 

  const reacciones = ['🌿', '🍃', '🍀', '🌱', '🌼', '🌸', '🌺', '🌹', '🌷']
  await m.react(reacciones.getRandom())

  user.coin = (user.coin || 0) + coinHasil
  user.exp = (user.exp || 0) + expHasil
  user.diamond = (user.diamond || 0) + diamondHasil
  user.hotpass = (user.hotpass || 0) + hotpassHasil
  user.lastweekly = new Date() * 1

  let txt = `> ${h} *「 𝚁𝙴𝙲𝙾𝙼𝙿𝙴𝙽𝚂𝙰 𝚂𝙴𝙼𝙰𝙽𝙰𝙻 」* ${h}\n\n`
  txt += `> 🪙 *Kryons:* » +${coinHasil.toLocaleString()}\n`
  txt += `> ✨ *Exp:* » +${expHasil.toLocaleString()}\n`
  txt += `> 💎 *Diamond:* » +${diamondHasil}\n`
  txt += `> 🎫 *HotPass:* » +${hotpassHasil}\n\n`
  txt += `> ✨ _¡Has sido constante esta semana, te mereces este capricho!_`

  let messageOptions = { text: txt }
  if (global.rcanal && global.rcanal.contextInfo) {
      messageOptions.contextInfo = global.rcanal.contextInfo
  }

  await conn.sendMessage(m.chat, messageOptions, { quoted: m })
}

handler.help = ['weekly']
handler.tags = ['economy']
handler.command = ['weekly', 'semanal'] 
handler.register = true

function msToTime(duration) {
    let days = Math.floor(duration / (1000 * 60 * 60 * 24))
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    return `${days}d ${hours}h`
}

module.exports = handler