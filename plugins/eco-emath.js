const emojiMathActivo = new Map();
const todosEmojis = ['🦁', '🍎', '💎', '🚗', '🍕', '⚽', '🎸', '🦊', '🍌', '👑', '🚀', '🍔', '🏀', '🎨', '🐼', '🍓', '💍', '✈️', '🌮', '🎾'];

let handler = async (m, { conn, usedPrefix, command, args }) => {
    if (emojiMathActivo.has(m.sender)) return m.reply(`> ⏳ *Cariño, ya tienes un juego en marcha. ¡Termina ese primero!*`);

    let modo = 'facil'; 
    if (args[0] === 'normal' || command.includes('normal')) modo = 'normal';
    if (args[0] === 'dificil' || command.includes('dificil')) modo = 'dificil';

    // --- ECONOMÍA EQUILIBRADA (ESCASEZ) ---
    let config = {
        facil: { intentos: 3, tiempo: 120000, premios: { coin: 60, exp: 40, kryons: 1 }, emoji: '🟢' },
        normal: { intentos: 2, tiempo: 90000, premios: { coin: 120, exp: 80, kryons: 3 }, emoji: '🟡' },
        dificil: { intentos: 1, tiempo: 60000, premios: { coin: 250, exp: 150, kryons: 8 }, emoji: '🔴' }
    };

    let cfg = config[modo];
    let sel = [...todosEmojis].sort(() => Math.random() - 0.5).slice(0, 3);

    let v1, v2, v3;
    if (modo === 'facil') {
        v1 = Math.floor(Math.random() * 5) + 5; 
        v2 = Math.floor(Math.random() * 5) + 2; 
        v3 = Math.floor(Math.random() * 3) + 1;
    } else if (modo === 'normal') {
        v1 = Math.floor(Math.random() * 12) + 8; 
        v2 = Math.floor(Math.random() * 10) + 5; 
        v3 = Math.floor(Math.random() * 6) + 2;
    } else {
        v1 = Math.floor(Math.random() * 25) + 15; 
        v2 = Math.floor(Math.random() * 20) + 10; 
        v3 = Math.floor(Math.random() * 15) + 5;
    }

    let ecuaciones = [
        `${sel[0]} + ${sel[0]} = ${v1 + v1}`,
        `${sel[0]} + ${sel[1]} = ${v1 + v2}`,
        `${sel[1]} - ${sel[2]} = ${v2 - v3}`
    ];

    let respuestaCorrecta = v1 + v2 + v3;

    let caption = `${cfg.emoji} *𝗗𝗘𝗦𝗔𝗙Í𝗢 𝗠𝗔𝗧𝗘𝗠Á𝗧𝗜𝗖𝗢: ${modo.toUpperCase()}*\n\n`;
    caption += `*¡Hola! He preparado este acertijo para ti. ¿Podrás resolverlo?*\n\n`;
    ecuaciones.forEach((eq, i) => { caption += `${i + 1}. ${eq}\n`; });

    caption += `\n🎯 *Pregunta final:*\n`;
    caption += `> \`\`\`${sel[0]} + ${sel[1]} + ${sel[2]} = ?\`\`\`\n\n`;
    caption += `📊 *Detalles del Reto:*\n`;
    caption += `> ❤️ Intentos: ${cfg.intentos}\n`;
    caption += `> ⏰ Tiempo: ${cfg.tiempo / 60000}m\n\n`;
    caption += `🎁 *Recompensa:* ${cfg.premios.coin} Coins\n\n`;
    caption += `*Responde directamente a este mensaje con el número. ¡Suerte!*`;

    await m.react('🧮');

    let sentMsg = await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m });

    emojiMathActivo.set(m.sender, {
        msgId: sentMsg.key.id,
        key: sentMsg.key,
        modo: modo,
        respuestaCorrecta: respuestaCorrecta,
        premios: cfg.premios,
        intentos: cfg.intentos,
        chat: m.chat,
        timeout: setTimeout(() => {
            if (emojiMathActivo.has(m.sender)) {
                conn.sendMessage(m.chat, { text: `> ⏰ *TIEMPO AGOTADO*\n\n*Se acabó el tiempo, corazón. La respuesta era ${respuestaCorrecta}.*` });
                emojiMathActivo.delete(m.sender);
            }
        }, cfg.tiempo)
    });
}

handler.before = async (m, { conn }) => {
    let game = emojiMathActivo.get(m.sender);
    if (!game || m.isBaileys || !m.text) return;

    const quotedId = m.quoted ? (m.quoted.id || m.quoted.key?.id) : null;
    if (!quotedId || quotedId !== game.msgId) return;

    let text = m.text.trim();
    let user = global.db.data.users[m.sender];
    let respuestaUsuario = parseInt(text);

    if (isNaN(respuestaUsuario)) return;

    if (respuestaUsuario === game.respuestaCorrecta) {
        clearTimeout(game.timeout);
        user.coin = (user.coin || 0) + game.premios.coin;
        user.exp = (user.exp || 0) + game.premios.exp;
        user.kryons = (user.kryons || 0) + game.premios.kryons;

        await m.react('🎉');
        let winMsg = `✅ *¡𝗟𝗢 𝗟𝗢𝗚𝗥𝗔𝗦𝗧𝗘! (${game.modo.toUpperCase()})*\n\n`;
        winMsg += `*¡Increíble! La respuesta era ${game.respuestaCorrecta}. Aquí tienes tu premio:* \n\n`;
        winMsg += `> 💰 +${game.premios.coin} Coins\n`;
        winMsg += `> ✨ +${game.premios.exp} Exp\n`;
        winMsg += `> ⚡ +${game.premios.kryons} Kryons\n\n`;
        winMsg += `*¡Estoy muy orgullosa de tu inteligencia!*`;

        await conn.sendMessage(m.chat, { text: winMsg }, { quoted: m });
        emojiMathActivo.delete(m.sender);
    } else {
        game.intentos -= 1;
        await m.react('❌');

        if (game.intentos > 0) {
            await m.reply(`> ❌ *¡Casi! Pero esa no es la respuesta.*\n\n*Te quedan ${game.intentos} ${game.intentos === 1 ? 'intento' : 'intentos'}. ¡Piénsalo bien!*`);
        } else {
            let perderMsg = `💀 *𝗙𝗜𝗡 𝗗𝗘𝗟 𝗝𝗨𝗘𝗚𝗢*\n\n`;
            perderMsg += `*Oh no... te has quedado sin intentos. La respuesta correcta era ${game.respuestaCorrecta}.*\n\n`;
            perderMsg += `*No te desanimes, ¡sigamos practicando!*`;
            await m.reply(perderMsg);
            clearTimeout(game.timeout);
            emojiMathActivo.delete(m.sender);
        }
    }
    return true;
}

handler.help = ['emath', 'emath normal', 'emath dificil'];
handler.tags = ['game'];
handler.command = /^(emath|math|emojimath)$/i;

export default handler;