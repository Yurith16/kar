const { checkReg } = require('../lib/checkReg.js')
const { canLevelUp, xpRange } = require('../lib/levelling.js')

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]

    // Verificación de registro (Ahora sí sin errores, vida mía)
    if (await checkReg(m, user)) return

    let nameHandle = user.registeredName || user.name || conn.getName(m.sender)

    // Dificultad equilibrada
    let difficulty = 1.5 
    let { min, xp, max } = xpRange(user.level, difficulty)

    let fortunaTotal = (user.coin || 0) + (user.bank || 0)
    let rangoActual = obtenerRango(user.level, fortunaTotal)
    let h = ["🍃", "🌿", "🍀", "🌱", "☘️"].getRandom()

    // --- VERIFICACIÓN: ¿PUEDE SUBIR? ---
    if (!canLevelUp(user.level, user.exp, difficulty)) {
        let expActual = Math.max(0, user.exp - min)
        let porcentaje = Math.min(100, (expActual / xp) * 100)
        let progreso = Math.min(Math.floor((expActual / xp) * 10), 10)

        let barra = '▰'.repeat(progreso) + '▱'.repeat(10 - progreso)
        let faltante = Math.max(0, max - user.exp)

        let txt = `> ${h} *「 𝙴𝚂𝚃𝙰𝙳𝙾 𝙳𝙴 𝙰𝚂𝙲𝙴𝙽𝚂𝙾 」* ${h}\n\n`
        txt += `> 👤 *Usuario:* » ${nameHandle}\n`
        txt += `> 🏆 *Rango:* » ${rangoActual}\n`
        txt += `> 🆙 *Nivel:* » ${user.level}\n`
        txt += `> 📊 *Progreso:* » [ ${barra} ] ${porcentaje.toFixed(1)}%\n`
        txt += `> 📈 *Faltan:* » ${faltante.toLocaleString()} XP\n\n`
        txt += `> 💋 _Llegar a la cima requiere sacrificio... ¿estás a la altura, vida mía?_`

        await m.react('🌿')
        return m.reply(txt)
    }

    // --- PROCESO DE LEVEL UP ---
    let before = user.level * 1
    while (canLevelUp(user.level, user.exp, difficulty)) user.level++

    if (before !== user.level) {
        let nuevoRango = obtenerRango(user.level, fortunaTotal)
        user.role = nuevoRango 

        let up = `> 🎊 *「 ¡𝙰𝚂𝙲𝙴𝙽𝚂𝙾 𝙴𝙻𝙸𝚃𝙸𝚂𝚃𝙰! 」* 🎊\n\n`
        up += `> 👤 *Usuario:* » ${nameHandle}\n`
        up += `> 📉 *De:* » Nivel ${before}\n`
        up += `> 📈 *A:* » Nivel ${user.level}\n`
        up += `> 🎖️ *Rango:* » ${nuevoRango}\n\n`
        up += `> 🔥 _Tu evolución es excitante... has superado tus límites con elegancia._`

        await m.react('😲')
        await m.react('✨')

        let messageOptions = { text: up }
        if (global.rcanal && global.rcanal.contextInfo) {
            messageOptions.contextInfo = global.rcanal.contextInfo
        }
        return conn.sendMessage(m.chat, messageOptions, { quoted: m })
    }
}

function obtenerRango(lvl, fortuna) {
    if (fortuna >= 50000000) return "🏦 Deidad Financiera"
    if (fortuna >= 10000000) return "👑 Magnate"
    if (fortuna >= 1000000) return "🏛️ Capitalista"
    const rangos = [
        { min: 0, max: 10, name: '🌱 Novato' }, { min: 11, max: 30, name: '⚔️ Guerrero' },
        { min: 31, max: 60, name: '🛡️ Caballero' }, { min: 61, max: 100, name: '🎖️ Veterano' },
        { min: 101, max: 200, name: '🔥 Maestro' }, { min: 201, max: 500, name: '🐉 Épico' },
        { min: 501, max: 1000, name: '👑 Leyenda' }
    ]
    const encontrado = rangos.find(r => lvl >= r.min && lvl <= r.max)
    return encontrado ? encontrado.name : '🐉 Dragón Rey Estrella'
}

handler.help = ['nivel']
handler.tags = ['econ']
handler.command = ['nivel', 'lvl', 'levelup', 'level'] 

module.exports = handler