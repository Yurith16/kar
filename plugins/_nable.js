import fetch from "node-fetch"
import { saveDatabase } from "../lib/db.js"

let handler = async (m, { conn, usedPrefix, command, args }) => {
  // Reacción de engranaje para marcar el inicio del proceso
  await conn.sendMessage(m.chat, { react: { text: '⚙️', key: m.key } })

  const toNum = (jid = '') => String(jid).split('@')[0].split(':')[0].replace(/[^0-9]/g, '')
  const senderNum = toNum(m.sender)
  const botId = conn?.user?.id || ''
  const owners = Array.isArray(global.owner) ? global.owner.map(v => Array.isArray(v) ? v[0] : v) : []
  const isROwner = [botId, ...owners].map(v => toNum(v)).includes(senderNum)
  const isOwner = isROwner || !!m.fromMe
  const isAdmin = !!m.isAdmin
  let chat = global.db?.data?.chats?.[m.chat] || (global.db.data.chats[m.chat] = {})
  let settings = global.db?.data?.settings || (global.db.data.settings = {})
  let bot = settings[conn.user.jid] || (settings[conn.user.jid] = {})

  let fkontak = { 
    key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" }, 
    message: { contactMessage: { vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, 
    participant: "0@s.whatsapp.net" 
  }

  const imageUrl = "https://image2url.com/r2/default/images/1768346184993-24cd2f90-2aa6-4ebd-8adf-067a4cdf67a0.jpeg"
  //const imageUrl = "https://image2url.com/images/1765486012290-7e2d4538-c0d4-487b-9410-9b21ab56387f.jpg"
  let imageBuffer = await fetch(imageUrl).then(res => res.buffer())

  // Diseño minimalista para la lista de funciones (sin cajas)
  const listMessage = {
    image: imageBuffer,
    caption: `*${global.botname}*

*Uso del comando:*
*Ejemplo:* ${usedPrefix}on welcome
*Descripción:* Activa o desactiva funciones del bot.

*Funciones disponibles:*
• *antifake* - Anti números falsos
• *antibot* - Anti bots externos
• *antisubbots* - Anti sub bots
• *welcome* - Mensajes de bienvenida
• *public* - Modo público del bot
• *chatbot* - Chatbot automático
• *nsfw* - Contenido para adultos
• *autosticker* - Creación automática de stickers
• *antitraba* - Protección anti trabas
• *antiprivado* - Bloqueo de chat privado
• *antispam* - Protección anti spam
• *anticall* - Bloqueo de llamadas
• *antidelete* - Ver mensajes eliminados
• *autolevelup* - Subida de nivel automática
• *autoresponder* - Respuestas automáticas
• *autoaceptar* - Aceptar solicitudes auto
• *autorechazar* - Rechazar solicitudes auto
• *detect* - Avisos de cambios en grupo
• *antiviewonce* - Ver mensajes de una vez
• *restrict* - Restricción de usuarios
• *autoread* - Lectura automática
• *antisticker* - Bloqueo de stickers
• *antiraid* - Protección contra ataques
• *modoadmin* - Solo para administradores
• *reaction* - Reacciones automáticas
• *jadibotmd* - Función de sub bots
• *onlypv* - Solo chat privado
• *onlygp* - Solo grupos
• *antiperu* - Anti números de Perú

*Usa:* ${usedPrefix}on o ${usedPrefix}off seguido de la opción.`
  }

  let isEnable = /true|enable|(turn)?on|1|activar|on/i.test(command)
  let type = (args[0] || '').toLowerCase()
  let isAll = false, isUser = false

  if (!args[0]) return conn.sendMessage(m.chat, listMessage, { quoted: fkontak })

  switch (type) {
    case 'autotype':
    case 'autotipo':
      isAll = true
      if (!isOwner) { global.dfail('rowner', m, conn); throw false }
      bot.autotypeDotOnly = isEnable
      break
    case 'welcome':
    case 'bienvenida':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } } else { if (!isOwner) { global.dfail('group', m, conn); throw false } }
      chat.welcome = isEnable
      break
    case 'bye':
    case 'despedida':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } } else { if (!isOwner) { global.dfail('group', m, conn); throw false } }
      chat.welcome = isEnable
      break
    case 'antiprivado':
    case 'antiprivate':
      isAll = true
      if (!isOwner) { global.dfail('rowner', m, conn); throw false }
      bot.antiPrivate = isEnable
      break
    case 'antispam':
      isAll = true
      if (!isOwner) { global.dfail('owner', m, conn); throw false }
      bot.antiSpam = isEnable
      break
    case 'restrict':
    case 'restringir':
      isAll = true
      if (!isOwner) { global.dfail('rowner', m, conn); throw false }
      bot.restrict = isEnable
      break
    case 'antibot':
    case 'antibots':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } }
      chat.antiBot = isEnable
      break
    case 'antisubbots':
    case 'antibot2':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } }
      chat.antiBot2 = isEnable
      break
    case 'antidelete':
    case 'antieliminar':
    case 'delete':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } }
      chat.delete = isEnable
      break
    case 'autoaceptar':
    case 'aceptarauto':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } } else { if (!isOwner) { global.dfail('group', m, conn); throw false } }
      chat.autoAceptar = isEnable
      break
    case 'autorechazar':
    case 'rechazarauto':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } } else { if (!isOwner) { global.dfail('group', m, conn); throw false } }
      chat.autoRechazar = isEnable
      break
    case 'autoresponder':
    case 'autorespond':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } }
      chat.autoresponder = isEnable
      break
    case 'autolevelup':
    case 'autonivel':
    case 'nivelautomatico':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } }
      chat.autolevelup = isEnable
      break
    case 'modoadmin':
    case 'soloadmin':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } }
      chat.modoadmin = isEnable
      break
    case 'reaction':
    case 'reaccion':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } } else { if (!isOwner) { global.dfail('group', m, conn); throw false } }
      chat.reaction = isEnable
      break
    case 'nsfw':
    case 'modohorny':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } }
      chat.nsfw = isEnable
      break
    case 'antitoxic':
    case 'antitoxicos':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } }
      chat.antitoxic = isEnable
      break
    case 'jadibotmd':
    case 'modejadibot':
      isAll = true
      if (!isOwner) { global.dfail('rowner', m, conn); throw false }
      bot.jadibotmd = isEnable
      break
    case 'detect':
    case 'avisos':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } } else { if (!isOwner) { global.dfail('group', m, conn); throw false } }
      chat.detect = isEnable
      break
    case 'antifake':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } }
      chat.antifake = isEnable
      break
    case 'public':
      isAll = true
      if (!isOwner) { global.dfail('rowner', m, conn); throw false }
      bot.public = isEnable
      break
    case 'chatbot':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } }
      chat.chatbot = isEnable
      break
    case 'autosticker':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } }
      chat.autoSticker = isEnable
      break
    case 'antitraba':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } }
      chat.antiTraba = isEnable
      break
    case 'anticall':
      isAll = true
      if (!isOwner) { global.dfail('rowner', m, conn); throw false }
      bot.antiCall = isEnable
      break
    case 'antiviewonce':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } }
      chat.antiviewonce = isEnable
      break
    case 'autoread':
      isAll = true
      if (!isOwner) { global.dfail('rowner', m, conn); throw false }
      bot.autoread = isEnable
      break
    case 'antisticker':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } }
      chat.antiSticker = isEnable
      break
    case 'antiraid':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } }
      chat.antiRaid = isEnable
      break
    case 'onlypv':
      if (!isOwner) { global.dfail('rowner', m, conn); throw false }
      chat.onlyPv = isEnable
      break
    case 'onlygp':
      if (!isOwner) { global.dfail('rowner', m, conn); throw false }
      chat.onlyGp = isEnable
      break
    case 'antiperu':
      if (m.isGroup) { if (!(isAdmin || isOwner)) { global.dfail('admin', m, conn); throw false } }
      chat.antiperu = isEnable
      break
    default:
      return conn.sendMessage(m.chat, listMessage, { quoted: fkontak })
  }

  try { await saveDatabase() } catch {}

  // Respuesta final minimalista
  m.reply(`*${type}* ha sido ${isEnable ? 'activado' : 'desactivado'} con exito.`)
}

handler.help = ['en', 'dis']
handler.tags = ['nable', 'owner']
handler.command = /^((en|dis)able|(tru|fals)e|(turn)?o(n|ff)|[01])$/i

export default handler