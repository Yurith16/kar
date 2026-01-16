let handler = async (m, { conn, usedPrefix }) => {
    // --- VERIFICACIÓN DE ECONOMÍA ---
    if (m.isGroup && !global.db.data.chats[m.chat]?.economy) {
        return m.reply(`> ⛏️ La minería está desactivada en este grupo.`)
    }

    let user = global.db.data.users[m.sender]
    if (!user) return

    // 1. CHEQUEO DE SALUD
    if ((user.health || 0) < 50) {
        await m.react('⚠️')
        return m.reply(`> ❤️ *Salud:* ${user.health || 0}%\n\nCorazón, estás demasiado agotado para trabajar en las minas ahora mismo. Necesitas descansar o usar *${usedPrefix}curar* para recuperar energías.`)
    }

    // 2. COOLDOWN (10 minutos)
    let cooldown = 600000 
    let time = (user.lastmiming || 0) + cooldown
    if (new Date() - (user.lastmiming || 0) < cooldown) {
        await m.react('⏳')
        return m.reply(`> ⏳ Aún te estás recuperando del último descenso. Vuelve en: **${msToTime(time - new Date())}**`)
    }

    // 3. RECOMPENSAS (Ajustadas a escasez)
    let exp = Math.floor(Math.random() * 80) + 40
    let coin = Math.floor(Math.random() * 120) + 50 
    let kryons = pickRandom([1, 2, 3, 5, 2, 1, 4]) 

    let stone = pickRandom([10, 15, 20, 25])
    let coal = pickRandom([5, 8, 10, 0])
    let iron = pickRandom([2, 4, 5, 0, 0])
    let gold = pickRandom([1, 2, 0, 0, 0, 0])
    let emerald = pickRandom([1, 0, 0, 0, 0, 0, 0, 0])

    await m.react('⛏️')

    // 4. ACTUALIZACIÓN DE DATOS
    user.health = Math.max(0, (user.health || 100) - 50)
    user.coin = (user.coin || 0) + coin
    user.kryons = (user.kryons || 0) + kryons
    user.exp = (user.exp || 0) + exp
    user.stone = (user.stone || 0) + stone
    user.coal = (user.coal || 0) + coal
    user.iron = (user.iron || 0) + iron
    user.gold = (user.gold || 0) + gold
    user.emerald = (user.emerald || 0) + emerald
    user.lastmiming = new Date() * 1

    let txt = `> ⛏️ *Has vuelto de las profundidades.*\n\n`
    txt += `⚡ *Kryons:* +${kryons}\n`
    txt += `🪙 *Coins:* +${coin}\n`
    txt += `✨ *Exp:* +${exp}\n`
    txt += `🪨 *Piedra:* +${stone}\n`
    if (coal > 0) txt += `🕋 *Carbón:* +${coal}\n`
    if (iron > 0) txt += `🔩 *Hierro:* +${iron}\n`
    if (gold > 0) txt += `🏅 *Oro:* +${gold}\n`
    if (emerald > 0) txt += `♦️ *Esmeralda:* +${emerald}\n\n`

    txt += `❤️ *Salud:* ${user.health}%\n`
    txt += `— — — — — — — — — — — —\n`
    txt += `*Cuídate mucho allá abajo, no quiero que te pase nada.*`

    return m.reply(txt)
}

handler.help = ['minar']
handler.tags = ['economy']
handler.command = ['minar', 'mine']
handler.group = true

export default handler

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60)
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    return `${minutes}m ${seconds}s`
}