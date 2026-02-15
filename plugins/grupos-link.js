const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn, isBotAdmin }) => {
  const userId = m.sender
  const user = global.db.data.users[userId]
  
  // Verificación de registro rápida
  if (await checkReg(m, user)) return
  
  // Validaciones de entorno
  if (!m.isGroup) return
  if (!isBotAdmin) return m.reply(`> ❌ *Necesito ser administradora para generar el enlace, vida mía.*`)

  try {
    // Reacción inicial con planta 🌱
    await m.react('🌱')
    
    const groupCode = await conn.groupInviteCode(m.chat)
    const inviteLink = `https://chat.whatsapp.com/${groupCode}`
    
    // Mensaje minimalista con estilo KarBot
    let txt = `> 🌿 *Enlace del grupo*\n\n`
    txt += `> ${inviteLink}\n\n`
    txt += `> 🍀 *Comparte con quien desees.*`
    
    await conn.reply(m.chat, txt, m)
    
    // El engranaje final de KarBot ⚙️
    await m.react('⚙️')

  } catch (error) {
    console.error(error)
    await m.react('❌')
    return m.reply(`> 🥀 *Hubo un drama técnico y no pude obtener el link.*`)
  }
}

handler.help = ['link']
handler.tags = ['group']
handler.command = ['link', 'enlace']
handler.group = true
handler.botAdmin = true

module.exports = handler