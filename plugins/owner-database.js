const fsp = require('fs/promises');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const ROOT = path.resolve(__dirname, '..');
const TEMP = path.join(ROOT, 'temp');
const DATABASE_PATH = path.join(ROOT, 'database.json');

function stamp() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// Crear zip usando archiver (sin dependencias del sistema)
const createZip = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => resolve());
        archive.on('error', (err) => reject(err));
        archive.on('warning', (err) => {
            if (err.code === 'ENOENT') console.warn('Warning:', err);
            else reject(err);
        });

        archive.pipe(output);
        archive.file(inputPath, { name: path.basename(inputPath) });
        archive.finalize();
    });
};

let handler = async (m, { conn }) => {
    // Verificar si la base de datos existe
    try {
        await fsp.access(DATABASE_PATH);
    } catch {
        return m.reply(`> 🗄️ *No se encontró la base de datos.*`);
    }

    await m.react('🗄️');
    await fsp.mkdir(TEMP, { recursive: true }).catch(() => {});

    const zipName = `db-${stamp()}.zip`;
    const zipPath = path.join(TEMP, zipName);

    try {
        // Crear zip con archiver
        await createZip(DATABASE_PATH, zipPath);

        const stat = await fsp.stat(zipPath);
        const sizeKB = (stat.size / 1024).toFixed(2);
        const buffer = await fsp.readFile(zipPath);

        // Enviar con diseño impecable
        await conn.sendMessage(m.chat, {
            document: buffer,
            mimetype: 'application/zip',
            fileName: zipName,
            caption: `> 🗄️ *Base de datos respaldada.*`,
            contextInfo: {
                externalAdReply: {
                    title: `𝙳𝙰𝚃𝙰𝙱𝙰𝚂𝙴 𝙱𝙰𝙲𝙺𝚄𝙿`,
                    body: `${zipName} (${sizeKB} KB)`,
                    thumbnailUrl: global.icono || 'https://i.imgur.com/8fK4h6A.png',
                    sourceUrl: '',
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m });

        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        await m.reply(`> 🗄️ *Error al procesar la base de datos.*`);
    } finally {
        try { await fsp.rm(zipPath, { force: true }); } catch {}
    }
};

handler.help = ['database'];
handler.tags = ['owner'];
handler.command = ['database', 'db', 'dbbot', 'basedatos'];
handler.rowner = true;

module.exports = handler;