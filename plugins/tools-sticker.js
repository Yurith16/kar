const { Sticker, StickerTypes } = require('wa-sticker-formatter')

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false
  let user = global.db.data.users[m.sender]

  // Obtenemos el nombre de registro de la base de datos
  let nameHandle = user.registeredName || user.name || conn.getName(m.sender)

  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/webp|image|video/g.test(mime) && !args[0]) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      return conn.reply(m.chat, '> 🖼️ *Atención:* Responde a una imagen o video para crear tu sticker.', m)
    }

    await conn.sendMessage(m.chat, { react: { text: '🔄', key: m.key } })

    if (/webp|image|video/g.test(mime)) {
      if (/video/g.test(mime)) {
        if ((q.msg || q).seconds > 180) {
          await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
          return conn.reply(m.chat, '> ⚠️ *Límite:* El video es demasiado largo, vida mía.', m)
        }
      }

      let img = await q.download?.()
      if (!img) throw new Error('Error al descargar')

      const stickerOptions = {
        type: StickerTypes.FULL,
        quality: 70,
        pack: '', // Sin nombre de paquete
        author: nameHandle // Solo el nombre de registro
      }

      const sticker = new Sticker(img, stickerOptions)
      stiker = await sticker.toBuffer()

    } else if (args[0]) {
      if (isUrl(args[0])) {
        const stickerOptions = {
          type: StickerTypes.FULL,
          quality: 70,
          pack: '',
          author: nameHandle
        }

        const sticker = new Sticker(args[0], stickerOptions)
        stiker = await sticker.toBuffer()
      } else {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        return conn.reply(m.chat, '> ❌ *Error:* Esa URL no me sirve, corazón.', m)
      }
    }

    if (stiker) {
      const fkontak = await makeFkontak()
      await conn.sendMessage(m.chat, {
        sticker: stiker
      }, { quoted: fkontak })

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    }

  } catch (error) {
    console.error('Error en sticker:', error)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.reply(m.chat, '> ⚠️ *Aviso:* Hubo un error técnico con el sticker.', m)
  }
}

async function makeFkontak() {
  try {
    const fetch = require('node-fetch')
    const res = await fetch('https://image2url.com/images/1765504298320-250ed158-9ddc-49d9-942b-2edfcc711cc8.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { locationMessage: { name: '🖼️ 𝚂𝚃𝙸𝙲𝙺𝙴𝚁', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return undefined
  }
}

handler.help = ['s', 'sticker']
handler.tags = ['tools']
handler.command = /^(s|sticker)$/i

const isUrl = (text) => {
  return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|webp)/, 'gi'))
}

module.exports = handler