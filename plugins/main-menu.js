const { existsSync, readFileSync } = require('fs')
const { join } = require('path')
const { prepareWAMessageMedia, generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys')
const { performance } = require('perf_hooks')

// Función para convertir texto a fuente de máquina de escribir (la que te gusta)
function toTypewriter(text) {
    const typewriter = {
        'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵', 'G': '𝙶', 'H': '𝙷', 'I': '𝙸', 'J': '𝙹', 'K': '𝙺', 'L': '𝙻', 'M': '𝙼', 'N': '𝙽', 'O': '𝙾', 'P': '𝙿', 'Q': '𝚀', 'R': '𝚁', 'S': '𝚂', 'T': '𝚃', 'U': '𝚄', 'V': '𝚅', 'W': '𝚆', 'X': '𝚇', 'Y': '𝚈', 'Z': '𝚉',
        'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝚏', 'g': '𝚐', 'h': '𝚑', 'i': '𝚒', 'j': '𝚓', 'k': '𝚔', 'l': '𝚕', 'm': '𝚖', 'n': '𝚗', 'o': '𝚘', 'p': '𝚙', 'q': '𝚚', 'r': '𝚛', 's': '𝚜', 't': '𝚝', 'u': '𝚞', 'v': '𝚟', 'w': '𝚠', 'x': '𝚡', 'y': '𝚢', 'z': '𝚣',
        '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺', '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿'
    }
    return text.split('').map(char => typewriter[char] || char).join('')
}

function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
}

function getMenuImage() {
    const path = join(process.cwd(), 'src', 'Images', 'menu.png')
    if (existsSync(path)) return readFileSync(path)
    return null
}

let handler = async (m, { conn, usedPrefix: _p }) => {
    try {
        // Usamos los emojis y nombres aleatorios definidos en global (main-allfake)
        const emji = global.iconos ? "🍃" : "🌿" // Fallback por si acaso
        const bName = global.textbot || "𝙺𝙰𝚁𝙱𝙾𝚃"

        // Reacción aleatoria con los emojis de naturaleza
        const emjisMenu = ["🍃", "🌿", "🍀", "☘️", "🌱", "🌾", "🌸", "🌺"]
        await m.react(emjisMenu.getRandom())

        let help = Object.values(global.plugins).filter(p => !p.disabled).map(p => ({
            help: Array.isArray(p.help) ? p.help : p.help ? [p.help] : [],
            tags: Array.isArray(p.tags) ? p.tags : p.tags ? [p.tags] : [],
        }))

        const categories = {
            '𝙼𝙴𝙽𝚄 𝙿𝙴𝚁𝚂𝙾𝙽𝙰𝙻': ['main', 'info'],
            '𝚂𝚃𝙰𝚁 𝙿𝚁𝙴𝙼𝙸𝚄𝙼': ['premium', 'luxury'],
            '𝙸𝙽𝚃𝙴𝙻𝙸𝙶𝙴𝙽𝙲𝙸𝙰': ['ia', 'bots'],
            '𝙴𝙲𝙾𝙽𝙾𝙼𝙸𝙰': ['economy', 'rpg'],
            '𝙹𝚄𝙴𝙶𝙾𝚂': ['game', 'juegos'],
            '𝙶𝚁𝚄𝙿𝙾𝚂': ['group'],
            '𝙳𝙴𝚂𝙲𝙰𝚁𝙶𝙰𝚂': ['downloader', 'media'],
            '𝙼𝚄𝙻𝚃𝙸𝙼𝙴𝙳𝙸𝙰': ['sticker', 'audio'],
            '🔞 𝙽𝚂𝙵𝚆 🔞': ['nsfw', 'NSFW'],
            '𝚃𝙾𝙾𝙻𝚂': ['tools'],
            '𝙱𝚄𝚂𝚀𝚄𝙴𝙳𝙰': ['search'],
            '𝙾𝚆𝙽𝙴𝚁': ['owner'],
        }

        const username = m.pushName || "𝚄𝚜𝚞𝚊𝚛𝚒𝚘"
        const uptime = clockString(process.uptime() * 1000)
        let menuSections = []

        // Encabezado Principal
        menuSections.push(`╭━━〔 ${toTypewriter(bName)} 〕━━⬣\n┃\n┃ ⚘ ${toTypewriter("Hola")}: » ${username}\n┃ ⚘ ${toTypewriter("Fecha")}: » ${global.fecha}\n┃ ⚘ ${toTypewriter("Tiempo")}: » ${global.tiempo}\n┃\n╰━━━━━━━━━━━━━━━━━━⬣`)

        // Info del Bot
        menuSections.push(`╭━━〔 ${toTypewriter("𝚂𝚃𝙰𝚃𝚂 𝙱𝙾𝚃")} 〕━━⬣\n┃\n┃ ⚘ ${toTypewriter("Creador")}: » ${global.author}\n┃ ⚘ ${toTypewriter("Actividad")}: » ${uptime}\n┃ ⚘ ${toTypewriter("Moneda")}: » ${global.moneda}\n┃\n╰━━━━━━━━━━━━━━━━━━⬣`)

        // Construcción de Categorías
        for (let catName in categories) {
            let comandos = help.filter(menu => menu.tags.some(tag => categories[catName].includes(tag)))
            if (comandos.length) {
                let section = `╭━━〔 ${catName} 〕━━⬣\n┃\n`
                let uniqueCommands = [...new Set(comandos.flatMap(menu => menu.help))]
                for (let cmd of uniqueCommands) {
                    if (cmd) section += `┃ 🍀 ${_p}${cmd}\n`
                }
                section += `┃\n╰━━━━━━━━━━━━━━━━━━⬣`
                menuSections.push(section)
            }
        }

        const fullText = menuSections.join("\n\n")
        const imageBuffer = getMenuImage()

        // Usamos la configuración de rcanal definida en main-allfake para los botones
        let header = { hasMediaAttachment: false }
        if (imageBuffer) {
            const media = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer })
            header = { hasMediaAttachment: true, imageMessage: media.imageMessage }
        }

        const interactiveMessage = proto.Message.InteractiveMessage.fromObject({
            body: { text: fullText },
            footer: { text: global.wm3 }, // Usa el diseño de tréboles de main-allfake
            header: header,
            nativeFlowMessage: {
                buttons: [
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({ 
                            display_text: `✨ 𝚂𝚘𝚙𝚘𝚛𝚝𝚎 ✨`, 
                            url: `https://wa.me/50496926150` 
                        })
                    },
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({ 
                            display_text: `☘️ 𝙶𝚛𝚞𝚙𝚘 𝙾𝚏𝚒𝚌𝚒𝚊𝚕 ☘️`, 
                            url: `https://chat.whatsapp.com/K2cIBxrPhPF1WLpLBhEIN0` 
                        })
                    }
                ]
            }
        })

        const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid: conn.user.jid, quoted: m })
        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

    } catch (e) {
        console.error(e)
        m.reply(`🍃 Error al generar el menú, corazón.`)
    }
}

handler.command = /^(menu|help|ayuda)$/i
module.exports = handler