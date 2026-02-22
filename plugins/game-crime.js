const { checkReg } = require('../lib/checkReg.js')

// 30 Acciones de crimen de alto riesgo
const CRIMENES = [
  'Asaltaste el museo nacional con un equipo de élite',
  'Entraste a robar a la bóveda del banco central',
  'Secuestraste a un empresario millonario en su yate',
  'Hackeaste las cuentas de un magnate tecnológico',
  'Robaste un prototipo de auto deportivo de lujo',
  'Extorsionaste a un político corrupto con fotos prohibidas',
  'Asaltaste un camión de caudales en plena autopista',
  'Secuestraste a un heredero por un rescate millonario',
  'Entraste a una mansión en Beverly Hills y vaciaste la caja fuerte',
  'Arrebataste un maletín lleno de diamantes en el aeropuerto',
  'Asaltaste una joyería de la quinta avenida',
  'Secuestraste a un periodista que sabía demasiado',
  'Entraste a robar a un almacén de armas ilegales',
  'Burlaste la seguridad de un bunker privado',
  'Extorsionaste a una familia adinerada de la ciudad',
  'Asaltaste un casino clandestino de alta alcurnia',
  'Secuestraste a un modelo famoso en medio de una pasarela',
  'Entraste a una catedral y robaste las reliquias de oro',
  'Asaltaste una gasolinera de madrugada para lavar dinero',
  'Secuestraste a un rival de la mafia italiana',
  'Robaste un cargamento de oro en el puerto',
  'Interceptaste una transferencia bancaria internacional',
  'Vaciaste las cuentas de una organización fantasma',
  'Robaste una obra de arte valuada en millones',
  'Saboteaste una subasta de antigüedades para robar el botín',
  'Asaltaste un club privado de apuestas ilegales',
  'Secuestraste al contador de un cartel rival',
  'Robaste un helicóptero privado para un cliente anónimo',
  'Extorsionaste al jefe de seguridad de una multinacional',
  'Realizaste un atraco perfecto en una convención de relojes'
]

const BOTIN = [
  { emoji: '💰', nombre: 'Bolsas de Dinero', coins: 4000 },
  { emoji: '💎', nombre: 'Diamante Azul', diamonds: 3 },
  { emoji: '💵', nombre: 'Fajos de Billetes', coins: 5500 },
  { emoji: '👑', nombre: 'Reliquia de Oro', coins: 7000 },
  { emoji: '🎫', nombre: 'HotPass', hotpass: 1 },
  { emoji: '💍', nombre: 'Anillo de Diamante', diamonds: 5 }
]

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  let cooldown = 300000 
  let time = (user.lastcrime || 0) + cooldown
  let h = ["🍃", "🌿", "🍀", "🌱", "☘️"].getRandom()

  if (new Date() - (user.lastcrime || 0) < cooldown) {
      await m.react('⏳')
      return m.reply(`> ⏳ *Escóndete, vida mía.* La policía vigila la zona. Vuelve en: **${msToTime(time - new Date())}**`)
  }

  try {
    // 60% de probabilidad de éxito
    let exito = Math.random() > 0.4
    const reacciones = ['🎭', '🔫', '💣', '💵', '🧤', '🚨', '⛓️']
    await m.react(reacciones.getRandom())

    if (exito) {
      let accion = CRIMENES.getRandom()
      let cantidadBotin = Math.floor(Math.random() * 2) + 1
      let hallazgos = []
      let totalCoins = 0
      let totalDiamonds = 0
      let totalHotpass = 0
      let totalExp = Math.floor(Math.random() * 800) + 400

      for (let i = 0; i < cantidadBotin; i++) {
        let objeto = BOTIN.getRandom()
        hallazgos.push(objeto)
        if (objeto.coins) totalCoins += objeto.coins
        if (objeto.diamonds) totalDiamonds += objeto.diamonds
        if (objeto.hotpass) totalHotpass += objeto.hotpass
      }

      user.coin = (user.coin || 0) + totalCoins
      user.diamond = (user.diamond || 0) + totalDiamonds
      user.hotpass = (user.hotpass || 0) + totalHotpass
      user.exp = (user.exp || 0) + totalExp
      user.lastcrime = new Date() * 1

      let txt = `> ${h} *「 𝚁𝙴𝙿𝙾𝚁𝚃𝙴 𝙳𝙴𝙻 𝙲𝚁𝙸𝙼𝙴𝙽 」* ${h}\n\n`
      txt += `> 🕶️ *Acción:* » ${accion}\n\n`
      txt += `> 📦 *Botín obtenido:* \n`

      hallazgos.forEach(p => {
        txt += `> • ${p.emoji} ${p.nombre} » ${p.coins ? p.coins + ' 🪙' : p.diamonds ? p.diamonds + ' 💎' : p.hotpass + ' 🎫'}\n`
      })

      txt += `\n> 💰 *Total Coins:* » +${totalCoins.toLocaleString()}\n`
      if (totalDiamonds > 0) txt += `> 💎 *Total Diamonds:* » +${totalDiamonds}\n`
      if (totalHotpass > 0) txt += `> 🎫 *Total HotPass:* » +${totalHotpass}\n`
      txt += `> ✨ *Total Exp:* » +${totalExp.toLocaleString()}\n\n`
      txt += `> 💋 _Tu audacia es excitante... el bajo mundo ahora te respeta._`

      let messageOptions = { text: txt }
      if (global.rcanal?.contextInfo) messageOptions.contextInfo = global.rcanal.contextInfo

      await conn.sendMessage(m.chat, messageOptions, { quoted: m })
      await m.react('✅')

    } else {
      let perdida = Math.floor(Math.random() * 1500) + 800
      user.coin = Math.max(0, (user.coin || 0) - perdida)
      user.lastcrime = new Date() * 1
      await m.react('🚨')
      m.reply(`> 🚨 *¡Te atraparon, tesoro!* El plan falló y tuviste que pagar una fianza de *${perdida.toLocaleString()} coins*.`)
    }

  } catch (error) {
    console.error(error)
    await m.react('❌')
    return m.reply(`> 🌪️ Hubo un error técnico en el asalto. Nadie fue arrestado esta vez.`)
  }
}

handler.help = ['crime']
handler.tags = ['economy']
handler.command = ['crime', 'crimen', 'robar'] 
handler.register = true

function msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let seconds = Math.floor((duration / 1000) % 60)
    return `${minutes}m ${seconds}s`
}

module.exports = handler