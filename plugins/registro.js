import { saveDatabase } from '../lib/db.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    if (user?.registered) return m.reply(`> 🎀 *Aviso:* Ya estás registrado, cielo.`)

    // Formato: nombre.edad.genero
    let Reg = /([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,20})[.]([0-9]{1,2})[.](hombre|mujer|otro)/i
    let matches = text.match(Reg)

    if (!text || !matches) {
        return m.reply(`> 🎀 *Uso correcto:*\n> \`${usedPrefix + command} nombre.edad.genero\`\n\n*Ejemplo:*\n> \`${usedPrefix + command} KarBot.19.mujer\``)
    }

    let [_, name, age, genre] = matches
    age = parseInt(age)

    if (age < 10 || age > 85) return m.reply("> 🎀 Edad inválida (10-85 años).")
    
    user.registeredName = name.trim()
    user.age = age
    user.genre = genre.toLowerCase()
    user.registered = true
    user.regDate = new Date().toLocaleDateString('es-ES')

    // Bono inicial
    user.coin = (user.coin || 0) + 10000
    user.diamond = (user.diamond || 0) + 5
    user.hotpass = (user.hotpass || 0) + 10

    await m.react('✅')
    let txt = `✅ *REGISTRO EXITOSO*\n\n`
    txt += `> *Nombre:* ${user.registeredName}\n`
    txt += `> *Edad:* ${user.age} años\n`
    txt += `> *Género:* ${user.genre}\n\n`
    txt += `🎁 *BONO:* +10k Coins, +5 Dmd, +10 HotPass.`

    await m.reply(txt)
    await saveDatabase()
}

handler.help = ['reg']
handler.tags = ['main']
handler.command = /^(reg|registro)$/i

export default handler