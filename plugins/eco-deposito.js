import { checkReg } from '../lib/checkReg.js'

const HOJITAS = ['🌿', '🍃', '🍀', '🌱', '☘️']
const REACCIONES = ['🏛️', '💰', '🏦', '💹', '💳']

function getLeaf() { return HOJITAS[Math.floor(Math.random() * HOJITAS.length)] }
function getReact() { return REACCIONES[Math.floor(Math.random() * REACCIONES.length)] }

let handler = async (m, { conn, args }) => {
  let user = global.db.data.users[m.sender]
  if (await checkReg(m, user)) return

  let amount
  if (args[0] === 'all') {
    amount = user.coin
  } else {
    amount = parseInt(args[0])
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return m.reply(`> ${getLeaf()} *Ingresa una cantidad válida para depositar.*\n> Ejemplo: *.dep 100* o *.dep all*`)
  }

  if (user.coin < amount) {
    return m.reply(`> ❌ No tienes suficientes *Coins* para realizar este depósito.`)
  }

  await m.react(getReact())

  user.coin -= amount
  user.bank = (user.bank || 0) + amount

  let h = getLeaf()
  let txt = `${h} *DEPÓSITO BANCARIO* ${h}\n\n`
  txt += `> 🏛️ Depositado : ${amount.toLocaleString()} 🪙\n`
  txt += `> 💳 En cuenta : ${user.bank.toLocaleString()} 🪙\n`
  txt += `> 💰 Cartera : ${user.coin.toLocaleString()} 🪙`

  m.reply(txt)
}

handler.help = ['depositar']
handler.tags = ['economy']
handler.command = ['dep', 'depositar', 'depall']
handler.register = true

export default handler