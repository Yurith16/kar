import { performance } from 'perf_hooks'
import { checkReg } from '../lib/checkReg.js'

let handler = async (m, { conn }) => {
  const userId = m.sender
  const user = global.db.data.users[userId]
  
  // Verificación de registro
  if (await checkReg(m, user)) return
  
  try {
    // Reacción inicial con engranaje
    await m.react('⚙️')

    // Medición precisa del ping
    const start = performance.now()
    
    // Enviar mensaje de prueba
    await conn.sendMessage(m.chat, { 
      text: '🍃',
      ephemeralExpiration: 86400
    })
    
    const end = performance.now()
    const ping = Math.round(end - start)

    // Evaluación del ping
    let emoji, status
    if (ping < 100) {
      emoji = '🚀'
      status = 'Excelente'
    } else if (ping < 300) {
      emoji = '⚡'
      status = 'Rápido'
    } else if (ping < 600) {
      emoji = '📶'
      status = 'Estable'
    } else {
      emoji = '🐢'
      status = 'Lento'
    }

    // Obtener uptime
    const uptime = process.uptime()
    const horas = Math.floor(uptime / 3600)
    const minutos = Math.floor((uptime % 3600) / 60)
    const segundos = Math.floor(uptime % 60)
    
    // Formatear uptime
    let uptimeStr = ''
    if (horas > 0) uptimeStr += `${horas}h `
    if (minutos > 0) uptimeStr += `${minutos}m `
    uptimeStr += `${segundos}s`

    // Memoria RAM
    const memory = (process.memoryUsage().rss / 1024 / 1024).toFixed(2)

    // Crear mensaje con diseño único
    const lines = [
      '╭━━━━━━━━━━━━━━━━━━━━╮',
      `┃ 🍃  *KARBOT PING*  🍃`,
      '╰━━━━━━━━━━━━━━━━━━━━╯',
      '',
      `🍃 *Tiempo:* ${ping} ms`,
      `🌿 *Estado:* ${status} ${emoji}`,
      `🍀 *Activo:* ${uptimeStr}`,
      `🌱 *RAM:* ${memory} MB`,
      '',
      '╭━━━━━━━━━━━━━━━━━━━━╮',
      '┃     ⚙️  SISTEMA  ⚙️',
      '╰━━━━━━━━━━━━━━━━━━━━╯'
    ]

    await conn.reply(m.chat, lines.join('\n'), m)
    
    // El engranaje final de KarBot
    await m.react('⚙️')

  } catch (error) {
    console.error('Error en ping:', error)
    await m.react('❌')
    await conn.reply(m.chat, '> Error al calcular.', m)
  }
}

handler.command = ['ping', 'p', 'latencia']
handler.tags = ['main']

export default handler