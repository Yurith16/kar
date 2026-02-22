const { checkReg } = require('../lib/checkReg.js')

const ANIMALES = [
  { emoji: '🐁', nombre: 'Ratón', coins: 50 },
  { emoji: '🐇', nombre: 'Conejo', coins: 120 },
  { emoji: '🐿️', nombre: 'Ardilla', coins: 150 },
  { emoji: '🦆', nombre: 'Pato', coins: 200 },
  { emoji: '🐍', nombre: 'Serpiente', coins: 350 },
  { emoji: '🦊', nombre: 'Zorro', coins: 400 },
  { emoji: '🦌', nombre: 'Ciervo', coins: 500 },
  { emoji: '🐗', nombre: 'Jabalí', coins: 600 },
  { emoji: '🐺', nombre: 'Lobo', coins: 750 },
  { emoji: '🦅', nombre: 'Águila', coins: 850 },
  { emoji: '🦍', nombre: 'Gorila', coins: 1000 },
  { emoji: '🐆', nombre: 'Leopardo', coins: 1200 },
  { emoji: '🐅', nombre: 'Tigre', coins: 1500 },
  { emoji: '🦁', nombre: 'León', coins: 1800 },
  { emoji: '🐊', nombre: 'Cocodrilo', coins: 2100 },
  { emoji: '🐃', nombre: 'Búfalo', coins: 2300 },
  { emoji: '🐘', nombre: 'Elefante', coins: 2800 },
  { emoji: '🦏', nombre: 'Rinoceronte', coins: 3200 },
  { emoji: '🦈', nombre: 'Tiburón', coins: 3500 },
  { emoji: '🐋', nombre: 'Ballena', coins: 5000 },
  { emoji: '🦓', nombre: 'Zebra', coins: 450 },
  { emoji: '🦒', nombre: 'Jirafa', coins: 1300 },
  { emoji: '🦛', nombre: 'Hipopótamo', coins: 2400 },
  { emoji: '🐻', nombre: 'Oso', coins: 1100 },
  { emoji: '🐼', nombre: 'Panda', coins: 900 },
  { emoji: '🦘', nombre: 'Canguro', coins: 550 }
]

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  let cooldown = 600000 
  let time = (user.lastcaza || 0) + cooldown
  let h = ["🍃", "🌿", "🍀", "🌱", "☘️"].getRandom()

  if (new Date() - (user.lastcaza || 0) < cooldown) {
      await m.react('⏳')
      return m.reply(`> ⏳ *Expedición en pausa.* Estás rastreando nuevas presas. Vuelve en: **${msToTime(time - new Date())}**`)
  }

  try {
    let cantidad = Math.floor(Math.random() * 4) + 1
    let presasCazadas = []
    let totalCoins = 0
    let totalExp = 0

    for (let i = 0; i < cantidad; i++) {
      let animal = ANIMALES.getRandom()
      let exp = Math.floor(Math.random() * 150) + 50
      presasCazadas.push({ ...animal, exp })
      totalCoins += animal.coins
      totalExp += exp
    }

    const reacciones = ['🏹', '🦊', '🦅', '🐗', '🦁', '🐅', '🐊', '🦈', '🐍', '🐘']
    await m.react(reacciones.getRandom())

    user.coin = (user.coin || 0) + totalCoins
    user.exp = (user.exp || 0) + totalExp
    user.lastcaza = new Date() * 1

    let txt = `> ${h} *「 𝚁𝙴𝙿𝙾𝚁𝚃𝙴 𝙳𝙴 𝙲𝙰𝙲𝙴𝚁𝙸𝙰 」* ${h}\n\n`

    presasCazadas.forEach(p => {
      txt += `> ${p.emoji} *${p.nombre}* » +${p.coins} 🪙\n`
    })

    txt += `\n> 💰 *Total Ganado:* » ${totalCoins.toLocaleString()} 🪙\n`
    txt += `> ✨ *Total Exp:* » +${totalExp.toLocaleString()}\n\n`
    txt += `> 💋 _Tu puntería es excitante... has dominado la naturaleza._`

    let messageOptions = { text: txt }
    if (global.rcanal && global.rcanal.contextInfo) {
        messageOptions.contextInfo = global.rcanal.contextInfo
    }

    await conn.sendMessage(m.chat, messageOptions, { quoted: m })

  } catch (error) {
    console.error(error)
    await m.react('❌')
    return m.reply(`> 🌪️ Hubo un error en la jungla y las presas escaparon. Inténtalo de nuevo, vida mía.`)
  }
}

handler.help = ['cazar']
handler.tags = ['economy']
handler.command = ['cazar', 'caza', 'hunt'] 
handler.register = true

function msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let seconds = Math.floor((duration / 1000) % 60)
    return `${minutes}m ${seconds}s`
}

module.exports = handler