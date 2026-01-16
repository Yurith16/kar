let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        if (!m.isGroup) return;
        if (!global.db.data.chats[m.chat]?.economy) return m.reply(`> 🎭 La economía está desactivada en este grupo, no me pidas que ignore las reglas.`);

        let who = m.quoted ? m.quoted.sender : (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);
        if (!who) return m.reply(`> 🎭 ¿A quién tienes en la mira? Menciona a alguien o responde a su mensaje para intentar el robo.`);
        if (who === m.sender) return m.reply(`> 🎭 ¿Robarte a ti mismo? Corazón, si necesitas monedas solo dímelo, no hace falta que intentes engañarte así.`);

        let ladron = global.db.data.users[m.sender];
        let victima = global.db.data.users[who];
        if (!victima) return m.reply(`> 🎭 No encuentro a esa persona en mis registros, parece que se ha esfumado.`);

        let cooldown = 600000; // 10 minutos
        if (Date.now() - (ladron.lastcrime || 0) < cooldown) {
            return m.reply(`> 🚔 Shhh, la policía todavía está patrullando la zona por tu culpa. Espera **${msToTime((ladron.lastcrime + cooldown) - Date.now())}** antes de volver a las andadas.`);
        }

        victima.coin = (Number(victima.coin) || 0);
        ladron.coin = (Number(ladron.coin) || 0);

        if (victima.coin < 200) return m.reply(`> 📭 Déjalo ir... esa pobre alma no tiene ni para un caramelo. No vale la pena el riesgo.`);

        ladron.lastcrime = Date.now();
        const exito = Math.random() <= 0.30;

        if (exito) {
            let porcentaje = Math.random() * (0.15 - 0.05) + 0.05;
            let robo = Math.floor(victima.coin * porcentaje);

            victima.coin -= robo;
            ladron.coin += robo;

            let txt = `> 🦹 *¡Lo lograste! Pero que no se te haga costumbre...*\n\n`;
            txt += `Has sido muy ágil. Lograste quitarle **${robo.toLocaleString()} coins** a @${who.split('@')[0]} sin que se diera cuenta.\n\n`;
            txt += `💰 *Tu botín actual:* ${ladron.coin.toLocaleString()} coins\n`;
            txt += `— — — — — — — — — — — —\n`;
            txt += `*Espero que uses ese dinero para algo bueno, no me hagas arrepentirme de no haberte delatado.*`;

            await m.react('💰');
            return conn.sendMessage(m.chat, { text: txt, mentions: [who, m.sender] }, { quoted: m });

        } else {
            let multa = Math.floor(ladron.coin * 0.15) + 100;
            ladron.coin = Math.max(0, ladron.coin - multa);
            victima.coin += Math.floor(multa / 2);

            let txt = `> 👮 *¡Ay no! Te han atrapado in fraganti.*\n\n`;
            txt += `Te lo advertí, la policía de KarBot no se anda con juegos. Te han procesado y la fianza no ha sido barata.\n\n`;
            txt += `💸 *Multa pagada:* -${multa.toLocaleString()} coins\n`;
            txt += `💳 *Tu saldo:* ${ladron.coin.toLocaleString()} coins\n\n`;
            txt += `*Me duele verte así, pero las reglas son las reglas. Paga tu deuda y descansa un poco.*`;

            await m.react('🚓');
            return conn.sendMessage(m.chat, { text: txt, mentions: [m.sender] }, { quoted: m });
        }

    } catch (e) {
        return m.reply(`> ❌ Algo salió mal con el plan... mejor retírate por ahora.`);
    }
};

function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    return `${minutes}m ${seconds}s`;
}

handler.help = ['robar'];
handler.tags = ['economy'];
handler.command = ['robar', 'rob', 'steal'];
handler.group = true;

export default handler;