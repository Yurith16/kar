const { watchFile, unwatchFile } = require("fs");
const chalk = require("chalk");
const { fileURLToPath, pathToFileURL } = require("url");
const fs = require("fs");
const cheerio = require("cheerio");
const fetch = require("node-fetch");
const axios = require("axios");
const moment = require("moment-timezone");
const { dirname } = require("path");

// En CommonJS, __dirname ya existe, pero si necesitas esta función:
global.__dirname = (url) => {
  try {
    return dirname(fileURLToPath(url));
  } catch {
    return __dirname;
  }
};

//aquí los retirados👑🥀
global.retirado = [["50496926150", "𝙷𝙴𝚁𝙽𝙰𝙽𝙳𝙴𝚉", true]];

/*habrán comandos especiales para los retirados algo q los identifique | nota ustedes pondrán los coamndos y q solo funcione para los retirados*/

// Configuraciones principales
global.roowner = ["50496926150"];
global.owner = [["50496926150", "𝙷𝙴𝚁𝙽𝙰𝙽𝙳𝙴𝚉", true],
  ['5191334760', 'Kar', true]];

global.mods = ["50496926150"];
global.suittag = ["50496926150"];
global.prems = ["50496926150"];

// Información del bot
global.libreria = "Baileys";
global.baileys = "V 6.7.9";
global.languaje = "Español";
global.vs = "7.5.2";
global.vsJB = "5.0";
global.nameqr = "𝙺𝙰𝚁𝙱𝙾𝚃𝚀𝚁";
global.namebot = "𝙺𝙰𝚁𝙱𝙾𝚃";
global.sessions = "Sessions/Principal";
global.jadi = "Sessions/SubBot";
global.ItsukiJadibts = false;
global.Choso = false;
global.prefix = "/";
global.apikey = "𝙺𝙰𝚁𝙱𝙾𝚃𝙸𝙰";
global.botNumber = '50498729368'
global.packname = "";
global.botname = "⚙️  𝙺𝙰𝚁𝙱𝙾𝚃 ⚙️";
global.wm = "© 𝙷𝙴𝚁𝙽𝙰𝙽𝙳𝙴𝚉";
global.wm3 = "⚙️  𝙺𝙰𝚁𝙱𝙾𝚃 ⚙️";
global.author = "𝙷𝙴𝚁𝙽𝙰𝙽𝙳𝙴𝚉";
global.dev = "𝙾𝚆𝙽𝙴𝚁-𝙷𝙴𝚁𝙽𝙰𝙽𝙳𝙴𝚉";
global.textbot = "𝙺𝙰𝚁𝙱𝙾𝚃-𝙸𝙰";
global.etiqueta = "@𝙷𝙴𝚁𝙽𝙰𝙽𝙳𝙴𝚉";
global.gt = "𝙺𝙰𝚁𝙱𝙾𝚃";
global.me = "⚙️  𝙺𝙰𝚁𝙱𝙾𝚃 𝙸𝙰 ⚙️";
global.listo = "*𝙰𝚚𝚞𝚒 𝚝𝚒𝚎𝚗𝚎*";
global.moneda = "𝙺𝚛𝚢𝚘𝚗𝚜";
global.multiplier = 69;
global.maxwarn = 3;
global.cheerio = cheerio;
global.fs = fs;
global.fetch = fetch;
global.axios = axios;
global.moment = moment;

// Enlaces oficiales del bot - ELIMINADOS COMO SOLICITASTE
global.gp1 = "";
global.comunidad1 = "";
global.channel = "";
global.channel2 = "";
global.md = "";
global.correo = "";

// Apis para las descargas y más
global.APIs = {
  ryzen: "https://api.ryzendesu.vip",
  xteam: "https://api.xteam.xyz",
  lol: "https://api.lolhuman.xyz",
  delirius: "https://delirius-apiofc.vercel.app",
  siputzx: "https://api.siputzx.my.id",
  mayapi: "https://mayapi.ooguy.com",
};

global.APIKeys = {
  "https://api.xteam.xyz": "YOUR_XTEAM_KEY",
  "https://api.lolhuman.xyz": "API_KEY",
  "https://api.betabotz.eu.org": "API_KEY",
  "https://mayapi.ooguy.com": "may-f53d1d49",
};

// Endpoints de IA
global.SIPUTZX_AI = {
  base: global.APIs?.siputzx || "https://api.siputzx.my.id",
  bardPath: "/api/ai/bard",
  queryParam: "query",
  headers: { accept: "*/*" },
};

global.chatDefaults = {
  isBanned: false,
  sAutoresponder: "",
  welcome: true,
  autolevelup: false,
  autoAceptar: false,
  autosticker: false,
  autoRechazar: false,
  autoresponder: false,
  detect: true,
  antiBot: false,
  antiBot2: false,
  modoadmin: false,
  antiLink: true,
  antiImg: false,
  reaction: false,
  nsfw: false,
  antifake: false,
  delete: false,
  expired: 0,
  antiLag: false,
  per: [],
  antitoxic: false,
};

// CORREGIDO: Usar __filename en lugar de import.meta.url
let file = __filename;
watchFile(file, () => {
  unwatchFile(file);
  console.log(chalk.redBright("𝚄𝚙𝚍𝚊𝚝𝚎 '𝚌𝚘𝚗𝚏𝚒𝚐.𝚓𝚜'"));
  try {
    // Recargar el módulo eliminando el cache
    delete require.cache[require.resolve('./config.js')];
    require('./config.js');
  } catch (e) {
    console.error('Error recargando config:', e);
  }
});

// Configuraciones finales
module.exports = {
  prefix: global.prefix,
  owner: global.owner,
  sessionDirName: global.sessions,
  sessionName: global.sessions,
  botNumber: global.botNumber,
  chatDefaults: global.chatDefaults,
};