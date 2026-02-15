const axios = require('axios')
const fetch = require('node-fetch')
const { checkReg } = require('../lib/checkReg.js')

// Mapa para gestionar las descargas activas y evitar el abuso
let descargasActivas = new Set()

// ========== MÉTODOS DE RESPALDO ==========
async function tryTikWM(url) {
    const res = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}?hd=1`)
    const data = res.data?.data
    if (data) {
        return {
            video: data.play,
            audio: data.music,
            images: data.images,
            success: true
        }
    }
    return { success: false }
}

async function tryDelirius(url) {
    const res = await fetch(`https://api.delirius.store/download/tiktok?url=${encodeURIComponent(url)}`)
    const data = await res.json()
    if (data?.status && data?.data?.meta?.media) {
        const media = data.data.meta.media[0]
        return {
            images: media.type === "image" ? media.images : null,
            video: media.type === "video" ? (media.org || media.hd) : null,
            success: true
        }
    }
    return { success: false }
}

let handler = async (m, { conn, text, args, command }) => {
    const userId = m.sender
    const user = global.db.data.users[userId]

    // Verificación de registro
    if (await checkReg(m, user)) return

    // Control de descargas (una a la vez)
    if (descargasActivas.has(m.sender)) {
        await m.react('⏳')
        return m.reply(`> ⏳ *Ya tienes una descarga en proceso, espera.*`)
    }

    if (!text) {
        await m.react('🤔')
        return m.reply(`> ¿Qué TikTok desea descargar?\n> Envíe un enlace o nombre.`)
    }

    const isUrl = /(?:https:?\/{2})?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/([^\s&]+)/gi.test(text)

    try {
        descargasActivas.add(m.sender)

        // Secuencia técnica de reacciones
        await m.react('🔍') // Buscando
        await m.react('📥') // Descargando

        if (isUrl) {
            let result = await tryTikWM(text)
            if (!result.success) result = await tryDelirius(text)

            if (!result.success) throw new Error('Error en APIs')

            const isAudioCommand = ['tiktokaudio', 'tta', 'ttaudio'].includes(command)

            // CASO: AUDIO
            if (isAudioCommand) {
                if (!result.audio) throw new Error('No audio found')
                await m.react('📦') // Procesando
                await conn.sendMessage(m.chat, {
                    audio: { url: result.audio },
                    mimetype: 'audio/mpeg',
                    fileName: `tiktok_audio.mp3`,
                    ptt: false
                }, { quoted: m })
            } 
            // CASO: GALERÍA DE IMÁGENES
            else if (result.images && result.images.length > 0) {
                await m.react('📦') // Procesando
                for (let img of result.images) {
                    await conn.sendMessage(m.chat, { 
                        image: { url: img }
                    }, { quoted: m })
                }
                // Enviar audio si existe
                if (result.audio) {
                    await conn.sendMessage(m.chat, {
                        audio: { url: result.audio },
                        mimetype: 'audio/mpeg',
                        fileName: `tiktok_audio.mp3`,
                        ptt: false
                    }, { quoted: m })
                }
            } 
            // CASO: VIDEO
            else if (result.video) {
                await m.react('📦') // Procesando
                await conn.sendMessage(m.chat, { 
                    video: { url: result.video }
                }, { quoted: m })
            }

        } else {
            // BÚSQUEDA POR TEXTO
            if (['tiktokaudio', 'tta', 'ttaudio'].includes(command)) {
                return m.reply(`> Para audio necesitas un enlace directo.`)
            }

            await m.react('📦') // Procesando
            const res = await axios({
                method: 'POST',
                url: 'https://tikwm.com/api/feed/search',
                data: { keywords: text, count: 1, HD: 1 }
            })

            const video = res.data?.data?.videos?.[0]
            if (!video) throw new Error('No results')

            await conn.sendMessage(m.chat, { 
                video: { url: video.play }
            }, { quoted: m })
        }

        await m.react('✅') // Éxito

    } catch (e) {
        console.error('[TikTok Error]:', e.message)
        await m.react('❌')
        await m.reply(`> 🌪️ *Vaya drama...* No pude descargar el contenido.`)
    } finally {
        descargasActivas.delete(m.sender)
    }
}

handler.help = ['tiktok <url>', 'tiktokaudio <url>']
handler.tags = ['downloader']
handler.command = ['tiktok', 'tt', 'tiktokaudio', 'tta', 'ttaudio']
handler.group = true

module.exports = handler