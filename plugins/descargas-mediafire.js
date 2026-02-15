const axios = require("axios");
const cheerio = require("cheerio");
const { lookup } = require("mime-types");
const { checkReg } = require('../lib/checkReg.js');

function getSizeInMB(sizeText) {
    try {
        if (!sizeText || sizeText === 'N/A') return 0;
        sizeText = sizeText.toLowerCase().trim();
        const match = sizeText.match(/([\d.]+)\s*(bytes|kb|mb|gb|tb)/i);
        if (!match) return 0;
        const number = parseFloat(match[1]);
        const unit = match[2].toLowerCase();
        switch(unit) {
            case 'bytes': return number / (1024 * 1024);
            case 'kb': return number / 1024;
            case 'mb': return number;
            case 'gb': return number * 1024;
            case 'tb': return number * 1024 * 1024;
            default: return 0;
        }
    } catch (error) { return 0; }
}

const activeDownloads = new Map();

async function mediafireDl(url) {
    try {
        if (!url.includes("mediafire.com")) throw new Error("URL no válida");
        let res = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 30000,
        });
        let $ = cheerio.load(res.data);
        let link = $("#downloadButton").attr("href");
        if (!link || link.includes("javascript:void(0)")) {
            const linkMatch = res.data.match(/href="(https:\/\/download\d+\.mediafire\.com[^"]+)"/);
            link = linkMatch ? linkMatch[1] : null;
        }
        if (!link) throw new Error("No se encontró el enlace");

        const name = $(".filename").text().trim() || "archivo";
        const size = $("#downloadButton").text().replace("Download", "").replace(/[()]/g, "").trim() || "N/A";
        const ext = name.split(".").pop()?.toLowerCase();
        const mime = lookup(ext) || "application/octet-stream";

        return { name, size, mime, link };
    } catch (error) { throw new Error(error.message); }
}

let handler = async (m, { conn, args }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];
    const text = args.join(" ").trim();

    if (await checkReg(m, user)) return;

    if (activeDownloads.has(userId)) {
        await m.react('⏳');
        return conn.reply(m.chat, `> ⏳ Ya estoy procesando una descarga para ti.`, m);
    }
    
    if (!text) {
        await m.react('❓');
        return conn.reply(m.chat, `> *MEDIAFIRE*\n> Uso: .mf <url>`, m);
    }

    activeDownloads.set(userId, true);
    
    try {
        // Secuencia técnica de descargas
        await m.react('🔍'); // Buscando
        await m.react('📥'); // Descargando
        await m.react('📦'); // Procesando

        const fileInfo = await mediafireDl(text);
        const { name: fileName, size, mime, link } = fileInfo;
        const sizeMB = getSizeInMB(size);

        // Restricción de peso (500 MB)
        if (sizeMB > 500) {
            await m.react("❌");
            activeDownloads.delete(userId);
            return conn.reply(m.chat, 
                `> ⚠️ Archivo demasiado grande: ${sizeMB.toFixed(2)}MB (Límite: 500MB)\n` +
                `> Estamos trabajando para permitir descargas mayores.`, m);
        }

        // Descarga del buffer
        const response = await axios({ 
            method: "GET", 
            url: link, 
            responseType: "arraybuffer", 
            timeout: 300000
        });
        
        const fileBuffer = Buffer.from(response.data);

        await m.react('📤'); // Enviando

        // Enviar archivo con caption mínimo
        await conn.sendMessage(m.chat, { 
            document: fileBuffer, 
            mimetype: mime, 
            fileName: fileName, 
            caption: `✅ *Descarga exitosa*`
        }, { quoted: m });
        
        await m.react('✅');

    } catch (error) {
        console.error('[Mediafire Error]:', error.message);
        await m.react('❌');
        return conn.reply(m.chat, `> ❌ Error al descargar el archivo.`, m);
    } finally {
        activeDownloads.delete(userId);
    }
};

handler.help = ['mediafire <url>']
handler.tags = ['downloader']
handler.command = ["mediafire", "mf"];
handler.group = true;

module.exports = handler;