// plugins/facebook2.js
const got = require('got'); // Cambiamos a got normal
const cheerio = require('cheerio');
const { checkReg } = require('../lib/checkReg.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const TARGET_URL = 'https://fdownloader.net/es';

// Headers fijos para las peticiones
const DEFAULT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
};

// Control de descargas activas por usuario
const activeDownloads = new Map();

let handler = async (m, { conn, text }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    if (await checkReg(m, user)) return;

    if (!text) {
        await m.react('🤔');
        return m.reply(`> ¿Qué video de Facebook desea descargar?\n> Envíe el enlace con: .fb <url>`);
    }

    // Validar URL de Facebook
    if (!text.includes('facebook.com') && !text.includes('fb.watch')) {
        await m.react('❌');
        return m.reply(`> ❌ *Eso no parece un enlace de Facebook válido.*`);
    }

    if (activeDownloads.has(userId)) {
        await m.react('⏳');
        return m.reply(`> ⏳ *Ya estoy procesando una descarga, paciencia.*`);
    }

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    
    const tempVideo = path.join(tmpDir, `fb_${Date.now()}.mp4`);

    try {
        activeDownloads.set(userId, true);
        
        // Secuencia técnica de reacciones
        await m.react('🔍'); // Buscando
        await m.react('📥'); // Descargando

        // --- INICIO DEL SCRAPER SIMPLIFICADO ---
        // 1. Obtener la página principal
        const response1 = await got.get(TARGET_URL, {
            headers: DEFAULT_HEADERS
        });

        // Extraer tokens usando regex
        const kExp = response1.body.match(/k_exp\s*=\s*["']?(\d+)["']?/)?.[1] || '1770235762';
        const kToken = response1.body.match(/k_token\s*=\s*["']?([a-f0-9]+)["']?/)?.[1] || 'b549f6763739d512060f25e56f57d962121b88403fa64bab897802fa3759ceff';
        const cfTokenMatch = response1.body.match(/name="cf_token"\s*value="([^"]+)"/);
        const cfToken = cfTokenMatch ? cfTokenMatch[1] : '';

        // 2. Llamar a la API de descarga
        const response2 = await got.post('https://v3.fdownloader.net/api/ajaxSearch', {
            headers: {
                'User-Agent': DEFAULT_HEADERS['User-Agent'],
                'Referer': TARGET_URL,
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://fdownloader.net',
                'X-Requested-With': 'XMLHttpRequest'
            },
            form: {
                k_exp: kExp,
                k_token: kToken,
                q: text.trim(),
                lang: 'es',
                web: 'fdownloader.net',
                v: 'v2',
                w: '',
                cftoken: cfToken
            },
            responseType: 'json'
        });

        if (!response2.body || !response2.body.data) {
            throw new Error('No se pudo obtener información del video');
        }

        const $api = cheerio.load(response2.body.data);
        const results = [];
        
        $api('a.download-link-fb').each((i, el) => {
            const quality = $api(el).closest('tr').find('.video-quality').text().trim() || 'Desconocida';
            const url = $api(el).attr('href');
            if (url && url.startsWith('http')) {
                results.push({ quality, url });
            }
        });

        if (results.length === 0) {
            throw new Error('No se encontraron enlaces de descarga');
        }

        // Elegir la mejor calidad
        const downloadUrl = results[0].url;
        const calidad = results[0].quality;

        // Descargar el video
        await m.react('📦'); // Procesando
        const response = await axios({
            url: downloadUrl,
            method: 'GET',
            responseType: 'stream',
            timeout: 600000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            headers: {
                'Referer': 'https://fdownloader.net/',
                'User-Agent': DEFAULT_HEADERS['User-Agent']
            }
        });
        
        const writer = fs.createWriteStream(tempVideo);
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        await m.react('📤'); // Enviando
        
        const videoBuffer = fs.readFileSync(tempVideo);
        const fileName = `facebook_video_${Date.now()}.mp4`;
        
        await conn.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            fileName: fileName,
            caption: `✅ *Descarga exitosa*`
        }, { quoted: m });

        await m.react('✅'); // Éxito

    } catch (error) {
        console.error('[Facebook Error]:', error.message);
        await m.react('❌');
        
        let errorMsg = '> 🌪️ *Vaya drama...* ';
        if (error.message.includes('No se pudo obtener')) {
            errorMsg += 'No pude obtener información del video.';
        } else if (error.message.includes('No se encontraron enlaces')) {
            errorMsg += 'No se encontraron enlaces de descarga.';
        } else if (error.message.includes('404')) {
            errorMsg += 'El video no está disponible.';
        } else if (error.message.includes('ECONNRESET') || error.message.includes('timeout')) {
            errorMsg += 'La conexión se interrumpió.';
        } else {
            errorMsg += 'Error al descargar el video.';
        }
        
        await m.reply(errorMsg);
    } finally {
        activeDownloads.delete(userId);
        if (fs.existsSync(tempVideo)) fs.unlinkSync(tempVideo);
        await conn.sendPresenceUpdate('paused', m.chat);
    }
};

handler.help = ['facebook <url>'];
handler.tags = ['downloader'];
handler.command = ['fb','facebook','fbdl'];
handler.group = true;

module.exports = handler;