import { checkReg } from '../lib/checkReg.js'

let autoadminGlobal = global.autoadminGlobal ?? true
global.autoadminGlobal = autoadminGlobal

const handler = async (m, { conn, isAdmin, isBotAdmin, isROwner, usedPrefix, command, args }) => {
  const userId = m.sender
  const user = global.db.data.users[userId]
  
  // Verificación de registro
  if (await checkReg(m, user)) return
  
  // Si el comando está desactivado globalmente
  if (!global.autoadminGlobal && !isROwner) {
    return conn.reply(m.chat, '> Sistema desactivado.', m)
  }

  // Si el bot no es admin
  if (!isBotAdmin) {
    return conn.reply(m.chat, '> Necesito ser admin.', m)
  }

  // Si ya es admin
  if (isAdmin) {
    return conn.reply(m.chat, '> Ya eres admin.', m)
  }

  try {
    // Reacción inicial
    await m.react('🔧')
    
    // Promover usuario
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote')
    
    // El engranaje final de KarBot ⚙️
    await m.react('⚙️')
    
    await conn.reply(m.chat, '> Ahora eres admin.', m)

  } catch (error) {
    await m.react('❌')
    await conn.reply(m.chat, '> Lo siento, hubo un error.', m)
  }
}

handler.help = ['autoadmin']
handler.tags = ['group', 'owner']
handler.command = ['autoadmin']
handler.group = true

export default handler