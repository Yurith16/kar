const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { checkReg } = require('../lib/checkReg.js');
const descargas = require('./descargas-activas.js');

// Función para identificar si es URL
const isSpotifyUrl = (text) => /https?:\/\/(open\.spotify\.com|spotify\.link)\//.test(text);

// Buscar el primer resultado usando Delirius
async function getFirstSpotifyResult(query) {
    const url = `https://api.delirius.store/search/spotify?q=${encodeURIComponent(query)}&limit=1`;
    const { data } = await axios.get(url);
    if (!data.status || !data.data || data.data.length === 0) {
        throw new Error('No se encontraron resultados, corazón.');
    }
    return data.data[0];
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    if (await checkReg(m, user)) return;

    if (!text) {
        await m.react('🤔');
        return m.reply(`> *¿Qué desea buscar en Spotify hoy, tesoro?*`);
    }

    if (descargas.tieneDescargasActivas(userId)) {
        await m.react('⏳');
        return m.reply(`> ⏳ *Ya tienes una descarga activa, espera.*`);
    }

    try {
        descargas.registrarDescarga(userId, 'spotify');
        await m.react('🔍');

        let songInfo;
        let spotifyUrl;

        // Si es URL la usamos directo, si no, buscamos el primer resultado
        if (isSpotifyUrl(text)) {
            spotifyUrl = text;
            const search = await getFirstSpotifyResult(text); // Para sacar los metadatos
            songInfo = search;
        } else {
            songInfo = await getFirstSpotifyResult(text);
            spotifyUrl = songInfo.url;
        }

        // Obtener link de descarga
        const downloadApi = `https://api-aswin-sparky.koyeb.app/api/downloader/spotify?url=${encodeURIComponent(spotifyUrl)}`;
        const downloadResponse = await axios.get(downloadApi);

        if (!downloadResponse.data.status || !downloadResponse.data.data) {
            throw new Error('No se pudo obtener el archivo de audio.');
        }

        const { title, artist, cover, download } = downloadResponse.data.data;

        // --- DISEÑO ESTILO KARBOT (IGUAL A PLAY) ---
        const details = 
            `> 🎬 *「🌱」 ${title}*\n\n` +
            `> 🍃 *Artista:* » ${artist}\n` +
            `> ⚘ *Duración:* » ${songInfo.duration || 'N/A'}\n` +
            `> 💿 *Álbum:* » ${songInfo.album || 'Single'}\n` +
            `> 🍀 *Publicado:* » ${songInfo.publish || 'Reciente'}\n` +
            `> 🌿 *Enlace:* » ${spotifyUrl}`;

        // Enviamos la info con la portada
        await conn.sendMessage(m.chat, { 
            image: { url: cover || songInfo.image }, 
            caption: details 
        }, { quoted: m });

        await m.react('📥');

        // Preparar descarga temporal
        const tmpDir = path.join(process.cwd(), 'tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        const outputPath = path.join(tmpDir, `${Date.now()}_spotify.mp3`);

        const response = await axios({
            method: 'GET',
            url: download,
            responseType: 'stream',
            timeout: 60000
        });

        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await m.react('📦');

        // Enviar como Documento (predeterminado)
        await conn.sendMessage(m.chat, {
            document: fs.readFileSync(outputPath),
            mimetype: "audio/mpeg",
            fileName: `${title.replace(/[<>:"/\\|?*]/g, '')}.mp3`,
            caption: `> ✅ *Spotify completado*`
        }, { quoted: m });

        await m.react('✅');

        // Limpiar
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    } catch (err) {
        await m.react('❌');
        await m.reply(`> 🌪️ *Vaya drama...* ${err.message}`);
    } finally {
        descargas.finalizarDescarga(userId);
    }
};

handler.help = ['spotify <nombre/url>'];
handler.tags = ['downloader'];
handler.command = /^(spotify|sp)$/i;
handler.group = true;

module.exports = handler;