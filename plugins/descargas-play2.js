import yts from 'yt-search'    
import fetch from 'node-fetch'    
import { checkReg } from '../lib/checkReg.js'

// Función para la API de Aswin Sparky (ESTRUCTURA CORRECTA)
async function apiAswinSparky(url) {
  try {
    const apiURL = `https://api-aswin-sparky.koyeb.app/api/downloader/ytv?url=${encodeURIComponent(url)}`
    const res = await fetch(apiURL)
    
    if (!res.ok) throw new Error('API no respondió');
    
    const data = await res.json()
    
    // Verificar estructura de respuesta CORRECTA según la documentación
    if (data.status && data.data && data.data.url) {
      return { 
        url: data.data.url, 
        title: data.data.title || 'Video sin título'
      }
    }
    
    // Si tiene estructura alternativa
    if (data.status && data.download && data.download.video) {
      return { 
        url: data.download.video, 
        title: data.meta?.title || 'Video sin título'
      }
    }
    
    throw new Error('Estructura de respuesta no reconocida')
    
  } catch (error) {
    console.log('API falló:', error.message)
    throw error
  }
}

let handler = async (m, { conn, text, usedPrefix }) => {    
  const userId = m.sender
  const user = global.db.data.users[userId]
  
  // Verificación de registro
  if (await checkReg(m, user)) return
  
  if (!text) {
    return conn.reply(m.chat, '> Debe ingresar el nombre de un video', m)
  }    

  try {    
    // Reacción inicial con 🌱
    await m.react('🌱')

    // Buscar en YouTube
    const searchResults = await yts(text)    
    if (!searchResults.videos.length) {
      await m.react('❌')
      return conn.reply(m.chat, '> Lo siento, hubo un error.', m)
    }

    const video = searchResults.videos[0]    

    // --- DISEÑO DE DETALLES IGUAL QUE PLAY ---
    const videoDetails = `> 🎬 *「🌱」 ${video.title}*\n\n` +
        `> 🍃 *Canal:* » ${video.author.name}\n` +
        `> ⚘ *Duración:* » ${video.timestamp}\n` +
        `> 🌼 *Vistas:* » ${(video.views || 0).toLocaleString()}\n` +
        `> 🍀 *Publicado:* » ${video.ago || 'Desconocido'}\n` +
        `> 🌿 *Enlace:* » ${video.url}`

    // Enviar thumbnail con detalles
    await conn.sendMessage(m.chat, {
        image: { url: video.thumbnail },
        caption: videoDetails
    }, { quoted: m })

    // Obtener el video de la API
    const videoData = await apiAswinSparky(video.url)

    // Descargar el video
    const response = await fetch(videoData.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.youtube.com/',
        'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5'
      }
    })
    
    if (!response.ok) {
      throw new Error('Error al descargar el video')
    }
    
    const buffer = await response.buffer()

    // Verificar tamaño del buffer
    if (buffer.length === 0) {
      throw new Error('El video está vacío')
    }

    // Enviar el video COMO DOCUMENTO con la frase específica
    await conn.sendMessage(    
      m.chat,    
      {    
        document: buffer,    
        mimetype: 'video/mp4',    
        fileName: `${video.title.substring(0, 100).replace(/[^\w\s.-]/gi, '')}.mp4`,    
        caption: '> La descarga fue exitosa'
      },    
      { quoted: m }    
    )    

    // El engranaje final de KarBot ⚙️
    await m.react('⚙️')

  } catch (e) {    
    console.error('❌ Error en play2:', e)    
    await m.react('❌')
    await conn.reply(m.chat, '> Lo siento, hubo un error.', m)
  }    
}    

handler.help = ['play2']    
handler.tags = ['downloader']    
handler.command = ['play2', 'ytmp4']
handler.group = true    

export default handler