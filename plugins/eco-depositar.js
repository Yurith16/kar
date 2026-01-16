let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];

    if (m.isGroup && !global.db.data.chats[m.chat]?.economy) {
        return m.reply(
            `> 👛 *Hola, la economía no está activa en este grupo ahora mismo.*`,
        );
    }

    user.coin = Number(user.coin) || 0;
    user.bank = Number(user.bank) || 0;

    // Respuesta de asesora si no ingresa cantidad
    if (!args[0]) {
        await conn.sendMessage(m.chat, { react: { text: "📑", key: m.key } });
        let ayuda = `⚙️ *𝗔𝗦𝗘𝗦𝗢𝗥Í𝗔 𝗕𝗔𝗡𝗖𝗔𝗥𝗜𝗔*\n\n`;
        ayuda += `*Hola ${await conn.getName(m.sender)}, parece que quieres proteger tus monedas. Para ayudarte a guardarlas en el banco, por favor dime la cantidad que deseas depositar.*\n\n`;
        ayuda += `> 💡 *Ejemplo:* ${usedPrefix + command} 500\n`;
        ayuda += `> 🏦 *O usa:* ${usedPrefix + command} all _(para guardar todo)_\n\n`;
        ayuda += `*Es mucho más seguro tenerlas en el banco que en la cartera, ¿no crees?*`;
        return m.reply(ayuda);
    }

    let amount = args[0] === "all" ? user.coin : parseInt(args[0]);

    if (isNaN(amount) || amount <= 0)
        return m.reply(
            `> ❌ *Vaya, esa no parece ser una cantidad válida de monedas.*`,
        );
    if (user.coin < amount)
        return m.reply(
            `> 💸 *Lo siento, pero no tienes tantas monedas en tu cartera para realizar este depósito.*`,
        );

    user.coin -= amount;
    user.bank += amount;

    const confirmaciones = [
        `*¡Perfecto! He movido tus monedas al banco de forma segura:*`,
        `*Depósito concluido con éxito. Ahora tus ahorros están bajo llave:*`,
        `*He procesado tu solicitud, tus monedas ya están en el banco:*`,
        `*¡Listo! Me encargué personalmente de resguardar tu capital:*`,
        `*Transacción finalizada. Es un placer ayudarte con tus finanzas:*`,
        `*Tus monedas han sido transferidas a tu cuenta bancaria correctamente:*`,
        `*Buen movimiento, ponerlas a salvo es lo más inteligente hoy:*`,
        `*He actualizado tus registros bancarios con este nuevo ingreso:*`,
        `*Todo en orden, tu depósito ha sido registrado en mi sistema:*`,
        `*Listo, corazón. Tus monedas ya están protegidas de cualquier robo:*`,
    ];

    let txt = `🏛️ *𝗚𝗘𝗦𝗧𝗜Ó𝗡 𝗕𝗔𝗡𝗖𝗔𝗥𝗜𝗔*\n\n`;
    txt += `${confirmaciones[Math.floor(Math.random() * confirmaciones.length)]}\n\n`;

    txt += `> 📥 *Monto:* ${amount.toLocaleString()}\n`;
    txt += `> 🪙 *En Cartera:* ${user.coin.toLocaleString()}\n`;
    txt += `> 🏛️ *En Banco:* ${user.bank.toLocaleString()}\n\n`;

    txt += `*Tu patrimonio está a salvo de robos mientras esté en el banco.*`;

    await m.reply(txt);
    await conn.sendMessage(m.chat, { react: { text: "🏛️", key: m.key } });
};

handler.help = ["d [cantidad]"];
handler.tags = ["economy"];
handler.command = ["deposit", "d", "dep", "depositar"];
handler.group = true;

export default handler;
