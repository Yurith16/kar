const { checkReg } = require('../lib/checkReg.js')

const handler = async (m, { conn, text, participants, isAdmin, isBotAdmin, isOwner, usedPrefix, command }) => {
  const userId = m.sender
  const user = global.db.data.users[userId]
  
  // Verificación de registro
  if (await checkReg(m, user)) return
  
  // Validación de grupo
  if (!m.isGroup) {
    await m.react('❌')
    return conn.reply(m.chat, '> Solo funciona en grupos.', m)
  }

  // Verificación de Admin o Owner (Estilo Tag)
  if (!isAdmin && !isOwner) {
    await m.react('🚫')
    return conn.reply(m.chat, '> 🚫 *𝙽𝙾 𝙴𝚁𝙴𝚂 𝙰𝙳𝙼𝙸𝙽*\n\n▸ 𝚂𝚘𝚕𝚘 𝚕𝚘𝚜 𝚊𝚍𝚖𝚒𝚗𝚜 𝚙𝚞𝚎𝚍𝚎𝚗 𝚞𝚜𝚊𝚛 𝚎𝚜𝚝𝚎 𝚌𝚘𝚖𝚊𝚗𝚍𝚘', m)
  }

  // Verificar si el bot tiene poder
  if (!isBotAdmin) {
    await m.react('🌱')
    return conn.reply(m.chat, '> Necesito ser admin para dar rangos, cielo.', m)
  }

  try {
    let targetUser = null
    
    if (m.mentionedJid && m.mentionedJid.length > 0) {
      targetUser = m.mentionedJid[0]
    } else if (m.quoted) {
      targetUser = m.quoted.sender
    }

    if (!targetUser) {
      await m.react('❓')
      return conn.reply(m.chat, '> Menciona o responde a un usuario.', m)
    }

    const userInGroup = participants.find(p => 
      p.id === targetUser || 
      p.jid === targetUser
    )

    if (!userInGroup) {
      await m.react('❌')
      return conn.reply(m.chat, '> El usuario no está en el grupo.', m)
    }

    // Comprobar si ya es admin o superadmin
    if (userInGroup.admin === 'admin' || userInGroup.admin === 'superadmin') {
      await m.react('ℹ️')
      return conn.reply(m.chat, '> El usuario ya es administrador.', m)
    }

    // Reacción de procesamiento con hojita 🍃
    await m.react('🍃')
    
    await conn.groupParticipantsUpdate(m.chat, [targetUser], 'promote')
    
    // El engranaje final de KarBot ⚙️
    await m.react('⚙️')
    
    await conn.reply(m.chat, '> 🍃 *¡Felicidades, cariño! Has sido promovido a administrador.*', m)

  } catch (error) {
    console.error(error)
    await m.react('❌')
    
    if (error.message?.includes('not authorized')) {
      return conn.reply(m.chat, '> Sin permisos suficientes para esta acción.', m)
    } else if (error.message?.includes('not in group')) {
      return conn.reply(m.chat, '> El usuario no está en el grupo.', m)
    } else {
      return conn.reply(m.chat, '> Lo siento, hubo un error.', m)
    }
  }
}

handler.help = ['promote']
handler.tags = ['group']
handler.command = /^(promote|daradmin)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

module.exports = handler