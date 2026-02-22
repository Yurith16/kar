const { existsSync, readFileSync } = require('fs')
const { join } = require('path')
const { xpRange } = require('../lib/levelling.js')
const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn, usedPrefix }) => {
  let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
  let user = global.db.data.users[who]

  if (await checkReg(m, user)) return

  // --- DATOS BÁSICOS ---
  let nameHandle = user.registeredName || user.name || conn.getName(who)
  let { min, max, xp } = xpRange(user.level || 0, global.multiplier || 1)
  let progreso = Math.max(0, Math.min(100, (((user.exp || 0) - min) / xp) * 100))
  let fortunaTotal = (user.coin || 0) + (user.bank || 0)
  let rango = obtenerRango(user.level || 0, fortunaTotal)
  let sn = user.registered ? '✅' : '❎'

  // --- GESTIÓN DE IMAGEN ---
  let pp;
  const userId = who.split('@')[0]
  const pathCustom = join(process.cwd(), 'src', 'Images', 'perfiles', `${userId}.png`)
  const defaultImg = 'https://image2url.com/r2/default/images/1768770939921-aafe9b1c-929f-426f-9282-0a6105dbc62f.jpg'

  if (existsSync(pathCustom)) {
      pp = readFileSync(pathCustom) 
  } else {
      try {
          let url = await conn.profilePictureUrl(who, 'image').catch(_ => null)
          pp = url ? { url } : { url: defaultImg }
      } catch (e) { 
          pp = { url: defaultImg } 
      }
  }

  await m.react('💎')

  // --- CONSTRUCCIÓN ESTILO KARBOT CON FUENTE ESPECIAL ---
  let txt = `> 👤 *「 𝙿𝙴𝚁𝙵𝙸𝙻 𝙳𝙴 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 」*\n\n`
  txt += `> 🌿 *🔖 Nombre:* » ${nameHandle}\n`
  txt += `> 🌿 *📱 Número:* » ${userId}\n`
  txt += `> 🌿 *📍 Edad:* » ${user.age || 'No definida'}\n`
  txt += `> 🌿 *🧬 Género:* » ${user.genre || 'No definido'}\n`
  txt += `> 🌿 *💍 Estado:* » ${user.marry ? 'Casado(a) con ' + (global.db.data.users[user.marry]?.name || 'alguien') : 'Soltero(a)'}\n\n`

  txt += `> 💎 *「 𝙴𝙲𝙾𝙽𝙾𝙼𝙸́𝙰 𝚈 𝚂𝚃𝙰𝚃𝚂 」*\n\n`
  txt += `> 🍀 *⚠️ Warns:* » ${user.warn || 0}/5\n`
  txt += `> 🍀 *🪙 Monedas:* » ${(user.coin || 0).toLocaleString()}\n`
  txt += `> 🍀 *🏛️ Banco:* » ${(user.bank || 0).toLocaleString()}\n`
  txt += `> 🍀 *💎 Diamonds:* » ${(user.diamond || 0).toLocaleString()}\n`
  txt += `> 🍀 *🎫 HotPass:* » ${(user.hotpass || 0).toLocaleString()}\n\n`

  txt += `> 🆙 *「 𝙿𝚁𝙾𝙶𝚁𝙴𝚂𝙾 」*\n\n`
  txt += `> ⚘ *Nivel:* » ${user.level || 0}\n`
  txt += `> ⚘ *XP:* » ${user.exp || 0} (${progreso.toFixed(1)}%)\n`
  txt += `> ⚘ *Rango:* » ${rango}\n\n`

  txt += `> ✨ *「 𝙸𝙽𝙵𝙾 𝙰𝙳𝙸𝙲𝙸𝙾𝙽𝙰𝙻 」*\n\n`
  txt += `> 🌼 *Racha Juego:* » ${user.racha || 0} victorias\n`
  txt += `> 🌼 *Registro:* » ${sn}\n`
  txt += `> 🌼 *Élite:* » ${user.premium ? '✅' : '❎'}\n\n`
  txt += `> ⚙️ *𝙺𝙰𝚁 𝚂𝙸𝚂𝚃𝙴𝙼𝙰 𝙳𝚄𝙰𝙻*`

  await conn.sendMessage(m.chat, { 
      image: pp instanceof Buffer ? pp : { url: pp.url }, 
      caption: txt,
      mentions: [who]
  }, { quoted: m })
}

function obtenerRango(lvl, fortuna) {
    if (fortuna >= 50000000) return "🏦 Deidad Financiera"
    if (fortuna >= 10000000) return "👑 Magnate"
    if (fortuna >= 1000000) return "🏛️ Capitalista"
    const rangos = [
        { min: 0, max: 10, name: '🌱 Novato' }, { min: 11, max: 30, name: '⚔️ Guerrero' },
        { min: 31, max: 60, name: '🛡️ Caballero' }, { min: 61, max: 100, name: '🎖️ Veterano' },
        { min: 101, max: 200, name: '🔥 Maestro' }, { min: 201, max: 500, name: '🐉 Épico' },
        { min: 501, max: 1000, name: '👑 Leyenda' }
    ]
    const encontrado = rangos.find(r => lvl >= r.min && lvl <= r.max)
    return encontrado ? encontrado.name : '🐉 Dragón Rey Estrella'
}

handler.help = ['profile']
handler.tags = ['main']
handler.command = /^(perfil|profile|me|pf)$/i
handler.register = true

module.exports = handler