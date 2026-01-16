import { premiumStyles } from '../lib/styles.js'

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

let handler = async (m, { conn, usedPrefix }) => {
    let user = global.db.data.users[m.sender]
    if (!user.premium) return m.reply(`> 💎 *ACCESO EXCLUSIVO*\n\n> Este reto de nivel extremo es solo para miembros **Élite**.`)
    if (salasBanderas.has(m.sender)) return m.reply(`> ⚠️ Ya tienes una operación de búsqueda activa.`)

    const itemCorrecto = banderas[Math.floor(Math.random() * banderas.length)]
    let opciones = [itemCorrecto]

    while (opciones.length < 12) {
        let fake = banderas[Math.floor(Math.random() * banderas.length)]
        if (!opciones.find(o => o.pais === fake.pais)) opciones.push(fake)
    }

    opciones.sort(() => Math.random() - 0.5)

    let s = premiumStyles[user.prefStyle] || (user.premium ? premiumStyles["luxury"] : null)
    let correctIndex = opciones.findIndex(o => o.pais === itemCorrecto.pais) + 1

    let timer = setTimeout(() => {
        if (salasBanderas.has(m.sender)) {
            m.reply(`> ⏰ *TIEMPO AGOTADO*\n\n> @${m.sender.split('@')[0]}, la bandera era la **#${correctIndex}** ${itemCorrecto.bandera}. Tu racha de victorias ha vuelto a 0.`)
            user.banderaStreak = 0
            salasBanderas.delete(m.sender)
        }
    }, 45000)

    salasBanderas.set(m.sender, { 
        correct: correctIndex, 
        pais: itemCorrecto.pais,
        bandera: itemCorrecto.bandera,
        chat: m.chat,
        style: s,
        timer
    })

    let caption = s ? `${s.top}\n\n` : ''
    caption += `🚩 *𝗗𝗘𝗦𝗔𝗙𝗜́𝗢: 𝗕𝗔𝗡𝗗𝗘𝗥𝗔𝗦 𝗘𝗫𝗧𝗥𝗘𝗠𝗢*\n`
    caption += `_Nivel Élite: Identifica la ubicación correcta._\n\n`
    caption += `🎯 Busca el estandarte de:\n> *${itemCorrecto.pais.toUpperCase()}*\n\n`

    opciones.forEach((op, i) => {
        caption += `*${i + 1}.* ${op.bandera}   `
        if ((i + 1) % 3 === 0) caption += '\n'
    })

    caption += `\n> 🔥 *Racha actual:* ${user.banderaStreak || 0}\n`
    caption += `\n> ⏰ *45s* | Responde solo con el número.\n`
    caption += `> ⚠️ Solo tienes **1 oportunidad**.`
    if (s) caption += `\n\n${s.footer}`

    await m.react('🌎')
    return conn.reply(m.chat, caption, m, { mentions: [m.sender] })
}

handler.before = async (m, { conn }) => {
    let game = salasBanderas.get(m.sender)
    if (!game || m.isBaileys || m.chat !== game.chat || !m.text) return 

    if (!/^[0-9]+$/.test(m.text.trim())) return 
    let input = parseInt(m.text.trim())
    if (input < 1 || input > 12) return

    let user = global.db.data.users[m.sender]
    let s = game.style

    if (input === game.correct) {
        // Sistema de recompensas y rachas
        user.banderaStreak = (user.banderaStreak || 0) + 1
        let bonificación = user.banderaStreak * 10

        let ganK = 5 
        let ganC = 400 + bonificación
        let ganD = 1
        let ganE = 250

        user.kryons = (user.kryons || 0) + ganK
        user.coin = (user.coin || 0) + ganC
        user.diamond = (user.diamond || 0) + ganD
        user.exp = (user.exp || 0) + ganE

        clearTimeout(game.timer)
        salasBanderas.delete(m.sender)

        await m.react('🔥')
        let win = s ? `${s.top}\n\n` : ''
        win += `🎊 *¡𝗗𝗘𝗧𝗘𝗖𝗖𝗜𝗢́𝗡 𝗣𝗘𝗥𝗙𝗘𝗖𝗧𝗔!*\n\n`
        win += `> ✅ Correcto: *${game.pais}* era la #${game.correct}\n`
        win += `> 🔥 Racha de victorias: *${user.banderaStreak}*\n\n`
        win += `🎁 *𝗕𝗢𝗧𝗜́𝗡 𝗘𝗟𝗜𝗧𝗘:* \n`
        win += `> ⚡ Kryons: +${ganK}\n`
        win += `> 🪙 Coins: +${ganC.toLocaleString()}\n`
        win += `> 💎 Diamante: +${ganD}\n`
        win += `> ✨ EXP: +${ganE}`
        if (s) win += `\n\n${s.footer}`

        return m.reply(win, null, { mentions: [m.sender] })
    } else {
        // Penalización por fallo
        let expLost = 150
        user.exp = Math.max(0, (user.exp || 0) - expLost)
        user.banderaStreak = 0

        clearTimeout(game.timer)
        salasBanderas.delete(m.sender)

        await m.react('❌')
        return m.reply(`> 🚫 *𝗘𝗥𝗥𝗢𝗥 𝗗𝗘 𝗜𝗗𝗘𝗡𝗧𝗜𝗙𝗜𝗖𝗔𝗖𝗜𝗢́𝗡*\n\n> @${m.sender.split('@')[0]}, esa no era. La correcta era la *${game.correct}* (${game.pais} ${game.bandera}).\n\n> 📉 *Penalización:* -${expLost} EXP\n> 🔥 *Racha:* Reseteada a 0.`, null, { mentions: [m.sender] })
    }
}

handler.help = ['bandera']
handler.tags = ['premium']
handler.command = /^(bandera|pbandera)$/i
handler.group = true

export default handler