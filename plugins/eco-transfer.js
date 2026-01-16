let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    if (!user) return

    const validItems = {
        'coin': 'coin',
        'diamond': 'diamond',
        'kryons': 'kryons',
        'joincount': 'joincount',
        'exp': 'exp'
    }

    let itemId = args[0]?.toLowerCase()
    let count = Math.max(1, isNaN(args[1]) ? 0 : parseInt(args[1]))
    let targetId = args[2]?.replace(/[^0-9]/g, '')

    // --- VALIDACIONES ---
    if (!itemId || !validItems[itemId]) {
        return m.reply(`> ⚠️ *ID de objeto no válido*\n\nIDs: \`coin\`, \`diamond\`, \`kryons\`, \`joincount\`, \`exp\`\nUso: \`${usedPrefix + command} coin 500 504xxxxxxx\``)
    }

    if (count <= 0) return m.reply(`> 🔢 La cantidad debe ser mayor a cero, corazón.`)

    if (!targetId || targetId.length < 8) {
        return m.reply(`> 👤 *ID requerido*\n\nNecesito el número de teléfono de quien recibirá el envío.\nEjemplo: \`${usedPrefix + command} ${itemId} ${count} 50499887766\``)
    }

    let who = targetId + '@s.whatsapp.net'
    if (who === m.sender) return m.reply(`> 🤡 ¿Transferirte a ti mismo? Para eso mejor déjalo en tu cartera.`)

    let target = global.db.data.users[who]
    if (!target) {
        return m.reply(`> ⚙️ No encuentro a nadie con el ID \`${targetId}\` en mi base de datos.`)
    }

    let itemKey = validItems[itemId]
    if (user[itemKey] < count) {
        return m.reply(`> ❌ No tienes suficientes **${itemId}** para realizar este envío.`)
    }

    // --- LÓGICA DE COMISIÓN ---
    let comision = user.premium ? 0 : Math.ceil(count * 0.05)
    let montoFinal = count - comision

    user[itemKey] -= count
    target[itemKey] += montoFinal

    await m.react('💸')

    // --- MENSAJES HUMANOS ---
    const frasesExito = [
        `He enviado los recursos con éxito. Espero que le den un buen uso.`,
        `Transferencia completada. Los fondos ya están en manos del receptor.`,
        `¡Listo! Ya procesé el envío de tus recursos.`,
        `Todo en orden. La transferencia se realizó sin problemas.`
    ]

    let txt = `> 💸 *Transferencia realizada*\n\n`
    txt += `${pickRandom(frasesExito)}\n\n`
    txt += `📤 *Emisor:* @${m.sender.split('@')[0]}\n`
    txt += `📥 *Receptor ID:* ${targetId}\n`
    txt += `📦 *Recurso:* ${itemId}\n`
    txt += `🔢 *Monto:* ${count.toLocaleString()}\n`

    if (comision > 0) {
        txt += `🏦 *Impuesto (5%):* -${comision.toLocaleString()}\n`
        txt += `✨ *Llega neto:* ${montoFinal.toLocaleString()}\n\n`
        txt += `_Los usuarios premium no pagan impuestos._`
    } else {
        txt += `💎 *Beneficio Premium:* Sin impuestos.\n`
        txt += `✨ *Llega neto:* ${montoFinal.toLocaleString()}\n`
    }

    return conn.sendMessage(m.chat, { 
        text: txt, 
        mentions: [m.sender, who] 
    }, { quoted: m })
}

handler.help = ['transferir']
handler.tags = ['economy']
handler.command = /^(transfer|transferir)$/i

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}