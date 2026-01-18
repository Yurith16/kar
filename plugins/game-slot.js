import { saveDatabase } from '../lib/db.js'
import { checkReg } from '../lib/checkReg.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    
    if (await checkReg(m, user)) return

    let apuesta = parseInt(text)
    if (isNaN(apuesta) || apuesta < 100) {
        return m.reply(`> 🎀 *Uso correcto:*\n> \`${usedPrefix + command} <cantidad>\`\n\n_Mínimo: 100 Coins._`)
    }

    if (user.coin < apuesta) {
        return m.reply(`> 🥀 *Pobreza:* No tienes suficientes coins, corazón.`)
    }

    if (apuesta > 50000) {
        return m.reply(`> ⚠️ *Límite:* La apuesta máxima es de 50,000 coins.`)
    }

    // Emojis de la suerte
    const emojis = ["🍎", "🍋", "🍇", "🍒", "💎", "🎰"];
    
    // --- SISTEMA DE PROBABILIDAD (30% Win Rate) ---
    let ganar = Math.random() < 0.30 
    let a, b, c;

    if (ganar) {
        // Generar una combinación ganadora (2 o 3 iguales)
        a = emojis[Math.floor(Math.random() * emojis.length)]
        let triple = Math.random() < 0.15 // Solo 15% de las victorias son Jackpots
        if (triple) {
            b = a
            c = a
        } else {
            b = a
            // El tercero es diferente para que sea "par"
            do { c = emojis[Math.floor(Math.random() * emojis.length)] } while (c === a)
        }
    } else {
        // Forzar pérdida (todos diferentes)
        a = emojis[Math.floor(Math.random() * emojis.length)]
        do { b = emojis[Math.floor(Math.random() * emojis.length)] } while (b === a)
        do { c = emojis[Math.floor(Math.random() * emojis.length)] } while (c === a || c === b)
    }

    user.coin -= apuesta
    await m.react('🎰')

    let spinning = `🎰 *GIRO DE FORTUNA* 🎰\n\n`
    spinning += `> 🎰 | ${a} | ${b} | ${c} | 🎰\n\n`
    
    let win = (a === b || b === c || a === c)
    let reward = 0
    let diamondBonus = 0

    if (win) {
        if (a === b && b === c) {
            // JACKPOT
            if (a === "💎") { reward = apuesta * 10; diamondBonus = 5 }
            else if (a === "🎰") { reward = apuesta * 15; diamondBonus = 10 }
            else { reward = apuesta * 5 }
        } else {
            // PAR
            reward = Math.floor(apuesta * 1.5)
        }

        user.coin += reward
        user.diamond = (user.diamond || 0) + diamondBonus
        await m.react('🎉')
        
        spinning += `✨ *¡GANASTE!* ✨\n`
        spinning += `> *Premio:* +${reward.toLocaleString()} Coins 🪙\n`
        if (diamondBonus > 0) spinning += `> *Bono:* +${diamondBonus} 💎\n`
    } else {
        await m.react('❌')
        spinning += `🥀 *PERDISTE...*\n`
        spinning += `> *- ${apuesta.toLocaleString()} Coins*\n\n`
        spinning += `_Suerte para la próxima, amor._`
    }

    await m.reply(spinning)
    await saveDatabase()
}

handler.help = ['slots']
handler.tags = ['game']
handler.command = /^(slots|slot|tragamonedas)$/i
handler.register = true

export default handler