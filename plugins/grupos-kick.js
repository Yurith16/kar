let handler = async (m, { conn, participants, usedPrefix, command }) => {
    let mentionedJid = await m.mentionedJid
    let user = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted && m.quoted.sender ? m.quoted.sender : null
    
    if (!user) {
        return m.reply(`> 🙄 *¿A quién quieres echar, mi vida? Menciona a alguien o responde a su mensaje.*`)
    }

    try {
        const groupInfo = await conn.groupMetadata(m.chat)
        const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
        const ownerBot = global.owner[0][0] + '@s.whatsapp.net'

        // Protecciones
        if (user === conn.user.jid) return m.reply(`> 🤨 *¿Intentas echarme a mí? Qué atrevida...*`)
        if (user === ownerGroup) return m.reply(`> ⚠️ *No puedo echar al dueño del grupo, no me busques problemas.*`)
        if (user === ownerBot) return m.reply(`> 👑 *Con el staff no se juega, cariño.*`)

        await m.react('🕒')
        
        // Mensajes de despedida con drama
        const frasesDespedida = [
            `> 💋 *¡Fuera de aquí, maldito! No te queremos ver más.*`,
            `> 💅 *Lárgate, tu energía no vibra con este grupo.*`,
            `> 💨 *Uno menos... el aire se siente más puro ahora.*`,
            `> 🚮 *Basura en su lugar. ¡Adiós!*`,
            `> 🚪 *Ahí tienes la puerta, no vuelvas nunca.*`
        ]
        
        let despedida = frasesDespedida[Math.floor(Math.random() * frasesDespedida.length)]
        await conn.reply(m.chat, despedida, m)

        // Expulsar al usuario
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        
        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        return m.reply(`> 🥀 *Hubo un drama técnico y no pude sacarlo. Tal vez tiene suerte... por ahora.*`)
    }
}

handler.help = ['kick']
handler.tags = ['group']
handler.command = ['kick', 'echar', 'sacar']
handler.admin = true
handler.group = true
handler.botAdmin = true

module.exports = handler