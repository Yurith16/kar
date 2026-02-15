const axios = require('axios');
const { checkReg } = require('../lib/checkReg.js');

const activeDownloads = new Map();
const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];
    const userNumber = userId.split("@")[0];

    if (await checkReg(m, user)) return;

    const url = args[0];

    if (activeDownloads.has(userNumber)) {
        return m.reply(`> *「⏳」 ESPERA*\n> Ya tienes una descarga en curso.`);
    }

    if (!url) {
        return m.reply(`> *「📦」 GITHUB*\n> Ingresa un enlace de repositorio.\n> Ejemplo: ${usedPrefix + command} https://github.com/usuario/repo`);
    }

    try {
        activeDownloads.set(userNumber, true);

        if (!regex.test(url)) {
            return m.reply(`> *「⚠️」 ERROR*\n> Enlace de GitHub no válido.`);
        }

        await m.react('🔍'); // buscando

        let [_, userRepo, repoName] = url.match(regex) || [];
        repoName = repoName.replace(/.git$/, "");

        await m.react('📥'); // descargando

        const apiUrl = `https://api.github.com/repos/${userRepo}/${repoName}/zipball`;

        const response = await axios({
            method: 'GET',
            url: apiUrl,
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 120000 
        });

        const fileBuffer = Buffer.from(response.data, 'binary');

        await m.react('📤'); // enviando

        await conn.sendMessage(m.chat, {
            document: fileBuffer,
            fileName: `${repoName}.zip`,
            mimetype: 'application/zip',
            caption: `> *「✅」 REPOSITORIO*\n> *Nombre:* ${repoName}\n> *De:* ${userRepo}`
        }, { quoted: m });

        await m.react('✅');

    } catch (error) {
        console.error(error);
        await m.react('✖️');
        m.reply(`> *「⚠️」 ERROR*\n> No se pudo obtener el repositorio.`);
    } finally {
        activeDownloads.delete(userNumber);
    }
};

handler.help = ['gitclone <url>'];
handler.tags = ['downloader'];
handler.command = /^(gitclone|git|github)$/i;
handler.register = true;

module.exports = handler;