import fetch from 'node-fetch'
import { procesarCompleto, procesarPago } from '../lib/pagoFiltro.js'

// Listado de imágenes (Mantenido igual)
const nekoImages = [
  "https://files.catbox.moe/qz3pix.jpg", "https://files.catbox.moe/mv26d5.jpg", "https://files.catbox.moe/tjbhm0.jpg",
  "https://files.catbox.moe/vd6f3x.jpg", "https://files.catbox.moe/d27pwj.jpg", "https://files.catbox.moe/e69n64.jpeg",
  "https://files.catbox.moe/ocglqs.webp", "https://files.catbox.moe/ha8p64.webp", "https://files.catbox.moe/q2b5za.webp",
  "https://files.catbox.moe/uyhbvi.webp", "https://files.catbox.moe/9yxqj2.jpg", "https://files.catbox.moe/wfq3ig.jpg",
  "https://files.catbox.moe/c9vs9z.jpg", "https://files.catbox.moe/achi39.jpg", "https://files.catbox.moe/phtwri.jpg",
  "https://files.catbox.moe/sdheiy.jpg", "https://files.catbox.moe/xts6oc.jpg", "https://files.catbox.moe/74o5ad.jpg",
  "https://files.catbox.moe/1bzr5n.jpg", "https://files.catbox.moe/ngg7b1.jpg", "https://files.catbox.moe/3qrkoq.jpg",
  "https://files.catbox.moe/hyjiv4.jpg", "https://files.catbox.moe/6l7js1.jpg", "https://files.catbox.moe/8pwqm9.jpg",
  "https://files.catbox.moe/y616bz.jpg", "https://files.catbox.moe/eh200l.jpg", "https://files.catbox.moe/iq6g17.jpg",
  "https://files.catbox.moe/ef2q3v.jpg", "https://files.catbox.moe/rsmmg7.jpg", "https://files.catbox.moe/elc8xe.jpg",
  "https://files.catbox.moe/ego1js.jpg", "https://files.catbox.moe/9qy0y7.jpg", "https://files.catbox.moe/fmll00.jpg",
  "https://files.catbox.moe/k403tr.jpg", "https://files.catbox.moe/p6rm9c.jpg", "https://files.catbox.moe/r632qa.jpg",
  "https://files.catbox.moe/fh87sd.jpg", "https://files.catbox.moe/qq711z.jpg", "https://files.catbox.moe/lyii18.jpg",
  "https://files.catbox.moe/19x0x8.jpg"
];

// Listado de frases (Mantenido igual)
const nekoCaptions = [
  "> 💖 *Mira bien...* » ¿Te gustó mi nuevo atuendo? ¡Fue hecho pensando en ti! 😉",
  "> 🐾 *Miau~* » ¿Me ayudas a estirarme? Necesito unas buenas caricias...",
  "> ✨ *Waifu Time* » ¿Me llevas a dar un paseo? Prometo ser una buena chica, si te portas bien.",
  "> 🍭 *Lo tengo todo* » Estoy lista para jugar un rato. Solo un poco, ¿eh?",
  "> 🤫 *Pequeño secreto* » Lo que ves aquí es solo para tus ojos. ¡Guárdalo bien!",
  "> 💋 *Un pequeño regalo* » Para alegrar tu día. ¡No te quedes mirándome todo el tiempo! 😊",
  "> ☀️ *Día libre* » Ya sabes dónde encontrarme si te aburres... 😼",
  "> 🎀 *Solo para ti* » Me esforcé mucho en arreglarme. ¿Lo notas? Dime qué te gusta más.",
  "> 💭 *Pensando en voz alta* » ¿En qué crees que estoy pensando ahora mismo? Te doy una pista: comienza contigo.",
  "> 🙈 *Qué vergüenza* » No me mires tan fijamente... aunque me gusta. *Miau...*",
  "> 💅 *Lista* » ¿Jugamos un rato antes de que oscurezca? Tengo algunas ideas... 😈",
  "> 💤 *Cansada* » Necesito que me cargues. Prometo ser ligera. 😜",
  "> 🌸 *Flores* » Me pican las orejas. ¿Será que alguien está hablando de mí... o *conmigo*?",
  "> 📸 *Selfie* » Esta es mi mejor pose. ¿Qué puntaje me das del 1 al 10? Sé honesto...",
  "> 🌙 *Noche* » No puedo dormir. ¿Me cuentas un secreto antes de irnos a la cama?",
  "> 🏃‍♀️ *Te reto* » ¡Intenta atraparme! Si lo haces, obtienes un premio. ¿Aceptas? 😼",
  "> 🍓 *Dulce* » Soy más dulce de lo que parezco. ¿Quieres probarlo? 😋",
  "> 🚿 *Limpieza* » Espero que no te importe si me quedo en toalla un rato... ¿Me traes algo de beber?",
  "> 🎶 *Mi melodía* » ¿Puedes adivinar mi canción favorita? Si la adivinas, hacemos lo que quieras.",
  "> 😈 *Mala chica* » Dicen que fui un poco traviesa hoy. ¿Quién me va a castigar? 😇",
  "> 👙 *Casi lista* » Este atuendo es un poco apretado. ¿Me ayudas a ajustarlo mejor? 🥵",
  "> 🦵 *Piernas* » Me esforcé mucho entrenando. ¿Me merezco un masaje? Justo aquí...",
  "> 👗 *Falda corta* » Hoy hace calor, ¿verdad? Quizás no debí ponerme algo tan... suelto.",
  "> 🤫 *Opps* » Se me olvidó algo importante... ¿Puedes cubrirme los ojos un segundo? 😳",
  "> 🧦 *Medias* » Me encanta cuando me pones atención. Pero no mires demasiado. 👀",
  "> ✨ *Brillo* » Creo que me falta algo... ¿un collar, una pulsera o... tus manos?",
  "> ☀️ *Calorcito* » Definitivamente necesito menos ropa. Mucho menos. ¿No crees? 😉",
  "> 💦 *Llovió* » ¡Estoy toda empapada! Ven, dame un abrazo fuerte para que me seque.",
  "> 🐾 *Patitas suaves* » ¡No toques mi cola! Es muy sensible. ¿O tal vez sí...? 🤭",
  "> 👚 *Muy pequeña* » Esta camiseta se encogió. ¿Es mi culpa que no me cubra lo suficiente? 🤷‍♀️",
  "> 🥵 *Mi boca* » Si te acercas, te diré lo que quiero susurrarte al oído... ¿Te atreves?",
  "> 🍒 *Escote* » ¿Por qué miras ahí? ¡Mis ojos están aquí! Aunque no te culpo, sé lo que te gusta.",
  "> 🤫 *Bajo las sábanas* » Ven aquí, tengo un espacio calentito reservado para ti. 💖",
  "> 💯 *Perfecto* » Dicen que nadie es perfecto, pero cuando estoy contigo, me siento así.",
  "> 🍑 *Suave* » Me gusta cuando me tocas. Si lo haces bien, ronronearé para ti. *Purrr*",
  "> 🤫 *Secreto* » Me dijeron que tengo un *cuerpo de pecado*. ¿Me ayudarías a demostrarlo?",
  "> 🐾 *Nuestras huellas* » Dejemos un rastro de donde estuvimos. ¿Empezamos por aquí?",
  "> 😈 *Tu regalo* » Estoy envuelta. Deséame lo que quieras. No hay límites.",
  "> ✨ *Encantada* » Caí bajo tu hechizo. Ahora, tienes que hacerte responsable de lo que pase. 💘",
  "> 💖 *La espera* » No me dejes esperando mucho tiempo. Mi paciencia es pequeña, pero mis deseos son grandes.",
  "> 😼 *Mi presa* » Te he estado observando toda la noche. Es hora de que vengas conmigo.",
  "> 😇 *Inocente* » No sé de qué hablas. Solo soy una chica buena. O eso te haré creer...",
  "> 🤯 *Mi cabeza* » ¡Ayúdame a concentrarme! Eres demasiado distracción para mí.",
  "> 🥳 *Celebración* » ¡Hoy es un buen día para ser malo! Vamos a celebrarlo en privado. 🎉",
  "> 🗝️ *Mi llave* » Sólo tú tienes acceso a esta puerta. ¿Qué esperas para abrirla?",
  "> 💘 *Flecha* » Me has disparado en el corazón. Ahora, ven a reclamar tu premio.",
  "> 🥂 *Brindemos* » Por lo que pasó, lo que está pasando, y lo que sabes que va a pasar.",
  "> 🧘‍♀️ *En calma* » Me siento muy relajada contigo. ¿Podrías hacerme un masaje en la espalda... y más abajo?",
  "> 🐾 *Juego de roles* » Hoy quiero ser tu... (dime el rol que más te guste).",
  "> 💯 *La última* » Esta es la mejor de todas. Pero solo tú puedes decidir si es verdad. 😉"
];

