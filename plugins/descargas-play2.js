import yts from 'yt-search'    
import fetch from 'node-fetch'    
import { checkReg } from '../lib/checkReg.js'

// Mapa para gestionar las descargas activas y evitar el abuso
let descargasActivas = new Set()

// Función para la API de Aswin Sparky
async function apiAswinSparky(url) {
  try {
    const apiURL = `https://api-aswin-sparky.koyeb.app/api/downloader/ytv?url=${encodeURIComponent(url)}`
    const res = await fetch(apiURL)
    
    if (!res.ok) throw new Error('API no respondió');
    
    const data = await res.json()
    
    if (data.status && data.data && data.data.url) {
      return { 
        url: data.data.url, 
        title: data.data.title || 'Video sin título'
      }
    }
    
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
  const user = global.db.data.users[m.sender]
  
  // 1. Verificación de registro
  if (await checkReg(m, user)) return
  
  // 2. Control de abuso (Una descarga a la vez)
  if (descargasActivas.has(m.sender)) {
    return m.reply(`> ⚠️ *𝗗𝗘𝗧𝗘𝗡𝗧𝗘:* No abuses, cielo. Ya tienes una descarga en proceso. Espera a que termine para pedir otro video.`)
  }

  if (!text) return m.reply(`> ¿Qué video desea buscar hoy, cielo?`)

  try {    
    // Añadir a descargas activas
    descargasActivas.add(m.sender)

    // Reacción inicial
    await m.react('🌱')

    // Buscar en YouTube
    const searchResults = await yts(text)    
    if (!searchResults.videos.length) {
      descargasActivas.delete(m.sender)
      await m.react('❌')
      return m.reply(`> Lo siento, no encontré nada sobre "${text}".`)
    }

    const video = searchResults.videos[0]    

    // --- RESTRICCIÓN DE DURACIÓN (2 HORAS = 7200 SEGUNDOS) ---
    if (video.seconds > 7200) {
      descargasActivas.delete(m.sender)
      await m.react('❌')
      return m.reply(`> ⚠️ No tienes permitido descargar videos tan grandes. El límite es de 2 horas.`)
    }

    // --- DISEÑO DE DETALLES ---
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
        'Referer': 'https://www.youtube.com/'
      }
    })
    
    if (!response.ok) throw new Error('Error al descargar el video')
    
    const buffer = await response.buffer()
    
    // --- RESTRICCIÓN DE PESO (1GB = 1024 MB) ---
    const sizeMB = buffer.length / (1024 * 1024)
    if (sizeMB > 1024) {
      descargasActivas.delete(m.sender)
      await m.react('❌')
      return m.reply(`> ⚠️ El archivo supera el límite de 1GB permitido.`)
    }

    if (buffer.length === 0) throw new Error('El video está vacío')

    // Enviar el video COMO DOCUMENTO
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

    await m.react('⚙️')

  } catch (e) {    
    console.error('❌ Error en ytmp4:', e)    
    await m.react('❌')
    await m.reply(`> Lo siento, hubo un error con la descarga del video.`)
  } finally {
    // Quitar de descargas activas siempre al final
    descargasActivas.delete(m.sender)
  }
}    

handler.help = ['ytmp4 (videos de Youtube)']    
handler.tags = ['downloader']    
handler.command = ['ytmp4']
handler.group = true    

export default handler