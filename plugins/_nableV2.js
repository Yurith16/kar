// plugins/grupo-info.js
let handler = async (m, { conn, usedPrefix }) => {
    // Reacción de engranaje
    await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } })

    let chat = global.db.data.chats[m.chat]

    let info = `*CONFIGURACIÓN DEL GRUPO*

• AntiLink: ${chat.antiLink ? '*on*' : '*off*'}
• AntiArabe: ${chat.antiArabe ? '*on*' : '*off*'}
• Welcome: ${chat.welcome ? '*on*' : '*off*'}
• NSFW: ${chat.nsfw ? '*on*' : '*off*'}
• Economy: ${chat.economy ? '*on*' : '*off*'}
• Gacha: ${chat.gacha ? '*on*' : '*off*'}

${chat.rootowner ? '*Nota:* Bot solo responde al creador' : ''}`.trim()

    await m.reply(info)
}

handler.help = ['config', 'settings', 'configuracion']
handler.tags = ['group']
handler.command = /^(config|settings|configuracion)$/i
handler.group = true

export default handler