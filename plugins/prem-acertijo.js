const { saveDatabase } = require('../lib/db.js')
const { checkReg } = require('../lib/checkReg.js')

const salasAcertijo = new Map()
const cooldowns = new Map()

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
    { q: "Blanco por dentro, verde por fuera. Si quieres que te lo diga, espera.", a: ["La manzana", "La pera", "La uva", "El limón"], c: 1 },
    { q: "Tengo agujeros, pero aun así puedo retener agua. ¿Qué soy?", a: ["Una red", "Una esponja", "Un colador", "Una nube"], c: 1 },
    { q: "Viajo por todo el mundo, pero siempre me quedo en una esquina. ¿Qué soy?", a: ["Un sello", "Un avión", "Un pensamiento", "Un mapa"], c: 0 },
    { q: "Tengo cuello pero no cabeza, y uso tapón pero no boca. ¿Qué soy?", a: ["Un zapato", "Una botella", "Un frasco", "Una lámpara"], c: 1 },
    { q: "Entro seca y salgo mojada, y cuanto más tiempo paso dentro, más fuerte me vuelvo. ¿Qué soy?", a: ["Una esponja", "Una galleta", "Una bolsa de té", "Una lengua"], c: 2 },
    { q: "Me puedes ver en el agua, pero nunca me mojo. ¿Qué soy?", a: ["Un pez", "Tu reflejo", "Una burbuja", "La luna"], c: 1 },
    { q: "Tengo dientes pero nunca muerdo. ¿Qué soy?", a: ["Un peine", "Una sierra", "Un piano", "Un tiburón"], c: 0 },
    { q: "Cuanto más fuerte es, más asusta, pero no tiene manos ni boca. ¿Qué es?", a: ["El trueno", "El viento", "La oscuridad", "Un fantasma"], c: 0 },
    { q: "Aparezco una vez en un minuto, dos veces en un momento, pero nunca en cien años. ¿Qué soy?", a: ["El tiempo", "La letra M", "Un segundo", "La casualidad"], c: 1 },
    { q: "Si lo tiras al aire se rompe, pero si lo tiras al suelo no. ¿Qué es?", a: ["Un huevo", "Un suspiro", "El agua", "Una burbuja"], c: 2 },
    { q: "Tengo teclas pero no piano, tengo ratón pero no animal. ¿Qué soy?", a: ["Una oficina", "Una computadora", "Un videojuego", "Una televisión"], c: 1 },
    { q: "Parezco de cristal, pero si me tocas, me deshago en tus manos. ¿Qué soy?", a: ["Un diamante", "El hielo", "Un copo de nieve", "Un cristal"], c: 2 },
    { q: "Corro pero no tengo pies, y si me detengo, muero. ¿Qué soy?", a: ["El tiempo", "El agua", "El viento", "La sangre"], c: 1 },
    { q: "Te doy mi luz en la noche, pero si me tocas, te quemo. ¿Qué soy?", a: ["El sol", "Una vela", "Una estrella", "Una bombilla"], c: 1 },
    { q: "Soy redondo como el queso, pero nadie puede darme un beso. ¿Qué soy?", a: ["La luna", "Un plato", "El sol", "Un reloj"], c: 0 },
    { q: "Vuelo sin alas, silbo sin boca y pego sin manos. ¿Qué soy?", a: ["Un pájaro", "El viento", "Un fantasma", "El trueno"], c: 1 },
    { q: "Tengo costillas pero no pulmones, y guardo secretos en mis renglones. ¿Qué soy?", a: ["Un esqueleto", "Un libro", "Un cuaderno", "Un baúl"], c: 1 },
    { q: "Cuanto más quitas, más grande se vuelve. ¿Qué es?", a: ["Un agujero", "La comida", "Un árbol", "Una deuda"], c: 0 },
    { q: "Estoy en todo el mundo, pero nadie me ha visto jamás. ¿Qué soy?", a: ["El aire", "El futuro", "El alma", "El viento"], c: 3 },
    { q: "Tengo hojas pero no soy árbol, tengo lomo pero no soy animal. ¿Qué soy?", a: ["Un bosque", "Un libro", "Una montaña", "Un sofá"], c: 1 },
    { q: "Me compran para comer, pero nunca me comen. ¿Qué soy?", a: ["La fruta", "Los cubiertos", "El plato", "La mesa"], c: 2 }
];

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    let id = m.sender
    
    if (await checkReg(m, user)) return

    // --- SISTEMA DE COOLDOWN ---
    let time = cooldowns.get(id) || 0
    if (Date.now() - time < 30000) {
        let wait = Math.ceil((30000 - (Date.now() - time)) / 1000)
        return m.reply(`> ⏳ *ESPERA:* No vayas tan rápido, cielo. Debes esperar **${wait}s** para otro acertijo.`)
    }

    if (salasAcertijo.has(id)) return m.reply(`> 🎀 *Aviso:* Ya tienes un acertijo activo. ¡Responde con el número!`)

    const item = acertijos[Math.floor(Math.random() * acertijos.length)]

    salasAcertijo.set(id, {
        correct: item.c + 1,
        text: item.a[item.c],
        chat: m.chat
    })

    await m.react('🧠')
    let caption = `🧩 *𝗗𝗘𝗦𝗔𝗙𝗜𝗢 𝗗𝗘 𝗜𝗡𝗧𝗘𝗟𝗘𝗖𝗧𝗢*\n\n`
    caption += `🤔 *𝗣𝗥𝗘𝗚𝗨𝗡𝗧𝗔:* \n`
    caption += `> ${item.q}\n\n`

    item.a.forEach((op, i) => {
        caption += `${i + 1}️⃣ ${op}\n`
    })

    caption += `\n> 🔥 *Racha:* ${user.racha || 0}\n`
    caption += `> ⚠️ Solo tienes **1 oportunidad**.\n`
    caption += `> _Responde solo con el número de la opción._`

    return conn.reply(m.chat, caption, m)
}

