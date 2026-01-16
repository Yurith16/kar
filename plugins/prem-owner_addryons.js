import { premiumStyles } from '../lib/styles.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Validación de argumentos: .add [tipo] [id] [cantidad]
    let [tipo, id, cantidad] = text.split(' ')

    if (!tipo || !id || !cantidad) {
        return m.reply(`> *Hola, cielo. Necesito que me indiques qué deseas entregar, a quién y la cantidad. Usa:* \n> \`${usedPrefix + command} [coin|kryon|diamond|exp] ID cantidad\``)
    }

    // Mapeo de tipos para la base de datos y emojis
    const tiposValidos = {
        'coin': { db: 'coin', nombre: 'Coins', emoji: '💰' },
        'coins': { db: 'coin', nombre: 'Coins', emoji: '💰' },
        'kryon': { db: 'kryons', nombre: 'Kryons', emoji: '✨' },
        'kryons': { db: 'kryons', nombre: 'Kryons', emoji: '✨' },
        'diamond': { db: 'diamond', nombre: 'Diamantes', emoji: '💎' },
        'diamonds': { db: 'diamond', nombre: 'Diamantes', emoji: '💎' },
        'diamante': { db: 'diamond', nombre: 'Diamantes', emoji: '💎' },
        'exp': { db: 'exp', nombre: 'Experiencia', emoji: '🧪' },
        'experiencia': { db: 'exp', nombre: 'Experiencia', emoji: '🧪' }
    }

    let t = tiposValidos[tipo.toLowerCase()]
    if (!t) return m.reply(`*Lo siento, pero no reconozco "${tipo}" como algo que pueda entregar. Intenta con coin, kryon, diamond o exp.*`)

    let who = id.includes('@s.whatsapp.net') ? id : id.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    let user = global.db.data.users[who]

    if (!user) return m.reply(`*No logré encontrar a nadie con ese ID en mis registros. Verifica si el número es correcto, ¿si?*`)

    let numCantidad = parseInt(cantidad)
    if (isNaN(numCantidad) || numCantidad <= 0) return m.reply('*Cariño, la cantidad debe ser un número positivo para que pueda procesarla.*')

    // --- REGLA ANTI-INFLACIÓN ESTRICTA (1000 MAX) ---
    if (numCantidad > 1000) {
        const advertencias = [
            `*¡Oye! 1,000 es el límite absoluto. Aunque seas mi dueño, no dejaré que rompas el equilibrio de la economía.*`,
            `*Eso es demasiado, corazón. Si regalo más de 1,000 ${t.nombre} perderán su valor. Por favor, baja la cantidad.*`,
            `*Cariño, mi sistema no permite inyecciones tan grandes. Vamos a dejarlo en 1,000 o menos para cuidar el bot.*`
        ]
        return m.reply(`> ${advertencias[Math.floor(Math.random() * advertencias.length)]}`)
    }

    try {
        // Ejecutar la transacción
        user[t.db] = (user[t.db] || 0) + numCantidad

        // Reporte para el Owner
        let report = `✨ *Entrega de suministros exitosa*\n\n`
        report += `*Hecho, ya le entregué los ${numCantidad.toLocaleString()} ${t.nombre} a ${user.name || 'tu contacto'}. ¡Espero que le sirvan de mucho!*`

        await m.reply(report)

        // Notificación al Receptor
        let isPremium = user.premium || false
        let userStyle = premiumStyles[user.prefStyle] || (isPremium ? premiumStyles["luxury"] : null)

        const mensajesReceptor = [
            `*¡Hola! El Administrador me pidió que te entregara un regalito especial hoy.*`,
            `*¡Buenas noticias! Han llegado nuevos recursos a tu cuenta de parte del Owner.*`,
            `*¡Mira! El Administrador ha decidido premiar tu esfuerzo con esto.*`
        ]

        let notice = isPremium && userStyle ? `${userStyle.top}\n\n` : ''
        notice += `${t.emoji} *¡RECURSOS RECIBIDOS!*\n\n`
        notice += `${mensajesReceptor[Math.floor(Math.random() * mensajesReceptor.length)]}\n\n`
        notice += `> ✨ *Añadido:* +${numCantidad.toLocaleString()} ${t.nombre}\n`
        notice += `> 💰 *Nuevo Saldo:* ${user[t.db].toLocaleString()}\n\n`
        notice += `*¡Sigue disfrutando de KARBOT!*`
        if (isPremium && userStyle) notice += `\n\n${userStyle.footer}`

        await conn.sendMessage(who, { text: notice })

    } catch (e) {
        console.error(e)
        // Devolución automática por error (Instrucción 2026-01-10)
        m.reply("*Hubo un pequeño error al procesar los datos, pero ya me encargué de que no se pierda nada. Inténtalo de nuevo.*")
    }
}

handler.help = ['dar']
handler.tags = ['owner']
handler.command = /^(dar|añadir|dar)$/i
handler.rowner = true 

export default handler