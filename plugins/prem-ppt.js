import { premiumStyles } from '../lib/styles.js'

const opciones = {
    'piedra': { emoji: '🪨', vence: 'tijera' },
    'papel': { emoji: '📄', vence: 'piedra' },
    'tijera': { emoji: '✂️', vence: 'papel' }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    if (!user.premium) return m.reply("> 💎 *ACCESO PREMIUM*\n\n> Solo mis usuarios Élite pueden jugar conmigo, cielo.")

    let input = text.trim().toLowerCase()
    let s = premiumStyles[user.prefStyle] || (user.premium ? premiumStyles["luxury"] : null)

    if (!input || !opciones[input]) {
        return m.reply(`🎮 *DUELO CON KARBOT*\n\n> ¿Qué vas a elegir hoy? *Piedra, papel o tijera*.\n> Ejemplo: \`${usedPrefix + command} papel\``)
    }

    const botMove = Object.keys(opciones)[Math.floor(Math.random() * 3)]
    let res = input === botMove ? 'tie' : (opciones[input].vence === botMove ? 'win' : 'lose')

    // Valores variables para toque humano
    let ganK = Math.floor(Math.random() * 10) + 10 // 10-20
    let ganC = Math.floor(Math.random() * 500) + 400 // 400-900
    let ganE = Math.floor(Math.random() * 200) + 300 // 300-500
    let expLost = Math.floor(Math.random() * 100) + 150 // 150-250

    let txt = s ? `${s.top}\n\n` : ''
    txt += `🕹️ *Duelo:* ${input.toUpperCase()} vs ${botMove.toUpperCase()}\n`
    txt += `> ${opciones[input].emoji} (Tú) - ${opciones[botMove].emoji} (KarBot)\n\n`

    if (res === 'tie') {
        user.kryons += 5; user.coin += 150
        txt += `🤝 *¡Empate!* Casi me lees la mente, @${m.sender.split('@')[0]}. Toma algo por el esfuerzo.\n`
        txt += `> 🎁 +5 Kryons | +150 Coins`
        await m.react('🤝')
    } else if (res === 'win') {
        user.kryons += ganK; user.coin += ganC; user.diamond += 1; user.exp += ganE
        txt += `🎉 *¡Increíble!* Me has ganado esta vez... aquí tienes tus **${ganC}** coins y **${ganE}** de exp por tu astucia. ✨\n\n`
        txt += `🎁 *BOTÍN GANADO:* \n`
        txt += `> ⚡ +${ganK} Kryons | 💎 +1 Diamante\n`
        txt += `> 🪙 +${ganC} Coins | ✨ +${ganE} EXP`
        await m.react('✨')
    } else {
        user.exp = Math.max(0, (user.exp || 0) - expLost)
        txt += `💀 *¡AJAJAJ TE GANÉ!* Lo siento, corazón, pero te he robado **${expLost}** de tu exp por confiarte demasiado. 💋\n`
        txt += `> 📉 Penalización: -${expLost} EXP`
        await m.react('❌')
    }

    if (s) txt += `\n\n${s.footer}`
    return conn.sendMessage(m.chat, { text: txt, mentions: [m.sender] }, { quoted: m })
}

handler.help = ['ppt']
handler.tags = ['premium']
handler.command = /^(ppt|juego)$/i
handler.group = true

export default handler