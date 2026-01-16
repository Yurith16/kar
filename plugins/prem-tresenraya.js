import { premiumStyles } from '../lib/styles.js'

function toBoldMono(text) {
    const mapping = {
        A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", 
        N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
        a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺", 
        n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
        0: "𝟬", 1: "𝟭", 2: "𝟮", 3: "𝟯", 4: "𝟰", 5: "𝟱", 6: "𝟲", 7: "𝟳", 8: "𝟴", 9: "𝟵"
    }
    return text.split('').map(char => mapping[char] || char).join('')
}

const emojis = {
    X: '❌',
    O: '⭕',
    numbers: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣']
}

// Recompensas Considerables para Duelos Elite
const recompensas = {
    victoria: { kryons: 15, coin: 800, diamond: 2, exp: 500 },
    empate: { kryons: 5, coin: 300, diamond: 0, exp: 150 }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.ttt = conn.ttt ? conn.ttt : {}
    let user = global.db.data.users[m.sender]
    let input = (text || '').trim().toLowerCase()

    // 1. ACEPTAR DESAFÍO
    if (input === 'aceptar') {
        let room = Object.values(conn.ttt).find(r => r.o === m.sender && r.state === 'WAITING')
        if (!room) return m.reply(`> ❌ No tienes desafíos pendientes por aceptar.`)

        room.state = 'PLAYING'
        room.board = Array(9).fill('')
        room.turn = 'X' // X siempre inicia (el retador)
        clearTimeout(room.timeout)

        return renderBoard(conn, m.chat, room)
    }

    // 2. CREAR DESAFÍO
    if (!user.premium) return m.reply(`> 💎 *ACCESO PREMIUM*\n\n> Solo usuarios **Élite** pueden iniciar duelos de Tres en Raya.`)

    if (!input || isNaN(input.replace(/[^0-9]/g, ''))) {
        return m.reply(`🎯 ${toBoldMono('Menciona o escribe el ID del oponente.')}\n> ${toBoldMono('Ejemplo:')} ${usedPrefix + command} 504xxxxxx`)
    }

    let who = input.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    if (!(who in global.db.data.users)) return m.reply(`> ❌ El oponente no está registrado en la base de datos.`)
    if (who === m.sender) return m.reply(`> ❌ No puedes jugar contra ti mismo, busca un rival digno.`)

    // Verificar si alguno ya está en una partida en este chat
    if (conn.ttt[m.chat]) return m.reply(`> ⏳ Ya hay una partida activa en este chat. Espera a que termine.`)

    let s = premiumStyles[user.prefStyle] || premiumStyles["luxury"]

    // Crear sala con IDs vinculados
    conn.ttt[m.chat] = {
        id: m.chat,
        x: m.sender, // Retador
        o: who,      // Invitado
        state: 'WAITING',
        style: s,
        timeout: setTimeout(() => {
            if (conn.ttt[m.chat]?.state === 'WAITING') {
                delete conn.ttt[m.chat]
                conn.sendMessage(m.chat, { text: `> ⏰ ${toBoldMono('EL DESAFIO DE')} @${m.sender.split('@')[0]} ${toBoldMono('HA EXPIRADO POR FALTA DE RESPUESTA')}`, mentions: [m.sender] })
            }
        }, 60000)
    }

    let setupMsg = s ? `${s.top}\n\n` : ''
    setupMsg += `⚔️ ${toBoldMono('DUELO ELITE SOLICITADO')}\n\n`
    setupMsg += `> 👤 ${toBoldMono('Retador:')} @${m.sender.split('@')[0]}\n`
    setupMsg += `> 👤 ${toBoldMono('Oponente:')} @${who.split('@')[0]}\n\n`
    setupMsg += `📝 ${toBoldMono('Para aceptar usa:')}\n> *${usedPrefix + command} aceptar*\n\n`
    setupMsg += `_El desafío expirará en 60 segundos._`
    if (s) setupMsg += `\n\n${s.footer}`

    return await conn.sendMessage(m.chat, { text: setupMsg, mentions: [m.sender, who] }, { quoted: m })
}

