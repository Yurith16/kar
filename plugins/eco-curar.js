const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  if ((user.health || 0) >= 100) return m.reply(`> ❤️ *Cariño, ya tienes salud de hierro.* ¡No malgastes medicina!`)
  if ((user.medicina || 0) < 1) return m.reply(`> 💊 *No tienes medicinas.* Ve a la *.comprar medicina* antes de que el drama sea peor.`)

  user.medicina -= 1
  user.health = 100

  await m.react('💖')
  let txt = `> 💖 *「 𝚂𝙰𝙽𝙰𝙲𝙸𝙾𝙽 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙰 」*\n\n`
  txt += `> ✨ *Estado:* » Salud al 100%\n`
  txt += `> 📉 *Inventario:* » -1 Medicina\n\n`
  txt += `> *¡Ya estás como nuevo para volver a la mina!*`

  let messageOptions = { text: txt }
  if (global.rcanal?.contextInfo) messageOptions.contextInfo = global.rcanal.contextInfo
  await conn.sendMessage(m.chat, messageOptions, { quoted: m })
}

handler.help = ['curar']
handler.tags = ['economy']
handler.command = /^(curar|heal|recover)$/i
handler.register = true
module.exports = handler