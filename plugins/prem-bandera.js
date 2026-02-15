const { saveDatabase } = require('../lib/db.js')
const { checkReg } = require('../lib/checkReg.js')

const banderas = [
    // América
    { pais: "Honduras", bandera: "🇭🇳" }, { pais: "México", bandera: "🇲🇽" }, { pais: "Argentina", bandera: "🇦🇷" },
    { pais: "Brasil", bandera: "🇧🇷" }, { pais: "Canadá", bandera: "🇨🇦" }, { pais: "Chile", bandera: "🇨🇱" },
    { pais: "Colombia", bandera: "🇨🇴" }, { pais: "Costa Rica", bandera: "🇨🇷" }, { pais: "Cuba", bandera: "🇨🇺" },
    { pais: "Ecuador", bandera: "🇪🇨" }, { pais: "El Salvador", bandera: "🇸🇻" }, { pais: "Guatemala", bandera: "🇬🇹" },
    { pais: "Haití", bandera: "🇭🇹" }, { pais: "Jamaica", bandera: "🇯🇲" }, { pais: "Nicaragua", bandera: "🇳🇮" },
    { pais: "Panamá", bandera: "🇵🇦" }, { pais: "Paraguay", bandera: "🇵🇾" }, { pais: "Perú", bandera: "🇵🇪" },
    { pais: "República Dominicana", bandera: "🇩🇴" }, { pais: "Uruguay", bandera: "🇺🇾" }, { pais: "Venezuela", bandera: "🇻🇪" },
    { pais: "Estados Unidos", bandera: "🇺🇸" }, { pais: "Bahamas", bandera: "🇧🇸" }, { pais: "Barbados", bandera: "🇧🇧" },
    { pais: "Belice", bandera: "🇧🇿" }, { pais: "Bolivia", bandera: "🇧🇴" }, { pais: "Guyana", bandera: "🇬🇾" },
    { pais: "Surinam", bandera: "🇸🇷" }, { pais: "Trinidad y Tobago", bandera: "🇹🇹" }, { pais: "Dominica", bandera: "🇩🇲" },
    { pais: "Santa Lucía", bandera: "🇱🇨" }, { pais: "San Vicente y las Granadinas", bandera: "🇻🇨" }, { pais: "Antigua y Barbuda", bandera: "🇦🇬" },
    { pais: "San Cristóbal y Nieves", bandera: "🇰🇳" }, { pais: "Granada", bandera: "🇬🇩" },

    // Europa
    { pais: "España", bandera: "🇪🇸" }, { pais: "Francia", bandera: "🇫🇷" }, { pais: "Alemania", bandera: "🇩🇪" },
    { pais: "Italia", bandera: "🇮🇹" }, { pais: "Reino Unido", bandera: "🇬🇧" }, { pais: "Portugal", bandera: "🇵🇹" },
    { pais: "Países Bajos", bandera: "🇳🇱" }, { pais: "Bélgica", bandera: "🇧🇪" }, { pais: "Suiza", bandera: "🇨🇭" },
    { pais: "Austria", bandera: "🇦🇹" }, { pais: "Suecia", bandera: "🇸🇪" }, { pais: "Noruega", bandera: "🇳🇴" },
    { pais: "Dinamarca", bandera: "🇩🇰" }, { pais: "Finlandia", bandera: "🇫🇮" }, { pais: "Irlanda", bandera: "🇮🇪" },
    { pais: "Islandia", bandera: "🇮🇸" }, { pais: "Polonia", bandera: "🇵🇱" }, { pais: "República Checa", bandera: "🇨🇿" },
    { pais: "Eslovaquia", bandera: "🇸🇰" }, { pais: "Hungría", bandera: "🇭🇺" }, { pais: "Rumania", bandera: "🇷🇴" },
    { pais: "Bulgaria", bandera: "🇧🇬" }, { pais: "Grecia", bandera: "🇬🇷" }, { pais: "Croacia", bandera: "🇭🇷" },
    { pais: "Serbia", bandera: "🇷🇸" }, { pais: "Eslovenia", bandera: "🇸🇮" }, { pais: "Bosnia y Herzegovina", bandera: "🇧🇦" },
    { pais: "Montenegro", bandera: "🇲🇪" }, { pais: "Albania", bandera: "🇦🇱" }, { pais: "Macedonia del Norte", bandera: "🇲🇰" },
    { pais: "Estonia", bandera: "🇪🇪" }, { pais: "Letonia", bandera: "🇱🇻" }, { pais: "Lituania", bandera: "🇱🇹" },
    { pais: "Bielorrusia", bandera: "🇧🇾" }, { pais: "Ucrania", bandera: "🇺🇦" }, { pais: "Moldavia", bandera: "🇲🇩" },
    { pais: "Rusia", bandera: "🇷🇺" }, { pais: "Mónaco", bandera: "🇲🇨" }, { pais: "San Marino", bandera: "🇸🇲" },
    { pais: "Vaticano", bandera: "🇻🇦" }, { pais: "Andorra", bandera: "🇦🇩" }, { pais: "Malta", bandera: "🇲🇹" },
    { pais: "Liechtenstein", bandera: "🇱🇮" }, { pais: "Luxemburgo", bandera: "🇱🇺" },

    // Asia
    { pais: "Japón", bandera: "🇯🇵" }, { pais: "China", bandera: "🇨🇳" }, { pais: "Corea del Sur", bandera: "🇰🇷" },
    { pais: "Corea del Norte", bandera: "🇰🇵" }, { pais: "India", bandera: "🇮🇳" }, { pais: "Pakistán", bandera: "🇵🇰" },
    { pais: "Indonesia", bandera: "🇮🇩" }, { pais: "Filipinas", bandera: "🇵🇭" }, { pais: "Vietnam", bandera: "🇻🇳" },
    { pais: "Tailandia", bandera: "🇹🇭" }, { pais: "Malasia", bandera: "🇲🇾" }, { pais: "Singapur", bandera: "🇸🇬" },
    { pais: "Turquía", bandera: "🇹🇷" }, { pais: "Irán", bandera: "🇮🇷" }, { pais: "Irak", bandera: "🇮🇶" },
    { pais: "Arabia Saudita", bandera: "🇸🇦" }, { pais: "Emiratos Árabes Unidos", bandera: "🇦🇪" }, { pais: "Israel", bandera: "🇮🇱" },
    { pais: "Jordania", bandera: "🇯🇴" }, { pais: "Líbano", bandera: "🇱🇧" }, { pais: "Siria", bandera: "🇸🇾" },
    { pais: "Qatar", bandera: "🇶🇦" }, { pais: "Kuwait", bandera: "🇰🇼" }, { pais: "Omán", bandera: "🇴🇲" },
    { pais: "Yemen", bandera: "🇾🇪" }, { pais: "Afganistán", bandera: "🇦🇫" }, { pais: "Bangladesh", bandera: "🇧🇩" },
    { pais: "Sri Lanka", bandera: "🇱🇰" }, { pais: "Nepal", bandera: "🇳🇵" }, { pais: "Bután", bandera: "🇧🇹" },
    { pais: "Myanmar", bandera: "🇲🇲" }, { pais: "Camboya", bandera: "🇰🇭" }, { pais: "Laos", bandera: "🇱🇦" },
    { pais: "Mongolia", bandera: "🇲🇳" }, { pais: "Kazajistán", bandera: "🇰🇿" }, { pais: "Uzbequistán", bandera: "🇺🇿" },
    { pais: "Turkmenistán", bandera: "🇹🇲" }, { pais: "Kirguistán", bandera: "🇰🇬" }, { pais: "Tayikistán", bandera: "🇹🇯" },
    { pais: "Georgia", bandera: "🇬🇪" }, { pais: "Armenia", bandera: "🇦🇲" }, { pais: "Azerbaiyán", bandera: "🇦🇿" },
    { pais: "Maldivas", bandera: "🇲🇻" }, { pais: "Brunéi", bandera: "🇧🇳" }, { pais: "Timor Oriental", bandera: "🇹🇱" },

    // África
    { pais: "Egipto", bandera: "🇪🇬" }, { pais: "Sudáfrica", bandera: "🇿🇦" }, { pais: "Nigeria", bandera: "🇳🇬" },
    { pais: "Etiopía", bandera: "🇪🇹" }, { pais: "Argelia", bandera: "🇩🇿" }, { pais: "Marruecos", bandera: "🇲🇦" },
    { pais: "Kenia", bandera: "🇰🇪" }, { pais: "Uganda", bandera: "🇺🇬" }, { pais: "Ghana", bandera: "🇬🇭" },
    { pais: "Senegal", bandera: "🇸🇳" }, { pais: "Angola", bandera: "🇦🇴" }, { pais: "Tanzania", bandera: "🇹🇿" },
    { pais: "Costa de Marfil", bandera: "🇨🇮" }, { pais: "Camerún", bandera: "🇨🇲" }, { pais: "Madagascar", bandera: "🇲🇬" },
    { pais: "Mozambique", bandera: "🇲🇿" }, { pais: "Zimbabue", bandera: "🇿🇼" }, { pais: "Túnez", bandera: "🇹🇳" },
    { pais: "Libia", bandera: "🇱🇾" }, { pais: "Sudán", bandera: "🇸🇩" }, { pais: "RD del Congo", bandera: "🇨🇩" },
    { pais: "Congo", bandera: "🇨🇬" }, { pais: "Gabón", bandera: "🇬🇦" }, { pais: "Guinea", bandera: "🇬🇳" },
    { pais: "Malí", bandera: "🇲🇱" }, { pais: "Níger", bandera: "🇳🇪" }, { pais: "Chad", bandera: "🇹🇩" },
    { pais: "Mauritania", bandera: "🇲🇷" }, { pais: "Namibia", bandera: "🇳🇦" }, { pais: "Botsuana", bandera: "🇧🇼" },
    { pais: "Zambia", bandera: "🇿🇲" }, { pais: "Malaui", bandera: "🇲🇼" }, { pais: "Ruanda", bandera: "🇷🇼" },
    { pais: "Burundi", bandera: "🇧🇮" }, { pais: "Somalia", bandera: "🇸🇴" }, { pais: "Eritrea", bandera: "🇪🇷" },
    { pais: "Yibuti", bandera: "🇩🇯" }, { pais: "Benín", bandera: "🇧🇯" }, { pais: "Togo", bandera: "🇹🇬" },
    { pais: "Burkina Faso", bandera: "🇧🇫" }, { pais: "Sierra Leona", bandera: "🇸🇱" }, { pais: "Liberia", bandera: "🇱🇷" },
    { pais: "Gambia", bandera: "🇬🇲" }, { pais: "Guinea-Bisáu", bandera: "🇬🇼" }, { pais: "Guinea Ecuatorial", bandera: "🇬🇶" },
    { pais: "Cabo Verde", bandera: "🇨🇻" }, { pais: "Santo Tomé y Príncipe", bandera: "🇸🇹" }, { pais: "Seychelles", bandera: "🇸🇨" },
    { pais: "Mauricio", bandera: "🇲🇺" }, { pais: "Comoras", bandera: "🇰🇲" }, { pais: "Lesoto", bandera: "🇱🇸" },
    { pais: "Eswatini", bandera: "🇸🇿" },

    // Oceanía
    { pais: "Australia", bandera: "🇦🇺" }, { pais: "Nueva Zelanda", bandera: "🇳🇿" }, { pais: "Papúa Nueva Guinea", bandera: "🇵🇬" },
    { pais: "Fiyi", bandera: "🇫🇯" }, { pais: "Islas Salomón", bandera: "🇸🇧" }, { pais: "Vanuatu", bandera: "🇻🇺" },
    { pais: "Samoa", bandera: "🇼🇸" }, { pais: "Tonga", bandera: "🇹🇴" }, { pais: "Kiribati", bandera: "🇰🇮" },
    { pais: "Micronesia", bandera: "🇫🇲" }, { pais: "Islas Marshall", bandera: "🇲🇭" }, { pais: "Palaos", bandera: "🇵🇼" },
    { pais: "Nauru", bandera: "🇳🇷" }, { pais: "Tuvalu", bandera: "🇹🇻" }
];

