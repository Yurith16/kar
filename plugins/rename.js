const { saveDatabase } = require('../lib/db.js')
const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]

    // 1. Verificación de Registro
    if (await checkReg(m, user)) return 

    // 2. Límite de 24 Horas
    let tiempoEspera = 24 * 60 * 60 * 1000 
    if (user.lastRename && (new Date() - user.lastRename < tiempoEspera)) {
        let tiempoRestante = user.lastRename + tiempoEspera - new Date()
        let horas = Math.floor(tiempoRestante / (1000 * 60 * 60))
        let minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60))
        await m.react('⏳')
        return m.reply(`> ⏳ *Cariño, espera...*\n> No puedes cambiar de piel tan seguido. Faltan: *${horas}h ${minutos}m* para otra transformación.`)
    }

    // Formato: nombre.edad.genero
    let Reg = /([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,20})[.]([0-9]{1,2})[.](hombre|mujer|otro)/i
    let matches = text.match(Reg)

    if (!text || !matches) {
        return m.reply(`> ✨ *FORMA CORRECTA:*\n> *${usedPrefix + command} nombre.edad.genero*\n\n*Ejemplo:*\n> *${usedPrefix + command} NuevaIdentidad.20.mujer*`)
    }

    let [_, name, age, genre] = matches
    age = parseInt(age)

    if (age < 10 || age > 85) return m.reply("> ⚠️ Esa edad no me parece real, corazón. (Rango: 10-85 años).")
    
    // Actualización de Esencia
    user.registeredName = name.trim()
    user.name = name.trim()
    user.age = age
    user.genre = genre.toLowerCase()
    user.lastRename = new Date() * 1

    await m.react('✨')
    let conf = `✨ *ESENCIA RENOVADA*\n\n`
    conf += `> *Nombre:* ${user.registeredName}\n`
    conf += `> *Edad:* ${user.age} años\n`
    conf += `> *Género:* ${user.genre}\n\n`
    conf += `Tu nueva identidad ha sido grabada en las profundidades de mi sistema. Te ves radiante con este nuevo nombre. 💋`

    await m.reply(conf)
    await saveDatabase()
}

handler.help = ['rename']
handler.tags = ['main']
handler.command = /^(rename|renombrar|setname)$/i
handler.register = true

module.exports = handler