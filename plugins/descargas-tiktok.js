import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `> ⓘ \`Debes proporcionar un enlace o término de búsqueda\``, m)
  }

  const isUrl = /(?:https:?\/{2})?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/([^\s&]+)/gi.test(text)
  try {
    await m.react('🕒')

    if (isUrl) {
      const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}?hd=1`)
      const data = res.data?.data
      if (!data?.play && !data?.music) return conn.reply(m.chat, '> ⓘ \`Enlace inválido o sin contenido descargable\`', m)

      const { title, duration, author, play, music } = data

      // Si el comando es para audio
      if (command === 'tiktokaudio' || command === 'tta' || command === 'ttaudio') {
        if (!music) {
          return conn.reply(m.chat, '> ⓘ \`No se pudo obtener el audio del video\`', m)
        }

        await conn.sendMessage(
          m.chat,
          {
            audio: { url: music },
            mimetype: 'audio/mpeg',
            fileName: `tiktok_audio.mp3`,
            ptt: false
          },
          { quoted: m }
        )

        await m.react('✅')
        return
      }

      // Comando normal de TikTok (video)
      const caption = `> ⓘ \`Título:\` *${title || 'No disponible'}*\n> ⓘ \`Autor:\` *${author?.nickname || 'No disponible'}*`

      await conn.sendMessage(m.chat, { video: { url: play }, caption }, { quoted: m })

    } else {
      // Búsqueda por texto (solo para comando normal)
      if (command === 'tiktokaudio' || command === 'tta' || command === 'ttaudio') {
        return conn.reply(m.chat, '> ⓘ \`Para descargar audio necesitas un enlace de TikTok\`', m)
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
      if (results.length === 0) return conn.reply(m.chat, '> ⓘ \`No se encontraron videos\`', m)

      // Enviar solo el primer resultado
      const video = results[0]
      const caption = `> ⓘ \`Título:\` *${video.title || 'No disponible'}*\n> ⓘ \`Autor:\` *${video.author?.nickname || 'No disponible'}*`
      
      await conn.sendMessage(m.chat, { video: { url: video.play }, caption }, { quoted: m })
    }

    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    await conn.reply(m.chat, `> ⓘ \`Error:\` *${e.message}*`, m)
  }
}

handler.help = ['tiktok', 'tiktokaudio']
handler.tags = ['downloader']
handler.command = ['tiktok', 'tt', 'tiktokaudio', 'tta', 'ttaudio']
handler.group = true

export default handler