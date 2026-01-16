import fetch from 'node-fetch'
import cheerio from 'cheerio'

// =================================================================
// 🔥 CONFIGURACIÓN KARBOT - MENSAJES Y ECONOMÍA 🔥
// =================================================================
const costo = 5; // Cantidad de Diamantes que cuesta la búsqueda

const NSFW_ATREVIDO_SEARCH = {
    buscando: "🤫 ¡Espera! Estoy revisando los rincones más sucios de XNXX por ti. Dame un momento... 🔍",
    exito: "😈 ¡Aquí están los resultados! Mira la lista y elige tu placer. 👇",
    sin_argumentos: "🥵 Veo que tienes prisa. Para empezar la acción, dame el *término* de búsqueda. ¡No seas tímido! 😌",
    error_no_encontrado: "🤔 No encontré nada para esa *fantasía*... Intenta ser más específico o buscar algo más popular. 🤨",
    error_nsfw_off: "⛔ ¡ALTO! El burdel digital está cerrado en este grupo. 😞",
    sin_diamantes: `❌ *¡No tienes suficientes diamantes!* \nEsta búsqueda cuesta *${costo} Diamantes*. Revisa tu balance con .bal`,
};

// --- FUNCIÓN SCRAPER (INTACTA) ---
async function xnxxsearch(query) {
    return new Promise((resolve, reject) => {
        const baseurl = "https://www.xnxx.com";
        fetch(`${baseurl}/search/${query}/${Math.floor(Math.random() * 3) + 1}`, { method: "get" })
            .then((res) => res.text())
            .then((res) => {
                const $ = cheerio.load(res, { xmlMode: false });
                const results = [];
                $("div.mozaique").each(function (a, b) {
                    $(b).find("div.thumb-under").each(function (c, d) {
                        const url = baseurl + $(d).find("a").attr("href").replace("/THUMBNUM/", "/");
                        const title = $(d).find("a").attr("title");
                        const infoString = $(d).find("p.metadata").text().trim();
                        const parts = infoString.split("|").map((p) => p.trim());
                        if (title && url) {
                            results.push({
                                title,
                                link: url,
                                durationQuality: parts[0] || "N/A",
                                viewsAndDate: parts[1] || "N/A",
                            });
                        }
                    });
                });
                if (results.length === 0) return reject(new Error("No results"));
                resolve({ status: true, result: results });
            })
            .catch((err) => reject(err));
    });
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Verificación de Registro y NSFW
    let chat = global.db.data.chats[m.chat];
    let user = global.db.data.users[m.sender];

    if (!user.registered) return m.reply(`❌ Debes registrarte primero\nUsa: ${usedPrefix}reg nombre | edad | género`);
    
    if (!chat.nsfw) {
        await conn.sendMessage(m.chat, { react: { text: '🔞', key: m.key } });
        return m.reply(`> ⛔ *Bloqueo:* » ${NSFW_ATREVIDO_SEARCH.error_nsfw_off}`);
    }

    // 2. Verificación de Economía (Diamantes)
    if (user.diamond < costo) {
        await conn.sendMessage(m.chat, { react: { text: '📉', key: m.key } });
        return m.reply(NSFW_ATREVIDO_SEARCH.sin_diamantes);
    }

    let text = args.join(" ").trim();
    if (!text) {
        await conn.sendMessage(m.chat, { react: { text: '🥵', key: m.key } });
        return m.reply(`> ✦ *Error:* » ${NSFW_ATREVIDO_SEARCH.sin_argumentos}\n> ⴵ *Ejemplo:* » ${usedPrefix}${command} con mi prima`);
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });
        m.reply(`> 💫 *Estado:* » ${NSFW_ATREVIDO_SEARCH.buscando}`);

        const res = await xnxxsearch(text);
        const json = res.result;

        // Descontar diamantes tras búsqueda exitosa
        user.diamond -= costo;

        if (!global.videoListXXX) global.videoListXXX = {};
        global.videoListXXX[m.sender] = []; 

        let cap = `╭━━〔 🔥 *𝙺𝙰𝚁𝙱𝙾𝚃 𝚂𝙴𝙰𝚁𝙲𝙷* 〕━━╮\n\n`;
        cap += `*${NSFW_ATREVIDO_SEARCH.exito}*\n\n`;
        cap += `*Búsqueda:* _${text.toUpperCase()}_\n`;
        cap += `*Costo:* 💎 ${costo} Diamantes (Descontados)\n\n`;

        let count = 1;
        for (const v of json) {
            global.videoListXXX[m.sender].push(v.link);
            cap += ` *「${count}」 ${v.title}*\n`;
            cap += `> ✦ *Detalles:* » ${v.durationQuality}\n`;
            cap += `> 🔗 *Enlace:* » ${v.link}\n`;
            cap += "—\n";
            count++;
            if (count > 10) break;
        }

        cap += `\n*😈 Para descargar, usa:*\n*${usedPrefix}xnxxdl [número]*`;

        await conn.sendMessage(m.chat, { text: cap.trim() }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`> 💔 *Fallo:* » ${NSFW_ATREVIDO_SEARCH.error_no_encontrado}`);
    }
};

handler.help = ['xnxxsearch <texto>'];
handler.tags = ['NSFW'];
handler.command = /^(xnxxsearch|xnxxs|searchxnxx)$/i;

export default handler;