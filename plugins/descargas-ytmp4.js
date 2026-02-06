import axios from 'axios'
import yts from 'yt-search'
import { checkReg } from '../lib/checkReg.js'

let isProcessing = false

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender]

    if (await checkReg(m, user)) return

    if (!text) {
        await m.react('🤔')
        return m.reply(`> ¿Qué video desea ver hoy, cielo?`)
    }

    if (isProcessing) {
        return m.reply(`> ⏳ *¡Paciencia, corazón!* Estoy procesando otra descarga. Inténtalo en un momento.`)
    }

    try {
        isProcessing = true
        await m.react('🔍')

        let videoUrl = text
        let videoInfo = null

        if (!text.includes('youtu.be') && !text.includes('youtube.com')) {
            const search = await yts(text)
            if (!search.videos.length) {
                isProcessing = false
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

        const { title, author, duration, thumbnail, url } = videoInfo

        if (duration.seconds > 600) {
            isProcessing = false
            await m.react('❌')
            return m.reply(`> El video excede los 10 minutos permitidos.`)
        }

        await m.react('⌛')
        const videoDetails = `> 🎥 *「🌱」 ${title}*\n\n` +
            `> 🍃 *Canal:* » ${author.name}\n` +
            `> ⚘ *Duración:* » ${duration.timestamp}\n` +
            `> 🌿 *Enlace:* » ${url}\n\n` +
            `> ⏳ _ᴇsᴛᴏʏ ᴘʀᴏᴄᴇsᴀɴᴅᴏ sᴜ ᴘᴇᴅɪᴅᴏ... ᴘᴀᴄɪᴇɴᴄɪᴀ_`

        await conn.sendMessage(m.chat, {
            image: { url: thumbnail },
            caption: videoDetails
        }, { quoted: m })

        // --- SOLICITUD A LA API ---
        const apiUrl = `https://api.princetechn.com/api/download/ytv?apikey=prince&url=${encodeURIComponent(videoUrl)}&quality=480`
        const { data } = await axios.get(apiUrl)

        if (!data.success || !data.result?.download_url) throw new Error('API Error')

        const { download_url } = data.result
        const safeTitle = `${title.substring(0, 50)}`.replace(/[<>:"/\\|?*]/g, '')

        await m.react('📥')

        // --- EL CAMBIO CLAVE: ENVIAR URL EN LUGAR DE BUFFER ---
        // Esto evita que el archivo se corrompa en el servidor del bot
        await conn.sendMessage(m.chat, {
            document: { url: download_url },
            mimetype: 'video/mp4',
            fileName: `${safeTitle}.mp4`,
            caption: `> *Video enviado como documento*`
        }, { quoted: m })

        await m.react('✅')
        isProcessing = false

    } catch (error) {
        isProcessing = false
        console.error('Error en KarBot Video:', error)
        await m.react('❌')
        await m.reply(`> Hubo un problema al obtener el archivo. Por favor, intente de nuevo.`)
    }
}

handler.help = ['play2', 'ytmp4']
handler.tags = ['downloader']
handler.command = ['play2', 'ytmp4']
handler.group = true

export default handler