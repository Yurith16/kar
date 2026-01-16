let handler = async (m, { conn, usedPrefix, args }) => {
    if (m.isGroup && !global.db.data.chats[m.chat]?.economy) return

    let user = global.db.data.users[m.sender]
    if (!user) return

    user.candies = (Number(user.candies) || 0)
    user.health = (Number(user.health) || 0)

    if (user.candies <= 0) {
        return m.reply(`> 🍬 No tienes dulces, corazón. Ve a la tienda a por más.`)
    }

    if (user.health >= 100) {
        return m.reply(`> ❤️ Ya estás a tope, no desperdicies tus suministros.`)
    }

    let saludFaltante = 100 - user.health
    let candiesNecesarios = Math.ceil(saludFaltante / 20)
    let cantidad = args[0]?.toLowerCase() === 'all' ? Math.min(user.candies, candiesNecesarios) : (parseInt(args[0]) || 1)

    if (cantidad > user.candies) cantidad = user.candies

    let saludRecuperada = cantidad * 20
    user.health = Math.min(100, user.health + saludRecuperada)
    user.candies -= cantidad

    const frases = [
        `Te ves mejor ahora.`,
        `Salud recuperada, ten más cuidado.`,
        `¡Listo! Energía restaurada.`,
        `Ya estás en forma otra vez.`
    ]

    let txt = `> 🍬 *${pickRandom(frases)}*\n\n`
    txt += `❤️ *Salud:* ${user.health}%\n`
    txt += `🎒 *Dulces:* ${user.candies} restantes\n\n`
    txt += `_Ya puedes volver a ${usedPrefix}minar_`

    await m.react('🍬')
    return m.reply(txt)
}

handler.help = ['curar']
handler.tags = ['economy']
handler.command = ['curar', 'comer', 'heal', 'eat']
handler.group = true

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}