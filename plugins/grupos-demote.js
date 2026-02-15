const { checkReg } = require('../lib/checkReg.js')

const handler = async (m, { conn, participants, isAdmin, isBotAdmin }) => {
  const userId = m.sender
  const user = global.db.data.users[userId]
  
  // Verificación de registro
  if (await checkReg(m, user)) return
  
  // Solo funciona en grupos
  if (!m.isGroup) return
  
  // Si el bot no es admin
  if (!isBotAdmin) {
    await m.react('🌱')
    return
  }
  
  // Si el usuario no es admin
  if (!isAdmin) {
    await m.react('🍀')
    return
  }

  // Identificar al objetivo (citado o mencionado)
  let targetUser = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0])
  
  if (!targetUser) {
    await m.react('❓')
    return conn.reply(m.chat, '> Menciona a un admin.', m)
  }

  const userInGroup = participants.find(p => p.id === targetUser)
  if (!userInGroup) {
    await m.react('❌')
    return conn.reply(m.chat, '> No está en el grupo.', m)
  }

  // Protección para el Creador (Superadmin)
  if (userInGroup.admin === 'superadmin') {
    await m.react('⚠️')
    return conn.reply(m.chat, '> No puedo quitar admin al creador.', m)
  }

  // Verificar si ya no es admin
  if (userInGroup.admin !== 'admin') {
    await m.react('ℹ️')
    return conn.reply(m.chat, '> No es admin.', m)
  }

  await m.react('🔧')

  try {
    await conn.groupParticipantsUpdate(m.chat, [targetUser], 'demote')
    
    // El engranaje final de KarBot ⚙️
    await m.react('⚙️')
    
    await conn.reply(m.chat, '> 🍃 Admin removido.', m)
    
  } catch (error) {
    console.error(error)
    await m.react('❌')
    await conn.reply(m.chat, '> Lo siento, hubo un error.', m)
  }
}

handler.help = ['demote']
handler.tags = ['group']
handler.command = /^(demote|quitaradmin)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

module.exports = handler