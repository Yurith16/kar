let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    let cooldown = 600000 // 10 minutos

    await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } })

    if (new Date() - (user.lastwork || 0) < cooldown) {
        let timeLeft = msToTime((user.lastwork + cooldown) - new Date())
        await conn.sendMessage(m.chat, { react: { text: '☕', key: m.key } })
        return m.reply(`> *Oye, no te sobreesfuerces. Tómate un café y descansa, podrás volver a trabajar en ${timeLeft}.*`)
    }

    // 20 Trabajos creativos con su emoji y reacción
    const trabajos = [
        { t: "Desarrollador de IA", p: 120, r: "💻" },
        { t: "Cazador de recompensas galáctico", p: 150, r: "🌌" },
        { t: "Chef en un restaurante de lujo", p: 95, r: "🍳" },
        { t: "Entrenador de dragones", p: 180, r: "🐲" },
        { t: "Probador de videojuegos", p: 80, r: "🎮" },
        { t: "Alquimista estatal", p: 130, r: "🧪" },
        { t: "Jardinero de flores mágicas", p: 70, r: "🌻" },
        { t: "Piloto de carreras clandestinas", p: 140, r: "🏎️" },
        { t: "Escritor de novelas ligeras", p: 85, r: "📚" },
        { t: "Detective privado", p: 110, r: "🔍" },
        { t: "Diseñador de naves espaciales", p: 160, r: "🚀" },
        { t: "Músico callejero talentoso", p: 60, r: "🎸" },
        { t: "Guardia de un castillo antiguo", p: 90, r: "🏰" },
        { t: "Minero de cristales energéticos", p: 105, r: "⛏️" },
        { t: "Barman en un club cyberpunk", p: 100, r: "🍸" },
        { t: "Fotógrafo de vida silvestre", p: 75, r: "📸" },
        { t: "Explorador de mazmorras", p: 170, r: "⚔️" },
        { t: "Vendedor de pociones", p: 95, r: "🏺" },
        { t: "Astronauta de reconocimiento", p: 190, r: "👨‍🚀" },
        { t: "Pescador de perlas", p: 85, r: "🐚" }
    ]

    let job = trabajos[Math.floor(Math.random() * trabajos.length)]
    let gain = Math.floor(Math.random() * 40) + job.p // Variación de sueldo
    let exp = Math.floor(gain / 2)

    user.coin += gain
    user.exp += exp
    user.lastwork = new Date() * 1

    const frases = [
        `*¡Buen trabajo! Hoy te desempeñaste como ${job.t} y lo hiciste genial:*`,
        `*Me encanta verte tan activo. Trabajaste de ${job.t} y aquí tienes tu paga:*`,
        `*Vuelves del turno de ${job.t}. Se nota el esfuerzo, descansa un poco:*`,
        `*¡Hola! He recibido tu informe como ${job.t}. Tu paga ya está lista:*`,
        `*Qué oficio tan interesante... Ser ${job.t} te sienta muy bien:*`,
        `*Terminaste tu jornada de ${job.t}. Gracias por ayudar al sistema:*`,
        `*¡Mira cuánto ganaste hoy siendo ${job.t}! Estoy orgullosa de ti:*`,
        `*Un día agotador como ${job.t}, pero valió la pena por este botín:*`,
        `*Me avisaron que fuiste el mejor ${job.t} del turno. Aquí tienes un extra:*`,
        `*Aquí tienes el fruto de tu labor como ${job.t}. ¡Disfrútalo, corazón!:*`
    ]

    let txt = `👷 *𝗝𝗢𝗥𝗡𝗔𝗗𝗔 𝗟𝗔𝗕𝗢𝗥𝗔𝗟 𝗙𝗜𝗡𝗔𝗟𝗜𝗭𝗔𝗗𝗔*\n\n`
    txt += `${frases[Math.floor(Math.random() * frases.length)]}\n\n`
    txt += `> 🪙 *Sueldo:* +${gain} Coins\n`
    txt += `> 🧪 *Experiencia:* +${exp} XP\n\n`
    txt += `*Ahora relájate un poco, yo me encargo de registrar todo.*`

    await m.reply(txt)
    await conn.sendMessage(m.chat, { react: { text: job.r, key: m.key } })
}

handler.help = ['work', 'trabajar']
handler.tags = ['economy']
handler.command = ['work', 'trabajar', 'trabajo', 'w']
handler.group = true

export default handler

function msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let seconds = Math.floor((duration / 1000) % 60)
    return `*${minutes}m ${seconds}s*`
}