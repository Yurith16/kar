/**
 * Video Downloader - Download video from YouTube
 */

const yts = require('yt-search');
const APIs = require('../utils/api');
const { checkReg } = require('../lib/checkReg.js');

const activeDownloads = new Map();
const lastUsage = new Map();

function extractYouTubeId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

const cleanFiles = (files) => {
    files.forEach(f => {
        try {
            if (fs.existsSync(f)) fs.unlinkSync(f);
        } catch (e) {}
    });
};

let handler = async (m, { conn, text, args }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    // Sistema de registro
    if (await checkReg(m, user)) return;

    // Rate limiting: 5 segundos entre comandos
    const now = Date.now();
    const lastUse = lastUsage.get(userId) || 0;
    if (now - lastUse < 5000) {
        const wait = Math.ceil((5000 - (now - lastUse)) / 1000);
        return m.reply(`> ⏳ *Espera ${wait}s antes de usar el comando de nuevo.*`);
    }
    lastUsage.set(userId, now);

    if (activeDownloads.has(userId)) {
        return m.reply(`> ⏳ *Espera, ya proceso uno.*`);
    }

    const searchQuery = text || args.join(' ');

    if (!searchQuery || !searchQuery.trim()) {
        return m.reply(`> 🎬 *¿Qué video deseas descargar?*`);
    }

    let videoUrl = '';
    let videoTitle = '';
    let videoThumbnail = '';
    let videoDuration = null;

    try {
        activeDownloads.set(userId, true);
        await m.react('🔍');

        if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
            videoUrl = searchQuery;
            // Obtener info adicional si es URL
            const videoId = extractYouTubeId(videoUrl);
            if (videoId) {
                const info = await yts({ videoId });
                videoTitle = info.title;
                videoThumbnail = info.thumbnail;
                videoDuration = info.duration;
            }
        } else {
            const { videos } = await yts(searchQuery);
            if (!videos || videos.length === 0) throw new Error('No encontrado');
            videoUrl = videos[0].url;
            videoTitle = videos[0].title;
            videoThumbnail = videos[0].thumbnail;
            videoDuration = videos[0].duration;
        }

        // Validar duración (máximo 2 horas)
        if (videoDuration && videoDuration.seconds > 7200) {
            throw new Error('Muy largo');
        }

        const statusMsg = await conn.sendMessage(m.chat, {
            text: `> ⏳ *Procesando...*`
        }, { quoted: m });

        await m.react('📥');

        // Intentar APIs en orden
        let videoData;
        try {
            videoData = await APIs.getEliteProTechVideoByUrl(videoUrl);
        } catch (e1) {
            try {
                videoData = await APIs.getYupraVideoByUrl(videoUrl);
            } catch (e2) {
                videoData = await APIs.getOkatsuVideoByUrl(videoUrl);
            }
        }

        if (!videoData?.download) throw new Error('SIN_LINK_DESCARGA');

        await conn.sendMessage(m.chat, {
            text: `> ✅ *Descarga completada, enviando...*`,
            edit: statusMsg.key
        });

        await m.react('📤');

        // Enviar como documento (igual que play2)
        await conn.sendMessage(m.chat, {
            document: { url: videoData.download },
            mimetype: 'video/mp4',
            fileName: `${(videoData.title || videoTitle || 'video').substring(0, 50).replace(/[<>:"/\\|?*]/g, '')}.mp4`,
            caption: videoUrl,
            contextInfo: {
                externalAdReply: {
                    title: `𝚈𝚘𝚞𝚃𝚞𝚋𝚎 𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍`,
                    body: `${videoData.title || videoTitle || 'Video'}`,
                    thumbnailUrl: videoThumbnail || videoData.thumbnail,
                    sourceUrl: videoUrl,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

        await m.react('✅');

    } catch (error) {
        console.error('[mp4]', error?.message || error);
        await m.react('❌');

        let errorMsg = 'No pude procesarlo';
        if (error?.message === 'Muy largo') errorMsg = 'Máximo 2 horas';
        else if (error?.message === 'No encontrado') errorMsg = 'No encontré resultados';
        else if (error?.message === 'SIN_LINK_DESCARGA') errorMsg = 'No pude obtener el link';
        else if (error?.message?.includes('EliteProTech') || error?.message?.includes('Yupra') || error?.message?.includes('Okatsu')) {
            errorMsg = 'Las APIs no responden';
        }

        m.reply(`> 🎬 *Error: ${errorMsg}*`);

    } finally {
        activeDownloads.delete(userId);
    }
};

handler.help = ['play2'];
handler.tags = ['media', 'downloader'];
handler.command = /^(play2)$/i;
handler.register = true;
handler.group = true;

module.exports = handler;