handler.before = async (m, { conn }) => {
    let id = m.sender
    let game = salasAcertijo.get(id)
    if (!game || m.isBaileys || !m.text) return 
    if (m.chat !== game.chat) return 

    if (!/^[1-4]$/.test(m.text.trim())) return 

    let input = parseInt(m.text.trim())
    let user = global.db.data.users[id]

    if (input === game.correct) {
        let ganCoins = Math.floor(Math.random() * (2200 - 1500 + 1)) + 1500 
        let ganDiamonds = Math.random() > 0.7 ? 2 : 1

        user.coin = (user.coin || 0) + ganCoins
        user.diamond = (user.diamond || 0) + ganDiamonds
        user.racha = (user.racha || 0) + 1

        let bonus = ""
        if (user.racha % 5 === 0) {
            user.hotpass = (user.hotpass || 0) + 1
            bonus = `\n🔥 *BONUS RACHA:* +1 🎫 HotPass`
        }

        salasAcertijo.delete(id)
        cooldowns.set(id, Date.now())
        await m.react('🎉')

        let win = `✨ *¡MENTE BRILLANTE!*\n\n`
        win += `> 🎯 *Respuesta:* ${game.text}\n`
        win += `> *Ganancia:* ${ganCoins.toLocaleString()} 🪙 y ${ganDiamonds} 💎\n`
        win += `> *Racha:* ${user.racha} 🔥${bonus}`

        await m.reply(win)
        await saveDatabase()
    } else {
        user.racha = 0
        salasAcertijo.delete(id)
        cooldowns.set(id, Date.now())
        await m.react('❌')
        return m.reply(`> 🚫 *𝗜𝗡𝗖𝗢𝗥𝗥𝗘𝗖𝗧𝗢*\n\n> La respuesta era: **${game.text}**\n> Tu racha 🔥 se ha extinguido, corazón. _Qué drama, me duele hasta a mí._`)
    }
    return true
}

handler.help = ['acertijo']
handler.tags = ['game']
handler.command = /^(acertijo|puzzle|adivinanza)$/i

module.exports = handler