import moment from 'moment-timezone'

let handler = async (m, { conn, usedPrefix }) => {
    // --- VERIFICACIÓN DE ECONOMÍA ---
    if (m.isGroup && !global.db.data.chats[m.chat]?.economy) {
        return m.reply(`> 👛 *Hola, la economía está desactivada en este grupo por ahora.*`)
    }

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let user = global.db.data.users[who]

    if (!user) return m.reply('> ⚙️ *𝗘𝗥𝗥𝗢𝗥:* No he podido localizar los registros financieros de ese usuario.')

    await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } })

    // --- LÓGICA FINANCIERA (Comisión del Banco) ---
    let comision = Math.floor((user.bank || 0) * 0.005)
    if (comision > 0) user.bank -= comision

    const n = (val) => (Number(val) || 0)
    let totalMonetario = n(user.coin) + n(user.bank)
    let name = user.name || await conn.getName(who)
    let premiumEmoji = user.premium ? '⭐' : '👤'

    // Sincronización de diamantes
    const diamantes = n(user.diamond || user.diamantes)
    if (user.diamantes && !user.diamond) user.diamond = user.diamantes

    // --- MENSAJES HUMANÍSTICOS ALEATORIOS ---
    const intros = [
        `*Hola ${name}, he preparado este reporte detallado de tu fortuna y recursos:*`,
        `*¿Listo para ver tu progreso? Aquí tienes el balance de tus arcas, ${name}:*`,
        `*He sumado cada moneda y contado cada tesoro. Esto es lo que posees actualmente:*`,
        `*Hola cariño, aquí tienes el detalle de todo lo que hemos guardado juntos:*`
    ]
    const cierres = [
        `*El banco aplicó una pequeña cuota por proteger tu dinero.*`,
        `*Tu patrimonio está seguro bajo mi vigilancia y la del banco.*`,
        `*Sigue así, me encanta ver cómo crece tu inventario día tras día.*`
    ]

    let txt = `🏛️ *𝗘𝗦𝗧𝗔𝗗𝗢 𝗣𝗔𝗧𝗥𝗜𝗠𝗢𝗡𝗜𝗔𝗟*\n\n`
    txt += `${intros[Math.floor(Math.random() * intros.length)]}\n\n`

    // --- SECCIÓN 1: FINANZAS ---
    txt += `💰 *𝗙𝗜𝗡𝗔𝗡𝗭𝗔𝗦*\n`
    txt += `> 🪙 *Cartera:* ${n(user.coin).toLocaleString()}\n`
    txt += `> 🏛️ *Banco:* ${n(user.bank).toLocaleString()}\n`
    txt += `> 🛡️ *Custodia:* -${comision.toLocaleString()}\n`
    txt += `> 💹 *Patrimonio:* ${totalMonetario.toLocaleString()}\n\n`

    // --- SECCIÓN 2: MINERALES (Solo si tiene) ---
    let tieneMineras = diamantes > 0 || n(user.emerald) > 0 || n(user.gold) > 0 || n(user.iron) > 0 || n(user.coal) > 0 || n(user.stone) > 0
    if (tieneMineras) {
        txt += `⛏️ *𝗠𝗜𝗡𝗘𝗥𝗔𝗟𝗘𝗦*\n`
        if (diamantes > 0) txt += `> 💎 Diamantes: ${diamantes.toLocaleString()}\n`
        if (n(user.emerald) > 0) txt += `> ♦️ Esmeraldas: ${n(user.emerald).toLocaleString()}\n`
        if (n(user.gold) > 0) txt += `> 🏅 Oro: ${n(user.gold).toLocaleString()}\n`
        if (n(user.iron) > 0) txt += `> 🔩 Hierro: ${n(user.iron).toLocaleString()}\n`
        if (n(user.coal) > 0) txt += `> 🕋 Carbón: ${n(user.coal).toLocaleString()}\n`
        if (n(user.stone) > 0) txt += `> 🪨 Piedra: ${n(user.stone).toLocaleString()}\n\n`
    }

    // --- SECCIÓN 3: TESOROS Y OBJETOS (Solo si tiene) ---
    let tieneItems = n(user.common_box) > 0 || n(user.rare_box) > 0 || n(user.legendary_box) > 0 || n(user.joincount) > 0
    if (tieneItems) {
        txt += `📦 *𝗧𝗘𝗦𝗢𝗥𝗢𝗦*\n`
        if (n(user.common_box) > 0) txt += `> 📦 Cofre Común: ${n(user.common_box)}\n`
        if (n(user.rare_box) > 0) txt += `> 🎁 Cofre Raro: ${n(user.rare_box)}\n`
        if (n(user.legendary_box) > 0) txt += `> 🌌 Cofre Galáctico: ${n(user.legendary_box)}\n`
        if (n(user.joincount) > 0) txt += `> 🎟️ Tokens: ${n(user.joincount).toLocaleString()}\n\n`
    }

    // --- SECCIÓN 4: ESTADO ---
    txt += `📊 *𝗘𝗦𝗧𝗔𝗗𝗢*\n`
    txt += `> ❤️ Salud: ${user.health ?? 100}%\n`
    txt += `> ✨ Exp: ${n(user.exp).toLocaleString()}\n\n`

    txt += `${cierres[Math.floor(Math.random() * cierres.length)]}\n`
    txt += `— — — — — — — — — — — —\n`
    txt += `💡 _Usa ${usedPrefix}shop para ver precios de venta._`

    // Reacción dinámica
    let reaction = totalMonetario > 100000 ? '🏛️' : totalMonetario > 10000 ? '💰' : '🍃'
    await conn.sendMessage(m.chat, { react: { text: reaction, key: m.key } })

    // Envío con estética de KarBot
    return conn.sendMessage(m.chat, { 
        text: txt.trim(),
        contextInfo: {
            externalAdReply: {
                title: `🏛️ 𝗕𝗔𝗟𝗔𝗡𝗖𝗘 𝗚𝗘𝗡𝗘𝗥𝗔𝗟: ${name.toUpperCase()}`,
                body: `Patrimonio: ${totalMonetario.toLocaleString()} Coins`,
                thumbnailUrl: 'https://i.postimg.cc/63HSmCvV/1757985995273.png',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
}

handler.help = ['balance']
handler.tags = ['economy']
handler.command = /^(balance|bal|banco|inv|inventario)$/i 
handler.register = true
handler.group = true

export default handler