import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, args }) => {
try {
if (!args[0]) {
return conn.reply(m.chat,
`> ⓘ USO INCORRECTO

> ❌ Debes proporcionar el nombre de la aplicación

> 📝 Ejemplos:
> • ${usedPrefix + command} whatsapp
> • ${usedPrefix + command} tiktok
> • ${usedPrefix + command} facebook
> • ${usedPrefix + command} instagram`, m)
}

const appName = args.join(' ').toLowerCase()    

// Reacción de búsqueda
await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })

const apiUrl = `https://mayapi.ooguy.com/apk?query=${encodeURIComponent(appName)}&apikey=may-f53d1d49`    
const response = await fetch(apiUrl, {    
timeout: 30000    
})    

if (!response.ok) {    
throw new Error(`Error en la API: ${response.status}`)    
}    

const data = await response.json()    

if (!data.status || !data.result) {    
throw new Error('No se encontró la aplicación')    
}    

const appData = data.result    
const downloadUrl = appData.url    
const appTitle = appData.title || appName    
const appVersion = appData.version || 'Última versión'    
const appSize = appData.size || 'Tamaño no disponible'    
const appDeveloper = appData.developer || 'Desarrollador no disponible'    

// Intentar obtener imagen del APK
let appImage = null
try {
if (appData.icon) {
appImage = appData.icon
} else if (appData.image) {
appImage = appData.image
} else if (appData.screenshot) {
appImage = appData.screenshot[0]
}
} catch (imgError) {
console.log('No se pudo obtener imagen del APK')
}

if (!downloadUrl) {    
throw new Error('No se encontró enlace de descarga')    
}    

// Reacción de encontrado
await conn.sendMessage(m.chat, { react: { text: '📱', key: m.key } })

// Mensaje de aplicación encontrada
if (appImage) {
await conn.sendMessage(m.chat, {
image: { url: appImage },
caption: `> ⓘ APLICACION ENCONTRADA

> 📱 ${appTitle}
> 🔄 ${appVersion}
> 💾 ${appSize}
> 👨‍💻 ${appDeveloper}`
}, { quoted: m })
} else {
await conn.reply(m.chat,    
`> ⓘ APLICACION ENCONTRADA

> 📱 ${appTitle}
> 🔄 ${appVersion}
> 💾 ${appSize}
> 👨‍💻 ${appDeveloper}`, m)    
}

// Enviar el archivo APK    
await conn.sendMessage(m.chat, {    
document: { url: downloadUrl },    
mimetype: 'application/vnd.android.package-archive',    
fileName: `${appTitle.replace(/\s+/g, '_')}.apk`,    
caption: `> ⓘ APK DESCARGADO

> ✅ ${appTitle}
> ⭐ ${appVersion}
> 💾 ${appSize}
> 👨‍💻 ${appDeveloper}`    
}, { quoted: m })    

await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

} catch (error) {
console.error('Error en descarga APK:', error)

await conn.reply(m.chat,    
`> ⓘ ERROR

> ❌ ${error.message}

> 💡 Intenta con otro nombre`, m)    

await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
}
}

handler.help = ['apk']
handler.tags = ['downloader']
handler.command = ['apk', 'apkdl', 'descargarapk']
handler.register = false

export default handler