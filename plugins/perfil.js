import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { premiumStyles } from '../lib/styles.js'
import { xpRange } from '../lib/levelling.js'
import { checkReg } from '../lib/checkReg.js'

let handler = async (m, { conn, usedPrefix }) => {
  if (!m) return

  let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
  let user = global.db.data.users[who]

  if (await checkReg(m, user)) return

  // --- LÓGICA DE FILTRADO ---
  const esValido = (dato) => {
    if (!dato) return false
    let d = dato.toString().toLowerCase().trim()
    return d !== 'no definido' && d !== 'undefined' && d !== 'null' && d !== ''
  }

  let nameHandle = user.registeredName || user.name || conn.getName(who)
  const { min, max, xp } = xpRange(user.level || 0, global.multiplier || 1)
  const progreso = Math.max(0, Math.min(100, (((user.exp || 0) - min) / xp) * 100))

  // Solo aparece el diseño del perfil si el usuario es PREMIUM (Instrucción guardada)
  let s = user.premium ? (premiumStyles[user.prefStyle] || premiumStyles["luxury"]) : null

  let fortunaTotal = (user.coin || 0) + (user.bank || 0)
  let rango = obtenerRango(user.level || 0, fortunaTotal)
  let poderTotal = Math.round(((user.level || 0) * 50) + (Math.log10(fortunaTotal + 1) * 100))

  // Lógica de Imagen
  let pp;
  const pathCustom = join(process.cwd(), 'src', 'Images', 'perfiles', `${who.split('@')[0]}.png`)
  if (existsSync(pathCustom)) {
      try { pp = readFileSync(pathCustom) } catch { pp = { url: 'https://files.catbox.moe/xr2m6u.jpg' } }
  } else {
      try {
          let url = await conn.profilePictureUrl(who, 'image').catch(_ => null)
          pp = url ? { url } : { url: 'https://files.catbox.moe/xr2m6u.jpg' }
      } catch (e) { pp = { url: 'https://files.catbox.moe/xr2m6u.jpg' } }
  }

  await m.react(['🎀', '🌸', '✨', '🌷'].sort(() => 0.5 - Math.random())[0])

  // --- CONSTRUCCIÓN DEL MENSAJE ---
  let txt = s ? `${s.top}\n\n` : ''

  txt += `🍃 *𝗘𝗦𝗘𝗡𝗖𝗜𝗔*\n`
  txt += `> 👤 *Nombre:* ${nameHandle.toUpperCase()}\n`
  txt += `> 📍 *Edad:* ${user.age} años\n`

  if (esValido(user.genre)) txt += `> 🚻 *Género:* ${user.genre}\n`
  if (esValido(user.colorFav)) txt += `> 🎨 *Color:* ${user.colorFav}\n`
  if (esValido(user.animalFav)) txt += `> 🐾 *Animal:* ${user.animalFav}\n`
  if (esValido(user.cumple)) txt += `> 🎂 *Cumple:* ${user.cumple}\n`
  txt += `\n`

  txt += `🎀 *𝗩𝗜𝗡𝗖𝗨𝗟𝗢*\n`
  txt += `> 🚩 *Rol:* ${user.premium ? '💎 Élite Premium' : '👤 Ciudadano Kar'}\n`

  // --- LÓGICA DE MATRIMONIO ---
  if (user.marry) {
      let spouseJid = user.marry
      let spouseData = global.db.data.users[spouseJid]
      let spouseName = spouseData?.registeredName || spouseData?.name || conn.getName(spouseJid)
      txt += `> 💍 *Relación:* Casado(a) con ${spouseName}\n`
  } else {
      txt += `> 💍 *Relación:* Soltero(a)\n`
  }

  txt += `> 📅 *Desde:* ${user.regDate || 'Reciente'}\n`
  txt += `> 🏷️ *Frase:* _${user.customPerfil?.frase || 'Viviendo la experiencia KarBot.'}_\n\n`

  txt += `🌟 *𝗣𝗥𝗘𝗦𝗧𝗜𝗚𝗜𝗢*\n`
  txt += `> 🎖️ *Rango:* ${rango}\n`
  txt += `> ✨ *Nivel:* ${user.level || 0} (${progreso.toFixed(1)}%)\n`
  txt += `> 💪 *Poder:* ${poderTotal.toLocaleString()}\n`

  if (user.premium && user.premiumTime > 0) {
      let rest = user.premiumTime - Date.now()
      if (rest > 0) txt += `> ⏳ *Élite:* ${Math.floor(rest / 86400000)}d ${Math.floor((rest % 86400000) / 3600000)}h\n`
  }

  if (s) txt += `\n\n${s.footer}`

  return await conn.sendMessage(m.chat, { 
      image: pp, 
      caption: txt, 
      mentions: [who],
      contextInfo: {
        externalAdReply: {
            title: `ESENCIA DE ${nameHandle.toUpperCase()}`,
            body: 'KarBot: Elegancia en cada bit',
            thumbnailUrl: 'https://i.postimg.cc/63HSmCvV/1757985995273.png',
            mediaType: 1,
            showAdAttribution: true
        }
      }
  }, { quoted: m })
}

