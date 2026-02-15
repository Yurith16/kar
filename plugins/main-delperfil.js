const { unlinkSync, existsSync } = require("fs");
const { join } = require("path");
const { checkReg } = require('../lib/checkReg.js')

let handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender];

    // Verificación de registro
    if (await checkReg(m, user)) return

    const userId = m.sender.split("@")[0];
    const pathImg = join(process.cwd(), "src", "Images", "perfiles", `${userId}.png`);

    if (existsSync(pathImg)) {
        try {
            unlinkSync(pathImg); // Borramos el archivo
            await m.react("🗑️");
            
            let txt = `✨ *IDENTIDAD RESTABLECIDA*\n\n`
            txt += `> He eliminado tu imagen personalizada. Ahora volverás a mostrar tu esencia original.\n\n`
            txt += `_Verifica el cambio con \`${usedPrefix}perfil\`_`
            
            return await conn.sendMessage(m.chat, { text: txt }, { quoted: m });
        } catch (e) {
            return m.reply("> 🥀 Hubo un error al intentar borrar tu imagen, inténtalo más tarde.");
        }
    } else {
        return m.reply("> ⚠️ No tienes ninguna imagen personalizada guardada para eliminar.");
    }
};

handler.help = ["delperfil"];
handler.tags = ["main"];
handler.command = /^(delperfil|borrarperfil|eliminarperfil)$/i;
handler.register = true;

module.exports = handler;