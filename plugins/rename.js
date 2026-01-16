import { saveDatabase } from '../lib/db.js'
import { checkReg } from '../lib/checkReg.js'

let handler = async (m, { conn, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]

    // 1. Verificación Global de Registro
    if (await checkReg(m, user)) return 

    // 2. Sistema de Límite Diario (24 Horas)
    let tiempoEspera = 24 * 60 * 60 * 1000 
    if (user.lastRename && (new Date() - user.lastRename < tiempoEspera)) {
        let tiempoRestante = user.lastRename + tiempoEspera - new Date()
        let horas = Math.floor(tiempoRestante / (1000 * 60 * 60))
        let minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60))
        await m.react('⏳')
        return m.reply(`> ⏳ *𝚄𝚗 𝚖𝚘𝚖𝚎𝚗𝚝𝚘, 𝚌𝚒𝚎𝚕𝚘...*\n\nDebes esperar a que tu esencia se asiente antes de cambiarla de nuevo.\n\n> *Faltan:* ${horas}h y ${minutos}m.`)
    }

    // Iniciar el proceso paso a paso
    conn.renameStep = conn.renameStep ? conn.renameStep : {}
    conn.renameStep[m.sender] = { step: 1 }

    await m.react('✨')
    return m.reply(`> ✨ *𝚁𝙴𝙽𝙾𝚅𝙰𝙲𝙸Ó𝙽 𝙳𝙴 𝙴𝚂𝙴𝙽𝙲𝙸𝙰*\n\nEntiendo, quieres un cambio. Vamos a actualizar tus datos.\n\n¿Cuál será tu *nuevo nombre*?`)
}

handler.before = async (m, { conn }) => {
    conn.renameStep = conn.renameStep ? conn.renameStep : {}
    if (!conn.renameStep[m.sender] || m.isBaileys) return false

    let user = global.db.data.users[m.sender]
    let state = conn.renameStep[m.sender]
    let txt = m.text.trim()

    try {
        // PASO 1: NOMBRE
        if (state.step === 1) {
            if (txt.length < 3 || txt.length > 25) {
                return m.reply("> ⚠️ Intenta con un nombre entre 3 y 25 letras.")
            }
            state.name = txt
            state.step = 2
            return m.reply(`> ✨ *${txt}*... Me gusta. Ahora dime tu edad.`)
        }

        // PASO 2: EDAD
        if (state.step === 2) {
            let age = parseInt(txt)
            if (isNaN(age) || age < 10 || age > 85) {
                return m.reply("> ⚠️ Por favor, una edad real entre 10 y 85 años.")
            }
            state.age = age
            state.step = 3
            return m.reply(`> ✨ ¿Cuál es tu género?\n\n👉 *Hombre*\n👉 *Mujer*\n👉 *Otro*`)
        }

        // PASO 3: GÉNERO
        if (state.step === 3) {
            let gen = txt.toLowerCase()
            let valid = ['hombre', 'mujer', 'otro']
            if (!valid.includes(gen)) {
                return m.reply("> ⚠️ Elige: *Hombre*, *Mujer* u *Otro*.")
            }
            state.genre = gen.charAt(0).toUpperCase() + gen.slice(1)
            state.step = 4
            return m.reply(`> ✨ ¿Deseas actualizar tus detalles extra? (Color, animal, cumple).\n\nResponde con *SI* o *NO*.`)
        }

        // PASO 4: DECISIÓN EXTRAS
        if (state.step === 4) {
            if (/si/i.test(txt)) {
                state.step = 5
                return m.reply(`> 🎨 ¿Cuál es tu nuevo *color favorito*?`)
            } else if (/no/i.test(txt)) {
                return finalizarRename(m, conn, state, user)
            } else {
                return m.reply("> ⚠️ Responde con *SI* o *NO*.")
            }
        }

        // PASO 5: COLOR
        if (state.step === 5) {
            state.color = txt
            state.step = 6
            return m.reply(`> 🐾 ¿Y tu *animal favorito*?`)
        }

        // PASO 6: ANIMAL
        if (state.step === 6) {
            state.animal = txt
            state.step = 7
            return m.reply(`> 🎂 Por último, ¿cuándo es tu *cumpleaños*?`)
        }

        // PASO 7: CUMPLE Y FIN
        if (state.step === 7) {
            state.nacimiento = txt
            return finalizarRename(m, conn, state, user)
        }

    } catch (e) {
        console.error(e)
        delete conn.renameStep[m.sender]
    }
}

async function finalizarRename(m, conn, state, user) {
    user.name = state.name
    user.registeredName = state.name
    user.age = state.age
    user.genre = state.genre

    // Solo actualiza los extras si el usuario decidió pasar por el paso 5, 6 y 7
    if (state.color) user.colorFav = state.color
    if (state.animal) user.animalFav = state.animal
    if (state.nacimiento) user.cumple = state.nacimiento

    user.lastRename = new Date() * 1

    await m.react('✨')

    let conf = `✨ *𝙴𝚜𝚎𝚗𝚌𝚒𝚊 𝚁𝚎𝚗𝚘𝚟𝚊𝚍𝚊*\n\n`
    conf += `> 👤 *Nombre:* ${user.name}\n`
    conf += `> 🎂 *Edad:* ${user.age} años\n`
    conf += `> 🚻 *Género:* ${user.genre}\n`

    if (state.color) {
        conf += `> 🎨 *Color:* ${user.colorFav}\n`
        conf += `> 🐾 *Animal:* ${user.animalFav}\n`
        conf += `> 📅 *Cumple:* ${user.cumple}\n`
    }

    conf += `\nTu nueva identidad ha sido grabada con éxito. Te ves radiante.`

    await conn.sendMessage(m.chat, { text: conf }, { quoted: m })

    delete conn.renameStep[m.sender]
    await saveDatabase()
    return true
}

handler.help = ['rename']
handler.tags = ['main']
handler.command = /^(rename|renombrar)$/i

export default handler