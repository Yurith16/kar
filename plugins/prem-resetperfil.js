import { unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import { premiumStyles } from '../lib/styles.js'
import { checkReg } from '../lib/checkReg.js' // Importamos tu nueva función

let handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender]

    // 1. Verificación Global de Registro
    if (await checkReg(m, user)) return 

    // Guardamos el estilo para la despedida visual
    let s = user.premium ? (premiumStyles[user.prefStyle] || premiumStyles["luxury"]) : null

    // Ruta de la foto personalizada
    let pathImg = join(process.cwd(), 'src', 'Images', 'perfiles', `${m.sender.split('@')[0]}.png`)

    // 2. Borrado físico de la imagen
    if (existsSync(pathImg)) {
        try { 
            unlinkSync(pathImg) 
        } catch (e) { 
            console.error('Error al borrar foto:', e) 
        }
    }

    // 3. Reset de los datos en la DB
    user.customPerfil = { frase: '', foto: '' }
    user.prefStyle = 'luxury' 

    await m.react('🥺')

    // 4. Mensaje melancólico
    let txt = s ? `${s.top}\n\n` : ''
    txt += `> 🥀 *𝚄𝚗 𝚟𝚊𝚌í𝚘 𝚎𝚗 𝚝𝚞 𝚎𝚜𝚎𝚗𝚌𝚒𝚊...*\n\n`
    txt += `He borrado tu frase y tu foto personalizada. Se siente extraño verte así, como si una parte de tu historia se hubiera desvanecido de mis archivos.\n\n`
    txt += `_Si alguna vez deseas volver a brillar, estaré esperando por tu nueva configuración con \`${usedPrefix}setperfil\`._`
    if (s) txt += `\n\n${s.footer}`

    await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
}

handler.help = ['resetperfil']
handler.tags = ['config']
handler.command = /^(resetperfil|limpiarperfil|borrarperfil)$/i

export default handler