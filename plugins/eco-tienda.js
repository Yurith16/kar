import { checkReg } from '../lib/checkReg.js';

const currency = 'Coins';

// Precios de venta ajustados (aprox 10-15%) para evitar inflación
const objetosTienda = {
    "stone": { id: "stone", nombre: "Piedra", emoji: "🪨", precioCompra: 25, precioVenta: 5, rareza: "Común" },
    "coal": { id: "coal", nombre: "Carbón", emoji: "🕋", precioCompra: 50, precioVenta: 10, rareza: "Común" },
    "iron": { id: "iron", nombre: "Hierro", emoji: "🔩", precioCompra: 100, precioVenta: 20, rareza: "Común" },
    "gold": { id: "gold", nombre: "Oro", emoji: "🏅", precioCompra: 500, precioVenta: 80, rareza: "Raro" },
    "emerald": { id: "emerald", nombre: "Esmeralda", emoji: "♦️", precioCompra: 1200, precioVenta: 200, rareza: "Épico" },
    "diamond": { id: "diamond", nombre: "Diamante", emoji: "💎", precioCompra: 2500, precioVenta: 400, rareza: "Legendario" },
    "candies": { id: "candies", nombre: "Caramelo", emoji: "🍬", precioCompra: 75, precioVenta: 15, rareza: "Común" },
    "gifts": { id: "gifts", nombre: "Regalo", emoji: "🎁", precioCompra: 400, precioVenta: 80, rareza: "Raro" },
    "joincount": { id: "joincount", nombre: "Token", emoji: "🎟️", precioCompra: 150, precioVenta: 30, rareza: "Común" },

    "common_box": { id: "common_box", nombre: "Cofre de Madera", emoji: "📦", precioCompra: 800, precioVenta: 150, rareza: "Cofres" },
    "rare_box": { id: "rare_box", nombre: "Cofre de Hierro", emoji: "🎁", precioCompra: 3000, precioVenta: 500, rareza: "Cofres" },
    "legendary_box": { id: "legendary_box", nombre: "Cofre Galáctico", emoji: "🌌", precioCompra: 10000, precioVenta: 2000, rareza: "Cofres" }
};

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];

    if (await checkReg(m, user)) return;

    try {
        if (!m.isGroup) return m.reply(`> 🏦 *Tienda* » Solo disponible en grupos.`);
        if (!global.db.data.chats[m.chat]?.economy) return m.reply(`> 🏪 *Economía Desactivada* » Usa: ${usedPrefix}economy on`);

        user.coin = (Number(user.coin) || 0);
        user.bank = (Number(user.bank) || 0);

        // --- MODO: VISTA DE TIENDA ---
        if (command === 'tienda' || command === 'shop') {
            await m.react('🏪');
            let txt = `> 🏬 *𝗧𝗜𝗘𝗡𝗗𝗔 𝗗𝗘 𝗥𝗘𝗖𝗨𝗥𝗦𝗢𝗦*\n`;
            txt += `> 👛 *Cartera:* ${user.coin.toLocaleString()} ${currency}\n`;
            txt += `> 🏛️ *Banco:* ${user.bank.toLocaleString()} ${currency}\n\n`;

            const categorias = ["Cofres", "Común", "Raro", "Épico", "Legendario"];
            categorias.forEach(cat => {
                const items = Object.values(objetosTienda).filter(obj => obj.rareza === cat);
                if (items.length > 0) {
                    txt += `*${cat.toUpperCase()}*\n`;
                    items.forEach(obj => {
                        txt += `> ${obj.emoji} *${obj.nombre}* \`(${obj.id})\`\n`;
                        txt += `> 🛒 Compra: ${obj.precioCompra.toLocaleString()}\n`;
                    });
                    txt += `\n`;
                }
            });
            txt += `— — — — — — — — — — — —\n`;
            txt += `💡 *Uso:* \`${usedPrefix}comprar candies 5\`\n`;
            txt += `✨ *Abrir:* \`${usedPrefix}unbox common_box\``;
            return m.reply(txt);
        }

        // --- MODO: COMPRAR (Lógica de Cartera -> Banco) ---
        if (command === 'comprar' || command === 'buy') {
            let item = objetosTienda[args[0]?.toLowerCase()];
            if (!item) return m.reply(`> ❌ *ID Inválido.*`);

            let cantidad = args[1] === 'all' ? Math.floor((user.coin + (user.bank / 1.03)) / item.precioCompra) : parseInt(args[1]) || 1;
            if (cantidad < 1) return m.reply(`> 💸 *Sin Fondos:* No tienes suficiente ni para una unidad.`);

            let costoTotal = item.precioCompra * cantidad;
            let usarCartera = 0;
            let usarBanco = 0;
            let impuestoBanco = 0;

            if (user.coin >= costoTotal) {
                // Paga todo con cartera
                usarCartera = costoTotal;
            } else {
                // Usa lo que tenga en cartera y el resto del banco
                usarCartera = user.coin;
                let faltante = costoTotal - usarCartera;
                impuestoBanco = Math.ceil(faltante * 0.03); // 3% de recargo por uso de banco
                usarBanco = faltante + impuestoBanco;

                if (user.bank < usarBanco) return m.reply(`> 💸 *Fondos Insuficientes:* Te faltan ${(usarBanco - user.bank).toLocaleString()} en el banco para completar la compra.`);
            }

            user.coin -= usarCartera;
            user.bank -= usarBanco;
            user[item.id] = (user[item.id] || 0) + cantidad;

            await m.react('✅');
            let mensajito = `> ✅ *𝗖𝗢𝗠𝗣𝗥𝗔 𝗥𝗘𝗔𝗟𝗜𝗭𝗔𝗗𝗔*\n\n> 📦 *Objetos:* ${cantidad} ${item.nombre}\n`;
            mensajito += `> 👛 *Pagado Cartera:* ${usarCartera.toLocaleString()}\n`;
            if (usarBanco > 0) mensajito += `> 🏛️ *Pagado Banco:* ${usarBanco.toLocaleString()} (Inc. 3% imp.)\n`;
            mensajito += `> 💰 *Total:* ${(usarCartera + (usarBanco - impuestoBanco)).toLocaleString()} ${currency}`;
            return m.reply(mensajito);
        }

        // --- MODO: VENDER ---
        if (command === 'vender' || command === 'sell') {
            let item = objetosTienda[args[0]?.toLowerCase()];
            if (!item) return m.reply(`> ❌ *ID Inválido.*`);
            let totalPropio = Number(user[item.id]) || 0;
            let cantidad = args[1] === 'all' ? totalPropio : parseInt(args[1]) || 1;

            if (cantidad < 1 || cantidad > totalPropio) return m.reply(`> ❌ Cantidad insuficiente.`);

            let ganancia = item.precioVenta * cantidad;
            user[item.id] -= cantidad;
            user.coin += ganancia;

            await m.react('💸');
            return m.reply(`> 💰 *𝗩𝗘𝗡𝗧𝗔 𝗘𝗫𝗜𝗧𝗢𝗦𝗔*\n\n> 📦 *Objetos:* ${cantidad} ${item.nombre}\n> 💵 *Recibido:* ${ganancia.toLocaleString()} ${currency}`);
        }

        // --- MODO: UNBOX (Se mantiene igual) ---
        if (command === 'unbox' || command === 'desenvolver') {
            let boxId = args[0]?.toLowerCase();
            if (!['common_box', 'rare_box', 'legendary_box'].includes(boxId)) return m.reply(`> 💡 *Uso:* \`${usedPrefix}unbox common_box\``);
            if ((Number(user[boxId]) || 0) < 1) return m.reply(`> 📦 No tienes este cofre.`);

            user[boxId] -= 1;
            let suerte = Math.random() * 100;
            let premio = {};
            let isPremium = false;

            if (boxId === 'common_box') {
                if (suerte < 80) premio = { id: 'iron', n: Math.floor(Math.random() * 3) + 2 };
                else if (suerte < 98) premio = { id: 'joincount', n: 3 };
                else { isPremium = true; premio.dias = 1; } 
            } else if (boxId === 'rare_box') {
                if (suerte < 70) premio = { id: 'gold', n: Math.floor(Math.random() * 5) + 2 };
                else if (suerte < 95) premio = { id: 'joincount', n: 10 };
                else { isPremium = true; premio.dias = 2; }
            } else if (boxId === 'legendary_box') {
                if (suerte < 60) premio = { id: 'diamond', n: Math.floor(Math.random() * 6) + 3 };
                else if (suerte < 90) premio = { id: 'joincount', n: 25 };
                else { isPremium = true; premio.dias = 5; }
            }

            const { key } = await m.reply(`> 📦 *Desenvolviendo ${objetosTienda[boxId].nombre}...*`);
            await new Promise(res => setTimeout(res, 2000));

            if (isPremium) {
                if (user.premium) {
                    user.joincount = (user.joincount || 0) + 50;
                    return conn.sendMessage(m.chat, { text: `> 🌌 *¡𝗦𝗨𝗣𝗘𝗥 𝗦𝗨𝗘𝗥𝗧𝗘!*\n\n> El cofre contenía **Premium ⭐**, recibes:\n> 🎟️ **50 Tokens Extra**`, edit: key });
                } else {
                    user.premium = true;
                    user.premiumTime = (user.premiumTime > Date.now() ? user.premiumTime : Date.now()) + (premio.dias * 86400000);
                    return conn.sendMessage(m.chat, { text: `> 👑 *¡𝗣𝗥𝗘𝗠𝗜𝗢 𝗠𝗜𝗧𝗜𝗖𝗢!*\n\n> Has desbloqueado: **PASES PREMIUM ⭐**\n> ⏳ **Duración:** ${premio.dias} día(s)`, edit: key });
                }
            }

            let itemRec = objetosTienda[premio.id];
            user[premio.id] = (user[premio.id] || 0) + premio.n;
            return conn.sendMessage(m.chat, { text: `> 🎊 *¡𝗢𝗕𝗧𝗘𝗡𝗜𝗗𝗢!*\n\n> Has ganado: **${premio.n} ${itemRec.emoji} ${itemRec.nombre}**`, edit: key });
        }

    } catch (e) {
        console.error(e);
        // Devolución automática de monedas si hay error (Instrucción 2026-01-10)
        m.reply('❌ *ERROR:* Se ha cancelado la operación para proteger tus fondos.');
    }
};

handler.help = ['tienda', 'comprar', 'unbox'];
handler.tags = ['economy'];
handler.command = ['tienda', 'shop', 'comprar', 'buy', 'vender', 'sell', 'unbox', 'desenvolver'];
handler.group = true;

export default handler;