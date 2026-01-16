let handler = async (m, { conn, usedPrefix }) => {
    // --- VERIFICACIÓN DE ECONOMÍA ---
    if (m.isGroup && !global.db.data.chats[m.chat]?.economy) {
        return m.reply(`> 🆙 La economía está desactivada en este grupo.`)
    }

    let user = global.db.data.users[m.sender]
    if (!user) return

    // Lógica de experiencia: (Nivel actual * 500)
    let expActual = user.exp || 0
    let nivelActual = user.level || 0
    let expNecesaria = (nivelActual + 1) * 500

    // 1. VERIFICACIÓN DE PROGRESO
    if (expActual < expNecesaria) {
        let faltante = expNecesaria - expActual
        let txt = `> 📊 *Progreso de nivel*\n\n`

        txt += `👤 *Usuario:* ${user.name || m.pushName}\n`
        txt += `🆙 *Nivel Actual:* ${nivelActual}\n`
        txt += `✨ *Exp Actual:* ${expActual.toLocaleString()}\n`
        txt += `📋 *Siguiente Nivel:* ${expNecesaria.toLocaleString()}\n\n`

        txt += `⚠️ *Faltan:* ${faltante.toLocaleString()} de experiencia.\n`
        txt += `— — — — — — — — — — — —\n`
        txt += `*Sigue minando o explorando para ascender, corazón.*`

        return m.reply(txt)
    }

    // 2. PROCESO DE ASCENSO
    let nivelesSubidos = 0
    while (user.exp >= (user.level + 1) * 500) {
        user.level += 1
        nivelesSubidos += 1
    }

    // Recompensas (Ajustadas)
    let bonoKryons = nivelesSubidos * 10 
    user.kryons = (user.kryons || 0) + bonoKryons

    await m.react('🆙')

    // 3. MENSAJE DE RESULTADO
    let up = `> 🎉 *¡Felicidades! Has subido de nivel.*\n\n`

    up += `📈 *Niveles subidos:* +${nivelesSubidos}\n`
    up += `🆙 *Nivel actual:* ${user.level}\n`
    up += `💠 *Bono:* +${bonoKryons} Kryons\n\n`

    up += `— — — — — — — — — — — —\n`
    up += `*Estoy muy orgullosa de ver cómo progresas. ¡Sigue así!*`

    return m.reply(up)
}

handler.help = ['nivel']
handler.tags = ['economy']
handler.command = ['nivel', 'lvl', 'levelup']
handler.group = true

export default handler