const salasBanderas = new Map();
const cooldowns = new Map();

let handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    let id = m.sender

    if (await checkReg(m, user)) return
    
    // --- SISTEMA DE COOLDOWN ---
    let time = cooldowns.get(id) || 0
    if (Date.now() - time < 30000) {
        let wait = Math.ceil((30000 - (Date.now() - time)) / 1000)
        return m.reply(`> ⏳ *ESPERA:* Debes esperar **${wait}s** para volver a jugar, no seas impaciente, cielo.`)
    }

    if (salasBanderas.has(id)) return m.reply(`> 🎀 *Aviso:* Ya tienes un desafío activo. ¡Responde con el número!`)

    const itemCorrecto = banderas[Math.floor(Math.random() * banderas.length)]
    let opciones = [itemCorrecto]

    while (opciones.length < 10) {
        let fake = banderas[Math.floor(Math.random() * banderas.length)]
        if (!opciones.find(o => o.pais === fake.pais)) opciones.push(fake)
    }
    opciones.sort(() => Math.random() - 0.5)

    let correctIndex = opciones.findIndex(o => o.pais === itemCorrecto.pais) + 1

    salasBanderas.set(id, { 
        correct: correctIndex, 
        pais: itemCorrecto.pais,
        bandera: itemCorrecto.bandera,
        chat: m.chat
    })

    await m.react('🌎')
    let caption = `🚩 *𝗗𝗘𝗦𝗔𝗙𝗜́𝗢: 𝗕𝗔𝗡𝗗𝗘𝗥𝗔𝗦*\n\n`
    caption += `🎯 Encuentra la bandera de:\n> *${itemCorrecto.pais.toUpperCase()}*\n\n`

    opciones.forEach((op, i) => {
        caption += `*${i + 1}.* ${op.bandera}   `
        if ((i + 1) % 5 === 0) caption += '\n'
    })

    caption += `\n> 🔥 *Racha:* ${user.racha || 0}\n`
    caption += `> ⚠️ Solo tienes **1 oportunidad**.\n`
    caption += `> _Responde solo con el número de la opción._`

    return conn.reply(m.chat, caption, m)
}

