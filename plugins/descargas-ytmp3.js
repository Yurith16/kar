import axios from 'axios'
import yts from 'yt-search'
import { checkReg } from '../lib/checkReg.js'

// Mapa para gestionar las descargas activas y evitar el abuso
let descargasActivas = new Set()

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender]

    // 1. Verificación de registro
    if (await checkReg(m, user)) return

    // 2. Control de abuso (Una descarga a la vez)
    if (descargasActivas.has(m.sender)) {
        return m.reply(`> ⚠️ *𝗗𝗘𝗧𝗘𝗡𝗧𝗘:* No abuses, cielo. Ya tienes una descarga en proceso. Espera a que termine para pedir otra melodía.`)
    }

    // 3. Ayuda humanizada
    if (!text) return m.reply(`> ¿Qué música desea buscar hoy, cielo?`)

    try {
        // Añadir a descargas activas
        descargasActivas.add(m.sender)

        // Secuencia de reacciones 🔍🌿🍀🎶
        const reacciones = ['🔍', '🌿', '🍀', '🎶']
        for (const reacc of reacciones) {
            await m.react(reacc)
        }

        // Búsqueda en YouTube
        const search = await yts(text)
        if (!search.videos.length) {
            descargasActivas.delete(m.sender)
            await m.react('❌')
            return m.reply(`> Lo siento, no encontré nada sobre "${text}".`)
        }

        const video = search.videos[0]
        const { title, url, thumbnail, author, views, duration, ago, seconds } = video

        // --- RESTRICCIÓN DE DURACIÓN (2 HORAS = 7200 SEGUNDOS) ---
        if (seconds > 7200) {
            descargasActivas.delete(m.sender)
            await m.react('❌')
            return m.reply(`> ⚠️ No tienes permitido descargar audios de videos tan largos. El límite es de 2 horas.`)
        }

        // --- DISEÑO DE DETALLES KARBOT ---
        const videoDetails = `> 🎵 *「🌱」 ${title}*\n\n` +
            `> 🍃 *Canal:* » ${author.name}\n` +
            `> ⚘ *Duración:* » ${duration.timestamp}\n` +
            `> 🌼 *Vistas:* » ${(views || 0).toLocaleString()}\n` +
            `> 🍀 *Publicado:* » ${ago || 'Reciente'}\n` +
            `> 🌿 *Enlace:* » ${url}`

        await conn.sendMessage(m.chat, {
            image: { url: thumbnail },
            caption: videoDetails
        }, { quoted: m })

        // 4. Descarga usando la API de Ananta
        const apiUrl = `https://api.ananta.qzz.io/api/yt-mp3?url=${encodeURIComponent(url)}`
        
        const response = await axios({
            method: 'get',
            url: apiUrl,
            headers: {
                "x-api-key": "antebryxivz14"
            },
            responseType: 'arraybuffer'
        })

        if (!response.data) {
            throw new Error('Sin datos de respuesta')
        }

        // --- RESTRICCIÓN DE PESO (1GB = 1024 MB) ---
        const sizeMB = response.data.byteLength / (1024 * 1024)
        if (sizeMB > 1024) {
            descargasActivas.delete(m.sender)
            await m.react('❌')
            return m.reply(`> ⚠️ El archivo de audio supera el límite de 1GB permitido.`)
        }

        // Enviar el audio como documento
        await conn.sendMessage(m.chat, {
            document: response.data,
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            caption: `> 🎵 ${title}`
        }, { quoted: m })

        // Engranaje final ⚙️
        await m.react('⚙️')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        await m.reply(`> Lo siento, hubo un error en nuestro jardín musical.`)
    } finally {
        // Quitar de descargas activas siempre al terminar
        descargasActivas.delete(m.sender)
    }
}

handler.help = ['ytmp3 (musicas de YouTube)']
handler.tags = ['downloader']  
handler.command = ['ytmp3']
handler.group = true

export default handler