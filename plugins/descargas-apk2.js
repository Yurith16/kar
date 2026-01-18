/*
██████╗░██╗░░░██╗███████╗███████╗
██╔══██╗╚██╗░██╔╝╚════██║██╔════╝
██████╔╝░╚████╔╝░░░███╔═╝█████╗░░
██╔══██╗░░╚██╔╝░░██╔══╝░░██╔══╝░░
██║░░██║░░░██║░░░███████╗███████╗
╚═╝░░╚═╝░░░╚═╝░░░╚══════╝╚══════╝
*/
import { search, download } from 'aptoide-scraper'
import { checkReg } from '../lib/checkReg.js'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m) return
  const ctx = (global.rcanalr || {})
  
  // Verificación de registro
  let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
  let user = global.db.data.users[who]
  if (await checkReg(m, user)) return

  if (!text) {
    await m.react('📝')
    return conn.reply(m.chat, `> ¿Qué aplicación desea buscar?\n*Uso:* ${usedPrefix + command} <Nombre>`, m, ctx)
  }

  try {
    await m.react('🕛')
    
    let searchA = await search(text)
    if (!searchA.length) {
      await m.react('❌')
      return conn.reply(m.chat, `> No se encontraron resultados para su búsqueda.`, m, ctx)
    }

    let data5 = await download(searchA[0].id)

    let infoApk = `💰 *DETALLES DEL APK*
┌───⊷
▢ *📱 Nombre:* _${data5.name}_
▢ *📦 Paquete:* _${data5.package}_
▢ *💾 Tamaño:* _${data5.size}_
└──────────────`

    await conn.sendFile(m.chat, data5.icon, 'apk.jpg', infoApk, m, null, ctx)

    if (data5.size.includes('GB') || parseFloat(data5.size.replace(' MB', '')) > 999) {
      await m.react('❌')
      return conn.reply(m.chat, `> El archivo excede el límite de peso permitido (999 MB).`, m, ctx)
    }

    // Pequeña espera para no saturar el envío
    await new Promise(resolve => setTimeout(resolve, 1500))

    await conn.sendMessage(m.chat, {
        document: { url: data5.dllink },
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${data5.name}.apk`
    }, { quoted: m })

    await m.react('✅')

  } catch (error) {
    console.error(error)
    await m.react('❌')
    return conn.reply(m.chat, `> Ocurrió un error inesperado al procesar la solicitud.`, m, ctx)
  }
}

handler.help = ['apk (descargas de app)']
handler.tags = ['downloader']
handler.command = ['apk2', 'apk', 'aptoide']
handler.group = true

export default handler