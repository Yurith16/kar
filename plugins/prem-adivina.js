import { premiumStyles } from '../lib/styles.js'

const niveles = {
    "1": { n: "Fácil", r: [1, 10], i: 3, kb: 5, c: 150, d: 0, e: "🟢" },
    "2": { n: "Normal", r: [1, 50], i: 4, kb: 15, c: 300, d: 1, e: "🟡" },
    "3": { n: "Difícil", r: [1, 100], i: 5, kb: 30, c: 450, d: 2, e: "🟠" }
};

const salasActivas = new Map()

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]

    if (!user.premium) return m.reply(`> 💎 *ACCESO PREMIUM*\n\n> Este juego es exclusivo para miembros **Elite**.`)

    if (salasActivas.has(m.sender)) return m.reply(`> ⚠️ Ya tienes una partida en curso. ¡Concéntrate!`)

    let s = premiumStyles[user.prefStyle] || (user.premium ? premiumStyles["luxury"] : null)

    if (!text || !niveles[text]) {
        let menu = s ? `${s.top}\n\n` : ''
        menu += `🎯 *𝗔𝗗𝗜𝗩𝗜𝗡𝗔 𝗘𝗟 𝗡𝗨́𝗠𝗘𝗥𝗢*\n`
        menu += `_Elige un nivel para iniciar tu sesión privada._\n\n`
        for (let key in niveles) {
            let n = niveles[key]
            menu += `${key}️⃣ *${n.n.toUpperCase()}* (${n.r[0]}-${n.r[1]})\n`
            menu += `> 🎪 Intentos: ${n.i} | 🎁 Recompensa: +${n.kb} ⚡\n\n`
        }
        menu += `💡 *Uso:* \`${usedPrefix + command} 2\``
        if (s) menu += `\n\n${s.footer}`
        return await conn.sendMessage(m.chat, { text: menu, mentions: [m.sender] }, { quoted: m })
    }

    const dif = niveles[text]
    const numSecreto = Math.floor(Math.random() * (dif.r[1] - dif.r[0] + 1)) + dif.r[0]

    let gameMsg = s ? `${s.top}\n\n` : ''
    gameMsg += `🎮 *𝗦𝗘𝗦𝗜𝗢́𝗡 𝗣𝗥𝗜𝗩𝗔𝗗𝗔 𝗜𝗡𝗜𝗖𝗜𝗔𝗗𝗔 ${dif.e}*\n\n`
    gameMsg += `🧐 *He pensado un número entre ${dif.r[0]} y ${dif.r[1]}.*\n`
    gameMsg += `> 👤 Jugador: @${m.sender.split('@')[0]}\n`
    gameMsg += `> 🎪 Tienes *${dif.i}* intentos.\n\n`
    gameMsg += `🎁 *𝗣𝗥𝗘𝗠𝗜𝗢:* \n`
    gameMsg += `> ⚡ Kryons: +${dif.kb} | 🪙 Coins: +${dif.c}\n\n`
    gameMsg += `> ⏳ Tienes 1 minuto. ¡Suerte!`
    if (s) gameMsg += `\n\n${s.footer}`

    await m.react('🎯')

    let timer = setTimeout(() => {
        if (salasActivas.has(m.sender)) {
            m.reply(`> ⏰ *𝗧𝗜𝗘𝗠𝗣𝗢 𝗔𝗚𝗢𝗧𝗔𝗗𝗢*\n\n> El número secreto era: *${numSecreto}*. Inténtalo de nuevo cuando quieras.`)
            salasActivas.delete(m.sender)
        }
    }, 60000)

    salasActivas.set(m.sender, {
        secreto: numSecreto,
        intentos: dif.i,
        baseK: dif.kb,
        baseC: dif.c,
        baseD: dif.d,
        chat: m.chat,
        style: s,
        timer
    })

    return conn.reply(m.chat, gameMsg, m, { mentions: [m.sender] })
}

handler.before = async (m, { conn }) => {
    let game = salasActivas.get(m.sender)
    if (!game || m.isBaileys || !m.text) return 
    if (m.chat !== game.chat) return 
    if (!/^[0-9]+$/.test(m.text.trim())) return 

    let input = parseInt(m.text.trim())
    let user = global.db.data.users[m.sender]
    let s = game.style 

    if (input === game.secreto) {
        user.kryons = (user.kryons || 0) + game.baseK
        user.coin = (user.coin || 0) + game.baseC
        user.diamond = (user.diamond || 0) + game.baseD

        clearTimeout(game.timer)
        salasActivas.delete(m.sender)

        await m.react('✨')
        let win = s ? `${s.top}\n\n` : ''
        win += `🎊 *¡𝗜𝗡𝗖𝗥𝗘𝗜𝗕𝗟𝗘!*\n\n`
        win += `> @${m.sender.split('@')[0]}, lo has adivinado.\n`
        win += `> ✨ *Número secreto:* ${game.secreto}\n\n`
        win += `🎁 *𝗕𝗢𝗧𝗜𝗡:* \n`
        win += `> ⚡ Kryons: +${game.baseK} | 🪙 Coins: +${game.baseC}\n`
        if (game.baseD > 0) win += `> 💎 Diamantes: +${game.baseD}`
        if (s) win += `\n\n${s.footer}`

        return m.reply(win, null, { mentions: [m.sender] })
    } else {
        game.intentos--
        if (game.intentos <= 0) {
            clearTimeout(game.timer)
            salasActivas.delete(m.sender)
            await m.react('💀')
            return m.reply(`> ❌ *𝗚𝗔𝗠𝗘 𝗢𝗩𝗘𝗥*\n\n> Te quedaste sin intentos, corazón.\n> El número secreto era: *${game.secreto}*`)
        } else {
            let pista = input > game.secreto ? "MENOR" : "MAYOR"
            await m.react(input > game.secreto ? '📉' : '📈')
            return m.reply(`> ⚠️ *𝗖𝗔𝗦𝗜*\n\n> El número secreto es *${pista}* que *${input}*.\n> 🎪 Te quedan *${game.intentos}* intentos.`)
        }
    }
}

handler.help = ['adivina']
handler.tags = ['premium']
handler.command = /^(adivina|padivina)$/i
handler.group = true

export default handler