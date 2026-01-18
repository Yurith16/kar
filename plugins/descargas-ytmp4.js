import axios from 'axios'
import fetch from 'node-fetch'
import yts from 'yt-search'
import { checkReg } from '../lib/checkReg.js'

// --- FUNCIONES DE RESPALDO (APIs) ---

// Opción A: Ananta (Con API Key)
async function tryAnanta(url) {
    const apiUrl = `https://api.ananta.qzz.io/api/yt-mp4?url=${encodeURIComponent(url)}`
    const response = await axios({
        method: 'get',
        url: apiUrl,
        headers: { "x-api-key": "antebryxivz14" },
        responseType: 'arraybuffer',
        timeout: 300000 
    })
    return response.data
}

// Opción B: Aswin Sparky
async function tryAswin(url) {
    const apiURL = `https://api-aswin-sparky.koyeb.app/api/downloader/ytv?url=${encodeURIComponent(url)}`
    const res = await fetch(apiURL)
    const data = await res.json()
    
    let downloadUrl = ''
    if (data.status && data.data && data.data.url) downloadUrl = data.data.url
    else if (data.status && data.download && data.download.video) downloadUrl = data.download.video
    
    if (!downloadUrl) throw new Error('No link')

    const videoRes = await fetch(downloadUrl)
    return await videoRes.buffer()
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender]

    if (await checkReg(m, user)) return
    if (!text) return m.reply(`> ¿Qué video desea descargar hoy, cielo?`)

    try {
        await m.react('🔍') // Buscando...

        const search = await yts(text)
        if (!search.videos.length) {
            await m.react('❌')
            return m.reply(`> No encontré resultados, bombón.`)
        }

        const video = search.videos[0]
        const { title, url, thumbnail, author, views, duration, ago } = video

        // Diseño KarBot
        const videoDetails = `> 🎬 *「🌱」 ${title}*\n\n` +
            `> 🍃 *Canal:* » ${author.name}\n` +
            `> ⚘ *Duración:* » ${duration.timestamp}\n` +
            `> 🌼 *Vistas:* » ${(views || 0).toLocaleString()}\n` +
            `> 🍀 *Publicado:* » ${ago || 'Reciente'}\n` +
            `> 🌿 *Enlace:* » ${url}`

        await conn.sendMessage(m.chat, {
            image: { url: thumbnail },
            caption: videoDetails
        }, { quoted: m })

        await m.react('📥') // Descargando...

        let videoBuffer = null
        let success = false

        // --- LÓGICA DE FALLBACK (SILENCIOSA) ---
        try {
            // Intento 1: Ananta
            videoBuffer = await tryAnanta(url)
            success = true
        } catch (err1) {
            try {
                // Intento 2: Aswin si falla el 1
                videoBuffer = await tryAswin(url)
                success = true
            } catch (err2) {
                success = false
            }
        }

        if (!success || !videoBuffer) throw new Error('Ambas APIs fallaron')

        await m.react('📤') // Enviando...

        await conn.sendMessage(m.chat, {
            document: videoBuffer,
            caption: '> La descarga fue exitosa',
            mimetype: 'video/mp4',
            fileName: `${title.substring(0, 50)}.mp4`
        }, { quoted: m })

        await m.react('✅') // ¡Listo!

    } catch (e) {
        console.error('Error total en ytmp4:', e.message)
        await m.react('❌')
        await m.reply(`> Lo siento, hubo un error al procesar el video.`)
    }
}

handler.help = ['play2 (videos de YouTube)']
handler.tags = ['downloader']
handler.command = ['play2']
handler.group = true

export default handler