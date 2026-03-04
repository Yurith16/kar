const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { checkReg } = require('../lib/checkReg.js');
const descargas = require('./descargas-activas.js');

// Función para detectar si es URL de Spotify
function isSpotifyUrl(text) {
    return text.includes('open.spotify.com/');
}

// Función para buscar en Spotify usando Delirius API
async function getFirstSpotifyResult(query) {
    const url = `https://api.delirius.store/search/spotify?q=${encodeURIComponent(query)}&limit=1`;
    const { data } = await axios.get(url, { timeout: 15000 });
    if (!data.status || !data.data || data.data.length === 0) {
        throw new Error('No se encontraron resultados, corazón.');
    }
    return data.data[0];
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    // Verificación de Registro
    if (await checkReg(m, user)) return;

    if (!text) {
        await m.react('🤔');
        return await conn.sendMessage(m.chat, { 
          text: `Uso: .${command} <nombre de canción o link de Spotify>` 
        }, { quoted: m });
    }

    // Verificar descargas activas (sistema global)
    if (descargas.tieneDescargasActivas(userId)) {
        await m.react('⏳');
        return await conn.sendMessage(m.chat, { 
          text: '⏳ Ya tienes una descarga activa, espera.' 
        }, { quoted: m });
    }

    try {
        descargas.registrarDescarga(userId, 'spotify');
        await m.react('🔍');

        let spotifyUrl;
        let songInfo;

        // CASO 1: Es URL directa de Spotify
        if (isSpotifyUrl(text)) {
            spotifyUrl = text;
            // Intentar obtener información de la URL (opcional)
            try {
                const searchResults = await getFirstSpotifyResult(spotifyUrl.split('/').pop() || '');
                songInfo = searchResults;
            } catch {
                songInfo = { title: 'Canción de Spotify', artist: 'Artista' };
            }
        } 
        // CASO 2: Es búsqueda por texto
        else {
            await conn.sendMessage(m.chat, { 
                text: `🔎 Buscando: *${text}*` 
            }, { quoted: m });

            songInfo = await getFirstSpotifyResult(text);
            spotifyUrl = songInfo.url;
        }

        // Obtener descarga de Aswin API
        const downloadApi = `https://api-aswin-sparky.koyeb.app/api/downloader/spotify?url=${encodeURIComponent(spotifyUrl)}`;
        const downloadResponse = await axios.get(downloadApi, { timeout: 30000 });

        if (!downloadResponse.data.status || !downloadResponse.data.data) {
            throw new Error('No se pudo obtener la descarga');
        }

        const { title, artist, cover, download } = downloadResponse.data.data;

        // Informar al usuario
        await conn.sendMessage(m.chat, {
            image: { url: cover },
            caption: `🎵 Descargando: *${title}*\n👤 Artista: ${artist}`
        }, { quoted: m });

        await m.react('📥');

        // Preparar descarga temporal
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        // Descargar el audio
        const response = await axios({
            method: 'GET',
            url: download,
            responseType: 'arraybuffer',
            timeout: 60000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*'
            }
        });

        const audioBuffer = Buffer.from(response.data);
        const pesoMB = (audioBuffer.length / (1024 * 1024)).toFixed(2);

        if (!audioBuffer || audioBuffer.length === 0) {
            throw new Error('Downloaded audio buffer is empty');
        }

        await m.react('📦');

        // Enviar como audio
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${title.replace(/[^\w\s-]/g, '')}.mp3`,
            ptt: false
        }, { quoted: m });

        await m.react('✅');

        // Limpiar archivos temporales (si existen)
        try {
            if (fs.existsSync(tmpDir)) {
                const files = fs.readdirSync(tmpDir);
                const now = Date.now();
                files.forEach(file => {
                    const filePath = path.join(tmpDir, file);
                    try {
                        const stats = fs.statSync(filePath);
                        if (now - stats.mtimeMs > 10000) {
                            if (file.endsWith('.mp3') || /^\d+\.mp3$/.test(file)) {
                                fs.unlinkSync(filePath);
                            }
                        }
                    } catch (e) {}
                });
            }
        } catch (cleanupErr) {}

    } catch (err) {
        console.error('[Spotify Error]:', err.message);
        await m.react('❌');

        let errorMessage = '❌ Error al descargar la canción.';
        if (err.message.includes('No se encontraron resultados')) {
            errorMessage = `❌ No se encontraron resultados para "${text}".`;
        } else if (err.response?.status === 451 || err.status === 451) {
            errorMessage = '❌ Contenido no disponible (451). Esto puede deberse a restricciones legales.';
        } else if (err.message && err.message.includes('timeout')) {
            errorMessage = '❌ Tiempo de espera agotado. El servidor no responde.';
        }

        await conn.sendMessage(m.chat, { 
            text: errorMessage 
        }, { quoted: m });
    } finally {
        descargas.finalizarDescarga(userId);
    }
};

handler.help = ['spotify'];
handler.tags = ['downloader'];
handler.command = /^(spotify|sp)$/i;
handler.register = true;
handler.group = true;

module.exports = handler;