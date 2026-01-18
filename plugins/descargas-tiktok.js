import axios from 'axios'
import { checkReg } from '../lib/checkReg.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const userId = m.sender
  const user = global.db.data.users[userId]
  
  // Verificación de registro
  if (await checkReg(m, user)) return
  
  if (!text) {
    return conn.reply(m.chat, '> Debe proporcionar un enlace de TikTok.', m)
  }

  const isUrl = /(?:https:?\/{2})?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/([^\s&]+)/gi.test(text)
  
  try {
    // Secuencia de reacciones con plantas y tréboles
    const reacciones = ['🔍', '🌿', '🍀', '📥']
    for (const reacc of reacciones) {
      await m.react(reacc)
    }

    if (isUrl) {
      const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}?hd=1`)
      const data = res.data?.data
      
      if (!data?.play && !data?.music) {
        await m.react('❌')
        return conn.reply(m.chat, '> Lo siento, hubo un error.', m)
      }

      const { play, music } = data

      // Si el comando es para audio
      if (command === 'tiktokaudio' || command === 'tta' || command === 'ttaudio') {
        if (!music) {
          await m.react('❌')
          return conn.reply(m.chat, '> Lo siento, hubo un error.', m)
        }

        await conn.sendMessage(
          m.chat,
          {
            audio: { url: music },
            mimetype: 'audio/mpeg',
            fileName: `tiktok_audio.mp3`,
            ptt: false,
            caption: '> Descarga completada'
          },
          { quoted: m }
        )

        // El engranaje final de KarBot ⚙️
        await m.react('⚙️')
        return
      }

      // Comando normal de TikTok (video)
      await conn.sendMessage(m.chat, { 
        video: { url: play }, 
        caption: '> Descarga completada'
      }, { quoted: m })

    } else {
      // Búsqueda por texto (solo para comando normal)
      if (command === 'tiktokaudio' || command === 'tta' || command === 'ttaudio') {
        return conn.reply(m.chat, '> Para descargar audio necesitas un enlace de TikTok.', m)
      }

      const res = await axios({
        method: 'POST',
        url: 'https://tikwm.com/api/feed/search',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        data: { keywords: text, count: 5, cursor: 0, HD: 1 }
      })

      const results = res.data?.data?.videos?.filter(v => v.play) || []
      if (results.length === 0) {
        await m.react('❌')
        return conn.reply(m.chat, '> Lo siento, hubo un error.', m)
      }

      // Enviar solo el primer resultado
      const video = results[0]
      
      await conn.sendMessage(m.chat, { 
        video: { url: video.play }, 
        caption: '> Descarga completada'
      }, { quoted: m })
    }

    // El engranaje final de KarBot ⚙️
    await m.react('⚙️')

  } catch (e) {
    await m.react('❌')
    await conn.reply(m.chat, '> Lo siento, hubo un error.', m)
  }
}

handler.help = ['tiktok + url', 'tiktokaudio + url']
handler.tags = ['downloader']
handler.command = ['tiktok', 'tt', 'tiktokaudio', 'tta', 'ttaudio']
handler.group = true

export default handler