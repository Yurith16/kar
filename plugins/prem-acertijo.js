import { premiumStyles } from '../lib/styles.js'

const salasAcertijo = new Map()

const acertijos = [
    { q: "Se rompe si me nombras, pero existo en la ausencia de sonido. ¿Qué soy?", a: ["El eco", "El silencio", "Un secreto", "El cristal"], c: 1 },
    { q: "Tengo ciudades pero no casas, montañas pero no árboles y agua pero no peces. ¿Qué soy?", a: ["Un mapa", "Un globo", "Un sueño", "Una pintura"], c: 0 },
    { q: "Un hombre sale bajo la lluvia sin paraguas ni sombrero y no se moja el pelo. ¿Cómo?", a: ["Llevaba traje", "Es calvo", "La lluvia era poca", "Estaba bajo techo"], c: 1 },
    { q: "Vuelo sin alas, lloro sin ojos. Allá donde voy, la oscuridad me sigue. ¿Qué soy?", a: ["El viento", "La noche", "Una nube", "El humo"], c: 2 },
    { q: "Cuanto más hay, menos ves. ¿Qué es?", a: ["La niebla", "La oscuridad", "La luz", "El humo"], c: 1 },
    { q: "Lo alimentas y vive, le das agua y muere. ¿Qué es?", a: ["Un árbol", "El fuego", "La sed", "Un motor"], c: 1 },
    { q: "Si me tienes, quieres compartirme. Si me compartes, ya no me tienes. ¿Qué soy?", a: ["Un secreto", "Un tesoro", "El amor", "Un chisme"], c: 0 },
    { q: "Soy alto cuando soy joven y bajo cuando soy viejo. Brillo con la vida. ¿Qué soy?", a: ["Un árbol", "Una vela", "Una montaña", "Un cigarro"], c: 1 },
    { q: "Pobres lo tienen, ricos lo necesitan y si lo comes, mueres. ¿Qué es?", a: ["Veneno", "Nada", "Dinero", "Piedras"], c: 1 },
    { q: "Qué es lo que pertenece a ti, pero los demás lo usan más que tú?", a: ["Tu dinero", "Tu nombre", "Tu casa", "Tu celular"], c: 1 },
    { q: "Se puede atrapar pero nunca lanzar. ¿Qué es?", a: ["Un resfriado", "Una sombra", "El viento", "Un sueño"], c: 0 },
    { q: "Tiene un solo ojo pero no puede ver nada. ¿Qué es?", a: ["Un huracán", "Una aguja", "Una papa", "Un cíclope"], c: 1 },
    { q: "Qué es lo que sube pero nunca baja?", a: ["La edad", "El humo", "Un globo", "La marea"], c: 0 },
    { q: "Cuanto más fuerte gritas, más débil me vuelvo. ¿Qué soy?", a: ["El eco", "El silencio", "La voz", "La garganta"], c: 1 },
    { q: "Tengo cien pies pero no puedo andar. ¿Qué soy?", a: ["Un metro", "Un zapatero", "Un ciempiés", "Un peine"], c: 3 },
    { q: "Siempre está delante de ti pero no puedes verlo. ¿Qué es?", a: ["El futuro", "El aire", "El sol", "El pasado"], c: 0 },
    { q: "Qué tiene muchas palabras pero nunca habla?", a: ["Un libro", "Un loro", "Un eco", "Un mimo"], c: 0 },
    { q: "Vuelo de noche, duermo de día y nunca verás plumas en el ala mía.", a: ["Un búho", "Un murciélago", "Un avión", "Una nube"], c: 1 },
    { q: "Qué tiene un corazón que no late?", a: ["Una estatua", "Una alcachofa", "Un árbol", "Una piedra"], c: 1 },
    { q: "Blanco por dentro, verde por fuera. Si quieres que te lo diga, espera.", a: ["La manzana", "La pera", "La uva", "El limón"], c: 1 }
];

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    if (!user.premium) return m.reply(`> 💎 *ACCESO EXCLUSIVO*\n\n> Este desafío de intelecto es solo para miembros **Premium**.`)

    if (salasAcertijo.has(m.sender)) return m.reply(`> ⚠️ Ya tienes un acertijo activo. ¡Resuélvelo antes de pedir otro!`)

    const item = acertijos[Math.floor(Math.random() * acertijos.length)]
    let s = premiumStyles[user.prefStyle] || (user.premium ? premiumStyles["luxury"] : null)

    let timer = setTimeout(() => {
        if (salasAcertijo.has(m.sender)) {
            m.reply(`> ⏰ *𝗧𝗜𝗘𝗠𝗣𝗢 𝗔𝗚𝗢𝗧𝗔𝗗𝗢*\n\n> La respuesta correcta era: **${item.a[item.c]}**.`)
            salasAcertijo.delete(m.sender)
        }
    }, 45000)

    salasAcertijo.set(m.sender, {
        correct: item.c + 1,
        text: item.a[item.c],
        chat: m.chat,
        timer
    })

    let caption = s ? `${s.top}\n\n` : ''
    caption += `🧩 *𝗗𝗘𝗦𝗔𝗙𝗜𝗢 𝗘𝗟𝗜𝗧𝗘*\n`
    caption += `_Demuestra tu intelecto premium, @${m.sender.split('@')[0]}._\n\n`
    caption += `🤔 *𝗣𝗥𝗘𝗚𝗨𝗡𝗧𝗔:* \n`
    caption += `> ${item.q}\n\n`

    item.a.forEach((op, i) => {
        caption += `${i + 1}️⃣ ${op}\n`
    })

    caption += `\n> ⏳ Tienes **45s** para responder con el número.\n`
    caption += `> ⚠️ Solo tienes **1 oportunidad**.`
    if (s) caption += `\n\n${s.footer}`

    await m.react('🧠')
    return conn.reply(m.chat, caption, m, { mentions: [m.sender] })
}

