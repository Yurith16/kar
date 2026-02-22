const { saveDatabase } = require('../lib/db.js')
const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.math = conn.math ? conn.math : {}
    let id = m.sender 
    let user = global.db.data.users[m.sender]
    let h = ["🍃", "🌿", "🍀", "🌱", "☘️"].getRandom()

    if (await checkReg(m, user)) return

    // --- OPCIÓN DE RENDIRSE ---
    if (command === 'rendirse' || text === 'rendirse') {
        if (!conn.math[id]) return m.reply(`> ${h} *Atención:* No tienes ningún desafío activo en este momento.`)
        delete conn.math[id]
        user.coin = Math.max(0, (user.coin || 0) - 1000)
        user.racha = 0
        await m.react('🥀')
        return m.reply(`> 🥀 *「 𝙳𝙴𝚁𝚁𝙾𝚃𝙰 𝚈 𝚁𝙴𝙽𝙳𝙸𝙲𝙸𝙾𝙽 」*\n\n> Te has rendido ante el cálculo. Perdiste *1,000 Coins* y tu racha 🔥 se ha extinguido.`)
    }

    if (conn.math[id]) return m.reply(`> ${h} *Aviso:* Ya tienes un problema activo. Resuélvelo o usa \`${usedPrefix}rendirse\`.`)

    // --- SELECCIÓN DE DIFICULTAD ---
    let mode = text.toLowerCase().trim()
    if (!['normal', 'dificil', 'extremo'].includes(mode)) {
        let menu = `> ${h} *「 𝙳𝙴𝚂𝙰𝙵𝙸𝙾 𝙼𝙰𝚃𝙴𝙼𝙰𝚃𝙸𝙲𝙾 」* ${h}\n\n`
        menu += `> _Elige una dificultad para comenzar:_ \n\n`
        menu += `> 🟢 *${usedPrefix + command} normal*\n`
        menu += `> 🟠 *${usedPrefix + command} dificil*\n`
        menu += `> 🔴 *${usedPrefix + command} extremo*\n\n`
        menu += `> ✨ _¡Demuestra tu agilidad mental, vida mía!_`
        return m.reply(menu)
    }

    let n1, n2, op, time, rewardMult
    let ops = ['+', '-', '*']

    if (mode === 'normal') {
        n1 = Math.floor(Math.random() * 30) + 1
        n2 = Math.floor(Math.random() * 20) + 1
        op = ops[Math.floor(Math.random() * 2)]
        time = 30000 
        rewardMult = 1
    } else if (mode === 'dificil') {
        // Aumentamos el rango de los números
        n1 = Math.floor(Math.random() * 150) + 20
        n2 = Math.floor(Math.random() * 80) + 10
        op = ops[Math.floor(Math.random() * 3)]
        time = 18000 // Menos tiempo para más presión
        rewardMult = 2.5
    } else { // Extremo (Nivel Dios)
        n1 = Math.floor(Math.random() * 800) + 100
        n2 = Math.floor(Math.random() * 150) + 30
        op = ops[Math.floor(Math.random() * 3)]
        time = 10000 // Solo 10 segundos
        rewardMult = 5
    }

    let result = eval(`${n1} ${op === '*' ? '*' : op} ${n2}`)

    conn.math[id] = {
        result: result.toString(),
        mode,
        rewardMult,
        time: Date.now() + time,
        timeout: setTimeout(() => {
            if (conn.math[id]) {
                user.racha = 0
                conn.reply(m.chat, `> ⌛ *𝚃𝙸𝙴𝙼𝙿𝙾 𝙰𝙶𝙾𝚃𝙰𝙳𝙾*\n\n> El resultado era *${result}*. Perdiste tu racha 🔥.`, m)
                delete conn.math[id]
            }
        }, time)
    }

    await m.react('🔢')
    let txt = `> ${h} *「 𝙳𝙴𝚂𝙰𝙵𝙸𝙾: ${mode.toUpperCase()} 」* ${h}\n\n`
    txt += `> 💡 *¿Cuánto es:* » \`${n1} ${op.replace('*', 'x')} ${n2}\`?\n`
    txt += `> ⌛ *Tiempo:* » ${time / 1000} segundos\n\n`
    txt += `> ✨ _Responde directamente a este mensaje._`

    await m.reply(txt)
}

handler.before = async (m, { conn }) => {
    conn.math = conn.math ? conn.math : {}
    let id = m.sender
    if (!conn.math[id] || m.isBaileys || !m.text) return false

    let game = conn.math[id]
    let user = global.db.data.users[m.sender]
    let input = m.text.trim()
    let h = ["🍃", "🌿", "🍀", "🌱", "☘️"].getRandom()

    // Obtenemos el nombre registrado
    let nameHandle = user.registeredName || user.name || conn.getName(m.sender)

    if (input === game.result) {
        clearTimeout(game.timeout)

        let baseCoin = Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000
        let rewardCoin = Math.floor(baseCoin * game.rewardMult)
        let rewardDmd = game.mode === 'extremo' ? 5 : (game.mode === 'dificil' ? 3 : 1)

        user.coin = (user.coin || 0) + rewardCoin
        user.diamond = (user.diamond || 0) + rewardDmd
        user.racha = (user.racha || 0) + 1

        let bonus = ""
        if (user.racha % 5 === 0) {
            user.hotpass = (user.hotpass || 0) + 1
            bonus = `\n> 🔥 *BONUS RACHA:* » +1 🎫 HotPass`
        }

        await m.react('🎉')
        let winTxt = `> ${h} *「 𝙲𝙰𝙻𝙲𝚄𝙻𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾 」* ${h}\n\n`
        winTxt += `> 👤 *Usuario:* » ${nameHandle}\n`
        winTxt += `> 🎖️ *Modo:* » ${game.mode.toUpperCase()}\n`
        winTxt += `> 💰 *Ganancia:* » ${rewardCoin.toLocaleString()} 🪙 y ${rewardDmd} 💎\n`
        winTxt += `> 🔥 *Racha Actual:* » ${user.racha}${bonus}\n\n`
        winTxt += `> ✨ _¡Tu intelecto es brillante, tesoro!_`

        await m.reply(winTxt)
        delete conn.math[id]
        await saveDatabase()
    } else {
        if (m.text.startsWith('.') || m.text.startsWith('/') || m.text.startsWith('#')) return false

        clearTimeout(game.timeout)
        user.racha = 0
        await m.react('💀')
        let lose = `> 💀 *「 𝙴𝚁𝚁𝙾𝚁 𝙳𝙴 𝙲𝙰𝙻𝙲𝚄𝙻𝙾 」* 💀\n\n`
        lose += `> El resultado correcto era: *${game.result}*\n`
        lose += `> Has fallado. Tu racha 🔥 se ha extinguido.\n\n`
        lose += `> ✨ _Inténtalo de nuevo, no te rindas._`
        await m.reply(lose)
        delete conn.math[id]
    }
    return true
}

handler.help = ['mates']
handler.tags = ['game']
handler.command = /^(mates|math|calc|rendirse)$/i

module.exports = handler