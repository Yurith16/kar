import axios from 'axios'
import fetch from 'node-fetch'
import cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

const NSFW_ATREVIDO = {
    buscando_descargando: "🤫 ¡Espera! Estoy husmeando en las profundidades para succionar ese video prohibido. *Mantenlo en secreto*. ⏳",
    exito: "🔥 *¡Aquí está tu placer!* El objeto del deseo fue entregado. ¡A disfrutar! 😉",
    sin_argumentos: "🥵 Veo que tienes prisa. Para empezar la acción, dame el *enlace* o el *número* directo. ¡No seas tímido! 😌",
    error_no_encontrado: "❌ Falló la búsqueda... ese video parece ser demasiado *esquivo* o no existe. Intenta con un enlace que me *caliente* más. 😈",
    error_archivo_grande: "🚫 ¡Maldición! Era demasiado *grande*. Busca algo más *manejable* para el chat. 😔",
    error_nsfw_off: "⛔ ¡ALTO! El Owner cerró el burdel digital. El modo prohibido está apagado. Toca esperar. 😞",
    error_general: "💔 Algo se ha roto en el proceso... Me han *pillado* o la conexión falló. Vuelve a intentarlo con más *discreción*. 🥺",
    sin_diamantes: "❌ *Saldo insuficiente:* Esta descarga premium cuesta *15 Diamantes*. ¡use .comprar para obtener diamantes! 💎"
};

async function xnxxdl(URL) {
    return new Promise((resolve, reject) => {
        fetch(URL, { method: "get" })
            .then((res) => res.text())
            .then((res) => {
                const $ = cheerio.load(res, { xmlMode: false });
                const title = $('meta[property="og:title"]').attr("content") || "Video Prohibido";
                const videoScript = $("#video-player-bg > script:nth-child(6)").html() || $('body script:contains("setVideoUrlHigh")').html();

                if (!videoScript) return reject(new Error("No script found"));

                const files = {
                    low: (videoScript.match(/html5player\.setVideoUrlLow\('(.*?)'\);/i) || [])[1]?.replace(/\\/g, ""),
                    high: (videoScript.match(/html5player\.setVideoUrlHigh\('(.*?)'\);/i) || [])[1]?.replace(/\\/g, ""),
                };

                if (!files.high) return reject(new Error("No high quality link"));
                resolve({ status: 200, result: { title, files } });
            })
            .catch((err) => reject(err));
    });
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat];
    let user = global.db.data.users[m.sender];
    const costo = 15; // Costo por descarga de video

    // 1. Verificación de Registro y NSFW
    if (user && !user.registered) {
        return m.reply(`❌ Debes registrarte primero\nUsa: ${usedPrefix}reg nombre | edad | género`);
    }

    if (!chat.nsfw) {
        await conn.sendMessage(m.chat, { react: { text: '🔞', key: m.key } });
        return m.reply(`╭━━━〔 🔞 𝙽𝚂𝙵𝚆 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾 〕━━━⬣\n║\n║ ⚠️ ${NSFW_ATREVIDO.error_nsfw_off}\n║ 𝙰𝚌𝚝í𝚟𝚊𝚕𝚘 𝚌𝚘𝚗: *${usedPrefix}on nsfw*\n║\n╰━━━━━━━━━━━━━━━━━━━━━━⬣`);
    }

    // 2. Verificación de Economía (Diamantes)
    if (user.diamond < costo) {
        await conn.sendMessage(m.chat, { react: { text: '📉', key: m.key } });
        return m.reply(NSFW_ATREVIDO.sin_diamantes + `\n\nTu balance actual: *${user.diamond}* 💎`);
    }

    let text = args.join(" ").trim();
    if (!text) {
        await conn.sendMessage(m.chat, { react: { text: '🥵', key: m.key } });
        return m.reply(`> ✦ *Error:* » ${NSFW_ATREVIDO.sin_argumentos}\n> ⴵ *Ejemplo:* » ${usedPrefix}${command} 1 (si buscaste antes) o el link.`);
    }

    await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });
    
    let xnLink = "";
    if (text.match(/https?:\/\/(www\.)?xnxx\.[a-z]+\/video-/i)) {
        xnLink = text;
    } else {
        const sender = m.sender;
        const index = parseInt(text) - 1;
        if (global.videoListXXX && global.videoListXXX[sender] && global.videoListXXX[sender][index]) {
            xnLink = global.videoListXXX[sender][index];
        } else {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply(`> 💔 *Fallo:* » No hay resultados previos para el número "${text}".`);
        }
    }

    m.reply(`> 💫 *Estado:* » ${NSFW_ATREVIDO.buscando_descargando}`);
    let tempPath = path.join(process.cwd(), `temp/xnxx_${Date.now()}.mp4`);
    if (!fs.existsSync(path.join(process.cwd(), 'temp'))) fs.mkdirSync(path.join(process.cwd(), 'temp'));

    try {
        const res = await xnxxdl(xnLink);
        const downloadUrl = res.result.files.high;
        const videoTitle = res.result.title;

        await conn.sendMessage(m.chat, { react: { text: "👅", key: m.key } });

        const response = await axios({ method: "GET", url: downloadUrl, responseType: "stream" });
        const writer = fs.createWriteStream(tempPath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        const stats = fs.statSync(tempPath);
        const fileSizeMB = stats.size / (1024 * 1024);

        if (fileSizeMB > 2000) {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            return m.reply(`> 🚫 *Fallo:* » ${NSFW_ATREVIDO.error_archivo_grande}`);
        }

        // 3. COBRO DE DIAMANTES (Solo si la descarga fue exitosa hasta aquí)
        user.diamond -= costo;

        const finalCaption = `╭━━〔 🔥 *𝙺𝙰𝚁𝙱𝙾𝚃 𝚂𝙴𝙰𝚁𝙲𝙷* 〕━━╮\n║\n║ 🫦 ${NSFW_ATREVIDO.exito}\n║\n║ 🎬 *𝚃í𝚝𝚞𝚕𝚘:* ${videoTitle}\n║ 📦 *𝙿𝚎𝚜𝚘:* ${fileSizeMB.toFixed(2)} MB\n║ 💰 *𝙲𝚘𝚜𝚝𝚘:* ${costo} Diamantes\n║\n╰━━━━━━━━━━━━━━━━━━━━━━⬣`;

        await conn.sendMessage(m.chat, {
            video: fs.readFileSync(tempPath),
            caption: finalCaption,
            mimetype: 'video/mp4'
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "💦", key: m.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`> 💔 *Fallo:* » ${NSFW_ATREVIDO.error_no_encontrado}`);
    } finally {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
};

handler.help = ['xnxxdl <link/num>'];
handler.tags = ['NSFW'];
handler.command = /^(xnxxdl|xnvideo)$/i;
handler.register = true;

export default handler;