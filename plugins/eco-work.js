const { checkReg } = require('../lib/checkReg.js')

const FRASES = [
  "Trabajaste como barman en un club de lujo",
  "Limpiaste los servidores de KarBot con éxito",
  "Hiciste de guardaespalda para un político corrupto",
  "Vendiste contenido exclusivo en internet",
  "Fuiste mercenario en una guerra lejana",
  "Ayudaste a una anciana a cruzar la calle (y le robaste)",
  "Trabajaste turnos extra en una cafetería",
  "Hackeaste una cuenta bancaria pequeña",
  "Fuiste repartidor de comida bajo la lluvia",
  "Diste clases particulares de programación",
  "Trabajaste como extra en una película muy intensa",
  "Recogiste basura en la playa"
]

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  // Cooldown de 5 minutos
  let cooldown = 300000 
  let time = (user.lastwork || 0) + cooldown
  let h = ["🍃", "🌿", "🍀", "🌱", "☘️"].getRandom()

  if (new Date() - (user.lastwork || 0) < cooldown) {
      await m.react('⏳')
      return m.reply(`> ⏳ *No te agotes, vida mía.* Vuelve en: **${msToTime(time - new Date())}**`)
  }

  // Recompensas de trabajo
  let coinHasil = Math.floor(Math.random() * 800) + 300
  let expHasil = Math.floor(Math.random() * 700) + 200
  let chamba = FRASES.getRandom()

  const reacciones = ['🌿', '🍃', '🍀', '🌱', '🌼', '🌸', '🌺', '🌹', '🌷']
  await m.react(reacciones.getRandom())

  user.coin = (user.coin || 0) + coinHasil
  user.exp = (user.exp || 0) + expHasil
  user.lastwork = new Date() * 1

  let txt = `> ${h} *「 𝚃𝚁𝙰𝙱𝙰𝙹𝙾 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙰𝙳𝙾 」* ${h}\n\n`
  txt += `> 🛠️ *Labor:* » ${chamba}\n\n`
  txt += `> 🪙 *Kryons:* » +${coinHasil}\n`
  txt += `> ✨ *Exp:* » +${expHasil}\n\n`
  txt += `> 💋 _El esfuerzo rinde frutos... sigue así, tesoro._`

  let messageOptions = { text: txt }
  if (global.rcanal && global.rcanal.contextInfo) {
      messageOptions.contextInfo = global.rcanal.contextInfo
  }

  await conn.sendMessage(m.chat, messageOptions, { quoted: m })
}

handler.help = ['work']
handler.tags = ['economy']
handler.command = ['work', 'trabajar', 'chamba'] 
handler.register = true

function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60)
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    return `${minutes}m ${seconds}s`
}

module.exports = handler