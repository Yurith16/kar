let handler = async (m, { conn, usedPrefix, command, isAdmin, isROwner }) => {
    if (!m.isGroup) {
        await m.react('❌')
        return m.reply('> ⓘ Este comando solo funciona en grupos.')
    }

    if (!isAdmin && !isROwner) {
        await m.react('🚫')
        return m.reply('> ⓘ Solo los administradores pueden usar este comando.')
    }

    let chat = global.db.data.chats[m.chat]
    let args = m.text.trim().split(' ').slice(1)
    let action = args[0]?.toLowerCase()

    if (!action || (action !== 'on' && action !== 'off')) {
        let status = chat.antiExtranjero ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'
        await m.react('ℹ️')
        return m.reply(`╭─「 🛡️ *ANTI-EXTRANJERO* 🛡️ 」
│ 
│ 📊 Estado actual: ${status}
│ 
│ 💡 *Uso del comando:*
│ ├ ${usedPrefix}antiextranjero on
│ └ ${usedPrefix}antiextranjero off
│ 
│ 📝 *Descripción:*
│ EXPULSA TODOS los números extranjeros
│ Solo permite números locales
│ 
│ 🌍 *Cobertura completa:*
│ ├ +40 países bloqueados
│ ├ Todos los continentes
│ └ Detección automática
│ 
│ 🔨 *Acciones:*
│ ├ Expulsión automática al entrar
│ ├ Bloqueo total de extranjeros
│ └ Solo números locales permitidos
╰─◉`.trim())
    }

    if (action === 'on') {
        if (chat.antiExtranjero) {
            await m.react('ℹ️')
            return m.reply('> ⓘ El *Anti-Extranjero* ya está activado.')
        }
        chat.antiExtranjero = true
        await m.react('✅')
        m.reply(`╭─「 🛡️ *ANTI-EXTRANJERO ACTIVADO* 🛡️ 」
│ 
│ ✅ *Protección máxima activada:*
│ ├ TODOS los números extranjeros bloqueados
│ ├ +40 países detectados automáticamente
│ ├ Usuarios EXPULSADOS al entrar
│ └ Solo números locales permitidos
│ 
│ 🌍 *Países bloqueados:*
│ ├ Medio Oriente completo
│ ├ India y alrededores
│ ├ África, Asia, Europa del Este
│ ├ América Latina
│ └ Y muchos más...
│ 
│ ⚠️ *Advertencia:*
│ ├ Cualquier usuario extranjero
│ └ será expulsado automáticamente
│ 
│ 🔒 *Grupo 100% local*
╰─◉`.trim())

    } else if (action === 'off') {
        if (!chat.antiExtranjero) {
            await m.react('ℹ️')
            return m.reply('> ⓘ El *Anti-Extranjero* ya está desactivado.')
        }
        chat.antiExtranjero = false
        await m.react('✅')
        m.reply(`╭─「 🛡️ *ANTI-EXTRANJERO DESACTIVADO* 🛡️ 」
│ 
│ ✅ *Protección desactivada:*
│ ├ Números extranjeros permitidos
│ ├ Sin expulsiones automáticas
│ └ Restricciones removidas
│ 
│ 🌍 *Grupo abierto:*
│ ├ Usuarios internacionales bienvenidos
│ └ Sin filtros por país
│ 
│ 🔓 *Grupo abierto internacionalmente*
╰─◉`.trim())
    }
}

handler.help = ['antiextranjero on', 'antiextranjero off']
handler.tags = ['group']
handler.command = /^(antiextranjero|antiforeign|antiextrange)$/i
handler.group = true
handler.admin = true

export default handler