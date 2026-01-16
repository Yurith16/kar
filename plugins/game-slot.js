let handler = async (m, { conn, args, usedPrefix, command }) => {

    try {
        if (!m.isGroup) return;
        if (!global.db.data.chats[m.chat]?.economy) return m.reply(`> 🎰 *𝗖𝗔𝗦𝗜𝗡𝗢*\n> La economía está desactivada en este grupo.`);

        let user = global.db.data.users[m.sender];
        if (!user) return;

        // Cooldown de 30 segundos (más dinámico que 1 min)
        let cooldown = 30000;
        let now = Date.now();
        if (now - (user.lastslot || 0) < cooldown) {
            let timeLeft = msToTime((user.lastslot + cooldown) - now);
            await m.react('⏳');
            return m.reply(`> 🎰 *𝗖𝗔𝗦𝗜𝗡𝗢*\n> _La máquina necesita un respiro..._\n\n⏰ *Vuelve en:* ${timeLeft}`);
        }

        // Menú de ayuda
        if (!args[0]) {
            await m.react('🎰');
            let help = `> 🎰 *𝗖𝗔𝗦𝗜𝗡𝗢 𝗦𝗟𝗢𝗧𝗦*\n> _Prueba tu suerte en la KarBot-Machine._\n\n`;
            help += `🏆 *JACKPOTS:* (3 iguales)\n`;
            help += `> 💎 💎 💎 » x15 + 5 💎\n`;
            help += `> 7️⃣ 7️⃣ 7️⃣ » x10 + 2 💎\n`;
            help += `> ⭐ ⭐ ⭐ » x5\n\n`;
            help += `💰 *APUESTAS:*\n`;
            help += `> 💵 Mínimo: 100 | Máximo: 5,000\n\n`;
            help += `— — — — — — — — — — — —\n`;
            help += `💡 *Uso:* \`${usedPrefix + command} 500\``;
            return m.reply(help);
        }

        let apuesta = parseInt(args[0]);
        if (isNaN(apuesta) || apuesta < 100) return m.reply(`> ❌ La apuesta mínima es de **100 Coins**.`);
        if (apuesta > 5000) return m.reply(`> ❌ El límite máximo es de **5,000 Coins** por tiro.`);
        if (user.coin < apuesta) return m.reply(`> ❌ No tienes saldo suficiente para esa apuesta.`);

        // Lógica de Símbolos
        let simbolos = ["🍒", "🍋", "⭐", "💎", "7️⃣", "🔔"];
        let r1 = simbolos[Math.floor(Math.random() * simbolos.length)];
        let r2 = simbolos[Math.floor(Math.random() * simbolos.length)];
        let r3 = simbolos[Math.floor(Math.random() * simbolos.length)];

        let multiplicador = 0;
        let diamantesBonus = 0;
        let gano = false;

        // Lógica de premios
        if (r1 === r2 && r2 === r3) {
            gano = true;
            if (r1 === "💎") { multiplicador = 15; diamantesBonus = 5; }
            else if (r1 === "7️⃣") { multiplicador = 10; diamantesBonus = 2; }
            else if (r1 === "⭐") { multiplicador = 5; }
            else { multiplicador = 3; }
        } else if (r1 === r2 || r2 === r3 || r1 === r3) {
            gano = true;
            multiplicador = 1.5;
        }

        let gananciaNetas = gano ? Math.floor(apuesta * multiplicador) : -apuesta;

        // Ejecución de saldo
        user.coin += gananciaNetas;
        user.diamond = (user.diamond || 0) + diamantesBonus;
        user.lastslot = now;

        let res = `> 🎰 *𝗞𝗔𝗥𝗕𝗢𝗧-𝗠𝗔𝗖𝗛𝗜𝗡𝗘*\n`;
        res += `> 🎰 [ ${r1} | ${r2} | ${r3} ]\n\n`;

        if (gano) {
            await m.react('🤑');
            res += `✅ *¡GANASTE!*\n`;
            res += `> _La suerte te sonríe hoy, corazón._\n\n`;
            res += `🎁 *RECOMPENSA:* \n`;
            res += `> 🪙 Coins: +${gananciaNetas.toLocaleString()}\n`;
            if (diamantesBonus > 0) res += `> 💎 Diamantes: +${diamantesBonus}\n`;
        } else {
            await m.react('💸');
            res += `❌ *PERDISTE*\n`;
            res += `> _No te desanimes, la próxima será tuya._\n\n`;
            res += `💸 *PÉRDIDA:* \n`;
            res += `> 📉 Saldo: -${apuesta.toLocaleString()} Coins\n`;
        }

        res += `\n> 💰 *Cartera:* ${user.coin.toLocaleString()} Coins\n`;
        res += `— — — — — — — — — — — —`;

        return m.reply(res);

    } catch (e) {
        console.log(e);
        return m.reply(`> ❌ Hubo un error en la máquina, intenta de nuevo.`);
    }
};

handler.help = ['slot'];
handler.tags = ['game'];
handler.command = ['slot', 'slots', 'casino'];
handler.group = true;

export default handler;

function msToTime(duration) {
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    return `${minutes}m ${seconds}s`;
}