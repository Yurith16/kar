import fetch from 'node-fetch'
import cheerio from 'cheerio'

// =================================================================
// 🔥 CONFIGURACIÓN KARBOT - MENSAJES ATREVIDOS BÚSQUEDA XVIDEOS 🔥
// =================================================================
const NSFW_ATREVIDO_XV_SEARCH = {
    buscando: "🤫 ¡Espera! Estoy husmeando en Xvideos para encontrar tus fantasías. Dame un segundo... 🔍",
    exito: "😈 ¡He encontrado carne fresca! Elige el número que más te excite. 👇",
    sin_argumentos: "🥵 ¿Qué quieres buscar? No puedo leerte la mente todavía. ¡Dime qué se te antoja! 😌",
    error_no_encontrado: "🤔 No hay nada... Parece que tus gustos son demasiado *exóticos* o no hay videos así. 🤨",
    error_nsfw_off: "⛔ ¡ALTO! El burdel de Xvideos está cerrado en este grupo. 😞",
};

/**
 * Función Scraper de Búsqueda Xvideos
 */
async function xvideosSearch(query) {
    return new Promise((resolve, reject) => {
        const baseurl = "https://www.xvideos.com";
        fetch(`${baseurl}/?k=${query}&p=${Math.floor(Math.random() * 3)}`, { method: "get" })
            .then((res) => res.text())
            .then((res) => {
                const $ = cheerio.load(res, { xmlMode: false });
                const results = [];

                // Selector específico para las miniaturas de Xvideos
                $('div.mozaique > div.thumb-block').each(function (a, b) {
                    const url = baseurl + $(b).find('div.thumb > a').attr('href');
                    const title = $(b).find('p > a').attr('title');
                    const duration = $(b).find('span.duration').text();
                    
                    if (title && url) {
                        results.push({
                            title,
                            link: url,
                            duration: duration || "N/A"
                        });
                    }
                });

                if (results.length === 0) return reject(new Error("No results"));
                resolve({ status: true, result: results });
            })
            .catch((err) => reject(err));
    });
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Verificación de NSFW
    let chat = global.db.data.chats[m.chat];
    if (!chat.nsfw) {
        await conn.sendMessage(m.chat, { react: { text: '🔞', key: m.key } });
        return m.reply(`> ⛔ *Bloqueo:* » ${NSFW_ATREVIDO_XV_SEARCH.error_nsfw_off}`);
    }

    let text = args.join(" ").trim();
    if (!text) {
        await conn.sendMessage(m.chat, { react: { text: '🥵', key: m.key } });
        return m.reply(`> ✦ *Error:* » ${NSFW_ATREVIDO_XV_SEARCH.sin_argumentos}\n> ⴵ *Ejemplo:* » ${usedPrefix}${command} colegialas`);
    }

    try {
        // 2. Reacción de inicio
        await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });
        m.reply(`> 💫 *Estado:* » ${NSFW_ATREVIDO_XV_SEARCH.buscando}`);

        const res = await xvideosSearch(text);
        const json = res.result;

        // 3. Guardar lista en memoria para el comando de descarga
        // Usamos la misma variable global para que sea fácil
        if (!global.videoListXXX) global.videoListXXX = {};
        global.videoListXXX[m.sender] = json.map(v => v.link); 

        let cap = `╭━━〔 🔥 *𝚇𝚅𝙸𝙳𝙴𝙾𝚂 𝚂𝙴𝙰𝚁𝙲𝙷* 〕━━╮\n\n`;
        cap += `*${NSFW_ATREVIDO_XV_SEARCH.exito}*\n\n`;
        cap += `*Búsqueda:* _${text.toUpperCase()}_\n\n`;

        let count = 1;
        for (const v of json) {
            cap += ` *「${count}」 ${v.title}*\n`;
            cap += `> ⏳ *Duración:* » ${v.duration}\n`;
            cap += `> 🔗 *Link:* » ${v.link}\n`;
            cap += "—\n";
            
            count++;
            if (count > 10) break; // Mostramos máximo 10
        }

        cap += `\n*😈 Para descargar, usa:*\n*${usedPrefix}xvideosdl [número]*\n_(Ejemplo: ${usedPrefix}xvideosdl 1)_`;

        // 4. Enviar resultados
        await conn.sendMessage(m.chat, { text: cap.trim() }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`> 💔 *Fallo:* » ${NSFW_ATREVIDO_XV_SEARCH.error_no_encontrado}`);
    }
};

handler.help = ['xvsearch <tema>'];
handler.tags = ['NSFW'];
handler.command = /^(xvsearch|xvsearch|xvideossearch)$/i;

export default handler;