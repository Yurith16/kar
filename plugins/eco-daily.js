const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  let cooldown = 86400000 
  let time = (user.lastclaim || 0) + cooldown
  if (new Date() - (user.lastclaim || 0) < cooldown) {
      await m.react('⏳')
      return m.reply(`> ⏳ *¡Paciencia, tesoro!* Vuelve en:\n> 🕒 *${msToTime(time - new Date())}*`)
  }

  let coinHasil = Math.floor(Math.random() * 2500) + 1000 
  let expHasil = Math.floor(Math.random() * 3000) + 1500 
  let diamondHasil = Math.floor(Math.random() * 10) + 5
  let hotpassHasil = Math.floor(Math.random() * 3) + 1 

  const emjisNaturaleza = ['🌿', '🍃', '🍀', '🌱', '🌼', '🌸', '🌺', '🌹', '🌷']
  await m.react(emjisNaturaleza.getRandom())

  user.coin = (user.coin || 0) + coinHasil
  user.exp = (user.exp || 0) + expHasil
  user.diamond = (user.diamond || 0) + diamondHasil
  user.hotpass = (user.hotpass || 0) + hotpassHasil
  user.lastclaim = new Date() * 1

  let h = emjisNaturaleza.getRandom()
  let txt = `> ${h} *「 𝚁𝙴𝙲𝙾𝙼𝙿𝙴𝙽𝚂𝙰 𝙳𝙸𝙰𝚁𝙸𝙰 」* ${h}\n\n`
  txt += `> 💰 *Coin:* » +${coinHasil.toLocaleString()}\n`
  txt += `> ✨ *Exp:* » +${expHasil.toLocaleString()}\n`
  txt += `> 💎 *Diamond:* » +${diamondHasil}\n`
  txt += `> 🔥 *HotPass:* » +${hotpassHasil}\n\n`
  txt += `> ✨ *¡Disfruta tus regalos del día!*`

  // --- ENVIAR CON DISEÑO SEGURO ---
  let messageOptions = { text: txt }
  if (global.rcanal && global.rcanal.contextInfo) {
      messageOptions.contextInfo = global.rcanal.contextInfo
  }

  await conn.sendMessage(m.chat, messageOptions, { quoted: m })
}

handler.help = ['daily']
handler.tags = ['economy']
handler.command = /^(daily|diario|recompensa|claim)$/i
handler.register = true
module.exports = handler

function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60)
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    return `${hours < 10 ? "0" + hours : hours}h ${minutes < 10 ? "0" + minutes : minutes}m ${seconds < 10 ? "0" + seconds : seconds}s`
}