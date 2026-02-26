const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  // Cooldown de 5 minutos (300,000 ms)
  let cooldown = 300000 
  let time = (user.lastmine1 || 0) + cooldown
  let h = ["🍃", "🌿", "🍀", "🌱", "☘️"].getRandom()

  if (new Date() - (user.lastmine1 || 0) < cooldown) {
      await m.react('⏳')
      return m.reply(`> ⏳ *Descansa un poco, tesoro.* La mina aún no tiene nuevos recursos. Vuelve en: **${msToTime(time - new Date())}**`)
  }

  try {
    // Recompensas balanceadas
    let coin = Math.floor(Math.random() * 1500) + 500
    let exp = Math.floor(Math.random() * 800) + 200
    let dmd = Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 1 : 0 // Probabilidad de diamantes

    user.coin = (user.coin || 0) + coin
    user.exp = (user.exp || 0) + exp
    user.diamond = (user.diamond || 0) + dmd
    user.lastmine1 = new Date() * 1

    await m.react('⛏️')

    let txt = `> ${h} *「 𝙼𝙸𝙽𝙴𝚁𝙸𝙰 𝙴𝙻𝙸𝚃𝙴 」* ${h}\n\n`
    txt += `> 🪙 *Coins:* » +${coin.toLocaleString()}\n`
    txt += `> ✨ *Exp:* » +${exp.toLocaleString()}\n`
    if (dmd > 0) txt += `> 💎 *Diamond:* » +${dmd}\n`
    txt += `\n> 💫 _¡Has extraído tesoros con gran elegancia!_`

    let messageOptions = { text: txt }
    // Eliminado rcanal por instrucción previa

    await conn.sendMessage(m.chat, messageOptions, { quoted: m })

  } catch (error) {
    console.error(error)
    await m.react('❌')
    return m.reply(`> ⚠️ Hubo un derrumbe técnico en la mina. Inténtalo luego, corazón.`)
  }
}

handler.help = ['minar']
handler.tags = ['economy']
handler.command = /^(minar|mine)$/i
handler.register = true

function msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let seconds = Math.floor((duration / 1000) % 60)
    return `${minutes}m ${seconds}s`
}

module.exports = handler