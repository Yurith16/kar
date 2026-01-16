import axios from 'axios';
import fetch from 'node-fetch';

let handler = async (m, { command, conn, usedPrefix }) => {
    // 1. Verificación de Registro y Chat
    let chat = global.db.data.chats[m.chat];
    let user = global.db.data.users[m.sender];
    const costo = 5; // Costo en diamantes por cada imagen NSFW

    if (!user.registered) return m.reply(`❌ Debes registrarte primero\nUsa: ${usedPrefix}reg nombre | edad | género`);

    if (!chat.nsfw) {
        await conn.sendMessage(m.chat, { react: { text: '🔞', key: m.key } });
        return m.reply(`╭━━━〔 🔞 𝙽𝚂𝙵𝚆 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾 〕━━━⬣\n║\n║ ⚠️ El burdel está cerrado por ahora.\n║ 𝙰𝚌𝚝í𝚟𝚊𝚕𝚘 𝚌𝚘𝚗: *${usedPrefix}on nsfw*\n║\n╰━━━━━━━━━━━━━━━━━━━━━━⬣`);
    }

    // 2. Verificación de Economía (Diamantes)
    if (user.diamond < costo) {
        await conn.sendMessage(m.chat, { react: { text: '📉', key: m.key } });
        return m.reply(`❌ *Diamantes insuficientes*\n\nNecesitas *${costo} Diamantes* para ver este contenido. \nTu balance: *${user.diamond}*`);
    }

    await conn.sendMessage(m.chat, { react: { text: '🥵', key: m.key } });

    let url;
    const frases = [
        "🔥 Aquí tienes algo para calmar la sed...",
        "💦 Uff... esto se puso caliente de repente.",
        "😏 Justo lo que estabas buscando, ¿verdad?",
        "🫦 Una dosis de placer directo a tu chat...",
        "👀 Espero que estés solo viendo esto...",
        "🔥 No me hago responsable si alguien te atrapa mirando esto."
    ];
    let caption = `_${frases[Math.floor(Math.random() * frases.length)]}_\n\n💰 *Pago:* ${costo} Diamantes descontados.`;

    try {
        let type = command;
        if (command === 'loli') type = 'nsfwloli';
        if (command === 'imglesbi') type = 'imagenlesbians';

        switch (command) {
            case 'loli':
            case 'yuri':
            case 'tetas':
            case 'booty':
            case 'ecchi':
            case 'porno':
            case 'hentai':
            case 'pechos':
            case 'panties':
                let res = (await axios.get(`https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/${type}.json`)).data;
                url = res[Math.floor(res.length * Math.random())];
                break;

            case 'imglesbi':
                let lesb = (await axios.get(`https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/imagenlesbians.json`)).data;
                url = lesb[Math.floor(lesb.length * Math.random())];
                break;

            case 'trapito':
                let trap = await fetch(`https://api.waifu.pics/nsfw/trap`);
                let jsonTrap = await trap.json();
                url = jsonTrap.url;
                break;

            case 'yaoi':
                let yaoi = await fetch(`https://nekobot.xyz/api/image?type=yaoi`);
                let jsonYaoi = await yaoi.json();
                url = jsonYaoi.message;
                break;

            case 'yaoi2':
            case 'yuri2':
                let category = command === 'yaoi2' ? 'yaoi' : 'yuri';
                let purr = await fetch(`https://purrbot.site/api/img/nsfw/${category}/gif`);
                let jsonPurr = await purr.json();
                url = jsonPurr.link;
                break;

            case 'randomxxx':
                const raws = ['tetas', 'booty', 'imagenlesbians', 'panties', 'porno'];
                let pick = raws[Math.floor(raws.length * Math.random())];
                let resRand = (await axios.get(`https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/${pick}.json`)).data;
                url = resRand[Math.floor(resRand.length * Math.random())];
                break;
        }

        if (!url) throw 'Error';

        // 3. Descontar diamantes y enviar
        user.diamond -= costo;

        await conn.sendMessage(m.chat, { 
            image: { url: url }, 
            caption: caption 
        }, { quoted: m });
        
        await conn.sendMessage(m.chat, { react: { text: '💦', key: m.key } });

    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply('💔 La conexión falló... parece que no quiere que lo veas hoy.');
    }
};

handler.help = ['loli', 'yuri', 'yuri2', 'yaoi', 'yaoi2', 'tetas', 'booty', 'ecchi', 'trapito', 'imglesbi', 'porno'];
handler.command = /^(loli|yuri|yuri2|yaoi|yaoi2|tetas|booty|ecchi|trapito|imglesbi|porno|hentai|pechos|panties|randomxxx)$/i;
handler.tags = ['NSFW'];
handler.register = true;

export default handler;