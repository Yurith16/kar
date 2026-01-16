import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import { performance } from 'perf_hooks'

// === CONFIGURACIÓN KARBOT ===
const KARBOT_CONFIG = {
  BOT_NAME: "KARBOT",
  OWNER_NAME: "HERNANDEZ",
  OWNER_NUMBER: "50496926150"
}

// Lista de emojis en secuencia rotativa
const EMOJI_SEQUENCES = {
  REACCIÓN: ['🌿', '🍃', '🍀', '🌱', '🌼', '🌸', '🌺', '💮', '🥀', '🌻', '🌹', '🌷', '🏵️'],
  BULLET: ['🍃', '🌱', '🍀', '🌿', '🌼', '🌸', '🌺', '🌻', '🌹', '🌷', '☘️', '🥀', '💐'],
  BOT_TITLE: ['🔥', '🌟', '✨', '⭐', '💫', '⚡', '💥', '🌪️', '🌊'],
  INFO_TITLE: ['ℹ️', '📊', '📈', '📉', '📋', '📌', '📍', '🔖', '🏷️', '📎', '📄', '🗂️']
}

// Contadores para llevar el seguimiento de la secuencia
let sequenceCounters = {
  reacción: 0,
  bullet: 0,
  botTitle: 0,
  infoTitle: 0
}

// Función para obtener el siguiente emoji en secuencia
function getNextEmoji(type) {
  const sequence = EMOJI_SEQUENCES[type] || EMOJI_SEQUENCES.BULLET
  const counterKey = type.toLowerCase()
  
  // Obtener el emoji actual
  const emoji = sequence[sequenceCounters[counterKey] % sequence.length]
  
  // Incrementar el contador para la próxima vez
  sequenceCounters[counterKey] = (sequenceCounters[counterKey] + 1) % sequence.length
  
  return emoji
}

function getMenuImage() {
  const path = join(process.cwd(), 'src', 'Images', 'menu.png')
  if (existsSync(path)) return readFileSync(path)
  return null
}

function toBoldMono(text) {
  const mapping = {
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
    a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺", n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
    0: "𝟬", 1: "𝟭", 2: "𝟮", 3: "𝟯", 4: "𝟰", 5: "𝟱", 6: "𝟲", 7: "𝟳", 8: "𝟴", 9: "𝟵"
  };
  return text.split("").map((char) => mapping[char] || char).join("");
}

function clockString(ms) {
  let h = Math.floor(ms / 3600000);
  let m = Math.floor(ms / 60000) % 60;
  let s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    // Obtener emojis en secuencia para esta sesión
    const currentEmojis = {
      reacción: getNextEmoji('REACCIÓN'),
      bullet: getNextEmoji('BULLET'),
      botTitle: getNextEmoji('BOT_TITLE'),
      infoTitle: getNextEmoji('INFO_TITLE'),
      secondTitle: getNextEmoji('BOT_TITLE') // Segundo título diferente
    }

    // Reacción en secuencia
    await conn.sendMessage(m.chat, { react: { text: currentEmojis.reacción, key: m.key } })

    // Filtrar plugins y mapear sus ayudas y etiquetas
    let help = Object.values(global.plugins).filter(p => !p.disabled).map(p => ({
      help: Array.isArray(p.help) ? p.help : p.help ? [p.help] : [],
      tags: Array.isArray(p.tags) ? p.tags : p.tags ? [p.tags] : [],
    }))

    // Definición de Categorías y sus Tags asociados
    const categories = {
      'PERSONAL': ['main', 'info'],
      '⭐ PREMIUM ⭐': ['premium', 'luxury', 'exclusive'],
      'INTELIGENCIA': ['bots', 'ia'],
      'JUEGOS': ['game', 'gacha', 'juegos'],
      'ECONOMÍA': ['economy', 'rpgnk'],
      'GRUPOS': ['group'],
      'DESCARGAS': ['downloader'],
      'MULTIMEDIA': ['sticker', 'audio', 'anime'],
      'TOOLS': ['tools', 'advanced'],
      'BÚSQUEDA': ['search', 'buscador'],
      'NSFW +18': ['NSFW', 'nsfw'],
      'SUB-BOT': ['serbot'],
      'OWNER': ['owner', 'creador'],
    }

    const username = "@" + m.sender.split("@")[0]
    const uptime = clockString(process.uptime() * 1000)
    let menuSections = []

    // Encabezado con título en secuencia
    menuSections.push(`╭━〔 ${currentEmojis.botTitle} ${toBoldMono(KARBOT_CONFIG.BOT_NAME)} ${currentEmojis.secondTitle} 〕━╮\n┃\n┃ ${currentEmojis.bullet} Hola, ${username}\n┃ ${currentEmojis.bullet} Fecha: ${new Date().toLocaleDateString()}\n┃\n╰━━━━━━━━━━━━━━━━━━╯`)
    
    // Info del bot con título en secuencia
    menuSections.push(`╭━━〔 ${currentEmojis.infoTitle} ${toBoldMono("INFO DEL BOT")} ${currentEmojis.infoTitle} 〕━━╮\n┃\n┃ ${currentEmojis.bullet} Creador: ${KARBOT_CONFIG.OWNER_NAME}\n┃ ${currentEmojis.bullet} Actividad: ${uptime}\n┃ ${currentEmojis.bullet} Prefijo: ${_p}\n┃\n╰━━━━━━━━━━━━━━━━━━╯`)

    // Construcción dinámica de secciones
    for (let catName in categories) {
      let comandos = help.filter(menu => menu.tags.some(tag => categories[catName].includes(tag)))
      
      if (comandos.length) {
        let section = `╭━━〔 ${toBoldMono(catName)} 〕━━╮\n┃\n`
        // Usamos Set para evitar comandos duplicados en la lista
        let uniqueCommands = [...new Set(comandos.flatMap(menu => menu.help))]
        
        for (let cmd of uniqueCommands) {
          if (cmd) section += `┃ ${currentEmojis.bullet} ${_p}${cmd}\n`
        }
        
        section += `┃\n╰━━━━━━━━━━━━━━━━━━╯`
        menuSections.push(section)
      }
    }

    const fullText = menuSections.join("\n\n")
    const imageBuffer = getMenuImage()

    let header = { hasMediaAttachment: false }
    if (imageBuffer) {
        try {
            const media = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer })
            header = { hasMediaAttachment: true, imageMessage: media.imageMessage }
        } catch (e) { console.error(e) }
    }

    const interactiveMessage = proto.Message.InteractiveMessage.fromObject({
      body: { text: fullText },
      footer: { text: `${currentEmojis.bullet} 𝙺𝙰𝚁𝙱𝙾𝚃 𝚂𝚈𝚂𝚃𝙴𝙼 ${currentEmojis.bullet}` },
      header: header,
      nativeFlowMessage: {
        buttons: [{
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({ 
            display_text: `${currentEmojis.reacción} 𝙰𝚈𝚄𝙳𝙰`, 
            url: `https://wa.me/${KARBOT_CONFIG.OWNER_NUMBER}` 
          })
        }]
      }
    })

    const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid: conn.user.jid, quoted: m })
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

    // Registrar para depuración (opcional)
    console.log(`Menú enviado con emojis: ${currentEmojis.reacción}, ${currentEmojis.bullet}, ${currentEmojis.botTitle}, ${currentEmojis.infoTitle}`)

  } catch (e) {
    console.error(e)
    m.reply(`${getNextEmoji('BULLET')} Error al generar el menú.`)
  }
}

handler.command = /^(menu|help|ayuda)$/i
export default handler