let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } })

    let cooldown = 86400000 
    if (new Date - user.lastclaim < cooldown) {
        let time = (user.lastclaim + cooldown) - new Date()
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

        const esperas = [
            `*Oye, ya te di tus monedas hoy. Vuelve en ${msToTime(time)} y te daré más, ¿si?*`,
            `*¡Qué puntual! Pero aún faltan ${msToTime(time)} para tus próximos suministros.*`,
            `*Todavía no es hora, cariño. Regresa en ${msToTime(time)} por tu regalo diario.*`,
            `*Ten paciencia, mis reservas se están recargando. Vuelve en ${msToTime(time)}.*`
        ]
        return m.reply(`> ${esperas[Math.floor(Math.random() * esperas.length)]}`)
    }

    let coinsBase = user.premium ? Math.floor(Math.random() * 51) + 120 : Math.floor(Math.random() * 41) + 70 
    let expBase = user.premium ? 200 : 100

    user.coin += coinsBase
    user.exp += expBase
    user.lastclaim = new Date * 1

    const saludos = [
        `*¡Hola! Qué bueno verte por aquí. He preparado tus suministros de hoy:*`,
        `*¡Buen día! No me olvidé de tu regalo, aquí tienes lo que te corresponde:*`,
        `*Es un placer saludarte. He apartado estas monedas solo para ti:*`,
        `*Mira lo que tengo listo para tu jornada de hoy. Espero que te ayude:*`,
        `*¡Ya estás aquí! Toma tus beneficios diarios, te los has ganado:*`,
        `*Me alegra que seas tan constante. Aquí tienes tu botín del día:*`,
        `*He revisado el almacén y esto es lo que puedo darte hoy, disfrútalo:*`,
        `*Hola, corazón. Aquí tienes tus monedas y experiencia para seguir creciendo:*`,
        `*Siempre es un gusto apoyarte. Toma tus suministros diarios:*`,
        `*¡Puntual como siempre! Aquí tienes lo tuyo, guárdalo bien:*`
    ]

    let txt = `📅 *𝗕𝗢𝗡𝗢 𝗗𝗜𝗔𝗥𝗜𝗢 𝗗𝗘 𝗦𝗨𝗠𝗜𝗡𝗜𝗦𝗧𝗥𝗢𝗦*\n\n`
    txt += `${saludos[Math.floor(Math.random() * saludos.length)]}\n\n`

    txt += `> 💰 *Coins:* +${coinsBase.toLocaleString()}\n`
    txt += `> 🧪 *Exp:* +${expBase}\n\n`

    if (user.premium) {
        txt += `*🍀 Por ser un usuario Élite, me aseguré de darte un bono superior. ¡Disfrútalo!*`
        await conn.sendMessage(m.chat, { react: { text: '🍀', key: m.key } })
    } else {
        txt += `*🍃 Vuelve mañana por más. Me encanta ayudarte a progresar.*`
        await conn.sendMessage(m.chat, { react: { text: '☘️', key: m.key } })
    }

    await m.reply(txt)
}

handler.help = ['daily']
handler.tags = ['econ']
handler.command = /^(daily|claim|diario)$/i
handler.register = true

export default handler

function msToTime(duration) {
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    // Eliminados los asteriscos de aquí para que se vea limpio
    return `${hours}h ${minutes}m`
}