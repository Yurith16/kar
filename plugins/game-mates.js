const salasMates = new Map()

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (salasMates.has(m.sender)) return m.reply("> ⚠️ Ya tienes un reto activo. ¡Termina ese primero!")

    let modes = {
        fácil: [-10, 20, 25000, 100, 30, 0, 0],
        normal: [-50, 100, 35000, 250, 80, 1, 0],
        difícil: [-500, 500, 45000, 600, 200, 2, 1],
        extremo: [-1500, 1500, 60000, 1200, 500, 4, 2]
    }

    if (!args[0]) {
        let te = `> 🧠 *¿𝗤𝘂𝗲́ 𝘁𝗮𝗻 𝗯𝘂𝗲𝗻𝗼 𝗲𝗿𝗲𝘀 𝗲𝗻 𝗺𝗮𝘁𝗲𝘀?*\n`
        te += `> _Elige un nivel y demuestra tu agilidad._\n\n`
        Object.entries(modes).forEach(([mode, data]) => {
            te += `*${mode.toUpperCase()}*\n`
            te += `> ⏳ ${data[2] / 1000}s | 🪙 Recompensa: +${data[3]}\n`
        })
        te += `\n— — — — — — — — — — — —\n`
        te += `💡 *Uso:* \`${usedPrefix + command} normal\``
        return m.reply(te)
    }

    let mode = args[0].toLowerCase()
    if (!(mode in modes)) return m.reply(`> ❌ Ese modo no existe, intenta con uno del menú.`)

    let math = genMath(mode, modes)
    let timer = setTimeout(() => {
        if (salasMates.has(m.sender)) {
            m.reply(`> ⏰ *¡Se acabó el tiempo!*\n\n> La respuesta era *${math.result}*. Estuvo cerca, ¿no?`)
            salasMates.delete(m.sender)
        }
    }, math.time)

    salasMates.set(m.sender, { 
        ...math, 
        intentos: 3, 
        chat: m.chat,
        timer 
    })

    let txt = `> 🧠 *𝗥𝗘𝗧𝗢 𝗠𝗔𝗧𝗘𝗠𝗔𝗧𝗜𝗖𝗢*\n`
    txt += `> *Nivel:* ${mode.toUpperCase()}\n\n`
    txt += `🧮 *Resuelve esto:* \n> \` ${math.str} = ? \` \n\n`
    txt += `🎁 *Si aciertas te daré:* \n`
    txt += `> 🪙 Coins: +${math.bonus}\n`
    if (math.maxDiamond > 0) txt += `> 💎 Diamantes: Hasta ${math.maxDiamond}\n`
    txt += `\n⏳ Tienes *${math.time / 1000}s*. ¡Mucha suerte!`

    await m.react('🧠')
    return conn.reply(m.chat, txt, m, { mentions: [m.sender] })
}

function genMath(mode, modes) {
    let [min, max, time, bonus, xp, maxDiamond, kryons] = modes[mode]
    let ops = ['+', '-', '*']
    if (maxDiamond > 0) ops.push('/')
    let op = ops[Math.floor(Math.random() * ops.length)]
    let a = Math.floor(Math.random() * (max - min + 1)) + min
    let b = Math.floor(Math.random() * (max - min + 1)) + min
    if (op === '/') {
        b = Math.floor(Math.random() * 10) + 1
        a = b * (Math.floor(Math.random() * 10) + 1)
    }
    let res = eval(`${a} ${op} ${b}`)
    return { str: `${a} ${op.replace('*', '×').replace('/', '÷')} ${b}`, time, bonus, xp, maxDiamond, kryons, result: res }
}

handler.before = async function (m) {
    let math = salasMates.get(m.sender)
    if (!math || m.isBaileys || !m.text) return 
    if (m.chat !== math.chat) return 

    // Si el texto no es un número (con posible signo negativo), ignoramos
    if (!/^-?[0-9]+$/.test(m.text.trim())) return

    let respuestaUser = parseInt(m.text.trim())
    let user = global.db.data.users[m.sender]

    if (respuestaUser === math.result) {
        let diamantesGanados = math.maxDiamond > 0 ? Math.floor(Math.random() * math.maxDiamond) + 1 : 0

        user.coin += math.bonus
        user.exp += math.xp
        user.diamond += diamantesGanados
        if (math.kryons) user.kryons = (user.kryons || 0) + math.kryons

        clearTimeout(math.timer)
        salasMates.delete(m.sender)

        let res = `> ✅ *¡𝗘𝗫𝗖𝗘𝗟𝗘𝗡𝗧𝗘!*\n\n`
        res += `> @${m.sender.split('@')[0]}, lo lograste con éxito.\n`
        res += `> 🎁 *Premio:* ${math.bonus} coins y ${math.xp} exp.`
        if (diamantesGanados > 0) res += `\n> 💎 *Extra:* +${diamantesGanados} diamante(s).`

        await m.react('✨')
        return m.reply(res, null, { mentions: [m.sender] })
    } else {
        math.intentos--
        if (math.intentos <= 0) {
            clearTimeout(math.timer)
            salasMates.delete(m.sender)
            return m.reply(`> ❌ *Se acabaron las oportunidades.*\n> La respuesta era: ${math.result}. ¡A la próxima será!`)
        }
        return m.reply(`> ⚠️ *Casi, pero no.*\n> Te quedan ${math.intentos} intentos. ¡Tú puedes!`)
    }
}

handler.help = ['mates']
handler.tags = ['game']
handler.command = ['mates', 'math']
handler.group = true

export default handler