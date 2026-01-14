import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix }) => {
    // Reacción de enojo según el contexto
    await conn.sendMessage(m.chat, { react: { text: '😤', key: m.key } })

    let who = m.mentionedJid.length > 0 ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    let name = conn.getName(who)
    let name2 = conn.getName(m.sender)

    // Lista de mensajes con drama para mayor variedad
    const mensajesConAlguien = [
        `*${name2}* está muy molesto con *${name}*`,
        `¡Oye *${name}*! *${name2}* está realmente enojado contigo`,
        `*${name2}* no quiere saber nada de *${name}* ahora mismo`,
        `Parece que *${name2}* va a explotar contra *${name}*`,
        `*${name2}* está mostrando su lado más furioso con *${name}*`
    ]

    const mensajesSolo = [
        `*${name2}* está muy enojado`,
        `¡No molesten a *${name2}*! Está furioso`,
        `*${name2}* está de muy mal humor hoy`,
        `*${name2}* acaba de perder la paciencia`,
        `¡Cuidado! *${name2}* está que echa chispas`
    ]

    // Selección aleatoria del mensaje
    let str = m.mentionedJid.length > 0 || m.quoted 
        ? mensajesConAlguien[Math.floor(Math.random() * mensajesConAlguien.length)]
        : mensajesSolo[Math.floor(Math.random() * mensajesSolo.length)]

    if (m.isGroup) {
        let pp = 'https://image2url.com/r2/default/videos/1768346964896-f45affc4-9eb1-469e-956f-4b57781cee13.mp4'
        let pp2 = 'https://image2url.com/r2/default/videos/1768347085246-f35eb835-048c-4dea-ab10-4353b8fa4040.mp4'
        let pp3 = 'https://image2url.com/r2/default/videos/1768347126940-e6b06ac9-6b95-4548-81f5-19637190d28a.mp4'
        let pp4 = 'https://image2url.com/r2/default/videos/1768347159822-3633338c-bb38-448e-8d65-3b0753920fbf.mp4'
        let pp5 = 'https://image2url.com/r2/default/videos/1768347190804-3f8eb74f-7b6c-481a-aeb3-06a3d10f47ae.mp4'
        let pp6 = 'https://image2url.com/r2/default/videos/1768347229441-d1a62558-8727-4caa-a8c3-6742c7a15e75.mp4'
        let pp7 = 'https://image2url.com/r2/default/videos/1768347280859-260c1965-d9d6-4d4b-bf51-4afb49d5c113.mp4'
        let pp8 = 'https://image2url.com/r2/default/videos/1768347346868-93757b23-5748-4aa8-a962-d2a983d439ef.mp4'

        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8]
        const video = videos[Math.floor(Math.random() * videos.length)]

        // Envío de video/gif con menciones
        conn.sendMessage(m.chat, { 
            video: { url: video }, 
            gifPlayback: true, 
            caption: str, 
            mentions: [who, m.sender] 
        }, { quoted: m })
    }
}

handler.help = ['angry']
handler.tags = ['anime']
handler.command = ['angry', 'enojado','molesto', 'enojada', 'molesta']
handler.group = true

export default handler