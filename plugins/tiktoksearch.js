const axios = require('axios');
const { checkReg } = require('../lib/checkReg.js');

// Sistema de descargas activas por usuario
const userDownloads = new Map();

// Emojis numerados para reaccionar a cada video
const EMOJIS_NUMEROS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

// Función de búsqueda optimizada para videos
async function tiktokSearchKarbot(query) {
    try {
        const response = await axios.post("https://tikwm.com/api/feed/search",
            new URLSearchParams({
                keywords: query,
                count: '15', // Pedimos varios para tener respaldo
                cursor: '0',
                HD: '1'
            }), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            timeout: 20000
        });

        const videos = response.data?.data?.videos || [];

        if (videos.length === 0) throw new Error('No se encontraron videos.');

        // Retornamos hasta 15 videos para tener margen
        return videos
            .map(v => ({
                description: v.title ? v.title.slice(0, 100) : "Video de TikTok",
                videoUrl: v.play || v.wmplay || v.hdplay || null,
                author: v.author?.nickname || "Usuario"
            }))
            .filter(v => v.videoUrl)
            .slice(0, 15);

    } catch (error) {
        throw new Error(`API no responde. Intenta más tarde.`);
    }
}

let handler = async (m, { conn, text, usedPrefix }) => {
    const userId = m.sender;
    const jid = m.chat;
    let user = global.db.data.users[userId];

    if (await checkReg(m, user)) return;

    if (userDownloads.has(userId)) {
        return m.react('⏳');
    }

    if (!text) {
        return conn.reply(jid, `> ⚙️ *𝙸𝙽𝙶𝚁𝙴𝚂𝙰 𝚄𝙽𝙰 𝙱𝚄́𝚂𝚀𝚄𝙴𝙳𝙰*\n▸ *Ejemplo:* ${usedPrefix}tks memes de gatos`, m);
    }

    userDownloads.set(userId, true);

    try {
        await m.react('🔍');

        const searchResults = await tiktokSearchKarbot(text);

        if (searchResults.length < 3) {
            throw new Error('No encontré suficientes videos.');
        }

        await m.react('⬇️');

        let enviados = 0;
        let indice = 0;

        // Intentar enviar hasta 5 videos exitosos
        while (enviados < 5 && indice < searchResults.length) {
            const video = searchResults[indice];
            indice++;
            
            try {
                // Enviar el video
                const sentMsg = await conn.sendMessage(jid, {
                    video: { url: video.videoUrl },
                    caption: `> 🎵 *${video.description}*\n> 👤 @${video.author}`,
                    mimetype: 'video/mp4'
                }, { quoted: m });
                
                // Reaccionar al video inmediatamente con su número correspondiente
                if (sentMsg) {
                    await conn.sendMessage(jid, {
                        react: {
                            text: EMOJIS_NUMEROS[enviados],
                            key: sentMsg.key
                        }
                    });
                }
                
                enviados++;
                
                // Pequeña pausa entre videos para evitar spam
                if (enviados < 5) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                
            } catch (e) {
                console.error(`Error enviando video, probando con el siguiente...`);
                // Continuar con el siguiente video sin aumentar enviados
                continue;
            }
        }

        if (enviados === 0) {
            throw new Error('No se pudo enviar ningún video.');
        }

        // Solo reacción final al mensaje original
        await m.react('✅');

    } catch (error) {
        await m.react('❌');
        await conn.reply(jid, `> 🌪️ *Vaya drama...* ${error.message}`, m);
    } finally {
        userDownloads.delete(userId);
    }
};

handler.help = ['tiktoks <texto>'];
handler.tags = ['downloader'];
handler.command = /^(tiktoks|tks|tiktoksearch)$/i;

module.exports = handler;