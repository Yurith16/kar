const currency = 'Coins';

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        if (!m.isGroup) return;
        if (!global.db.data.chats[m.chat].economy) return m.reply(`> 🎣 La economía está desactivada en este grupo.`);

        let user = global.db.data.users[m.sender];
        if (!user) user = global.db.data.users[m.sender] = { coin: 50, lastpesca: 0 };

        let tiempoEspera = 480000; // 8 minutos
        if (new Date() - (user.lastpesca || 0) < tiempoEspera) {
            let timeLeft = msToTime((user.lastpesca + tiempoEspera) - new Date());
            return m.reply(`> ⏳ El mar está picado ahora mismo, corazón. Regresa en: **${timeLeft}**.`);
        }

        // --- ECONOMÍA DE SUBSISTENCIA (VALORES MÍNIMOS) ---
        const expediciones = [
            { lugar: "Triángulo de las Bermudas", peces: [{ n: "Calamar Cósmico", p: 120, x: 20, d: 1, r: 5, e: "🦑" }, { n: "Medusa Energía", p: 45, x: 10, d: 0, r: 3, e: "🪼" }] },
            { lugar: "Fosa de las Marianas", peces: [{ n: "Ballena Ancestral", p: 250, x: 50, d: 1, r: 6, e: "🐋" }, { n: "Angler Gigante", p: 90, x: 25, d: 0, r: 4, e: "🐡" }] },
            { lugar: "Arrecife Diamante", peces: [{ n: "Almeja Reina", p: 35, x: 5, d: 0, r: 2, e: "🦪" }, { n: "Delfín Cristal", p: 150, x: 30, d: 1, r: 5, e: "🐬" }] },
            { lugar: "Río Amazonas", peces: [{ n: "Piraña Alfa", p: 25, x: 5, d: 0, r: 2, e: "🐟" }, { n: "Pulpo Mutante", p: 65, x: 15, d: 0, r: 4, e: "🐙" }] }
        ];

        const zona = expediciones[Math.floor(Math.random() * expediciones.length)];
        const pez = zona.peces[Math.floor(Math.random() * zona.peces.length)];
        user.lastpesca = new Date() * 1;

        if (Math.random() > 0.45) { // Un poco más difícil tener éxito
            const multi = Math.random() > 0.98 ? 2 : 1; // Solo 2% de probabilidad de crítico
            const gC = pez.p * multi;
            const gX = pez.x * multi;
            const gD = pez.d * multi;

            user.coin = (user.coin || 0) + gC;
            user.exp = (user.exp || 0) + gX;
            if (gD > 0) user.diamond = (user.diamond || 0) + gD;

            let txt = `> 🎣 *Has tenido una buena captura* ${pez.e}\n\n`;
            txt += `📍 *Zona:* ${zona.lugar}\n`;
            txt += `📦 *Pez:* ${pez.n}\n`;
            txt += `💰 *Botín:* +${gC} ${currency} | +${gX} XP\n`;
            if (gD > 0) txt += `💎 *Extra:* +${gD} Diamante\n\n`;
            txt += `*¡Es un ejemplar precioso! Lo he guardado en tu inventario.*`;

            await m.react('🐟');
            return m.reply(txt);

        } else {
            // Penalización pequeña acorde a los premios bajos
            const perdida = Math.floor(Math.random() * 30) + 15;
            user.coin = Math.max(0, (user.coin || 0) - perdida);

            let fail = `> 🌊 *El mar ha estado difícil hoy* ⛈️\n\n`;
            fail += `Lanzaste la red en el *${zona.lugar}*, pero regresaste con las manos vacías. Perdiste **${perdida}** coins en el viaje.\n\n`;
            fail += `*No te preocupes, la próxima vez tendremos más suerte.*`;

            await m.react('⛈️');
            return m.reply(fail);
        }

    } catch (e) {
        console.error(e);
        return m.reply(`> ❌ Hubo un problema con la red de pesca.`);
    }
};

function msToTime(duration) {
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let seconds = Math.floor((duration / 1000) % 60);
    return `${minutes}m ${seconds}s`;
}

handler.help = ['pescar'];
handler.tags = ['economy'];
handler.command = ['pescar', 'pesca', 'fishing'];
handler.group = true;

export default handler;