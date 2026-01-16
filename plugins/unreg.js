import { saveDatabase } from '../lib/db.js'

let handler = async (m, { conn, usedPrefix }) => {
  let who = m.sender
  let user = global.db.data.users[who]

  // 1. VERIFICAR SI ESTÁ REGISTRADO
  if (!user || !user.registered) {
    await m.react('🥀')
    return m.reply(`> 🎀 *Cariño:* No puedo borrar algo que no existe. Aún no te has presentado conmigo.`)
  }

  // 2. ELIMINAR DATOS DE IDENTIDAD (Mantenemos economía por seguridad)
  user.registered = false
  user.registeredName = "" // Limpiamos el nombre blindado
  user.age = 0
  user.genre = ""
  user.colorFav = ""
  user.animalFav = ""
  user.cumple = ""

  await m.react('💔')

  // 3. MENSAJE DE DESPEDIDA HUMANO
  let txt = `> 🥀 *𝚄𝚗 𝚟í𝚗𝚌𝚞𝚕𝚘 𝚜𝚎 𝚑𝚊 𝚛𝚘𝚝𝚘...*\n\n`
  txt += `He borrado tu nombre y tu esencia de mi memoria. Me duele un poco verte partir de esta manera, pero respeto tu decisión.\n\n`
  txt += `Ya no te llamaré por tu nombre, volverás a ser un número más en mi lista hasta que decidas volver a decirme quién eres con *${usedPrefix}reg*.\n\n`
  txt += `_He guardado tus monedas y nivel por si decides regresar algún día..._`

  await conn.sendMessage(m.chat, { 
    text: txt,
    contextInfo: {
      externalAdReply: {
        title: '💔 VÍNCULO ELIMINADO',
        body: 'KarBot: Me siento un poco más vacía ahora.',
        thumbnailUrl: 'https://i.postimg.cc/63HSmCvV/1757985995273.png',
        mediaType: 1,
        showAdAttribution: true
      }
    }
  }, { quoted: m })

  try { await saveDatabase() } catch (e) { console.error(e) }
}

handler.help = ['unreg']
handler.tags = ['main']
handler.command = /^(unreg|anular)$/i

export default handler