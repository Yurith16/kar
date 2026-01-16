const currency = 'Coins';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!m.isGroup) return;

    if (!global.db.data.chats[m.chat]?.economy) {
        return m.reply(`> 🏦 La economía está apagada aquí. No puedo abrir la bóveda si no hay reglas claras.`);
    }

    let user = global.db.data.users[m.sender];
    if (!user) user = global.db.data.users[m.sender] = { coin: 50, bank: 0 };

    user.bank = Number(user.bank) || 0;
    user.coin = Number(user.coin) || 0;

    if (!args[0] || args[0].toLowerCase() === 'help') {
      await m.react('🏦');
      return m.reply(`> 🏦 *Gestión de retiro*\n\n🏛️ *En el banco:* ${user.bank.toLocaleString()}\n👛 *En mano:* ${user.coin.toLocaleString()}\n\n*¿Cuánto vamos a sacar hoy?*\n> • ${usedPrefix + command} [monto]\n> • ${usedPrefix + command} all | half\n\n_Recuerda que el banco retiene un 2% por el traslado de fondos._`);
    }

    let cantidad = 0;
    const input = args[0].toLowerCase();
    if (input === 'all' || input === 'todo') cantidad = user.bank;
    else if (input === 'half' || input === 'mitad') cantidad = Math.floor(user.bank / 2);
    else {
      let texto = input;
      let mult = 1;
      if (texto.endsWith('k')) { mult = 1000; texto = texto.slice(0, -1); }
      cantidad = Math.floor(parseInt(texto) * mult);
    }

    if (isNaN(cantidad) || cantidad <= 0) {
      return m.reply(`> ❌ Eso no parece un número, cariño. Dime bien cuánto quieres sacar.`);
    }

    if (cantidad > user.bank) {
      return m.reply(`> 🏛️ No puedo darte lo que no tienes. En tu cuenta solo hay **${user.bank.toLocaleString()}** ${currency}.`);
    }

    const impuesto = Math.floor(cantidad * 0.02);
    const cantidadFinal = cantidad - impuesto;

    if (cantidadFinal <= 0) return m.reply(`> 📉 Es muy poquito, el banco se lo quedaría todo en impuestos.`);

    user.bank -= cantidad;
    user.coin += cantidadFinal;

    // --- VARIACIÓN DE MENSAJES (Para evitar repetición) ---
    const msgsExito = [
        `Aquí tienes, ya saqué tus monedas. Ten mucho cuidado, hay gente con manos largas por aquí.`,
        `Transacción lista. Tus monedas ya están en tu cartera, ¡no las gastes todas en un solo lugar!`,
        `¡Bóveda abierta! He pasado los fondos a tu cuenta personal. ¿Necesitas algo más de mí?`,
        `Retiro completado. Ya tienes tus monedas contigo. Avísame si puedo ayudarte en otra cosa.`
    ];

    const despedidas = [
        `Cuida bien ese botín.`,
        `Estaré vigilando por si necesitas guardar algo más tarde.`,
        `¡Suerte con tus compras!`,
        `No olvides que en el banco están más seguras.`
    ];

    let res = `> ✅ *Retiro completado*\n\n${pickRandom(msgsExito)}\n\n`;
    res += `🏛️ *Retiro:* -${cantidad.toLocaleString()}\n`;
    res += `🧾 *Comisión:* ${impuesto.toLocaleString()}\n`;
    res += `👛 *Recibido:* +${cantidadFinal.toLocaleString()}\n\n`;
    res += `*Saldo en banco:* ${user.bank.toLocaleString()}\n`;
    res += `— — — — — — — — — — — —\n`;
    res += `*${pickRandom(despedidas)}*`;

    await m.react('💸');
    return m.reply(res);

  } catch (e) {
    console.error(e);
  }
};

handler.help = ['wd [monto]'];
handler.tags = ['economy'];
handler.command = ['wd', 'sacar', 'withdraw'];
handler.group = true;

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}