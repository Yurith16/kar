import { Sticker, StickerTypes } from 'wa-sticker-formatter'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false

  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/webp|image|video/g.test(mime) && !args[0]) {
      return conn.reply(m.chat, `> » *Responde a una imagen/video con* ${usedPrefix + command}`, m)
    }

    await conn.sendMessage(m.chat, { react: { text: '🕑', key: m.key } })

    if (/webp|image|video/g.test(mime)) {
      if (/video/g.test(mime)) {
        // Aumentado a 3 minutos (180 segundos)
        if ((q.msg || q).seconds > 180) {
          await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
          return conn.reply(m.chat, '> *Máximo 3 minutos*', m)
        }
      }

      let img = await q.download?.()
      if (!img) throw new Error('Error al descargar')

      const stickerOptions = {
        // Quitado pack y author
        type: StickerTypes.FULL,
        quality: 70, // Mejor calidad
      }

      const sticker = new Sticker(img, stickerOptions)
      stiker = await sticker.toBuffer()

    } else if (args[0]) {
      if (isUrl(args[0])) {
        const stickerOptions = {
          // Quitado pack y author
          type: StickerTypes.FULL,
          quality: 70,
        }

        const sticker = new Sticker(args[0], stickerOptions)
        stiker = await sticker.toBuffer()
      } else {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return conn.reply(m.chat, '> *URL no válida*', m)
      }
    }

    if (stiker) {
      const fkontak = await makeFkontak()
      await conn.sendMessage(m.chat, {
        sticker: stiker
      }, { quoted: fkontak })
      
      await conn.sendMessage(m.chat, { react: { text: '✅️', key: m.key } })
    }

  } catch (error) {
    console.error('Error en sticker:', error)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.reply(m.chat, '> *Error al crear sticker*', m)
  }
}

// Quoted especial con mini-thumbnail
async function makeFkontak() {
  try {
    const { default: fetch } = await import('node-fetch')
    const res = await fetch('https://cdn.russellxz.click/64bba973.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { locationMessage: { name: '🖼️ 𝗦𝘁𝗶𝗰𝗸𝗲𝗿 𝗖𝗿𝗲𝗮𝗱𝗼 𝗖𝗼𝗻 𝗘𝘅𝗶𝘁𝗼 ✅', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return undefined
  }
}

handler.help = ['sticker', 's']
handler.tags = ['tools']
handler.command = ['s', 'sticker']

export default handler

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|webp)/, 'gi'))
}