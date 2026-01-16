let handler = async (m, { conn, usedPrefix }) => {
    if (m.isGroup && !global.db.data.chats[m.chat]?.economy) return m.reply(`> 👛 *Hola, la economía no está activa aquí.*`)

    let user = global.db.data.users[m.sender]
    let cooldown = 180000 // 3 minutos

    await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } })

    if (Date.now() - (user.lastcrime || 0) < cooldown) {
        let tiempo = Math.ceil((cooldown - (Date.now() - user.lastcrime)) / 1000)
        await conn.sendMessage(m.chat, { react: { text: '🚔', key: m.key } })
        return m.reply(`> 🤫 *¡Shhh! Baja la voz, la policía patrulla cerca. Espera unos ${tiempo}s para que se olviden de ti.*`)
    }

    user.lastcrime = Date.now()
    let exito = Math.random() > 0.60 // 40% de éxito (es difícil ser criminal)

    if (exito) {
        let win = Math.floor(Math.random() * 250) + 150 // Ganancia equilibrada
        user.coin += win

        const exitos = [
            `*¡Lo lograste! Entramos y salimos sin que nadie se diera cuenta:*`,
            `*Vaya destreza... lograste hackear una cuenta descuidada:*`,
            `*Eres todo un profesional, mira lo que logramos extraer:*`,
            `*Nadie vio nada. Aquí tienes tu parte del botín, disfrútalo:*`,
            `*Fue un golpe limpio. Me encargo de limpiar el rastro de estas coins:*`,
            `*¡Qué adrenalina! Lograste vaciar una caja fuerte pequeña:*`,
            `*Tu plan funcionó a la perfección. Aquí tienes la recompensa:*`,
            `*Parece que hoy el sistema tiene un punto ciego y lo aprovechaste:*`,
            `*Un trabajo rápido y efectivo. Aquí tienes tus ganancias, guárdalas bien:*`,
            `*Me asusta lo fácil que haces esto... aquí tienes el botín:*`
        ]

        let txt = `🥷 *𝗢𝗣𝗘𝗥𝗔𝗖𝗜Ó𝗡 𝗘𝗡 𝗦𝗢𝗠𝗕𝗥𝗔𝗦*\n\n`
        txt += `${exitos[Math.floor(Math.random() * exitos.length)]}\n\n`
        txt += `> 💰 *Botín:* +${win.toLocaleString()} Coins\n`
        txt += `> 📝 *Nota:* Lograste descifrar una billetera virtual.\n\n`
        txt += `*No le digas a nadie de dónde salió esto, ¿vale?*`

        await m.reply(txt)
        await conn.sendMessage(m.chat, { react: { text: '🎭', key: m.key } })
    } else {
        let loss = Math.floor(Math.random() * 150) + 100

        const fallos = [
            `*¡Corren hacia nosotros! Tuvimos que soltar el dinero para escapar:*`,
            `*Vaya... activaste una alarma y la multa fue bastante cara:*`,
            `*Casi nos atrapan, tuve que pagar un soborno para que nos dejaran:*`,
            `*Te dije que era arriesgado... perdimos algo de capital en la huida:*`,
            `*Rayos, la policía fue más rápida esta vez. Nos confiscaron esto:*`,
            `*Nos tendieron una trampa. Tuve que usar tus coins para sacarte de ahí:*`,
            `*El sistema de seguridad nos detectó. Esto te costará una multa:*`,
            `*¡Maldición! El plan falló y nos cobraron los daños:*`,
            `*Mejor nos retiramos por hoy, la vigilancia está muy fuerte:*`,
            `*¡Corre! La policía te tiene en la mira y nos multaron por el intento:*`
        ]

        let totalLoss = loss
        if (user.coin < loss) {
            let faltante = loss - user.coin
            user.coin = 0
            user.bank = Math.max(0, (user.bank || 0) - faltante)

            let failTxt = `🚔 *𝗔𝗥𝗥𝗘𝗦𝗧𝗢 𝗬 𝗖𝗢𝗡𝗙𝗜𝗦𝗖𝗔𝗖𝗜Ó𝗡*\n\n`
            failTxt += `*No tenías suficiente efectivo, así que el juez tomó el resto de tu banco. Ten más cuidado la próxima vez.*\n\n`
            failTxt += `> ❌ *Multa Total:* -${loss.toLocaleString()} Coins\n\n`
            failTxt += `*Me duele verte perder así, pero el crimen tiene sus riesgos.*`
            await m.reply(failTxt)
        } else {
            user.coin -= loss
            let failTxt = `🚨 *𝗙𝗔𝗟𝗟𝗢 𝗗𝗘𝗟 𝗦𝗘𝗖𝗧𝗢𝗥*\n\n`
            failTxt += `${fallos[Math.floor(Math.random() * fallos.length)]}\n\n`
            failTxt += `> ❌ *Pérdida:* -${loss.toLocaleString()} Coins\n\n`
            failTxt += `*Tranquilo, yo te ayudaré a recuperarlo de forma legal después.*`
            await m.reply(failTxt)
        }
        await conn.sendMessage(m.chat, { react: { text: '🚨', key: m.key } })
    }
}

handler.help = ['crime']
handler.tags = ['economy']
handler.command = ['crimen', 'crime']
handler.group = true

export default handler