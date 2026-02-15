const { checkReg } = require('../lib/checkReg.js')

const HOJITAS = ['🌿', '🍃', '🍀', '🌱', '☘️']
const REACCIONES = ['🏛️', '💰', '🏦', '💹', '💳', '✨', '⚡', '🔥']

function getLeaf() { return HOJITAS[Math.floor(Math.random() * HOJITAS.length)] }
function getReact() { return REACCIONES[Math.floor(Math.random() * REACCIONES.length)] }

let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender]
    
    // Verificación de registro rápida
    if (await checkReg(m, user)) return

    // Reacción inmediata
    m.react(getReact())

    let h = getLeaf()
    let cartera = (user.coin || 0)
    let banco = (user.bank || 0)
    let total = cartera + banco

    let txt = `${h} *BALANCE TOTAL* ${h}\n\n`
    txt += `> 💰 Cartera : ${cartera.toLocaleString()} 🪙\n`
    txt += `> 🏛️ Banco : ${banco.toLocaleString()} 🪙\n`
    txt += `> ✨ Total : ${total.toLocaleString()} 🪙\n\n`
    txt += `> 💎 Diamond : ${(user.diamond || 0).toLocaleString()}\n`
    txt += `> 🔥 HotPass : ${(user.hotpass || 0).toLocaleString()}`

    // Envío sin esperas innecesarias
    m.reply(txt)
}

handler.help = ['bal', 'balance']
handler.tags = ['economy']
handler.command = ['bal', 'balance']
handler.register = true

module.exports = handler