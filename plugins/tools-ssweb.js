import fetch from 'node-fetch';

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

let handler = async (m, { conn, command, args, usedPrefix }) => {
  let link = args[0];

  if (!link) {
    return conn.reply(m.chat, `> ⓘ \`Uso:\` *${usedPrefix + command} url*`, m);
  }

  if (!isValidUrl(link)) {
    return conn.reply(m.chat, '> ⓘ \`El enlace proporcionado no es válido\`', m);
  }

  try {
    await m.react('🕑');

    let response = await fetch(`https://image.thum.io/get/fullpage/${link}`);
    if (!response.ok) throw new Error(`Error al obtener la captura`);

    let buffer = await response.buffer();

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `> ⓘ \`Captura de:\` *${link}*`
    }, { quoted: m });
    
    await m.react('✅️');

  } catch (err) {
    console.error(err);
    await conn.reply(m.chat, `> ⓘ \`Error:\` *${err.message}*`, m);
    await m.react('❌');
  }
};

handler.help = ['ssweb'];
handler.tags = ['tools'];
handler.command = ['ssweb', 'ss'];

export default handler;