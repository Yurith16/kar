const fs = require("fs");
const fetch = require("node-fetch");
const axios = require("axios");
const moment = require("moment-timezone");

var handler = (m) => m;
handler.all = async function (m) {
  // 🛑 IDENTIDAD DEL CANAL 🛑
  global.canalIdM = ["120363402246635214@g.us"];
  global.canalNombreM = ["꧁​𓊈🍃𝐊𝐚𝐫𝐛𝐨𝐭 𝐎𝐟𝐢𝐜𝐢𝐚𝐥🍃𓊉꧂"];

  global.channelRD = { id: undefined, name: undefined };

  // Gestión de Tiempo y Fecha
  global.d = new Date(new Date() + 3600000);
  global.locale = "es";
  global.dia = d.toLocaleDateString(locale, { weekday: "long" });
  global.fecha = d.toLocaleDateString("es", { day: "numeric", month: "numeric", year: "numeric" });
  global.mes = d.toLocaleDateString("es", { month: "long" });
  global.año = d.toLocaleDateString("es", { year: "numeric" });
  global.tiempo = d.toLocaleString("en-US", { hour: "numeric", minute: "numeric", second: "numeric", hour12: true });

  global.nombre = m.pushName || "𝚄𝚜𝚞𝚊𝚛𝚒𝚘-𝙼𝙳";
  global.packsticker = ``;

  // --- SISTEMA DE ICONOS Y EMOJIS ALEATORIOS ---
  global.iconos = [
    "https://image2url.com/images/1765486012290-7e2d4538-c0d4-487b-9410-9b21ab56387f.jpg",
    "https://image2url.com/images/1765486043596-c617bb6f-828d-4dbb-87e2-ea5c0ddaebed.jpg",
    "https://image2url.com/images/1765486068515-15617e4f-aaba-4dff-b4da-0ba106f75cfd.jpg",
    "https://image2url.com/images/1765486087799-4050fc16-aeff-4200-b499-20a5538148a7.jpg",
  ];
  global.icono = global.iconos.getRandom();

  const emjis = ["🍃", "🌿", "🍀", "☘️", "🌱", "🌾", "🌵", "🎋", "🍃", "🍄", "🌺", "🌷"];
  const emji = emjis.getRandom();

  // Nombres aleatorios para el Bot (Sin 'Lite')
  const botNames = ["𝙺𝙰𝚁𝙱𝙾𝚃-𝙾𝙵𝙸𝙲𝙸𝙰𝙻", "𝙺𝙰𝚁𝙱𝙾𝚃-𝙸𝙰", "𝙺𝙰𝚁𝙱𝙾𝚃-𝙽𝙰𝚃𝚄𝚁𝙴", "𝙺𝙰𝚁𝙱𝙾𝚃-𝚂𝙾𝙵𝚃", "𝙺𝙰𝚁𝙱𝙾𝚃-𝙼𝙳"];
  const bName = botNames.getRandom();

  // Frases aleatorias para el Body (Contexto natural y drama)
  const frasesBody = [
    "𝖮𝗇𝗅𝗂𝗇𝖾 floreciente 🪷",
    "🌿 Brotando con amor para ti",
    "🍃 Entre hojas y suspiros...",
    "🍀 Tu asistente natural favorito",
    "🍄 Un jardín de respuestas",
    "🥀 El drama de servirte es mi pasión",
    "🎋 Creciendo juntos cada día",
    "🌷 Floreciendo en este chat"
  ];
  const bBody = frasesBody.getRandom();

  // --- CONFIGURACIÓN DE NOMBRES Y TEXTOS ---
  global.wm = `© ${bName} 𝟸𝟶𝟸𝟼 ${emji}`; 
  global.wm3 = `${emji} 𝙺𝙰𝚁𝙱𝙾𝚃 𝚂𝙸𝚂𝚃𝙴𝙼𝙰 𝙳𝚄𝙰𝙻 ${emji}`;
  global.author = "𝙷𝙴𝚁𝙽𝙰𝙽𝙳𝙴𝚉";
  global.textbot = `${bName}`;
  global.etiqueta = "@𝙷𝙴𝚁𝙽𝙰𝙽𝙳𝙴𝚉_𝙾𝙵𝙸𝙲𝙸𝙰𝙻";
  global.me = `${emji} ${bName} ${emji}`;

  global.fkontak = {
    key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "Halo" },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split("@")[0]}:${m.sender.split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
      },
    },
    participant: "0@s.whatsapp.net",
  };

  global.rcanal = {
    contextInfo: {
      isForwarded: false,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363402246635214@newsletter",
        serverMessageId: "1",
        newsletterName: "꧁​𓊈🍃𝐊𝐚𝐫𝐛𝐨𝐭 𝐎𝐟𝐢𝐜𝐢𝐚𝐥🍃𓊉꧂", 
      },
      externalAdReply: {
        title: `${emji} ${bName} ${emji}`,
        body: bBody,
        thumbnailUrl: global.icono,
        sourceUrl: "",
        mediaType: 1,
        renderLargerThumbnail: false,
      },
    },
  };

  const frasesListo = [
    `> ${emji} *Aquí tienes lo solicitado, tesoro.*`,
    `> ${emji} *Hecho con amor para ti.*`,
    `> ${emji} *¡Listo! Disfruta tu pedido.*`,
    `> ${emji} *Todo preparado, corazón.*`,
    `> ${emji} *Tus deseos son órdenes, cielo.*`
  ];

  global.listo = frasesListo.getRandom();
  global.moneda = "𝙺𝚛𝚢𝚘𝚗𝚜";
  global.prefix = [".", "!", "/", "#", "%"];
};

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

async function getRandomChannel() {
  return { id: undefined, name: undefined };
}

if (!Array.prototype.getRandom) {
  Array.prototype.getRandom = function () {
    return this[Math.floor(Math.random() * this.length)];
  };
}

module.exports = handler;