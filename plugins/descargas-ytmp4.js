import axios from 'axios'
import yts from 'yt-search'
import fs from 'fs'
import path from 'path'
import { checkReg } from '../lib/checkReg.js'

let descargasActivas = new Set()

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const user = global.db.data.users[m.sender]

    if (await checkReg(m, user)) return

    if (!text) {
        await m.react('🤔')
        return m.reply(`> Ingrese el nombre o enlace y opcionalmente la calidad.\n> Uso: *${usedPrefix}${command}* <nombre/enlace> <calidad>\n> Ejemplo: *${usedPrefix}${command}* Alan Walker Faded 1080`)
    }

    if (descargasActivas.has(m.sender)) {
        return m.reply(`> Ya tiene una descarga en curso. Por favor, espere a que finalice.`)
    }

    try {
        descargasActivas.add(m.sender)
        await m.react('🎥')

        let args = text.split(' ')
        let quality = '720' 
        let searchQuery = text

        if (args.length > 1) {
            const lastArg = args[args.length - 1]
            if (/^(360|480|720|1080)$/.test(lastArg)) {
                quality = lastArg
                searchQuery = args.slice(0, -1).join(' ')
            }
        }

        let videoInfo = null
        let urlFinal = searchQuery

        if (/https?:\/\/(www\.)?youtube\.com\/watch\?v=|https?:\/\/youtu\.be\//.test(searchQuery)) {
            const videoId = searchQuery.includes('watch?v=') ? searchQuery.split('v=')[1].split('&')[0] : searchQuery.split('youtu.be/')[1].split('?')[0]
            videoInfo = await yts({ videoId })
        } else {
            const search = await yts(searchQuery)
            if (!search.videos.length) {
                descargasActivas.delete(m.sender)
                await m.react('💨')
                return m.reply(`> No encontré resultados para su búsqueda.`)
            }
            videoInfo = search.videos[0]
            urlFinal = videoInfo.url
        }

        const { title, thumbnail, url } = videoInfo

        await m.react('⌛')
        await conn.sendMessage(m.chat, {
            image: { url: thumbnail },
            caption: `> 🎥 *Descargando:* ${title}\n> ⏳ _El archivo se guardará en el servidor antes de enviarse..._`
        }, { quoted: m })

        const apiUrl = `https://api.princetechn.com/api/download/ytvideo?apikey=prince&quality=${quality}&url=${encodeURIComponent(urlFinal)}`
        const { data } = await axios.get(apiUrl)

        if (!data.success || !data.result?.download_url) throw new Error('API Error')

        const downloadUrl = data.result.download_url
        const safeTitle = title.replace(/[<>:"/\\|?*]/g, '').substring(0, 50)
        
        // Definir la ruta en la carpeta tmp
        const tmpDir = path.join(process.cwd(), 'tmp')
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
        
        const filePath = path.join(tmpDir, `${safeTitle}.mp4`)

        await m.react('📥')

        // DESCARGA FÍSICA AL DISCO
        const writer = fs.createWriteStream(filePath)
        const response = await axios({
            url: downloadUrl,
            method: 'GET',
            responseType: 'stream',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        })

        response.data.pipe(writer)

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
        })

        const stats = fs.statSync(filePath)
        const fileSizeMB = stats.size / (1024 * 1024)

        // ENVIAR EL ARCHIVO DESDE LA RUTA LOCAL
        await conn.sendMessage(m.chat, {
            document: fs.readFileSync(filePath),
            mimetype: 'video/mp4',
            fileName: `${safeTitle}.mp4`,
            caption: `> ✅ *Archivo descargado en tmp*\n> 📂 *Nombre:* ${safeTitle}.mp4\n> ⚖️ *Tamaño:* ${fileSizeMB.toFixed(2)} MB`
        }, { quoted: m })

        // No borramos el archivo (fs.unlinkSync(filePath)) para que lo revises manualmente.

        await m.react('✅')
        descargasActivas.delete(m.sender)

    } catch (error) {
        descargasActivas.delete(m.sender)
        console.error('Error:', error)
        await m.react('❌')
        await m.reply(`> Falló la descarga física. Revisa la consola para más drama técnico.`)
    }
}

handler.help = ['ytmp4']
handler.tags = ['downloader']
handler.command = ['ytmp4']
handler.group = true

export default handler