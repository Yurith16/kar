/**
 * Video Downloader - Download video from YouTube
 */

const yts = require('yt-search');
const APIs = require('../utils/api');

let handler = async (m, { conn, text, args }) => {
    try {
        // Usar global.botname de tu config.js
        const instanceConfig = { botName: global.botname || 'KARBOT' };

        const searchQuery = text || args.join(' ');

        if (!searchQuery || !searchQuery.trim()) {
            return await conn.sendMessage(m.chat, {
                text: '¿Qué video deseas descargar?'
            }, { quoted: m });
        }

        // Determine if input is a YouTube link
        let videoUrl = '';
        let videoTitle = '';
        let videoThumbnail = '';

        if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
            videoUrl = searchQuery;
        } else {
            // Search YouTube for the video
            const { videos } = await yts(searchQuery);
            if (!videos || videos.length === 0) {
                return await conn.sendMessage(m.chat, {
                    text: '¡No se encontraron videos!'
                }, { quoted: m });
            }
            videoUrl = videos[0].url;
            videoTitle = videos[0].title;
            videoThumbnail = videos[0].thumbnail;
        }

        // Send thumbnail immediately
        try {
            const ytId = (videoUrl.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/) || [])[1];
            const thumb = videoThumbnail || (ytId ? `https://i.ytimg.com/vi/${ytId}/sddefault.jpg` : undefined);
            const captionTitle = videoTitle || searchQuery;
            if (thumb) {
                await conn.sendMessage(m.chat, {
                    image: { url: thumb },
                    caption: `*${captionTitle}*\n⏳ Descargando...`
                }, { quoted: m });
            }
        } catch (e) {
            console.error('[VIDEO] thumb error:', e?.message || e);
        }

        // Validate YouTube URL
        let urls = videoUrl.match(/(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/|shorts\/|playlist\?list=)?)([a-zA-Z0-9_-]{11})/gi);
        if (!urls) {
            return await conn.sendMessage(m.chat, {
                text: '¡Este no es un enlace válido de YouTube!'
            }, { quoted: m });
        }

        // Get video: try EliteProTech first, then Yupra, then Okatsu fallback
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

        // Send video directly using the download URL
        await conn.sendMessage(m.chat, {
            video: { url: videoData.download },
            mimetype: 'video/mp4',
            fileName: `${(videoData.title || videoTitle || 'video').replace(/[^\w\s-]/g, '')}.mp4`,
            caption: `*${videoData.title || videoTitle || 'Video'}*\n\n> *_Descargado por ${instanceConfig.botName}_*`
        }, { quoted: m });

    } catch (error) {
        console.error('[VIDEO] Command Error:', error?.message || error);
        await conn.sendMessage(m.chat, {
            text: 'Error al descargar: ' + (error?.message || 'Error desconocido')
        }, { quoted: m });
    }
};

handler.help = ['mp4'];
handler.tags = ['media', 'downloader'];
handler.command = /^(mp4)$/i;
handler.register = true;

module.exports = handler;