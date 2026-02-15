const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))
const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn, usedPrefix, args, command }) => {
  // 1. Verificación de registro
  let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
  let user = global.db.data.users[who]
  if (await checkReg(m, user)) return

  // 2. Validación de entrada
  if (!args[0]) {
    await m.react('🤔')
    return conn.reply(m.chat, `> Debe proporcionar un enlace de Twitter/X.`, m)
  }

  const url = args[0]
  if (!url.match(/(twitter\.com|x\.com)/)) {
    await m.react('❌')
    return conn.reply(m.chat, `> El enlace no parece ser de Twitter o X.`, m)
  }

  // 3. Secuencia técnica de reacciones
  await m.react('🔍')
  await m.react('📥')

  try {
    const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/twiter?url=${encodeURIComponent(url)}`
    const res = await fetch(apiUrl)
    
    if (!res.ok) throw new Error()
    const json = await res.json()

    if (!json.status || !json.data) throw new Error()

    const { HD, SD } = json.data
    const videoUrl = HD || SD

    await m.react('📦')
    await m.react('📤')

    // Envío simplificado
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: `✅ *Descarga exitosa*`
    }, { quoted: m })

    await m.react('✅')

  } catch (error) {
    console.error('[Twitter Error]:', error.message)
    await m.react('❌')
    return conn.reply(m.chat, `> 🌪️ *Vaya drama...* No pude descargar el video.`, m)
  }
}

handler.help = ['twitter <url>']
handler.tags = ['downloader']
handler.command = /^(twitter|tw|twdl|x)$/i
handler.group = true

module.exports = handler