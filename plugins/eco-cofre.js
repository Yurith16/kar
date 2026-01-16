let handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];

    await conn.sendMessage(m.chat, { react: { text: "⚙️", key: m.key } });

    let cooldown = 21600000; // 6 Horas
    if (new Date() - user.lastcofre < cooldown) {
        let time = user.lastcofre + cooldown - new Date();
        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        const esperas = [
            `*Oye... todavía no puedes abrir otro cofre.* Descansa un poco y vuelve en ${msToTime(time)}, ¿si?`,
            `*¡Qué impaciente! El cofre aún está cerrado.* Regresa en ${msToTime(time)} y lo intentamos.`,
            `*Todavía no hay nada nuevo para ti, corazón. Dale tiempo al sistema: ${msToTime(time)}.*`,
            `*Mis sensores dicen que debes esperar ${msToTime(time)} más antes de otra sorpresa.*`,
        ];
        return m.reply(
            `> ${esperas[Math.floor(Math.random() * esperas.length)]}`,
        );
    }

    let rareCofre = Math.random() > 0.95;
    let c_coins = rareCofre
        ? Math.floor(Math.random() * 250) + 350
        : Math.floor(Math.random() * 61) + 40;
    let c_exp = rareCofre ? 600 : 70;

    user.coin += c_coins;
    user.exp += c_exp;
    user.lastcofre = new Date() * 1;

    // Mensajes aleatorios para Cofre Normal
    const normales = [
        `*Mira lo que encontré para ti. Logramos abrirlo y, aunque es sencillo, te servirá mucho:*`,
        `*He conseguido abrir esta caja por ti. No es una fortuna, pero es un bonito detalle:*`,
        `*¡Aquí tienes! Logré desbloquear el cofre y esto es lo que pude rescatar:*`,
        `*Un pequeño regalo de mi parte. Espero que estas monedas te ayuden hoy:*`,
        `*¡Lo abrimos! Mira, esto es lo que traía dentro para tu colección:*`,
        `*He estado buscando algo para ti y encontré esto. Disfruta tu pequeño botín:*`,
        `*No es mucho, pero lo conseguí con cariño para que sigas avanzando:*`,
        `*Aquí tienes el resultado de la apertura. Espero que sea de tu agrado:*`,
        `*¡Mira! El cofre cedió y nos dejó estas cositas. Guárdalas bien:*`,
        `*Un detalle aleatorio para un usuario constante. Aquí tienes lo tuyo:*`,
    ];

    // Mensajes aleatorios para Cofre Legendario
    const legendarios = [
        `*¡No puedo creerlo! Es un botín legendario. ¡Hoy la suerte brilla contigo!*`,
        `*¡Díos mío! Mira la cantidad de tesoros que había en este cofre épico:*`,
        `*¡Qué maravilla! Has encontrado algo realmente especial, disfrútalo mucho:*`,
        `*Mis circuitos están brillando... ¡Es un hallazgo legendario! Felicidades:*`,
        `*¡Increíble! Hacía tiempo que no veía un botín tan grande. Es todo tuyo:*`,
    ];

    let titulo = rareCofre
        ? `🎁 *𝗧𝗘𝗦𝗢𝗥𝗢 𝗟𝗘𝗚𝗘𝗡𝗗𝗔𝗥𝗜𝗢 𝗘𝗡𝗖𝗢𝗡𝗧𝗥𝗔𝗗𝗢*`
        : `📦 *𝗔𝗣𝗘𝗥𝗧𝗨𝗥𝗔 𝗗𝗘 𝗦𝗨𝗠𝗜𝗡𝗜𝗦𝗧𝗥𝗢𝗦*`;
    let msgBody = rareCofre
        ? legendarios[Math.floor(Math.random() * legendarios.length)]
        : normales[Math.floor(Math.random() * normales.length)];

    let txt = `${titulo}\n\n`;
    txt += `${msgBody}\n\n`;
    txt += `> 💰 *Coins:* +${c_coins.toLocaleString()}\n`;
    txt += `> 🧪 *Exp:* +${c_exp}\n\n`;
    txt += `*${rareCofre ? "¡Es un botín épico! Me hace muy feliz que lo hayas encontrado." : "Estaré aquí por si encuentras otro cofre luego."}*`;

    await m.reply(txt);
    await conn.sendMessage(m.chat, {
        react: { text: rareCofre ? "✨" : "🎁", key: m.key },
    });
};

handler.help = ["cofre"];
handler.tags = ["econ"];
handler.command = /^(cofre|chest)$/i;
handler.register = true;

export default handler;

function msToTime(duration) {
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    return `*${hours}h ${minutes}m*`;
}
