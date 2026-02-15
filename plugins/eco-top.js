const { areJidsSameUser } = require('@whiskeysockets/baileys')

const HOJITAS = ['🌿', '🍃', '🍀', '🌱', '☘️']
const REACCIONES = ['🏆', '✨', '🥇', '💰', '👑']

function getLeaf() { return HOJITAS[Math.floor(Math.random() * HOJITAS.length)] }
function getReact() { return REACCIONES[Math.floor(Math.random() * REACCIONES.length)] }

let handler = async (m, { conn, args, participants }) => {
  // Filtramos estrictamente a los usuarios registrados
  let users = Object.entries(global.db.data.users)
    .filter(([_, value]) => value.registered === true) 
    .map(([key, value]) => {
      let totalCoin = (value.coin || 0) + (value.bank || 0)
      return {...value, jid: key, totalCoin}
    })

  // Ordenar por balance total
  let sortedCoin = users.sort((a, b) => b.totalCoin - a.totalCoin)
  
  // Mostrar 15 puestos por defecto
  let len = 15
  let h = getLeaf()
  await m.react(getReact())

  let text = `${h} *TOP RIQUEZA KARBOT* ${h}\n\n`
  
  let userIndex = sortedCoin.findIndex(u => u.jid === m.sender)
  text += `> *Tu puesto:* ${userIndex !== -1 ? userIndex + 1 : 'Sin registro'} de ${users.length}\n\n`

  text += sortedCoin.slice(0, len).map((u, i) => {
    let id = u.jid.split`@`[0]
    // Usar registeredName si existe, si no usar el nombre de WhatsApp
    let name = u.registeredName || (participants.some(p => areJidsSameUser(u.jid, p.id)) ? conn.getName(u.jid) : id)
    
    let res = `*${i + 1}.*\n`
    res += `▢ ${name}\n`
    res += `> *ID:* ${id}\n`
    res += `> *Nivel:* ${u.level || 0}\n`
    res += `> *Balance:* ${u.totalCoin.toLocaleString()} 🪙\n`
    res += `> *Diamantes:* ${(u.diamond || 0).toLocaleString()} 💎`
    return res
  }).join('\n\n')

  conn.reply(m.chat, text, m, {
    mentions: sortedCoin.slice(0, len).map(u => u.jid).filter(v => !participants.some(p => areJidsSameUser(v, p.id)))
  })
}

handler.help = ['top']
handler.tags = ['economy']
handler.command = ['top', 'leaderboard', 'lb']
handler.register = true

module.exports = handler