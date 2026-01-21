import axios from 'axios'
import yts from 'yt-search'
import { checkReg } from '../lib/checkReg.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender]

    // 1. Verificación de registro (Estilo KarBot)
    if (await checkReg(m, user)) return

    // 2. Ayuda humanizada
    if (!text) return m.reply(`> ¿Qué música desea buscar hoy, cielo?`)

    try {
        // Secuencia de reacciones 🔍🌿🍀🎶
        const reacciones = ['🔍', '🌿', '🍀', '🎶']
        for (const reacc of reacciones) {
            await m.react(reacc)
        }

        // Búsqueda en YouTube para los detalles estéticos
        const search = await yts(text)
        if (!search.videos.length) {
            await m.react('❌')
            return m.reply(`> Lo siento, no encontré nada sobre "${text}".`)
        }

        const video = search.videos[0]
        const { title, url, thumbnail, author, views, duration, ago } = video

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

        // 3. Descarga usando la API de Ananta (Basado en tu doc)
        // La API devuelve el flujo del audio directamente
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
            await m.react('❌')
            return m.reply(`> Lo siento, el servidor de música me ha rechazado.`)
        }

        // Enviar el audio como documento para que no pierda calidad
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
    }
}

handler.help = ['ytmp3 (musicas de YouTube)']
handler.tags = ['downloader']  
handler.command = ['ytmp3']
handler.group = true

export default handler