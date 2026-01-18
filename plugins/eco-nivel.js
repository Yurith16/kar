let handler = async (m, { conn, usedPrefix }) => {
    // --- VERIFICACIÓN DE ECONOMÍA ---
    if (m.isGroup && !global.db.data.chats[m.chat]?.economy) {
        return m.reply(`> 🔞 La economía está apagada en este jardín.`)
    }

    let user = global.db.data.users[m.sender]
    if (!user) return

    let expActual = user.exp || 0
    let nivelActual = user.level || 0
    let expNecesaria = (nivelActual + 1) * 500
    let fortunaTotal = (user.coin || 0) + (user.bank || 0)

    // --- REACCIÓN ALEATORIA ---
    const esencias = ['🔥', '🍃', '🌱', '🌷', '✨']
    const esenciaRandom = esencias[Math.floor(Math.random() * esencias.length)]
    await m.react(esenciaRandom)

    // 1. VERIFICACIÓN DE PROGRESO
    if (expActual < expNecesaria) {
        let faltante = expNecesaria - expActual
        let rango = obtenerRango(nivelActual, fortunaTotal)
        
        let txt = `> 🌱 *LEVEL UP*\n\n`
        txt += `> 👤 *Usuario:* » ${user.name || m.pushName}\n`
        txt += `> 🎖️ *Rango:* » ${rango}\n`
        txt += `> 🆙 *Nivel:* » ${nivelActual}\n`
        txt += `> ✨ *Exp:* » ${expActual.toLocaleString()} / ${expNecesaria.toLocaleString()}\n\n`
        txt += `> ⚠️ *Faltan:* » ${faltante.toLocaleString()} XP\n`
        txt += `> 🔥 _Sigue floreciendo para ascender, corazón._`

        return m.reply(txt)
    }

    // 2. PROCESO DE ASCENSO
    let nivelesSubidos = 0
    while (user.exp >= (user.level + 1) * 500) {
        user.level += 1
        nivelesSubidos += 1
    }

    // Recompensas
    let bonoKryons = nivelesSubidos * 10 
    user.kryons = (user.kryons || 0) + bonoKryons
    let nuevoRango = obtenerRango(user.level, fortunaTotal)

    // --- REACCIONES DE CELEBRACIÓN ---
    await m.react('😲')
    await m.react('🎁')

    // 3. MENSAJE DE RESULTADO
    let up = `> 🎊 *LEVEL UP*\n\n`
    up += `> 📈 *Subida:* » +${nivelesSubidos}\n`
    up += `> 🎖️ *Rango:* » ${nuevoRango}\n`
    up += `> 🆙 *Nivel:* » ${user.level}\n`
    up += `> 💠 *Bono:* » +${bonoKryons} Kryons\n\n`
    up += `> 🔥 _¡Qué drama tan divino! Tu ascenso me deja sin aliento._`

    return m.reply(up)
}

function obtenerRango(lvl, fortuna) {
    if (fortuna >= 50000000) return "🏦 Deidad Financiera"
    if (fortuna >= 10000000) return "👑 Magnate"
    if (fortuna >= 5000000) return "🏛️ Capitalista"
    const rangos = [
        { min: 0, max: 3, name: 'Guerrero V' }, { min: 4, max: 6, name: 'Guerrero IV' },
        { min: 7, max: 9, name: 'Guerrero III' }, { min: 10, max: 12, name: 'Guerrero II' },
        { min: 13, max: 15, name: 'Guerrero I' }, { min: 16, max: 18, name: 'Élite V' },
        { min: 19, max: 21, name: 'Élite IV' }, { min: 22, max: 24, name: 'Élite III' },
        { min: 25, max: 27, name: 'Élite II' }, { min: 28, max: 30, name: 'Élite I' },
        { min: 31, max: 33, name: 'Maestros V' }, { min: 34, max: 36, name: 'Maestros IV' },
        { min: 37, max: 39, name: 'Maestros III' }, { min: 40, max: 42, name: 'Maestros II' },
        { min: 43, max: 45, name: 'Maestros I' }, { min: 46, max: 48, name: 'Gran Maestro V' },
        { min: 49, max: 51, name: 'Gran Maestro IV' }, { min: 52, max: 54, name: 'Gran Maestro III' },
        { min: 55, max: 57, name: 'Gran Maestro II' }, { min: 58, max: 60, name: 'Gran Maestro I' },
        { min: 61, max: 63, name: 'Épico V' }, { min: 64, max: 66, name: 'Épico IV' },
        { min: 67, max: 69, name: 'Épico III' }, { min: 70, max: 71, name: 'Épico II' },
        { min: 72, max: 74, name: 'Épico I' }, { min: 75, max: 77, name: 'Leyenda V' },
        { min: 78, max: 80, name: 'Leyenda IV' }, { min: 81, max: 83, name: 'Leyenda III' },
        { min: 84, max: 86, name: 'Leyenda II' }, { min: 87, max: 89, name: 'Leyenda I' },
        { min: 90, max: 91, name: 'Mítico V' }, { min: 92, max: 94, name: 'Mítico IV' },
        { min: 95, max: 97, name: 'Mítico III' }, { min: 98, max: 100, name: 'Mítico II' },
        { min: 101, max: 105, name: 'Mítico I' }, { min: 106, max: 120, name: 'Gloria Mítica' },
        { min: 121, max: 150, name: 'Esmeralda V' }, { min: 151, max: 160, name: 'Esmeralda VI' },
        { min: 161, max: 170, name: 'Esmeralda III' }, { min: 171, max: 185, name: 'Esmeralda II' },
        { min: 186, max: 200, name: 'Esmeralda I' }, { min: 201, max: 400, name: 'Titan III' },
        { min: 401, max: 700, name: 'Titan II' }, { min: 701, max: 1000, name: 'Titan I' }
    ]
    const rangoEncontrado = rangos.find(r => lvl >= r.min && lvl <= r.max)
    return rangoEncontrado ? rangoEncontrado.name : (lvl > 1000 ? '🐉 Dragón Rey Estrella' : '🌱 Novato')
}

handler.help = ['nivel']
handler.tags = ['economy']
handler.command = ['nivel', 'lvl', 'levelup']
handler.group = true

export default handler