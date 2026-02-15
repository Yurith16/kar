const { search, download } = require('aptoide-scraper')
const { checkReg } = require('../lib/checkReg.js')

// Sistema de descargas activas por usuario
let descargasActivas = new Set()

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender]
  
  // 1. Verificación de registro
  if (await checkReg(m, user)) return

  // 2. Control de descargas (Una a la vez)
  if (descargasActivas.has(m.sender)) {
    await m.react('⏳')
    return m.reply(`> *「⏳」 ESPERA*\n> Ya tienes una descarga en curso, espera a que termine.`)
  }

  if (!text) {
    await m.react('❓')
    return m.reply(`> *「🧐」 APK DOWNLOADER*\n> ¿Qué aplicación desea buscar?\n> *Uso:* ${usedPrefix + command} <nombre>`)
  }

  try {
    descargasActivas.add(m.sender)

    // Secuencia técnica de descargas
    await m.react('🔍') // buscando
    
    let searchA = await search(text)
    if (!searchA.length) {
      await m.react('❌')
      return m.reply(`> No se encontró ninguna aplicación con ese nombre.`)
    }

    await m.react('📥') // descargando información
    
    let data5 = await download(searchA[0].id)

    // --- DISEÑO DE DETALLES APK ---
    let infoApk = `> 📦 *「🌱」 DETALLES APK*\n\n` +
                  `> 📱 *Nombre:* » _${data5.name}_\n` +
                  `> 📦 *Paquete:* » _${data5.package}_\n` +
                  `> 💾 *Tamaño:* » _${data5.size}_\n` +
                  `> 🌿 *Estado:* » _Enviando..._`

    // Enviamos el icono con la información
    await conn.sendMessage(m.chat, { 
        image: { url: data5.icon }, 
        caption: infoApk 
    }, { quoted: m })

    // Restricción de peso (650 MB para estabilidad)
    const sizeValue = parseFloat(data5.size.replace(' MB', ''))
    if (data5.size.includes('GB') || sizeValue > 650) {
      await m.react('❌')
      return m.reply(`> ⚠️ El archivo pesa *${data5.size}* y excede el límite de 650MB.`)
    }

    await m.react('📤') // enviando archivo

    await conn.sendMessage(m.chat, {
        document: { url: data5.dllink },
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${data5.name}.apk`,
        caption: `✅ *Descarga exitosa*`
    }, { quoted: m })

    await m.react('✅')

  } catch (error) {
    console.error('[APK Error]:', error.message)
    await m.react('❌')
    m.reply(`> Error al obtener el APK. Intenta más tarde.`)
  } finally {
    descargasActivas.delete(m.sender)
  }
}

handler.help = ['apk <nombre>']
handler.tags = ['downloader']
handler.command = /^(apk|aptoide)$/i
handler.group = true

module.exports = handler