handler.before = async (m, { conn }) => {
    let id = m.chat
    if (!conn.ttt || !conn.ttt[id] || conn.ttt[id].state !== 'PLAYING') return 
    if (m.text.startsWith('.') || !/^[1-9]$/.test(m.text)) return 

    let room = conn.ttt[id]
    let move = parseInt(m.text.trim())

    // Validar que el mensaje sea de uno de los dos jugadores
    let isX = m.sender === room.x
    let isO = m.sender === room.o
    if (!isX && !isO) return 

    // Validar turno
    if ((room.turn === 'X' && !isX) || (room.turn === 'O' && !isO)) return 

    let index = move - 1
    if (room.board[index] !== '') return m.reply(`> ❌ Esa casilla ya está ocupada. Elige otro número.`)

    room.board[index] = room.turn
    let win = checkWinner(room.board)
    let tie = room.board.every(c => c !== '')

    if (win) {
        await finishGame(conn, id, room, win === 'X' ? room.x : room.o)
    } else if (tie) {
        await finishGame(conn, id, room, 'tie')
    } else {
        room.turn = room.turn === 'X' ? 'O' : 'X'
        await renderBoard(conn, id, room)
    }
    return true
}

async function renderBoard(conn, jid, room) {
    let boardTxt = room.board.map((v, i) => v === '' ? emojis.numbers[i] : (v === 'X' ? emojis.X : emojis.O))
    let s = room.style
    let txt = s ? `${s.top}\n\n` : ''
    txt += `     ${boardTxt[0]} ${boardTxt[1]} ${boardTxt[2]}\n`
    txt += `     ${boardTxt[3]} ${boardTxt[4]} ${boardTxt[5]}\n`
    txt += `     ${boardTxt[6]} ${boardTxt[7]} ${boardTxt[8]}\n\n`
    txt += `> 💠 ${toBoldMono('Turno actual:')} ${room.turn === 'X' ? '❌' : '⭕'}\n`
    txt += `> 👤 @${(room.turn === 'X' ? room.x : room.o).split('@')[0]}`
    if (s) txt += `\n\n${s.footer}`

    return await conn.sendMessage(jid, { text: txt, mentions: [room.x, room.o] })
}

function checkWinner(b) {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
    for (let [a, i, c] of lines) {
        if (b[a] && b[a] === b[i] && b[a] === b[c]) return b[a]
    }
    return null
}

async function finishGame(conn, jid, room, res) {
    let { x, o, style } = room
    delete conn.ttt[jid]
    let finalMsg = style ? `${style.top}\n\n` : ''

    if (res === 'tie') {
        finalMsg += `🤝 ${toBoldMono('¡EMPATE TECNICO!')}\n\n`
        finalMsg += `> Ambos jugadores han demostrado el mismo nivel.\n\n`
        finalMsg += `🎁 *RECOMPENSAS DE CONSOLACIÓN:*\n`
        finalMsg += `> ⚡ +${recompensas.empate.kryons} Kryons | ✨ +${recompensas.empate.exp} EXP\n`
        finalMsg += `> 🪙 +${recompensas.empate.coin} Coins`
        updateUser(x, recompensas.empate); updateUser(o, recompensas.empate)
    } else {
        let winnerName = global.db.data.users[res]?.name || res.split('@')[0]
        finalMsg += `🎉 ${toBoldMono('¡VICTORIA MAGISTRAL!')}\n\n`
        finalMsg += `> 🏆 ${toBoldMono('GANADOR:')} ${toBoldMono(winnerName.toUpperCase())}\n\n`
        finalMsg += `🎁 *PREMIOS DE ÉLITE:*\n`
        finalMsg += `> ⚡ +${recompensas.victoria.kryons} Kryons | 💎 +${recompensas.victoria.diamond} Diamantes\n`
        finalMsg += `> 🪙 +${recompensas.victoria.coin} Coins | ✨ +${recompensas.victoria.exp} EXP`
        updateUser(res, recompensas.victoria)
    }

    if (style) finalMsg += `\n\n${style.footer}`
    await conn.sendMessage(jid, { text: finalMsg, mentions: [x, o] })
}

function updateUser(jid, rec) {
    let u = global.db.data.users[jid]
    if (u) {
        u.kryons = (u.kryons || 0) + (rec.kryons || 0)
        u.coin = (u.coin || 0) + (rec.coin || 0)
        u.diamond = (u.diamond || 0) + (rec.diamond || 0)
        u.exp = (u.exp || 0) + (rec.exp || 0)
    }
}

handler.help = ['ttt']
handler.tags = ['premium']
handler.command = ['ttt', 'tresenraya']
handler.group = true

export default handler