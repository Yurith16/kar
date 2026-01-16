let handler = async (m, { conn, usedPrefix }) => {
    await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } })

    if (m.isGroup && !global.db.data.chats[m.chat]?.economy) return m.reply(`> 🏹 *Hola, la economía no está activa aquí.*`)

    let user = global.db.data.users[m.sender]
    let tiempoEspera = 600000 

    if (new Date() - (user.lastcaza || 0) < tiempoEspera) {
        let timeLeft = msToTime((user.lastcaza + tiempoEspera) - new Date())
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
        return m.reply(`> ⏳ *Tu equipo aún está caliente, cariño. Vuelve en ${timeLeft} y probamos de nuevo.*`)
    }

    const expediciones = [
        { titulo: "Selva Prehistórica", animales: [{ t: "Velociraptor", p: 45, x: 30, e: "🦎", r: "🦎" }, { t: "T-Rex", p: 90, x: 60, e: "🦖", r: "🦖" }] },
        { titulo: "Ciudad Ruina 2099", animales: [{ t: "Dron Asalto", p: 40, x: 35, e: "🛸", r: "🛰️" }, { t: "Cyber-Pantera", p: 85, x: 55, e: "🐆", r: "🦾" }] },
        { titulo: "Valle del Olimpo", animales: [{ t: "Pegaso", p: 50, x: 40, e: "🦄", r: "✨" }, { t: "Hidra", p: 120, x: 80, e: "🐉", r: "🐉" }] },
        { titulo: "Abismo Oceánico", animales: [{ t: "Calamar Gigante", p: 65, x: 45, e: "🦑", r: "🌊" }, { t: "Megalodón", p: 110, x: 75, e: "🦈", r: "🦈" }] },
        { titulo: "Desierto de Arrakis", animales: [{ t: "Escorpión de Cristal", p: 35, x: 25, e: "🦂", r: "🦂" }, { t: "Gusano de Arena", p: 130, x: 90, e: "🐛", r: "🏜️" }] },
        { titulo: "Bosque de los Susurros", animales: [{ t: "Lobo Plateado", p: 42, x: 32, e: "🐺", r: "🐺" }, { t: "Ciervo Ancestral", p: 80, x: 50, e: "🦌", r: "🍃" }] },
        { titulo: "Núcleo Volcánico", animales: [{ t: "Salamandra de Fuego", p: 55, x: 38, e: "🦎", r: "🔥" }, { t: "Fénix Carmesí", p: 115, x: 85, e: "🐦‍🔥", r: "🔥" }] },
        { titulo: "Tundra Olvidada", animales: [{ t: "Zorro de Escarcha", p: 38, x: 28, e: "🦊", r: "❄️" }, { t: "Mamut Lanudo", p: 95, x: 65, e: "🐘", r: "🌨️" }] },
        { titulo: "Cueva de los Cristales", animales: [{ t: "Murciélago Sónico", p: 30, x: 20, e: "🦇", r: "🦇" }, { t: "Golem de Cuarzo", p: 105, x: 70, e: "💎", r: "🗿" }] },
        { titulo: "Dimensión del Vacío", animales: [{ t: "Espectro Errante", p: 75, x: 50, e: "👻", r: "🔮" }, { t: "Dragón del End", p: 150, x: 120, e: "🐲", r: "🌌" }] }
    ];

    const expedicion = expediciones[Math.floor(Math.random() * expediciones.length)]
    const animal = expedicion.animales[Math.floor(Math.random() * expedicion.animales.length)]
    user.lastcaza = new Date() * 1

    if (Math.random() > 0.50) { 
        user.coin += animal.p
        user.exp += animal.x

        const exitos = [
            `*¡Increíble puntería! Lograste abatir la pieza en ${expedicion.titulo}:*`,
            `*Mira lo que has traído, una captura perfecta. Aquí tienes el botín:*`,
            `*¡Lo lograste! La expedición fue todo un éxito, buen trabajo:*`,
            `*Excelente rastro, cariño. La presa no tuvo oportunidad:*`,
            `*¡Qué destreza! Trajiste algo valioso desde ${expedicion.titulo}:*`,
            `*Cacería impecable. Me encargo de procesar tus ganancias:*`,
            `*¿Viste eso? Fue un tiro perfecto. Aquí tienes tus recompensas:*`,
            `*La suerte y la habilidad están contigo hoy. Mira tu botín:*`,
            `*¡Presa capturada! Has demostrado ser el mejor en la zona:*`,
            `*Vuelves con las manos llenas, me alegra mucho ver tu progreso:*`
        ]

        let intro = exitos[Math.floor(Math.random() * exitos.length)]
        let txt = `🏹 *𝗖𝗔𝗖𝗘𝗥Í𝗔 𝗘𝗫𝗣𝗘𝗗𝗜𝗖𝗜𝗢𝗡𝗔𝗥𝗜𝗔*\n\n`
        txt += `${intro}\n\n`
        txt += `> 🎯 *Objetivo:* ${animal.t} ${animal.e}\n`
        txt += `> 💰 *Coins:* +${animal.p}\n`
        txt += `> 🧪 *Exp:* +${animal.x}\n\n`
        txt += `*Guardaré esto para ti. ¡Esa pieza se ve imponente!*`

        await m.reply(txt)
        await conn.sendMessage(m.chat, { react: { text: animal.r, key: m.key } })
    } else {
        const perdida = Math.floor(Math.random() * 20) + 10
        user.coin = Math.max(0, user.coin - perdida)

        const fallos = [
            `*Vaya... la presa se escapó por poco en ${expedicion.titulo}.*`,
            `*Parece que hoy tenían más prisa que tú. Inténtalo luego.*`,
            `*¡Casi lo tienes! Pero el objetivo logró ocultarse a tiempo.*`,
            `*La zona estaba difícil hoy, no te desanimes por fallar.*`,
            `*Perdimos el rastro, pero al menos regresaste a salvo, ¿si?*`,
            `*La munición no es gratis, pero la experiencia te servirá.*`,
            `*Se nota que era una presa difícil, no cualquiera lo intenta.*`,
            `*Rayos... el ruido nos delató. Volvamos más tarde con sigilo.*`,
            `*Hoy no hubo suerte, pero me gusta que no te rindas.*`,
            `*Tranquilo, hasta los mejores cazadores tienen días así.*`
        ]

        let failIntro = fallos[Math.floor(Math.random() * fallos.length)]
        let fail = `⚙️ *𝗜𝗡𝗙𝗢𝗥𝗠𝗘 𝗗𝗘 𝗘𝗫𝗣𝗘𝗗𝗜𝗖𝗜Ó𝗡*\n\n`
        fail += `${failIntro}\n\n`
        fail += `> ❌ *Gasto:* -${perdida} Coins\n\n`
        fail += `*No te preocupes, yo te acompañaré en el próximo intento.*`

        await m.reply(fail)
        await conn.sendMessage(m.chat, { react: { text: '💨', key: m.key } })
    }
}

function msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let seconds = Math.floor((duration / 1000) % 60)
    return `*${minutes}m ${seconds}s*`
}

handler.command = ['cazar', 'hunt', 'caza']
handler.group = true
export default handler