handler.before = async (m) => {
    let game = salasAcertijo.get(m.sender)
    if (!game || m.isBaileys || !m.text) return 
    if (m.chat !== game.chat) return 

    if (!/^[1-4]$/.test(m.text.trim())) return 

    let input = parseInt(m.text.trim())
    let user = global.db.data.users[m.sender]

    if (input === game.correct) {
        let ganKryons = Math.floor(Math.random() * 3) + 2    
        let ganCoins = Math.floor(Math.random() * 200) + 150 
        let ganDiamonds = 1  

        user.kryons = (user.kryons || 0) + ganKryons
        user.coin = (user.coin || 0) + ganCoins
        user.diamond = (user.diamond || 0) + ganDiamonds

        clearTimeout(game.timer)
        salasAcertijo.delete(m.sender)

        await m.react('✨')
        let win = `> ✅ *¡𝗘𝗫𝗖𝗘𝗟𝗘𝗡𝗧𝗘!*\n\n`
        win += `> Has demostrado una gran agilidad mental.\n`
        win += `> 🎯 *Respuesta:* ${game.text}\n\n`
        win += `🎁 *𝗕𝗢𝗧𝗜𝗡 𝗣𝗥𝗘𝗠𝗜𝗨𝗠:* \n`
        win += `> ⚡ Kryons: +${ganKryons}\n`
        win += `> 🪙 Coins: +${ganCoins}\n`
        win += `> 💎 Diamantes: +${ganDiamonds}`

        return m.reply(win, null, { mentions: [m.sender] })
    } else {
        clearTimeout(game.timer)
        salasAcertijo.delete(m.sender)
        await m.react('❌')
        return m.reply(`> 🚫 *𝗜𝗡𝗖𝗢𝗥𝗥𝗘𝗖𝗧𝗢*\n\n> Esa no era la respuesta, corazón. La correcta era: **${game.text}**\n> Has perdido tu oportunidad.`)
    }
}

handler.help = ['acertijo']
handler.tags = ['premium']
handler.command = ['acertijo', 'pacertijo']

export default handler