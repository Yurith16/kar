import axios from 'axios';
import { procesarCompleto, procesarPago } from '../lib/pagoFiltro.js';
import { checkReg } from '../lib/checkReg.js';

// Sistema de descargas activas por usuario
const userDownloads = new Map();

// Función principal de búsqueda mejorada
async function tiktokSearchKarbot(query, limit = 15) {
    try {
        const response = await axios.post("https://tikwm.com/api/feed/search",
            new URLSearchParams({
                keywords: query,
                count: limit.toString(),
                cursor: '0',
                HD: '1'
            }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json, text/plain, */*",
                "Accept-Language": "es-ES,es;q=0.9",
                "Origin": "https://tikwm.com",
                "Referer": "https://tikwm.com/",
            },
            timeout: 20000
        });

        const videos = response.data?.data?.videos || [];

        if (videos.length === 0) {
            throw new Error('No se encontraron videos.');
        }

        // Mapear y ordenar por mejor calidad primero
        return videos
            .map(v => ({
                description: v.title ? v.title.slice(0, 120) : "Video de TikTok",
                videoUrl: v.play || v.wmplay || v.hdplay || null,
                duration: v.duration || 0,
                author: v.author?.nickname || "Usuario"
            }))
            .filter(v => v.videoUrl && v.duration > 0)
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 8);

    } catch (error) {
        console.error('❌ Error búsqueda TikTok:', error.message);
        throw new Error(`API no responde. Intenta más tarde.`);
    }
}

let handler = async (m, { conn, text, usedPrefix }) => {
    const userId = m.sender;
    const jid = m.chat;
    let user = global.db.data.users[userId];

    // --- SISTEMA DE REGISTRO ---
    if (await checkReg(m, user)) return;

    // Control de descargas simultáneas
    if (userDownloads.has(userId)) {
        try { await conn.sendMessage(jid, { react: { text: '⏳', key: m.key } }) } catch {}
        return;
    }

    // Verificar búsqueda
    if (!text) {
        try { await conn.sendMessage(jid, { react: { text: '❌', key: m.key } }) } catch {}
        return conn.reply(jid,
            `⚙️ *𝙸𝙽𝙶𝚁𝙴𝚂𝙰 𝚄𝙽𝙰 𝙱𝚄́𝚂𝚀𝚄𝙴𝙳𝙰*\n▸ *Ejemplo:* ${usedPrefix}tiktok memes graciosos`,
            m
        );
    }

    userDownloads.set(userId, true);

    try {
        // 1. Verificar saldo para multidescarga
        const v = await procesarCompleto(userId, 'multidescarga');
        if (!v.success) {
            await conn.sendMessage(jid, { react: { text: '❌', key: m.key } });
            return conn.reply(jid, v.mensajeError, m);
        }

        await conn.sendMessage(jid, { react: { text: '🔍', key: m.key } });

        // 2. Buscar videos
        const searchResults = await tiktokSearchKarbot(text, 20);

        if (searchResults.length < 3) {
            throw new Error('Muy pocos videos encontrados. Prueba otra búsqueda.');
        }

        const videosToSend = searchResults.slice(0, 5);

        // 3. Procesar cobro inicial informativo
        const pago = procesarPago(userId, 'multidescarga');

        let txt = `╭━〔 📱 𝚃𝙸𝙺𝚃𝙾𝙺 𝙼𝚄𝙻𝚃𝙸𝚂𝙴𝙰𝚁𝙲𝙷 〕━⬣\n`;
        txt += `║ 🔍 *𝙱𝚄́𝚂𝚀𝚄𝙴𝙳𝙰:* ${text}\n`;
        txt += `║ 📊 *𝚅𝚒𝚍𝚎𝚘𝚜:* 5 resultados\n`;
        txt += pago.premium ? `║ ⭐ *Premium*\n` : `║ 💰 *𝙲𝚘𝚜𝚝𝚘:* ${pago.costo} Coins\n║ 💳 *𝚂𝚊𝚕𝚍𝚘:* ${pago.saldoNuevo} Coins\n`;
        txt += `╰━━━━━━━━━━━━━━━━━━━⬣`;

        await conn.reply(jid, txt, m);
        await conn.sendMessage(jid, { react: { text: '⬇️', key: m.key } });

        let successfulCount = 0;
        let failedVideos = [];

        for (let i = 0; i < videosToSend.length; i++) {
            const video = videosToSend[i];

            try {
                const videoResponse = await axios({
                    method: 'GET',
                    url: video.videoUrl,
                    responseType: 'arraybuffer',
                    timeout: 25000,
                    maxContentLength: 50 * 1024 * 1024,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    }
                });

                if (!videoResponse.data || videoResponse.data.length < 1000) {
                    failedVideos.push(i+1);
                    continue;
                }

                const videoBuffer = Buffer.from(videoResponse.data);
                const sizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(1);

                // Enviar como DOCUMENTO para mejor calidad
                await conn.sendMessage(
                    jid,
                    {
                        document: videoBuffer,
                        mimetype: 'video/mp4',
                        fileName: `tiktok_${i+1}.mp4`,
                        caption: `🎵 ${video.description}\n👤 @${video.author}\n📊 ${sizeMB}MB | ${i+1}/5`
                    },
                    { quoted: m }
                );

                successfulCount++;

                if (i < videosToSend.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 800));
                }

            } catch (videoError) {
                failedVideos.push(i+1);
                continue;
            }
        }

        if (successfulCount > 0) {
            await conn.sendMessage(jid, { react: { text: '✅', key: m.key } });
            if (failedVideos.length > 0 && successfulCount < 5) {
                await conn.reply(jid, `✅ *${successfulCount}/5 videos enviados*\n⚠️ Fallos en indices: (${failedVideos.join(', ')})`, m);
            }
        } else {
            throw new Error('No se pudo cargar ningún video.');
        }

    } catch (error) {
        console.error('❌ Error comando TikTok:', error);
        await conn.sendMessage(jid, { react: { text: '❌', key: m.key } });

        // --- DEVOLUCIÓN DE COINS ---
        if (user && !user.premium) {
            user.coin += 350; // Devolver costo de multidescarga
        }

        await conn.reply(jid, `❌ *Error:* ${error.message}\nSe han devuelto tus coins.`, m);

    } finally {
        userDownloads.delete(userId);
    }
};

handler.help = ['tiktoksearch <texto>'];
handler.tags = ['downloader', 'internet'];
handler.command = /^(tiktoks|tks|tiktoks|tiktoksearch)$/i;

export default handler;