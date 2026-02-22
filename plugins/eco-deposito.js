const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn, args }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  // Emojis y lógica de Karbot
  const HOJITAS = ['🌿', '🍃', '🍀', '🌱', '☘️']
  const REACCIONES_EXITO = ['🏛️', '💰', '🏦', '💹', '💳', '✨']
  const REACCIONES_ADVERTENCIA = ['🔥', '⚡', '🌪️', '🤨', '🤌', '💨']

  const getLeaf = () => HOJITAS.getRandom()
  const getReact = (type) => type === 'success' ? REACCIONES_EXITO.getRandom() : REACCIONES_ADVERTENCIA.getRandom()

  let amount = args[0] === 'all' ? user.coin : parseInt(args[0])

  // Validación de cantidad
  if (!amount || isNaN(amount) || amount <= 0) {
    await m.react(getReact('warn'))
    return m.reply(`> ${getLeaf()} *Vaya drama, cielo... ingresa una cantidad real.*\n> 💡 Ejemplo: *.dep 100* o *.dep all*`)
  }

  if (user.coin < amount) {
    await m.react(getReact('warn'))
    return m.reply(`> ⚡ *Cariño, no tienes tantos Kryons en la cartera para este depósito.*`)
  }

  // Éxito en la transacción
  await m.react(getReact('success'))

  let interest = Math.floor(amount * 0.05)
  let amountToBank = amount - interest

  user.coin -= amount
  user.bank = (user.bank || 0) + amountToBank

  let h = getLeaf()
  let txt = `> ${h} *「 𝙳𝙴𝙿𝙾𝚂𝙸𝚃𝙾 𝙱𝙰𝙽𝙲𝙰𝚁𝙸𝙾 」* ${h}\n\n`
  txt += `> 🏛️ *Depositado:* » ${amount.toLocaleString()} 🪙\n`
  txt += `> 💸 *Interés (5%):* » -${interest.toLocaleString()} 🪙\n`
  txt += `> 💳 *En cuenta:* » ${user.bank.toLocaleString()} 🪙\n`
  txt += `> 💰 *En cartera:* » ${user.coin.toLocaleString()} 🪙\n\n`
  txt += `> ⚙️ *𝙺𝙰𝚁 𝚂𝙸𝚂𝚃𝙴𝙼𝙰 𝙳𝚄𝙰𝙻*`

  // --- ENVIAR CON DISEÑO SEGURO ---
  let messageOptions = { text: txt }
  if (global.rcanal && global.rcanal.contextInfo) {
      messageOptions.contextInfo = global.rcanal.contextInfo
  }

  await conn.sendMessage(m.chat, messageOptions, { quoted: m })
}

handler.help = ['dep', 'deposit']
handler.tags = ['economy']
handler.command = /^(dep|deposit|depositar)$/i
handler.register = true

module.exports = handler