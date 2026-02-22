const { checkReg } = require('../lib/checkReg.js')

const PECES = [
  { emoji: '🦐', nombre: 'Camarón', coins: 80 },
  { emoji: '🦀', nombre: 'Cangrejo', coins: 150 },
  { emoji: '🐠', nombre: 'Pez Tropical', coins: 200 },
  { emoji: '🐟', nombre: 'Pez Azul', coins: 250 },
  { emoji: '🐡', nombre: 'Pez Globo', coins: 400 },
  { emoji: '🦑', nombre: 'Calamar', coins: 550 },
  { emoji: '🐙', nombre: 'Pulpo', coins: 700 },
  { emoji: '🐢', nombre: 'Tortuga Marina', coins: 900 },
  { emoji: '🐬', nombre: 'Delfín', coins: 1500 },
  { emoji: '🦈', nombre: 'Tiburón Martillo', coins: 2200 },
  { emoji: '🐋', nombre: 'Ballena Jorobada', coins: 4500 },
  { emoji: '🐳', nombre: 'Ballena Azul', coins: 6000 },
  { emoji: '🧜‍♀️', nombre: 'Sirena Legendaria', coins: 10000 },
  { emoji: '🦞', nombre: 'Langosta', coins: 650 },
  { emoji: '🐚', nombre: 'Perla Negra', coins: 3000 },
  { emoji: '🔱', nombre: 'Tridente Oxidado', coins: 5000 },
  { emoji: '🪼', nombre: 'Medusa', coins: 300 },
  { emoji: '🦭', nombre: 'Foca', coins: 1200 },
  { emoji: '🐧', nombre: 'Pingüino', coins: 1000 },
  { emoji: '🚢', nombre: 'Tesoro Hundido', coins: 8000 }
]

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  // Cooldown de 10 minutos
  let cooldown = 600000 
  let time = (user.lastpesca || 0) + cooldown
  let h = ["🍃", "🌿", "🍀", "🌱", "☘️"].getRandom()

  if (new Date() - (user.lastpesca || 0) < cooldown) {
      await m.react('⏳')
      return m.reply(`> ⏳ *Aguas movidas, vida mía.* Espera un poco para volver a lanzar el anzuelo. Vuelve en: **${msToTime(time - new Date())}**`)
  }

  try {
    let cantidad = Math.floor(Math.random() * 4) + 1
    let capturas = []
    let totalCoins = 0
    let totalExp = 0

    for (let i = 0; i < cantidad; i++) {
      let pez = PECES.getRandom()
      let exp = Math.floor(Math.random() * 180) + 60
      capturas.push({ ...pez, exp })
      totalCoins += pez.coins
      totalExp += exp
    }

    const reacciones = ['🎣', '⚓', '🌊', '🛶', '🐠', '🐳', '🐡', '🐙', '🐚']
    await m.react(reacciones.getRandom())

    user.coin = (user.coin || 0) + totalCoins
    user.exp = (user.exp || 0) + totalExp
    user.lastpesca = new Date() * 1

    let txt = `> ${h} *「 𝚁𝙴𝙿𝙾𝚁𝚃𝙴 𝙳𝙴 𝙿𝙴𝚂𝙲𝙰 」* ${h}\n\n`

    capturas.forEach(p => {
      txt += `> ${p.emoji} *${p.nombre}* » +${p.coins} 🪙\n`
    })

    txt += `\n> 💰 *Total Ganado:* » ${totalCoins.toLocaleString()} 🪙\n`
    txt += `> ✨ *Total Exp:* » +${totalExp.toLocaleString()}\n\n`
    txt += `> 🌊 _¡Qué buena mano tienes con el anzuelo, tesoro!_`

    let messageOptions = { text: txt }
    if (global.rcanal && global.rcanal.contextInfo) {
        messageOptions.contextInfo = global.rcanal.contextInfo
    }

    await conn.sendMessage(m.chat, messageOptions, { quoted: m })

  } catch (error) {
    console.error(error)
    await m.react('❌')
    return m.reply(`> 🌪️ Hubo un error en las corrientes marinas. Inténtalo más tarde, cielo.`)
  }
}

handler.help = ['pescar']
handler.tags = ['economy']
handler.command = ['pescar', 'pesca', 'fish'] 
handler.register = true

function msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let seconds = Math.floor((duration / 1000) % 60)
    return `${minutes}m ${seconds}s`
}

module.exports = handler