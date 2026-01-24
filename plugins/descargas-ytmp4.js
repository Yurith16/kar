import axios from 'axios'
import fetch from 'node-fetch'
import yts from 'yt-search'
import { checkReg } from '../lib/checkReg.js'

// Mapa para gestionar las descargas activas y evitar el abuso
let descargasActivas = new Set()

// --- FUNCIONES DE RESPALDO (APIs) ---

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

    // 1. Verificación de registro
    if (await checkReg(m, user)) return

    // 2. Control de abuso (Una descarga a la vez)
    if (descargasActivas.has(m.sender)) {
        return m.reply(`> ⚠️ *𝗗𝗘𝗧𝗘𝗡𝗧𝗘:* No abuses, cielo. Ya tienes una descarga en proceso. Espera a que termine para pedir otro video.`)
    }

    if (!text) return m.reply(`> ¿Qué video desea descargar hoy, cielo?`)

    try {
        // Añadir a descargas activas
        descargasActivas.add(m.sender)
        await m.react('🔍') 

        const search = await yts(text)
        if (!search.videos.length) {
            await m.react('❌')
            return m.reply(`> No encontré resultados, bombón.`)
        }

        const video = search.videos[0]
        const { title, url, thumbnail, author, views, duration, ago, seconds } = video

        // 3. Restricción de duración (2 horas = 7200 segundos)
        if (seconds > 7200) {
            await m.react('❌')
            return m.reply(`> ⚠️ No tienes permitido descargar videos tan grandes. El límite es de 2 horas.`)
        }

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

        await m.react('📥') 

        let videoBuffer = null
        let success = false

        // --- LÓGICA DE FALLBACK ---
        try {
            videoBuffer = await tryAnanta(url)
            success = true
        } catch (err1) {
            try {
                videoBuffer = await tryAswin(url)
                success = true
            } catch (err2) {
                success = false
            }
        }

        if (!success || !videoBuffer) throw new Error('Ambas APIs fallaron')

        // 4. Restricción de peso (1GB)
        const sizeMB = videoBuffer.byteLength / (1024 * 1024)
        if (sizeMB > 1024) {
            await m.react('❌')
            return m.reply(`> ⚠️ El video supera el límite de 1GB permitido.`)
        }

        await m.react('📤') 

        await conn.sendMessage(m.chat, {
            document: videoBuffer,
            caption: '> La descarga fue exitosa',
            mimetype: 'video/mp4',
            fileName: `${title.substring(0, 50)}.mp4`
        }, { quoted: m })

        await m.react('✅') 

    } catch (e) {
        console.error('Error total en play2:', e.message)
        await m.react('❌')
        await m.reply(`> Lo siento, hubo un error al procesar el video.`)
    } finally {
        // Liberar al usuario siempre
        descargasActivas.delete(m.sender)
    }
}

handler.help = ['play2 (videos de YouTube)']
handler.tags = ['downloader']
handler.command = ['play2']
handler.group = true

export default handler