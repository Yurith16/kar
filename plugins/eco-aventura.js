let handler = async (m, { conn, usedPrefix }) => {
    if (m.isGroup && !global.db.data.chats[m.chat]?.economy) return m.reply(`> 🗺️ *Hola, la economía no está activa aquí.*`)

    let user = global.db.data.users[m.sender]
    if (!user) return
    if (user.health === undefined) user.health = 100

    // 1. CHEQUEO DE SALUD (Humanístico)
    if ((user.health || 0) < 40) {
        await conn.sendMessage(m.chat, { react: { text: '🩹', key: m.key } })
        return m.reply(`> ❌ *¡Espera! No puedes irte así.*\n\n*Estás muy débil (${user.health}%) y me preocupa que te pase algo malo en el camino. Por favor, usa ${usedPrefix}curar antes de seguir.*`)
    }

    // 2. COOLDOWN
    let cooldown = 900000 
    if (new Date() - (user.lastadventure || 0) < cooldown) {
        let timeLeft = msToTime((user.lastadventure + cooldown) - new Date())
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
        return m.reply(`> 👣 *Todavía estás recuperando el aliento de tu viaje anterior. Descansa unos ${timeLeft} más, ¿si?*`)
    }

    // 3. EVENTOS (Premios ajustados a escasez y textos humanos)
    const eventos = [
        { msg: "Te topaste con un nido de lobos en el bosque profundo.", h: 30, r: { coin: 80, exp: 150 }, ex: "Lograste ahuyentarlos y rescatar algunas pertenencias.", react: '🐺' },
        { msg: "Encontraste una caravana abandonada en el camino real.", h: 15, r: { coin: 120, exp: 200 }, ex: "Había algunos suministros olvidados entre los restos.", react: '📦' },
        { msg: "Caíste en una trampa de bandidos, pero fuiste más astuto.", h: 45, r: { coin: 50, exp: 100 }, ex: "Escapaste, pero te costó bastante energía.", react: '⚔️' },
        { msg: "Ayudaste a un anciano a cruzar el río caudaloso.", h: 10, r: { coin: 150, exp: 300 }, ex: "En agradecimiento, te dio sus últimas monedas.", react: '👴' },
        { msg: "Exploraste ruinas antiguas y activaste una trampa de flechas.", h: 35, r: { coin: 180, exp: 400 }, ex: "Esquivaste la mayoría y encontraste un relicario.", react: '🏹' },
        { msg: "Un duende te retó a un duelo de acertijos en el puente.", h: 5, r: { coin: 200, exp: 500 }, ex: "Le ganaste y, aunque se enojó, tuvo que pagarte.", react: '👺' },
        { msg: "Te perdiste en una niebla mágica que drenó tus fuerzas.", h: 50, r: { coin: 40, exp: 600 }, ex: "La niebla te dejó una sensación extraña de poder.", react: '🌫️' },
        { msg: "Entraste a una taberna y terminaste en una pelea multitudinaria.", h: 40, r: { coin: 90, exp: 250 }, ex: "Entre el caos, lograste recoger lo que cayó al suelo.", react: '🍻' },
        { msg: "Un caballero oscuro te desafió a un duelo en el sendero.", h: 60, r: { coin: 400, exp: 1000 }, ex: "¡Fue épico! Le ganaste y te quedaste con su botín.", react: '🛡️' },
        { msg: "Rescataste a un pequeño dragón atrapado en una red.", h: 25, r: { coin: 250, exp: 800 }, ex: "Te agradeció con una escama brillante antes de volar.", react: '🐲' }
    ]

    let e = eventos[Math.floor(Math.random() * eventos.length)]

    // 4. ACTUALIZACIÓN
    user.health = Math.max(0, user.health - e.h)
    user.coin = (user.coin || 0) + e.r.coin
    user.exp = (user.exp || 0) + e.r.exp
    user.lastadventure = new Date() * 1

    // 5. MENSAJE FINAL
    const intros = [
        `*¡Ya regresaste! Estaba ansiosa por saber cómo te fue:*`,
        `*Qué bueno verte a salvo, cuéntame... ¿fue difícil el viaje?*`,
        `*Mira nada más cómo vienes, aquí tienes el reporte de tu aventura:*`,
        `*¡Lo lograste! Sobreviviste a otro viaje, esto fue lo que pasó:*`
    ]

    let txt = `🧭 *Bitácora de Exploración*\n\n`
    txt += `${intros[Math.floor(Math.random() * intros.length)]}\n\n`
    txt += `> 🗺️ *Suceso:* ${e.msg}\n`
    txt += `> 🎒 *Hallazgo:* ${e.ex}\n\n`

    txt += `🎁 *Botín Obtenido*\n`
    txt += `> 💰 *Coins:* +${e.r.coin}\n`
    txt += `> 🧪 *Exp:* +${e.r.exp}\n\n`

    txt += `📊 *Tu Estado*\n`
    txt += `> ❤️ *Salud:* ${user.health}%\n\n`
    txt += `*${user.health < 50 ? 'Vienes algo herido, descansa un poco antes de volver.' : 'Te ves bien, ¡estoy orgullosa de tu valentía!'}*`

    await m.reply(txt)
    await conn.sendMessage(m.chat, { react: { text: e.react, key: m.key } })
}

handler.help = ['aventura']
handler.tags = ['economy']
handler.command = ['aventura', 'adventure', 'explorar']
handler.group = true

export default handler

function msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let seconds = Math.floor((duration / 1000) % 60)
    return `*${minutes}m ${seconds}s*`
}