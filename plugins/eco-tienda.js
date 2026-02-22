const { checkReg } = require('../lib/checkReg.js')

// CONFIGURACIÓN DE PRECIOS AJUSTADA (MÁS JUSTA)
const PRECIO_DIAMANTE = 5000 
const PRECIO_HOTPASS_COIN = 50000
const PRECIO_HOTPASS_DMD = 20
const PRECIO_PICO = 2000
const PRECIO_AGUA = 1000
const PRECIO_MEDICINA = 3500

let handler = async (m, { conn, usedPrefix, command, args }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  const reacciones = ['🛒', '🛍️', '📦', '💰', '🏷️']
  let h = ["🍃", "🌿", "🍀", "🌱", "☘️"].getRandom()
  let type = (args[0] || '').toLowerCase()

  // --- VISTA DE LA TIENDA ---
  if (!type || !['diamond', 'hotpass', 'pico', 'agua', 'medicina'].includes(type)) {
    let txt = `> ${h} *「 𝙺𝙰𝚁𝙱𝙾𝚃 𝚂𝚃𝙾𝚁𝙴 」* ${h}\n\n`
    txt += `> 💎 *Diamond:* » ${PRECIO_DIAMANTE.toLocaleString()} 🪙\n`
    txt += `> 🎫 *HotPass:* » ${PRECIO_HOTPASS_COIN.toLocaleString()} 🪙\n`
    txt += `> 🎫 *HotPass:* » ${PRECIO_HOTPASS_DMD} 💎\n\n`
    txt += `> ⚒️ *「 𝚂𝚄𝙼𝙸𝙽𝙸𝚂𝚃𝚁𝙾𝚂 𝙼𝙸𝙽𝙴𝚁𝙾𝚂 」*\n\n`
    txt += `> ⛏️ *Pico:* » ${PRECIO_PICO.toLocaleString()} 🪙\n`
    txt += `> 💧 *Agua:* » ${PRECIO_AGUA.toLocaleString()} 🪙\n`
    txt += `> 💊 *Medicina:* » ${PRECIO_MEDICINA.toLocaleString()} 🪙\n\n`
    txt += `*𝚄𝚂𝙾 𝙳𝙴 𝙲𝙾𝙼𝙿𝚁𝙰*\n`
    txt += `> ${usedPrefix + command} [item] [cantidad]\n`
    txt += `> _Ejemplo: ${usedPrefix + command} pico 5_`

    return m.reply(txt)
  }

  await m.react(reacciones.getRandom())

  // FUNCIÓN PARA COBRO AUTOMÁTICO (CARTERA + BANCO)
  const cobrar = (total) => {
    let totalDisponible = (user.coin || 0) + (user.bank || 0)
    if (totalDisponible < total) return false
    if (user.coin >= total) {
      user.coin -= total
    } else {
      let faltante = total - user.coin
      user.coin = 0
      user.bank -= faltante
    }
    return true
  }

  let count = args[1] === 'all' ? 0 : parseInt(args[1])
  if (type !== 'hotpass' && (args[1] !== 'all' && (isNaN(count) || count <= 0))) return m.reply(`> ${h} Indica una cantidad válida, tesoro.`)

  // --- LÓGICA DE COMPRAS ---
  let itemFinal = ''
  let gasto = 0
  let monedaGasto = '🪙'

  if (type === 'diamond') {
    let all = Math.floor(((user.coin || 0) + (user.bank || 0)) / PRECIO_DIAMANTE)
    count = args[1] === 'all' ? all : count
    gasto = PRECIO_DIAMANTE * count
    if (!cobrar(gasto)) return m.reply(`> ❌ No tienes suficiente fortuna para tanto brillo.`)
    user.diamond = (user.diamond || 0) + count
    itemFinal = 'Diamond'
  } 

  else if (type === 'hotpass') {
    let isDmd = args[1] === 'dmd' || args[1] === 'diamante'
    let countArg = isDmd ? args[2] : args[1]
    if (isDmd) {
      let all = Math.floor((user.diamond || 0) / PRECIO_HOTPASS_DMD)
      count = countArg === 'all' ? all : parseInt(countArg)
      gasto = PRECIO_HOTPASS_DMD * count
      if ((user.diamond || 0) < gasto) return m.reply(`> ❌ Te faltan diamantes para este placer.`)
      user.diamond -= gasto
      monedaGasto = '💎'
    } else {
      let all = Math.floor(((user.coin || 0) + (user.bank || 0)) / PRECIO_HOTPASS_COIN)
      count = countArg === 'all' ? all : parseInt(countArg)
      gasto = PRECIO_HOTPASS_COIN * count
      if (!cobrar(gasto)) return m.reply(`> ❌ No te alcanza para el pase, corazón.`)
    }
    user.hotpass = (user.hotpass || 0) + count
    itemFinal = 'HotPass'
  }

  else if (type === 'pico') {
    gasto = PRECIO_PICO * count
    if (!cobrar(gasto)) return m.reply(`> ❌ Necesitas más monedas para esta herramienta.`)
    user.pico = (user.pico || 0) + count
    itemFinal = 'Pico'
  }

  else if (type === 'agua') {
    gasto = PRECIO_AGUA * count
    if (!cobrar(gasto)) return m.reply(`> ❌ Ni para el agua te alcanza... qué drama.`)
    user.agua = (user.agua || 0) + count
    itemFinal = 'Agua'
  }

  else if (type === 'medicina') {
    gasto = PRECIO_MEDICINA * count
    if (!cobrar(gasto)) return m.reply(`> ❌ La salud es importante, y no tienes con qué pagar.`)
    user.medicina = (user.medicina || 0) + count
    itemFinal = 'Medicina'
  }

  // --- FACTURA FINAL ---
  let txtFactura = `> ${h} *「 𝙵𝙰𝙲𝚃𝚄𝚁𝙰 𝙳𝙴 𝙲𝙾𝙼𝙿𝚁𝙰 」*\n\n`
  txtFactura += `> 📦 *Item:* » ${itemFinal}\n`
  txtFactura += `> 🔢 *Cant:* » ${count.toLocaleString()}\n`
  txtFactura += `> 💰 *Gasto:* » -${gasto.toLocaleString()} ${monedaGasto}\n\n`
  txtFactura += `> _Firma: KarBot_ 🫦`

  let messageOptions = { text: txtFactura }
  if (global.rcanal && global.rcanal.contextInfo) {
      messageOptions.contextInfo = global.rcanal.contextInfo
  }

  await conn.sendMessage(m.chat, messageOptions, { quoted: m })
}

handler.help = ['buy', 'tienda']
handler.tags = ['economy']
handler.command = ['buy', 'comprar', 'tienda']
handler.register = true

module.exports = handler