const palabras = ["gato", "perro", "pájaro", "elefante", "tigre", "ballena", "mariposa", "tortuga", "conejo", "rana", "pulpo", "ardilla", "jirafa", "cocodrilo", "pingüino", "delfín", "serpiente", "hámster", "mosquito", "abeja", "television", "computadora", "botsito", "reggaeton", "economía", "electrónica", "facebook", "whatsapp", "instagram", "tiktok", "milanesa", "presidente", "bot", "películas"]

const intentosMaximos = 6
const salasActivas = new Map()
const LIMITE_SALAS = 3 

const ahorcadoDrawings = [
    `┌───┐\n│   💀\n│  /|\\\\\n│  / \\\\\n│\n─┴─`, // 0
    `┌───┐\n│   😵\n│  /|\\\\\n│  / \n│\n─┴─`,  // 1
    `┌───┐\n│   😟\n│  /|\\\\\n│  \n│\n─┴─`,   // 2
    `┌───┐\n│   😐\n│  /|\n│  \n│\n─┴─`,    // 3
    `┌───┐\n│   🙂\n│   |\n│  \n│\n─┴─`,    // 4
    `┌───┐\n│   😊\n│  \n│  \n│\n─┴─`,     // 5
    `┌───┐\n│   😎\n│  \n│  \n│\n─┴─`      // 6
];

function ocultarPalabra(palabra, letrasAdivinadas) {
    return palabra.split('').map(letra => letrasAdivinadas.includes(letra) ? letra : "_").join(" ")
}

let handler = async (m, { conn, usedPrefix }) => {
    if (salasActivas.has(m.sender)) return m.reply("> ⚠️ Ya tienes una partida en curso, corazón.")

    if (salasActivas.size >= LIMITE_SALAS) {
        return m.reply(`> 🏨 Las salas están llenas ahora mismo. Intenta en un momento.`)
    }

    let palabra = palabras[Math.floor(Math.random() * palabras.length)].toLowerCase()
    let letrasAdivinadas = []
    let intentos = intentosMaximos
    let oculto = ocultarPalabra(palabra, letrasAdivinadas)

    salasActivas.set(m.sender, { palabra, letrasAdivinadas, intentos, chat: m.chat })

    let txt = `> 🎮 *𝗔𝗛𝗢𝗥𝗖𝗔𝗗𝗢*\n`
    txt += `> 👤 @${m.sender.split('@')[0]}\n`
    txt += `— — — — — — — — — — — —\n\n`
    txt += `\`\`\`${ahorcadoDrawings[intentos]}\`\`\`\n\n`
    txt += `\`${oculto}\`\n\n`
    txt += `> ⏳ Tienes *${intentos}* intentos.\n`
    txt += `> Envía una letra para adivinar.`

    await m.react('🕹️')
    conn.reply(m.chat, txt, m, { mentions: [m.sender] })
}

handler.before = async (m) => {
    let juego = salasActivas.get(m.sender)
    if (!juego || m.isBaileys || !m.text) return 
    if (m.chat !== juego.chat) return 

    let texto = m.text.toLowerCase().trim()

    // Validar que sea solo una letra y no un comando
    if (texto.length !== 1 || !/[a-zñ]/.test(texto)) return
    if (m.text.startsWith('.') || m.text.startsWith('/') || m.text.startsWith('#')) return

    let { palabra, letrasAdivinadas, intentos } = juego
    if (letrasAdivinadas.includes(texto)) return 

    letrasAdivinadas.push(texto)

    if (!palabra.includes(texto)) {
        intentos--
        juego.intentos = intentos
    }

    let nuevoOculto = ocultarPalabra(palabra, letrasAdivinadas)

    if (!nuevoOculto.includes("_")) {
        let coins = palabra.length > 8 ? 1000 : 200
        global.db.data.users[m.sender].coin += coins
        salasActivas.delete(m.sender)
        return m.reply(`> 🎉 *¡Ganaste!* @${m.sender.split('@')[0]}\n\n> 📝 Palabra: *${palabra.toUpperCase()}*\n> 💰 Premio: *${coins} Coins*`, null, { mentions: [m.sender] })
    }

    if (intentos <= 0) {
        salasActivas.delete(m.sender)
        return m.reply(`> 💀 *¡Perdiste!* @${m.sender.split('@')[0]}\n\n\`\`\`${ahorcadoDrawings[0]}\`\`\`\n\n> La palabra era: *${palabra.toUpperCase()}*`, null, { mentions: [m.sender] })
    }

    let status = `> 👤 @${m.sender.split('@')[0]}\n`
    status += `\`\`\`${ahorcadoDrawings[intentos]}\`\`\`\n`
    status += `\`${nuevoOculto}\`\n\n`
    status += `> ⏳ Intentos: *${intentos}* | Letras: [${letrasAdivinadas.join(', ')}]`

    m.reply(status, null, { mentions: [m.sender] })
    return true
}

handler.help = ['ahorcado']
handler.tags = ['game']
handler.command = /^(ahorcado)$/i
handler.group = true

export default handler