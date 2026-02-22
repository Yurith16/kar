const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn, args }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  let amount
  if (args[0] === 'all') {
    amount = user.bank || 0
  } else {
    amount = parseInt(args[0])
  }

  const h = ["🍃", "🌿", "🍀", "🌱", "☘️"].getRandom()

  if (!amount || isNaN(amount) || amount <= 0) {
    return m.reply(`> ${h} *Atención financiera.* Indica la cantidad exacta a retirar.\n> 💡 *Uso:* .wd 100 o .wd all`)
  }

  if ((user.bank || 0) < amount) {
    return m.reply(`> ❌ *Fondos insuficientes, vida mía.* Tu cuenta bancaria no dispone de esa cantidad.`)
  }

  // Reacciones bancarias
  const reacciones = ['🏛️', '💰', '🏦', '💹', '💳']
  await m.react(reacciones.getRandom())

  // Operación
  user.bank -= amount
  user.coin = (user.coin || 0) + amount

  // Diseño KarBot
  let txt = `> ${h} *「 𝚁𝙴𝚃𝙸𝚁𝙾 𝙱𝙰𝙽𝙲𝙰𝚁𝙸𝙾 」* ${h}\n\n`
  txt += `> 📤 *Retirado:* » ${amount.toLocaleString()} 🪙\n`
  txt += `> 💳 *En Banco:* » ${user.bank.toLocaleString()} 🪙\n`
  txt += `> 💰 *En Cartera:* » ${user.coin.toLocaleString()} 🪙\n\n`
  txt += `> ✨ _Transacción completada con éxito. Gástalo con inteligencia._`

  // Envío seguro
  let messageOptions = { text: txt }
  if (global.rcanal && global.rcanal.contextInfo) {
      messageOptions.contextInfo = global.rcanal.contextInfo
  }

  await conn.sendMessage(m.chat, messageOptions, { quoted: m })
}

handler.help = ['retirar']
handler.tags = ['economy']
handler.command = ['wd', 'with', 'retirar', 'retall']
handler.register = true

module.exports = handler