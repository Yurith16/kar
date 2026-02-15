const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn, usedPrefix, command }) => {
  // Obtener el sender
  const sender = m.key.participant || m.key.remoteJid;
  const user = global.db.data.users[sender];
  const senderNumber = sender.split('@')[0]; // Extraer solo el número
  
  // Verificación de registro
  if (await checkReg(m, user)) return
  
  // Verificar si es owner (basado en global.owner)
  const isOwner = global.owner.map(v => v[0]).includes(senderNumber);
  
  if (!isOwner) {
    await m.react('🚫')
    return conn.reply(m.chat, '> Solo el owner puede usar este comando.', m)
  }

  try {
    await m.react('🔧')
    
    if (command === 'abrir') {
      await conn.groupSettingUpdate(m.chat, 'not_announcement')
      await m.react('✅')
      await conn.reply(m.chat, '> ✅ *Grupo abierto*', m)
      
    } else if (command === 'cerrar') {
      await conn.groupSettingUpdate(m.chat, 'announcement')
      await m.react('✅')
      await conn.reply(m.chat, '> ✅ *Grupo cerrado*', m)
    }

  } catch (error) {
    console.error(error)
    await m.react('❌')
    await conn.reply(m.chat, '> ❌ *Error*', m)
  }
}

handler.help = ['abrir', 'cerrar']
handler.tags = ['group']
handler.command = ['abrir', 'cerrar']
handler.group = true
handler.owner = true // Esto asegura que solo el owner pueda usar el comando

module.exports = handler