const fetch = require('node-fetch');
const { verificarSaldoNSFW, procesarPagoNSFW } = require('../lib/nsfw-pago.js');
const { checkReg } = require('../lib/checkReg.js');

let handler = async (m, { conn, usedPrefix, command }) => {
  let chat = global.db.data.chats[m.chat];
  let user = global.db.data.users[m.sender];

  // 1. Verificación de Registro
  if (await checkReg(m, user)) return;

  // 2. Verificación NSFW
  if (!chat.nsfw) {
    await m.react('🔞');
    return m.reply(`> 🔞 *𝙽𝚂𝙵𝚆 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾*\n> El deseo debe esperar, amor. Activa el modo prohibido primero.`);
  }

  // 3. Verificación de Saldo
  const v = verificarSaldoNSFW(m.sender, 'fuerte');
  if (!v.success) {
    await m.react('🎟️');
    return m.reply(v.mensajeError);
  }

  try {
    await m.react('🔥');

    const api = `https://api.vreden.my.id/api/v1/random/hentai`;
    const response = await fetch(api);
    const res = await response.json();

    if (!res.status || !res.result || res.result.length === 0) {
      await m.react('❌');
      return m.reply(`> 🥀 El placer se nos escapó de las manos... Inténtalo de nuevo, cielo.`);
    }

    const item = res.result[Math.floor(Math.random() * res.result.length)];
    
    // Procesar pago (Nivel fuerte - 5 HotPass)
    procesarPagoNSFW(m.sender, 'fuerte');

    // Texto de envío
    const caption = `🔥 *Costo:* 5 HotPass\n\n_Disfruta del espectáculo, corazón. Que el drama te consuma._ 💋`;

    if (item.type === 'video/mp4') {
      await conn.sendMessage(m.chat, { 
        video: { url: item.video_1 }, 
        caption: caption,
        mimetype: 'video/mp4'
      }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, { 
        image: { url: item.video_1 },
        caption: caption
      }, { quoted: m });
    }

    await m.react('💦');

  } catch (error) {
    console.error(error);
    await m.react('❌');
    m.reply(`> 🥀 Falló la descarga en el momento más inoportuno. Tus pases están a salvo, no te preocupes.`);
  }
}

handler.help = ['hentai'];
handler.tags = ['NSFW'];
handler.command = ['sfm', 'hentai'];
handler.register = true;
handler.nsfw = true;

module.exports = handler;