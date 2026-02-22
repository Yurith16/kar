const { saveDatabase } = require('../lib/db.js')
const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    let h = ["🍃", "🌿", "🍀", "🌱", "☘️"].getRandom()
    let nameHandle = user.registeredName || user.name || conn.getName(m.sender)

    if (await checkReg(m, user)) return

    let apuesta = parseInt(text)
    if (isNaN(apuesta) || apuesta < 100) {
        return m.reply(`> ${h} *Modo de uso:*\n> \`${usedPrefix + command} <cantidad>\`\n\n> ✨ _Mínimo: 100 Coins._`)
    }

    if (user.coin < apuesta) {
        return m.reply(`> 🥀 *Fondos insuficientes:* No tienes suficientes coins, vida mía.`)
    }

    if (apuesta > 50000) {
        return m.reply(`> ⚠️ *Límite:* La apuesta máxima permitida es de 50,000 coins.`)
    }

    const emojis = ["🍎", "🍋", "🍇", "🍒", "💎", "🎰"]

    // --- PROBABILIDAD CONFIGURADA: 30% Gana / 70% Pierde ---
    let ganar = Math.random() < 0.30 
    let matrix = [[], [], []]

    if (ganar) {
        let lineaGanadora = Math.floor(Math.random() * 3)
        let emojiGanador = emojis.getRandom()
        matrix[lineaGanadora] = [emojiGanador, emojiGanador, emojiGanador]

        for (let i = 0; i < 3; i++) {
            if (i !== lineaGanadora) {
                matrix[i] = [emojis.getRandom(), emojis.getRandom(), emojis.getRandom()]
            }
        }
    } else {
        for (let i = 0; i < 3; i++) {
            let fila = []
            for (let j = 0; j < 3; j++) {
                let emoji
                do { emoji = emojis.getRandom() } while (fila.includes(emoji))
                fila.push(emoji)
            }
            matrix[i] = fila
        }
    }

    user.coin -= apuesta
    await m.react('🎰')

    let gano = false
    let premio = 0
    let diamantes = 0

    const verificar = (a, b, c) => {
        if (a === b && b === c) {
            gano = true
            let mult = a === "🎰" ? 15 : a === "💎" ? 10 : 5
            premio += apuesta * mult
            if (a === "💎") diamantes += 5
            if (a === "🎰") diamantes += 10
        }
    }

    // Verificación de todas las líneas posibles
    for (let i = 0; i < 3; i++) verificar(matrix[i][0], matrix[i][1], matrix[i][2])
    for (let i = 0; i < 3; i++) verificar(matrix[0][i], matrix[1][i], matrix[2][i])
    verificar(matrix[0][0], matrix[1][1], matrix[2][2])
    verificar(matrix[0][2], matrix[1][1], matrix[2][0])

    let txt = `> ${h} *「 𝙺𝙰𝚁𝙱𝙾𝚃 𝚂𝙻𝙾𝚃𝚂 」* ${h}\n\n`
    txt += `     ${matrix[0][0]}  ${matrix[0][1]}  ${matrix[0][2]}\n`
    txt += `     ${matrix[1][0]}  ${matrix[1][1]}  ${matrix[1][2]}\n`
    txt += `     ${matrix[2][0]}  ${matrix[2][1]}  ${matrix[2][2]}\n\n`

    if (gano) {
        user.coin += premio
        user.diamond = (user.diamond || 0) + diamantes
        await m.react('🎉')
        txt += `> ✨ *¡FELICIDADES, ${nameHandle.toUpperCase()}!* ✨\n`
        txt += `> 🪙 *Ganancia:* » +${premio.toLocaleString()} Coins\n`
        if (diamantes > 0) txt += `> 💎 *Bono:* » +${diamantes} Diamantes\n\n`
        txt += `> _Tu suerte es tan brillante como tú._`
    } else {
        await m.react('❌')
        txt += `> 🥀 *RESULTADO:* » Derrota\n`
        txt += `> 💔 *Pérdida:* » -${apuesta.toLocaleString()} Coins\n\n`
        txt += `> _No te preocupes, el éxito requiere persistencia._`
    }

    await m.reply(txt)
    await saveDatabase()
}

handler.help = ['slots']
handler.tags = ['game']
handler.command = /^(slots|slot|tragamonedas)$/i
handler.register = true

module.exports = handler