handler.before = async (m, { conn }) => {
    let id = m.sender
    let game = salasBanderas.get(id)
    if (!game || m.isBaileys || !m.text) return 

    if (!/^[0-9]+$/.test(m.text.trim())) return 
    let input = parseInt(m.text.trim())
    if (input < 1 || input > 10) return

    let user = global.db.data.users[id]

    if (input === game.correct) {
        let ganC = Math.floor(Math.random() * (2000 - 1500 + 1)) + 1500 
        let ganD = Math.random() > 0.7 ? 2 : 1

        user.coin = (user.coin || 0) + ganC
        user.diamond = (user.diamond || 0) + ganD
        user.racha = (user.racha || 0) + 1

        let bonus = ""
        if (user.racha % 5 === 0) {
            user.hotpass = (user.hotpass || 0) + 1
            bonus = `\n🔥 *BONUS RACHA:* +1 🎫 HotPass`
        }

        await m.react('🎉')
        let win = `✨ *¡DETECCIÓN PERFECTA!*\n\n`
        win += `> ✅ Correcto: *${game.pais}* era la #${game.correct}\n`
        win += `> *Ganancia:* ${ganC.toLocaleString()} 🪙 y ${ganD} 💎\n`
        win += `> *Racha:* ${user.racha} 🔥${bonus}`

        await m.reply(win)
        salasBanderas.delete(id)
        cooldowns.set(id, Date.now()) 
        await saveDatabase()
    } else {
        user.racha = 0
        await m.react('❌')
        let lose = `🚫 *ERROR DE IDENTIFICACIÓN*\n\n`
        lose += `> La correcta era la *${game.correct}* (${game.pais} ${game.bandera})\n`
        lose += `> Tu racha 🔥 se ha extinguido. _Ay, corazón, qué decepción._`
        
        await m.reply(lose)
        salasBanderas.delete(id)
        cooldowns.set(id, Date.now())
    }
    return true
}

handler.help = ['bandera']
handler.tags = ['game']
handler.command = /^(bandera|flag)$/i

module.exports = handler