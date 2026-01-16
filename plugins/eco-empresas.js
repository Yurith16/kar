const currency = 'Coins';

const empresas = [
    { id: 1, n: "SecureTech", r: "Seguro 🛡️", min: 500, max: 5000, v: 0.03, e: "🟦" }, 
    { id: 2, n: "BioMed", r: "Estable ⚗️", min: 2000, max: 15000, v: 0.08, e: "🟩" },
    { id: 3, n: "Quantum", r: "Arriesgado ⚡", min: 10000, max: 50000, v: 0.25, e: "🟪" },
    { id: 4, n: "CyberTrade", r: "Especulativo 🚀", min: 25000, max: 100000, v: 0.60, e: "🔴" }
];

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        let user = global.db.data.users[m.sender];
        if (!user.inversiones) user.inversiones = [];
        if (m.isGroup && !global.db.data.chats[m.chat]?.economy) return;

        // --- MERCADO DE VALORES ---
        if (['bolsa', 'mercado', 'stocks'].includes(command)) {
            await m.react('📊');
            let txt = `🏛️ *𝗠𝗘𝗥𝗖𝗔𝗗𝗢 𝗗𝗘 𝗩𝗔𝗟𝗢𝗥𝗘𝗦*\n\n`;
            txt += `*Bienvenido al panel financiero. Los mercados son volátiles, invierte con prudencia, corazón.*\n\n`;

            empresas.forEach(emp => {
                txt += `${emp.e} *${emp.id}. ${emp.n}*\n`;
                txt += `> ⚖️ Riesgo: ${emp.r}\n`;
                txt += `> 💰 Límite: ${emp.min.toLocaleString()} - ${emp.max.toLocaleString()} ${currency}\n\n`;
            });

            txt += `💡 *Uso:* \`${usedPrefix}invertir [id] [monto]\`\n`;
            txt += `*Nota: Máximo 2 inversiones simultáneas para evitar inflación.*`;
            return m.reply(txt);
        }

        // --- INVERTIR ---
        if (command === 'invertir') {
            if (user.inversiones.length >= 2) return m.reply(`> ⛔ *¡Alto! Solo permito 2 inversiones por usuario para mantener el mercado estable.*`);

            let id = parseInt(args[0]);
            let emp = empresas.find(e => e.id === id);
            if (!emp) return m.reply(`> 💡 *Uso:* ${usedPrefix}invertir [id] [monto]`);

            let monto = parseInt(args[1]);
            if (isNaN(monto) || monto < emp.min) return m.reply(`> 📉 *MÍNIMO:* La empresa exige al menos ${emp.min.toLocaleString()} coins.`);
            if (monto > emp.max) return m.reply(`> 🚫 *LÍMITE:* No aceptamos más de ${emp.max.toLocaleString()} coins en esta firma.`);
            if ((user.coin || 0) < monto) return m.reply(`> 💸 *No tienes suficiente capital en tu cartera.*`);

            user.coin -= monto;
            user.inversiones.push({
                empresaId: emp.id,
                nombre: emp.n,
                monto: monto,
                fecha: Date.now(),
                risk: emp.v,
                emoji: emp.e,
                seed: Math.random()
            });

            await m.react('📈');
            return m.reply(`> ✅ *𝗜𝗡𝗩𝗘𝗥𝗦𝗜𝗢́𝗡 𝗔𝗖𝗘𝗣𝗧𝗔𝗗𝗔*\n\n*He registrado tus ${monto.toLocaleString()} coins en ${emp.n}. El mercado cerrará el ciclo en 24h. ¡Suerte!*`);
        }

        // --- CARTERA ---
        if (['cartera', 'inv', 'misinversiones'].includes(command)) {
            if (!user.inversiones.length) return m.reply(`> 📭 *No tienes activos moviéndose ahora mismo.*`);

            let txt = `📂 *𝗣𝗢𝗥𝗧𝗔𝗙𝗢𝗟𝗜𝗢 𝗗𝗘 𝗔𝗖𝗖𝗜𝗢𝗡𝗘𝗦*\n\n`;
            user.inversiones.forEach((inv) => {
                let horas = (Date.now() - inv.fecha) / 3600000;
                let factor = (inv.seed * 2) - 1; 
                let variacion = Math.floor(inv.monto * (factor * inv.risk) * Math.min(horas / 24, 1));

                let color = variacion >= 0 ? '🟢' : '🔴';
                txt += `${inv.emoji} *${inv.nombre}*\n`;
                txt += `> 📥 Compra: ${inv.monto.toLocaleString()}\n`;
                txt += `> ${color} Estado: ${variacion >= 0 ? '+' : ''}${variacion.toLocaleString()}\n`;
                txt += `> ⏳ Progreso: ${Math.floor((horas/24)*100)}%\n\n`;
            });
            txt += `💡 *Cobrar:* \`${usedPrefix}cobrar [ID]\``;
            return m.reply(txt);
        }

        // --- COBRAR ---
        if (['retirar', 'cobrar'].includes(command)) {
            let id = parseInt(args[0]);
            let index = user.inversiones.findIndex(i => i.empresaId === id);
            if (index === -1) return m.reply(`> ❌ *No reconozco esa ID de inversión.*`);

            let inv = user.inversiones[index];
            let horas = (Date.now() - inv.fecha) / 3600000;

            // Multa por retiro prematuro (Menos de 6 horas)
            if (horas < 6) {
                let multa = Math.floor(inv.monto * 0.35);
                user.coin += (inv.monto - multa);
                user.inversiones.splice(index, 1);
                return m.reply(`> ⚠️ *𝗥𝗘𝗧𝗜𝗥𝗢 𝗣𝗥𝗘𝗠𝗔𝗧𝗨𝗥𝗢*\n\n*Sacaste el dinero antes de las 6h de maduración. El mercado te penalizó con un -35%.*\n> 💵 Recibiste: ${(inv.monto - multa).toLocaleString()}`);
            }

            let factor = (inv.seed * 2) - 1;
            let variacion = Math.floor(inv.monto * (factor * inv.risk) * Math.min(horas / 24, 1));

            // Impuesto de KarBot (10% de las ganancias)
            let gananciaNeta = variacion;
            if (gananciaNeta > 0) gananciaNeta = Math.floor(variacion * 0.90);

            let total = inv.monto + gananciaNeta;
            user.coin += total;
            user.inversiones.splice(index, 1);

            await m.react(variacion >= 0 ? '💰' : '📉');
            return m.reply(`> 🏛️ *𝗟𝗜𝗤𝗨𝗜𝗗𝗔𝗖𝗜𝗢́𝗡 𝗗𝗘 𝗔𝗖𝗧𝗜𝗩𝗢𝗦*\n\n*Operación finalizada para ${inv.nombre}:*\n\n> 💰 Neto: ${total.toLocaleString()} ${currency}\n> 📊 Rendimiento: ${variacion >= 0 ? '+' : ''}${variacion.toLocaleString()}\n\n*Se ha aplicado un 10% de comisión por gestión bancaria.*`);
        }

    } catch (e) {
        m.reply('> ❌ *Hubo un error en la bolsa de valores.*');
    }
};

handler.help = ['bolsa', 'invertir', 'cartera', 'cobrar'];
handler.tags = ['economy'];
handler.command = ['bolsa', 'mercado', 'stocks', 'invertir', 'cobrar', 'retirar', 'misinversiones', 'cartera'];
handler.group = true;

export default handler;