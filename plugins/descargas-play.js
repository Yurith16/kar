import fetch from 'node-fetch'
import yts from 'yt-search'
import { checkReg } from '../lib/checkReg.js'

let handler = async (m, { conn, text, usedPrefix }) => {
  const userId = m.sender
  const user = global.db.data.users[userId]
  
  // Verificación de registro
  if (await checkReg(m, user)) return
  
  if (!text) {
    return conn.reply(m.chat, '> Debe ingresar el nombre de una música', m)
  }

  try {
    // Secuencia de reacciones con plantas y tréboles
    const reacciones = ['🔍', '🌿', '🍀', '🎶']
    for (const reacc of reacciones) {
      await m.react(reacc)
    }

    const search = await yts(text)
    if (!search.videos.length) {
      await m.react('❌')
      return conn.reply(m.chat, '> Lo siento, hubo un error.', m)
    }

    const video = search.videos[0]
    const { title, url, thumbnail, author, views, duration, ago } = video

    // --- DISEÑO DE DETALLES EXACTO ---
    const videoDetails = `> 🎵 *「🌱」 ${title}*\n\n` +
        `> 🍃 *Canal:* » ${author.name}\n` +
        `> ⚘ *Duración:* » ${duration.timestamp}\n` +
        `> 🌼 *Vistas:* » ${(views || 0).toLocaleString()}\n` +
        `> 🍀 *Publicado:* » ${ago || 'Desconocido'}\n` +
        `> 🌿 *Enlace:* » ${url}`

    // Enviar imagen con detalles primero
    await conn.sendMessage(m.chat, {
        image: { url: thumbnail },
        caption: videoDetails
    }, { quoted: m })

    // Obtener miniatura como buffer
    let thumbBuffer = null
    if (thumbnail) {
      try {
        const resp = await fetch(thumbnail)
        thumbBuffer = Buffer.from(await resp.arrayBuffer())
      } catch (err) {
        console.log('No se pudo obtener la miniatura:', err.message)
      }
    }

    const fuentes = [
      { api: 'Adonix', endpoint: `https://api-adonix.ultraplus.click/download/ytaudio?apikey=${global.apikey}&url=${encodeURIComponent(url)}`, extractor: res => res?.data?.url },
      { api: 'MayAPI', endpoint: `https://mayapi.ooguy.com/ytdl?url=${encodeURIComponent(url)}&type=mp3&apikey=${global.APIKeys['https://mayapi.ooguy.com']}`, extractor: res => res.result.url }
    ]

    let audioUrl, exito = false

    for (let fuente of fuentes) {
      try {
        const response = await fetch(fuente.endpoint)
        if (!response.ok) continue
        const data = await response.json()
        const link = fuente.extractor(data)
        if (link) {
          audioUrl = link
          exito = true
          break
        }
      } catch (err) {
        console.log(`Error con ${fuente.api}:`, err.message)
      }
    }

    if (!exito) {
      // El engranaje final de KarBot ⚙️
      await m.react('⚙️')
      return conn.reply(m.chat, '> Lo siento, hubo un error.', m)
    }

    // Enviar audio como documento
    await conn.sendMessage(
      m.chat,
      {
        document: { url: audioUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
        caption: `> 🎵 ${title}`
      },
      { quoted: m }
    )

    // El engranaje final de KarBot ⚙️
    await m.react('⚙️')

  } catch (e) {
    console.error('Error en play:', e)
    await m.react('❌')
    await conn.reply(m.chat, '> Lo siento, hubo un error.', m)
  }
}

handler.help = ['play']
handler.tags = ['downloader']
handler.command = ['play']
handler.group = true

export default handler