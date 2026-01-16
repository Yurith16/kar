import { saveDatabase } from '../lib/db.js'

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    if (user?.registered) {
        await m.react('🎀')
        return m.reply(`> 🎀 *Cariño:* Ya estás en mi lista de invitados especiales.`)
    }

    conn.regStep = conn.regStep ? conn.regStep : {}
    conn.regStep[m.sender] = { step: 1 }

    await m.react('🌸')
    return m.reply(`> 🎀 *¡HOLA, CIELO!*\n\nMe encanta que quieras ser parte de esto. Vamos a crear tu identidad paso a paso.\n\n¿Cómo quieres que te llame? Dime tu nombre.`)
}

handler.before = async (m, { conn }) => {
    conn.regStep = conn.regStep ? conn.regStep : {}
    if (!conn.regStep[m.sender] || m.isBaileys) return false

    let user = global.db.data.users[m.sender]
    let state = conn.regStep[m.sender]
    let txt = m.text.trim()
    let prefix = m.prefix || '/'

    try {
        // PASO 1: NOMBRE
        if (state.step === 1) {
            if (txt.length < 3 || txt.length > 25) {
                await m.react('⚠️')
                return m.reply("> 🎀 Intenta con un nombre más corto y bonito (3-25 letras).")
            }
            state.name = txt
            state.step = 2
            await m.react('🌿')
            return m.reply(`> 🎀 *${txt}*... ¡Qué nombre tan encantador!\n\nAhora dime, ¿cuántos años tienes? (Solo números).`)
        }

        // PASO 2: EDAD
        if (state.step === 2) {
            let age = parseInt(txt)
            if (isNaN(age) || age < 10 || age > 85) {
                await m.react('🍃')
                return m.reply("> 🎀 Por favor, dime una edad real entre 10 y 85 años.")
            }
            state.age = age
            state.step = 3
            await m.react('🍀')
            return m.reply(`> 🎀 Entendido. Por último, corazón... ¿Cuál es tu género?\n\n👉 *Hombre*\n👉 *Mujer*\n👉 *Otro*`)
        }

        // PASO 3: GÉNERO Y PREGUNTA OPCIONAL
        if (state.step === 3) {
            let gen = txt.toLowerCase()
            let valid = ['hombre', 'mujer', 'otro']
            if (!valid.includes(gen)) {
                await m.react('🌷')
                return m.reply("> 🎀 Elige una de las opciones: *Hombre*, *Mujer* u *Otro*.")
            }
            state.genre = gen.charAt(0).toUpperCase() + gen.slice(1)
            state.step = 4
            await m.react('✨')
            return m.reply(`> 🎀 ¡Listo, *${state.name}*! Hemos concluido el registro básico.\n\n¿Te gustaría agregar detalles extra a tu perfil? (Color favorito, animal, fecha de nacimiento).\n\nResponde con *SI* para continuar o *NO* para concluir y recibir tu bono.`)
        }

        // PASO 4: DECISIÓN OPCIONAL
        if (state.step === 4) {
            if (/si/i.test(txt)) {
                state.step = 5
                await m.react('🎨')
                return m.reply(`> 🎀 ¡Qué bien! Me gusta saber más de ti.\n\n¿Cuál es tu *color favorito*?`)
            } else if (/no/i.test(txt)) {
                return finalizarRegistro(m, conn, state, user, prefix)
            } else {
                return m.reply("> 🎀 Por favor, responde con *SI* o *NO*.")
            }
        }

        // PASO 5: COLOR FAVORITO
        if (state.step === 5) {
            state.color = txt
            state.step = 6
            await m.react('🐾')
            return m.reply(`> 🎀 ¡Ese color te debe quedar genial! ¿Y cuál es tu *animal favorito*?`)
        }

        // PASO 6: ANIMAL FAVORITO
        if (state.step === 6) {
            state.animal = txt
            state.step = 7
            await m.react('🎂')
            return m.reply(`> 🎀 ¡Qué tierno! Por último, ¿cuándo es tu *cumpleaños*? (Ejemplo: 15 de marzo).`)
        }

        // PASO 7: CUMPLEAÑOS Y FINALIZAR
        if (state.step === 7) {
            state.nacimiento = txt
            return finalizarRegistro(m, conn, state, user, prefix)
        }

    } catch (e) {
        console.error(e)
        delete conn.regStep[m.sender]
    }
}

async function finalizarRegistro(m, conn, state, user, prefix) {
    // Guardado en propiedades únicas para evitar que se sobrescriban
    user.registeredName = state.name 
    user.age = state.age
    user.genre = state.genre
    user.colorFav = state.color || 'No definido'
    user.animalFav = state.animal || 'No definido'
    user.cumple = state.nacimiento || 'No definido'
    user.registered = true
    user.regDate = new Date().toLocaleDateString('es-ES')

    // Premios
    user.coin = (user.coin || 0) + 2000
    user.kryons = (user.kryons || 0) + 150

    await m.react('🎀')

    let welcome = `> 🎀 *REGISTRO IMPECABLE*\n\n` +
                  `Listo, cielo. Ya te he guardado en mi base de datos. ✨\n\n` +
                  `👤 *Nombre:* ${user.registeredName}\n` +
                  `🎂 *Edad:* ${user.age} años\n` +
                  `🚻 *Género:* ${user.genre}\n`

    if (state.color) {
        welcome += `🎨 *Color:* ${user.colorFav}\n`
        welcome += `🐾 *Animal:* ${user.animalFav}\n`
        welcome += `📅 *Cumple:* ${user.cumple}\n`
    }

    welcome += `\n🎁 *BONO:* +2000 Coins y +150 Kryons.\n\n` +
               `_Usa *${prefix}perfil* para ver tu nueva cara._`

    await conn.sendMessage(m.chat, { 
        text: welcome, 
        mentions: [m.sender],
        contextInfo: {
            externalAdReply: {
                title: 'KARBOT SYSTEM ✅',
                body: `Vínculo creado: ${user.registeredName}`,
                thumbnailUrl: 'https://i.postimg.cc/63HSmCvV/1757985995273.png',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })

    delete conn.regStep[m.sender]
    await saveDatabase()
    return true
}

handler.help = ['reg']
handler.tags = ['main']
handler.command = /^(reg|registro)$/i
export default handler