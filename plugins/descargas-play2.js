import axios from 'axios'
import yts from 'yt-search'
import { checkReg } from '../lib/checkReg.js'

let descargasActivas = new Set()
let globalProcesando = false

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender]

    if (await checkReg(m, user)) return

    if (!text) {
        await m.react('🤔')
        return m.reply(`> ¿Qué video desea buscar hoy, cielo? Use: *${usedPrefix}${command}* nombre del video.`)
    }

    if (globalProcesando) {
        return m.reply(`> ⏳ *¡Paciencia, corazón!* Estoy procesando una descarga pesada en este momento. Inténtalo de nuevo en unos instantes.`)
    }

    if (descargasActivas.has(m.sender)) {
        return m.reply(`> ⚠️ *𝗗ΕΤΕΝΤΕ:* Ya tienes una descarga en curso, espera a que termine, cielo.`)
    }

    try {
        descargasActivas.add(m.sender)
        await m.react('🔍')
        
        let search = await yts(text)
        if (!search.videos.length) {
            descargasActivas.delete(m.sender)
            await m.react('💨')
            return m.reply(`> ⚡ *Cariño, no encontré nada sobre "${text}".*`)
        }

        let videoInfo = search.videos[0]
        let { title, author, duration, views, ago, thumbnail, url } = videoInfo

        // Restricción de 30 minutos
        if (duration.seconds > 1800) {
            descargasActivas.delete(m.sender)
            await m.react('❌')
            return m.reply(`> 🌪️ *Vaya drama...* Solo puedo descargar videos menores o iguales a *30 minutos*, corazón.`)
        }

        await m.react('⌛')
        globalProcesando = true

        const videoDetails = `> 🎵 *「🌱」 ${title}*\n\n` +
            `> 🍃 *Canal:* » ${author.name}\n` +
            `> ⚘ *Duración:* » ${duration.timestamp}\n` +
            `> 🌼 *Vistas:* » ${(views || 0).toLocaleString()}\n` +
            `> 🍀 *Publicado:* » ${ago || 'Reciente'}\n` +
            `> 🌿 *Enlace:* » ${url}\n\n` +
            `> ⏳ _ᴇsᴛᴏʏ ᴘʀᴏᴄᴇsᴀɴᴅᴏ sᴜ ᴘᴇᴅɪᴅᴏ... ᴘᴀᴄɪᴇɴᴄɪᴀ_`

        await conn.sendMessage(m.chat, {
            image: { url: thumbnail },
            caption: videoDetails
        }, { quoted: m })

        let download_url = null
        let size = "0 MB"
        let intentos = 0
        const maxIntentos = 5 // Subimos a 5 intentos por si Ananta está lenta

        while (intentos < maxIntentos) {
            await m.react('⏳')
            
            try {
                let res = await axios({
                    method: 'get',
                    url: `https://api.ananta.qzz.io/api/yt-dl-v2?url=${encodeURIComponent(url)}&format=mp4`,
                    headers: { "x-api-key": "antebryxivz14" }
                })

                let apiData = res.data.data
                // Validación estricta de la URL
                if (res.data.success && apiData.download_url && 
                    apiData.download_url !== "Waiting..." && 
                    apiData.download_url !== "In Processing...") {
                    download_url = apiData.download_url
                    size = apiData.size || "0 MB"
                    break
                }
            } catch (e) {
                console.log('Reintentando conexión...')
            }

            intentos++
            if (intentos < maxIntentos) {
                await m.react('⌛')
                await new Promise(resolve => setTimeout(resolve, 6000)) // 6 segundos entre reintentos
            }
        }

        if (!download_url || download_url.includes('Processing')) throw new Error('URL_INVALIDA')

        const fileSizeMB = parseFloat(size.replace(/[^\d.-]/g, '')) || 0
        if (fileSizeMB > 500) throw new Error('PESO_EXCEDIDO')

        await m.react('📥')
        const safeTitle = `${title.substring(0, 50)}`.replace(/[<>:"/\\|?*]/g, '')

        // Usamos { url: download_url } para que WhatsApp maneje la descarga y no el servidor
        if (fileSizeMB < 40 && fileSizeMB !== 0) {
            await conn.sendMessage(m.chat, {
                video: { url: download_url },
                caption: `> ✨ *Aquí tienes tu video, cielo.*`,
                mimetype: 'video/mp4',
                fileName: `${safeTitle}.mp4`
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, {
                document: { url: download_url },
                mimetype: 'video/mp4',
                fileName: `${safeTitle}.mp4`,
                caption: `> *Video enviado como documento*`
            }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        console.error('Error en Play2:', e)
        await m.react('❌')
        await m.reply(`> 🌪️ *Vaya drama...* No pude procesar el video en este momento. Inténtalo más tarde, cielo.`)
    } finally {
        descargasActivas.delete(m.sender)
        globalProcesando = false
    }
}

handler.help = ['play2']
handler.tags = ['downloader']
handler.command = ['play2']
handler.group = true

export default handler