const userNekoIndex = new Map();

let handler = async (m, { conn, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat];
    const userId = m.sender;

    // 1. Verificación NSFW (Estética KarBot)
    if (!chat.nsfw) {
        await conn.sendMessage(m.chat, { react: { text: '🔞', key: m.key } });
        return m.reply(`╭━━━〔 🔞 𝙽𝚂𝙵𝚆 𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝙳𝙾 〕━━━⬣\n║\n║ ⚠️ El burdel está cerrado.\n║ 𝙰𝚌𝚝í𝚟𝚊𝚕𝚘 𝚌𝚘𝚗: *${usedPrefix}on nsfw*\n║\n╰━━━━━━━━━━━━━━━━━━━━━━⬣`);
    }

    try {
        // 2. Verificar saldo con sistema de pago (Categoría nsfw)
        const v = await procesarCompleto(userId, 'nsfw');
        if (!v.success) return m.reply(v.mensajeError);

        await conn.sendMessage(m.chat, { react: { text: "🐱", key: m.key } });

        // 3. Obtener imagen y frase
        let currentIndex = userNekoIndex.get(userId) || 0;
        const imageUrl = nekoImages[currentIndex % nekoImages.length];
        const rawCaption = nekoCaptions[currentIndex % nekoCaptions.length];

        // 4. Cobrar (Usa la lógica de pagoFiltro)
        const pago = procesarPago(userId, 'nsfw');

        let txt = `╭━〔 🔞 𝙽𝙴𝙺𝙾 𝚂𝚈𝚂𝚃𝙴𝙼 〕━⬣\n`;
        txt += pago.premium ? `║ ⭐ *Premium:* Gratis\n` : `║ 💰 *𝙲𝚘𝚜𝚝𝚘:* ${pago.costo} Coins\n║ 💳 *𝚂𝚊𝚕𝚍𝚘:* ${pago.saldoNuevo} Coins\n`;
        txt += `╰━━━━━━━━━━━━━━━━━━━⬣\n\n`;
        txt += rawCaption;

        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: txt.trim()
        }, { quoted: m });

        // Actualizar índice para que no se repita de inmediato
        userNekoIndex.set(userId, (currentIndex + 1) % nekoImages.length);
        
        await conn.sendMessage(m.chat, { react: { text: "🔥", key: m.key } });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        m.reply(`> ✦ *Error:* » No se pudo enviar la Neko.`);
    }
};

handler.help = ['neko2'];
handler.tags = ['NSFW'];
handler.command = /^(neko2)$/i;
handler.register = true;

export default handler;