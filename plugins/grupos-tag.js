const handler = async (m, { conn, text, participants, isOwner, isAdmin }) => {
  // 1. Verificación de Grupo
  if (!m.isGroup) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    return m.reply("❌ *𝚂𝙾𝙻𝙾 𝙶𝚁𝚄𝙿𝙾𝚂*\n\n▸ Este comando es exclusivo para grupos, cielo.");
  }

  // 2. Verificación de Admin
  if (!isAdmin && !isOwner) {
    await conn.sendMessage(m.chat, { react: { text: "🚫", key: m.key } });
    return m.reply("🚫 *𝙽𝙾 𝙴𝚁𝙴𝚂 𝙰𝙳𝙼𝙸𝙽*\n\n▸ No tienes el poder para invocar a la plebe en silencio.");
  }

  await conn.sendMessage(m.chat, { react: { text: "⚙️", key: m.key } });

  try {
    const users = participants.map((u) => conn.decodeJid(u.id));
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || "";
    const isMedia = /image|video|sticker|audio/.test(mime);
    const htextos = text ? text : "¡Atención aquí, tesoros! 💋";

    if (isMedia) {
      // Manejo de Multimedia (Mención invisible en el caption)
      const mediax = await quoted.download?.();
      const messageType = quoted.mtype.replace('Message', '');
      
      let options = {
        mentions: users, // Aquí ocurre la magia silenciosa
        caption: htextos
      };

      if (quoted.mtype === "audioMessage") {
        options = { 
            audio: mediax, 
            mentions: users, 
            mimetype: "audio/mpeg", 
            fileName: `TagAudio.mp3` 
        };
      } else if (quoted.mtype === "stickerMessage") {
        options = { sticker: mediax, mentions: users };
      } else {
        options[messageType] = mediax;
      }

      await conn.sendMessage(m.chat, options, { quoted: m });

    } else {
      // Mensaje de Texto (Mención invisible en contextInfo)
      await conn.sendMessage(m.chat, {
        text: htextos,
        contextInfo: { 
          mentionedJid: users,
          externalAdReply: {
            title: '📣 ¡𝙸𝙽𝚅𝙾𝙲𝙰𝙲𝙸Ó𝙽!',
            body: 'KarBot ~ El deseo de todos.',
            thumbnailUrl: 'https://files.catbox.moe/ocglqs.webp', 
            sourceUrl: 'https://github.com',
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }
      }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    m.reply("> 🥀 Falló la invocación... parece que no quieren escucharte hoy.");
  }
};

handler.help = ["tag <texto>"];
handler.tags = ['group'];
handler.command = /^(tag|tagall|invocar|marcar)$/i;
handler.group = true;
handler.admin = true;

module.exports = handler;