function obtenerRango(lvl, fortuna) {
    if (fortuna >= 50000000) return "🏦 Deidad Financiera"
    if (fortuna >= 10000000) return "👑 Magnate"
    if (fortuna >= 5000000) return "🏛️ Capitalista"
    const rangos = [
        { min: 0, max: 3, name: 'Guerrero V' }, { min: 4, max: 6, name: 'Guerrero IV' },
        { min: 7, max: 9, name: 'Guerrero III' }, { min: 10, max: 12, name: 'Guerrero II' },
        { min: 13, max: 15, name: 'Guerrero I' }, { min: 16, max: 18, name: 'Élite V' },
        { min: 19, max: 21, name: 'Élite IV' }, { min: 22, max: 24, name: 'Élite III' },
        { min: 25, max: 27, name: 'Élite II' }, { min: 28, max: 30, name: 'Élite I' },
        { min: 31, max: 33, name: 'Maestros V' }, { min: 34, max: 36, name: 'Maestros IV' },
        { min: 37, max: 39, name: 'Maestros III' }, { min: 40, max: 42, name: 'Maestros II' },
        { min: 43, max: 45, name: 'Maestros I' }, { min: 46, max: 48, name: 'Gran Maestro V' },
        { min: 49, max: 51, name: 'Gran Maestro IV' }, { min: 52, max: 54, name: 'Gran Maestro III' },
        { min: 55, max: 57, name: 'Gran Maestro II' }, { min: 58, max: 60, name: 'Gran Maestro I' },
        { min: 61, max: 63, name: 'Épico V' }, { min: 64, max: 66, name: 'Épico IV' },
        { min: 67, max: 69, name: 'Épico III' }, { min: 70, max: 71, name: 'Épico II' },
        { min: 72, max: 74, name: 'Épico I' }, { min: 75, max: 77, name: 'Leyenda V' },
        { min: 78, max: 80, name: 'Leyenda IV' }, { min: 81, max: 83, name: 'Leyenda III' },
        { min: 84, max: 86, name: 'Leyenda II' }, { min: 87, max: 89, name: 'Leyenda I' },
        { min: 90, max: 91, name: 'Mítico V' }, { min: 92, max: 94, name: 'Mítico IV' },
        { min: 95, max: 97, name: 'Mítico III' }, { min: 98, max: 100, name: 'Mítico II' },
        { min: 101, max: 105, name: 'Mítico I' }, { min: 106, max: 120, name: 'Gloria Mítica' },
        { min: 121, max: 150, name: 'Esmeralda V' }, { min: 151, max: 160, name: 'Esmeralda VI' },
        { min: 161, max: 170, name: 'Esmeralda III' }, { min: 171, max: 185, name: 'Esmeralda II' },
        { min: 186, max: 200, name: 'Esmeralda I' }, { min: 201, max: 400, name: 'Titan III' },
        { min: 401, max: 700, name: 'Titan II' }, { min: 701, max: 1000, name: 'Titan I' }
    ]
    const rangoEncontrado = rangos.find(r => lvl >= r.min && lvl <= r.max)
    return rangoEncontrado ? rangoEncontrado.name : (lvl > 1000 ? '🐉 Dragón Rey Estrella' : '🌱 Novato')
}

handler.help = ['perfil']
handler.tags = ['main']
handler.command = /^(perfil|pf|me)$/i
export default handler