import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { premiumStyles } from "../lib/styles.js";
import { checkReg } from '../lib/checkReg.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];

    if (await checkReg(m, user)) return

    // 2. VERIFICAR ESTATUS PREMIUM
    if (!user.premium) {
        return m.reply(`> 💎 *Élite Requerido*\n\nSolo mis usuarios premium pueden alterar su esencia. Adquiere un plan con \`${usedPrefix}buypremium\`.`);
    }

    // Inicialización de estilo y objeto
    let s = premiumStyles[user.prefStyle] || premiumStyles["luxury"];
    if (!user.customPerfil) user.customPerfil = { foto: "", frase: "Viviendo la experiencia KarBot." };

    let dir = join(process.cwd(), "src", "Images", "perfiles");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";

    // Lógica para capturar Imagen
    if (/image/.test(mime)) {
        await m.react("📸");
        try {
            let img = await q.download();
            let pathImg = join(dir, `${m.sender.split("@")[0]}.png`);
            writeFileSync(pathImg, img);
            user.customPerfil.foto = pathImg;

            let txt = `✨ *𝙽𝚞𝚎𝚟𝚊 𝙸𝚖𝚊𝚐𝚎𝚗*\n\n`
            txt += `> Tu esencia visual ha sido actualizada. Se ve realmente bien.\n\n`
            txt += `_Verifica el cambio con \`${usedPrefix}perfil\`_`

            return await conn.sendMessage(m.chat, { text: txt }, { quoted: m });
        } catch (e) {
            return m.reply("> 🥀 Hubo un problema al guardar tu imagen, inténtalo de nuevo.");
        }
    }

    // Menú de ayuda minimalista
    if (!text) {
        let help = `🍃 *𝗖𝗢𝗡𝗙𝗜𝗚𝗨𝗥𝗔𝗖𝗜𝗢𝗡*\n\n`
        help += `*📸 Foto:* Responde a una imagen.\n`
        help += `*📝 Frase:* \`${usedPrefix + command} Texto\`\n\n`
        help += `_Crea una identidad que valga la pena recordar._`
        return await conn.sendMessage(m.chat, { text: help }, { quoted: m });
    }

    // Lógica para la Frase
    if (text.length > 55) return m.reply("> ⚠️ Procura que tu frase sea breve (máx. 55 letras).");

    user.customPerfil.frase = text.trim();
    await m.react("✨");

    let res = `✨ *𝙴𝚜𝚎𝚗𝚌𝚒𝚊 𝙰𝚌𝚝𝚞𝚊𝚕𝚒𝚣𝚊𝚍𝚊*\n\n`
    res += `> _"${user.customPerfil.frase}"_\n\n`
    res += `He guardado tus palabras con éxito.`

    await conn.sendMessage(m.chat, { text: res }, { quoted: m });
};

handler.help = ["setperfil"];
handler.tags = ["premium"];
handler.command = /^(setperfil|configurar|perfilset)$/i;

export default handler;