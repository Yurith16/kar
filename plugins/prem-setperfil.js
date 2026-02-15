const { writeFileSync, existsSync, mkdirSync } = require("fs");
const { join } = require("path");
const { checkReg } = require('../lib/checkReg.js');

let handler = async (m, { conn, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];

    // Verificación de registro
    if (await checkReg(m, user)) return

    let dir = join(process.cwd(), "src", "Images", "perfiles");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";

    // Lógica para capturar Imagen
    if (/image/.test(mime)) {
        await m.react("📸");
        try {
            let img = await q.download();
            // Guardamos la imagen con el ID del usuario
            let pathImg = join(dir, `${m.sender.split("@")[0]}.png`);
            writeFileSync(pathImg, img);

            let txt = `✨ *IDENTIDAD ACTUALIZADA*\n\n`
            txt += `> Tu esencia visual ha sido guardada en nuestros registros, corazón.\n`
            txt += `> Ahora cada vez que te miren, verán lo que tú decidiste mostrar.\n\n`
            txt += `_Puedes ver el resultado con *${usedPrefix}perfil*_`

            return await conn.sendMessage(m.chat, { text: txt }, { quoted: m });
        } catch (e) {
            console.error(e);
            return m.reply("> 🥀 Hubo un problema al procesar la imagen, nuestro sistema no pudo soportar tanta belleza. Inténtalo de nuevo.");
        }
    }

    // Mensaje si no se envía o responde a una imagen
    let help = `🍃 *CONFIGURAR PERFIL*\n\n`
    help += `> Para cambiar tu imagen de perfil en *KarBot*, responde a una foto con el comando:\n\n`
    help += `*COMANDO:* *${usedPrefix + command}*\n\n`
    help += `_Crea una identidad que valga la pena recordar, porque las miradas se olvidan, pero el impacto... eso es eterno._ 💋`
    
    return await conn.sendMessage(m.chat, { text: help }, { quoted: m });
};

handler.help = ["setperfil"];
handler.tags = ["main"];
handler.command = /^(setperfil|configurar|perfilset)$/i;
handler.register = true;

module.exports = handler;