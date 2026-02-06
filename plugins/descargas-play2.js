import axios from 'axios'
import yts from 'yt-search'
import { checkReg } from '../lib/checkReg.js'

// Mapa para gestionar las descargas activas por usuario y global
let descargasActivas = new Set()
let globalProcesando = false

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender]

    // 1. Verificación de registro
    if (await checkReg(m, user)) return

    // 2. Control de abuso (Global y por Usuario)
    if (globalProcesando) {
        return m.reply(`> ⏳ *¡Paciencia, corazón!* Estoy procesando una descarga pesada en este momento. Inténtalo de nuevo en unos instantes.`)
    }

    if (descargasActivas.has(m.sender)) {
        return m.reply(`> ⚠️ *𝗗𝗘𝗧ΕΝ𝗧𝗘:* Ya tienes una descarga en curso, espera a que termine para pedir otra, cielo.`)
    }

    // 3. Validación de texto
    if (!text) return m.reply(`> ¿Qué video desea buscar hoy, cielo?`)

    try {
        descargasActivas.add(m.sender)
        
        // Reacciones iniciales
        const reacciones = ['🔍', '🎥', '⚡']
        for (const reacc of reacciones) {
            await m.react(reacc)
        }

        let videoUrl = text
        let videoInfo = null

        // Búsqueda en YouTube
        if (!text.includes('youtu.be') && !text.includes('youtube.com')) {
            const search = await yts(text)
            if (!search.videos.length) {
                descargasActivas.delete(m.sender)
                await m.react('💨')
                return m.reply(`> ⚡ *Cariño, no encontré nada.*`)
            }
            videoInfo = search.videos[0]
            videoUrl = videoInfo.url
        } else {
            const videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('youtu.be/')[1]?.split('?')[0]
            const search = await yts({ videoId })
            videoInfo = search.videos[0]
        }

        const { title, author, duration, views, ago, thumbnail, url } = videoInfo

        // --- RESTRICCIÓN DE DURACIÓN (2 HORAS = 7200 SEGUNDOS) ---
        if (duration.seconds > 7200) {
            descargasActivas.delete(m.sender)
            return m.reply(`> 🌪️ *Vaya drama...* El video excede las 2 horas permitidas.`)
        }

        // --- DISEÑO DE DETALLES KARBOT ---
        const videoDetails = `> 🎥 *「🌱」 ${title}*\n\n` +
            `> 🍃 *Canal:* » ${author.name}\n` +
            `> ⚘ *Duración:* » ${duration.timestamp}\n` +
            `> 🌼 *Vistas:* » ${(views || 0).toLocaleString()}\n` +
            `> 🍀 *Publicado:* » ${ago || 'Reciente'}\n` +
            `> 🌿 *Enlace:* » ${url}`

        await conn.sendMessage(m.chat, {
            image: { url: thumbnail },
            caption: videoDetails
        }, { quoted: m })

        // Activar bloqueo global para descargas pesadas
        globalProcesando = true

        // --- DESCARGA ---
        const apiUrl = `https://api.princetechn.com/api/download/ytv?apikey=prince&url=${encodeURIComponent(videoUrl)}&quality=480`
        const { data } = await axios.get(apiUrl)

        if (!data.success || !data.result?.download_url) throw new Error('API Error')

        const { download_url } = data.result
        const videoResponse = await axios.get(download_url, { 
            responseType: 'arraybuffer',
            timeout: 300000 // 5 minutos de timeout para archivos grandes
        })

        const fileSizeMB = videoResponse.data.byteLength / (1024 * 1024)

        // --- RESTRICCIÓN DE PESO (500MB) ---
        if (fileSizeMB > 500) {
            globalProcesando = false
            descargasActivas.delete(m.sender)
            return m.reply(`> 🌪️ *Drama total...* El video pesa *${fileSizeMB.toFixed(2)} MB* y supera mi límite de 500MB.`)
        }

        await m.react('📥')

        const safeTitle = `${title.substring(0, 50)}`.replace(/[<>:"/\\|?*]/g, '')

        // --- ENVÍO COMO DOCUMENTO ---
        await conn.sendMessage(m.chat, {
            document: videoResponse.data,
            mimetype: 'video/mp4',
            fileName: `${safeTitle}.mp4`
        }, { quoted: m })

        await m.react('⚙️')

    } catch (e) {
        console.error('Error en KarBot Play2:', e)
        await m.react('❌')
        await m.reply(`> 🌪️ *Vaya drama...* Hubo un fallo técnico y no pude procesar tu video. Inténtalo más tarde.`)
    } finally {
        // Liberar bloqueos
        descargasActivas.delete(m.sender)
        globalProcesando = false
    }
}

handler.help = ['play2']
handler.tags = ['downloader']
handler.command = ['play2'] // Solo reacciona a .play2
handler.group = true

export default handler