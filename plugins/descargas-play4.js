import fetch from 'node-fetch';

const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, `> ⓘ USO INCORRECTO

> ❌ Debes ingresar el nombre de la música

> 📝 Ejemplo:
> • ${usedPrefix + command} nombre de la canción`, m);

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕑', key: m.key } })

    const searchRes = await fetch(`https://sky-api-ashy.vercel.app/search/youtube?q=${encodeURIComponent(text)}`);
    const searchJson = await searchRes.json();

    if (!searchJson.status || !searchJson.result?.length) {
      return conn.reply(m.chat, `> ⓘ SIN RESULTADOS

> ❌ No se encontraron resultados

> 💡 Intenta con otro nombre`, m);
    }

    await conn.sendMessage(m.chat, { react: { text: '🎵', key: m.key } })

    const video = searchJson.result[0];
    const { title, channel, duration, imageUrl, link } = video;

    const info = `> *ⓘ Y O U T U B E - P L A Y S V4*

> *🏷️ ${title}*
> *📺 ${channel}*
> *⏱️ ${duration}*
> *🔗 ${link}*
> *🎬 Tipo: ${command === 'play5' ? 'Audio MP3' : 'Video MP4'}*`;

    const thumb = await (await fetch(imageUrl)).arrayBuffer();
    await conn.sendMessage(m.chat, { image: Buffer.from(thumb), caption: info }, { quoted: m });

    if (command === 'play5') {
      const res = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/audio?url=${link}&quality=128`);
      const json = await res.json();

      if (!json.status || !json.result?.download?.url) {
        return conn.reply(m.chat, `> ⓘ ERROR

> ❌ No se pudo obtener el audio

> 💡 Intenta con otra canción`, m);
      }

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: json.result.download.url },
          fileName: `${title}.mp3`,
          mimetype: 'audio/mpeg',
          ptt: false
        },
        { quoted: m }
      );

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    }

    if (command === 'play6') {
      const res = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/video?url=${link}&quality=360`);
      const json = await res.json();

      if (!json.status || !json.result?.download?.url) {
        return conn.reply(m.chat, `> ⓘ ERROR

> ❌ No se pudo obtener el video

> 💡 Intenta con otro video`, m);
      }

      await conn.sendMessage(
        m.chat,
        {
          video: { url: json.result.download.url },
          fileName: `${title}.mp4`,
          mimetype: 'video/mp4',
          caption: `> *ⓘ Y O U T U B E - P L A Y S V4*

> *🏷️ ${title}*
> *📺 ${channel}*
> *⏱️ ${duration}*
> *🎬 Formato: MP4*
> *📊 Calidad: 360p*
> *🌐 Servidor: Las Quintillizas*`
        },
        { quoted: m }
      );

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    }

  } catch (e) {
    console.error('[play] Error:', e);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    conn.reply(m.chat, `> ⓘ ERROR

> ❌ ${e.message}

> 💡 Intenta más tarde`, m);
  }
};

handler.command = ['play5', 'play6'];
handler.tags = ['downloader'];
handler.help = ['play5', 'play6'];

export default handler;