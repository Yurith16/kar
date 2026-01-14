import getFacebookDownloadInfo from '../lib/fdownloader.js'

const chooseDownloadable = (formats) =>
  formats.find((item) => item?.url && !item.requiresRender)

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  const targetUrl = text?.trim() || args?.[0]
  if (!targetUrl) {
    return conn.reply(m.chat, `> ⓘ \`Uso:\` *${usedPrefix + command} link de Facebook*`, m)
  }

  await m.react('🕑')

  try {
    const { formats } = await getFacebookDownloadInfo(targetUrl)

    const directFormats = formats.filter((item) => item?.url && !item.requiresRender)
    if (!directFormats.length) {
      await m.react('❌')
      return conn.reply(m.chat, '> ⓘ \`No se encontraron enlaces directos para descargar\`', m)
    }

    const chosen = chooseDownloadable(directFormats)

    // Si el comando es fbaudio, enviar solo audio
    if (command === 'fbaudio') {
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: chosen.url },
          mimetype: 'audio/mpeg',
          fileName: 'facebook_audio.mp3',
          ptt: false
        },
        { quoted: m }
      )
    } else {
      // Comando fb - enviar video
      await conn.sendMessage(
        m.chat,
        {
          video: { url: chosen.url },
          caption: `> ⓘ \`Facebook Downloader\`\n> ⓘ \`Calidad:\` *${chosen.quality || chosen.label}*`
        },
        { quoted: m }
      )
    }

    await m.react('✅')
  } catch (error) {
    await m.react('❌')
    return conn.reply(m.chat, `> ⓘ \`Error:\` *${error.message}*`, m)
  }
}

handler.help = ['fb', 'fbaudio']
handler.tags = ['downloader']
handler.command = ['fb', 'fbaudio']

export default handler