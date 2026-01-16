import { premiumStyles } from '../lib/styles.js'

function toBoldMono(text) {
    const mapping = {
        A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", 
        N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭",
        a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲", f: "𝗳", g: "𝗴", h: "𝗵", i: "𝗶", j: "𝗷", k: "𝗸", l: "𝗹", m: "𝗺", 
        n: "𝗻", o: "𝗼", p: "𝗽", q: "𝗾", r: "𝗿", s: "𝘀", t: "𝘁", u: "𝘂", v: "𝘃", w: "𝘄", x: "𝘅", y: "𝘆", z: "𝘇",
        0: "𝟬", 1: "𝟭", 2: "𝟮", 3: "𝟯", 4: "𝟰", 5: "𝟱", 6: "𝟲", 7: "𝟳", 8: "𝟴", 9: "𝟵"
    }
    return text.split('').map(char => mapping[char] || char).join('')
}

const triviaData = {
    'cultura': [
        { q: '¿Cuál es el río más largo del mundo?', a: 'Amazonas', opciones: ['Nilo', 'Amazonas', 'Misisipi', 'Yangtsé', 'Danubio', 'Rhin'] },
        { q: '¿En qué país se encuentra la Torre de Pisa?', a: 'Italia', opciones: ['Francia', 'España', 'Italia', 'Grecia', 'Portugal', 'Bélgica'] },
        { q: '¿Quién pintó la "Mona Lisa"?', a: 'Leonardo da Vinci', opciones: ['Van Gogh', 'Picasso', 'Leonardo da Vinci', 'Dalí', 'Rembrandt', 'Monet'] },
        { q: '¿Cuál es el país más pequeño del mundo?', a: 'Vaticano', opciones: ['Mónaco', 'Vaticano', 'Andorra', 'San Marino', 'Malta', 'Liechtenstein'] },
        { q: '¿Qué ciudad es conocida como la "Gran Manzana"?', a: 'Nueva York', opciones: ['Chicago', 'Los Ángeles', 'Nueva York', 'Londres', 'París', 'Tokio'] },
        { q: '¿Cuál es el idioma más hablado del mundo?', a: 'Chino Mandarín', opciones: ['Español', 'Inglés', 'Chino Mandarín', 'Hindi', 'Árabe', 'Ruso'] },
        { q: '¿Qué país tiene forma de bota?', a: 'Italia', opciones: ['Grecia', 'Italia', 'España', 'México', 'Noruega', 'Japón'] },
        { q: '¿Quién escribió "Don Quijote de la Mancha"?', a: 'Miguel de Cervantes', opciones: ['Lope de Vega', 'Miguel de Cervantes', 'Gabriel García Márquez', 'Shakespeare', 'Neruda', 'Quevedo'] },
        { q: '¿Cuál es el océano más grande del mundo?', a: 'Pacífico', opciones: ['Atlántico', 'Índico', 'Ártico', 'Pacífico', 'Antártico', 'Muerto'] },
        { q: '¿En qué continente se encuentra el desierto del Sahara?', a: 'África', opciones: ['Asia', 'África', 'América', 'Oceanía', 'Europa', 'Antártida'] },
        { q: '¿Cuál es el animal terrestre más rápido?', a: 'Guepardo', opciones: ['León', 'Tigre', 'Guepardo', 'Caballo', 'Avestruz', 'Gacela'] },
        { q: '¿Qué país regaló la Estatua de la Libertad a EE.UU.?', a: 'Francia', opciones: ['España', 'Reino Unido', 'Francia', 'Alemania', 'Italia', 'Canadá'] },
        { q: '¿Cuál es la capital de Japón?', a: 'Tokio', opciones: ['Kioto', 'Osaka', 'Tokio', 'Seúl', 'Pekín', 'Hiroshima'] },
        { q: '¿Quién es el autor de "La noche estrellada"?', a: 'Vincent van Gogh', opciones: ['Claude Monet', 'Vincent van Gogh', 'Salvador Dalí', 'Picasso', 'Renoir', 'Degas'] },
        { q: '¿Cuál es el monte más alto del mundo?', a: 'Everest', opciones: ['K2', 'Everest', 'Kilimanjaro', 'Aconcagua', 'Mont Blanc', 'Anapurna'] },
        { q: '¿Qué instrumento tocaba Sherlock Holmes?', a: 'Violín', opciones: ['Piano', 'Violín', 'Flauta', 'Guitarra', 'Arpa', 'Clarinete'] },
        { q: '¿Cuál es la moneda oficial de Reino Unido?', a: 'Libra Esterlina', opciones: ['Euro', 'Dólar', 'Libra Esterlina', 'Franco', 'Yen', 'Peso'] },
        { q: '¿En qué país se originaron los Juegos Olímpicos?', a: 'Grecia', opciones: ['Italia', 'Egipto', 'Grecia', 'Francia', 'China', 'México'] },
        { q: '¿Qué país es famoso por el Taj Mahal?', a: 'India', opciones: ['Pakistán', 'India', 'Irán', 'Tailandia', 'Egipto', 'Turquía'] },
        { q: '¿Cuál es el libro más vendido después de la Biblia?', a: 'Don Quijote', opciones: ['Harry Potter', 'El Principito', 'Don Quijote', 'El Código Da Vinci', 'El Señor de los Anillos', 'Cien años de soledad'] }
    ],
    'ciencia': [
        { q: '¿Cuál es la fórmula química del agua?', a: 'H2O', opciones: ['CO2', 'H2O', 'NaCl', 'O2', 'CH4', 'H2SO4'] },
        { q: '¿Qué planeta es conocido como el "planeta rojo"?', a: 'Marte', opciones: ['Venus', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Neptuno'] },
        { q: '¿Cuál es el metal más caro del mundo?', a: 'Rodio', opciones: ['Oro', 'Platino', 'Rodio', 'Paladio', 'Iridio', 'Plata'] },
        { q: '¿Cuántos huesos tiene el cuerpo humano adulto?', a: '206', opciones: ['206', '210', '195', '200', '208', '215'] },
        { q: '¿Cuál es la velocidad de la luz aprox?', a: '300,000 km/s', opciones: ['150,000 km/s', '300,000 km/s', '500,000 km/s', '1,000,000 km/s', '200,000 km/s', '450,000 km/s'] },
        { q: '¿Cuál es el planeta más grande del Sistema Solar?', a: 'Júpiter', opciones: ['Júpiter', 'Saturno', 'Neptuno', 'Tierra', 'Urano', 'Sol'] },
        { q: '¿Qué gas necesitan las plantas para la fotosíntesis?', a: 'Dióxido de carbono', opciones: ['Oxígeno', 'Dióxido de carbono', 'Nitrógeno', 'Hidrógeno', 'Helio', 'Argón'] },
        { q: '¿Quién propuso la Teoría de la Relatividad?', a: 'Albert Einstein', opciones: ['Isaac Newton', 'Nikola Tesla', 'Albert Einstein', 'Stephen Hawking', 'Marie Curie', 'Galileo'] },
        { q: '¿Cuál es el órgano más grande del cuerpo humano?', a: 'Piel', opciones: ['Hígado', 'Corazón', 'Piel', 'Pulmones', 'Cerebro', 'Intestino'] },
        { q: '¿Qué estudia la Botánica?', a: 'Plantas', opciones: ['Animales', 'Plantas', 'Rocas', 'Estrellas', 'Insectos', 'Hongos'] },
        { q: '¿Cuál es el símbolo químico del Oro?', a: 'Au', opciones: ['Ag', 'Au', 'Fe', 'Pb', 'Or', 'Pt'] },
        { q: '¿Cuál es el planeta más cercano al Sol?', a: 'Mercurio', opciones: ['Venus', 'Tierra', 'Mercurio', 'Marte', 'Ceres', 'Plutón'] },
        { q: '¿Qué parte del ojo detecta el color?', a: 'Conos', opciones: ['Córnea', 'Conos', 'Bastones', 'Iris', 'Pupila', 'Cristalino'] },
        { q: '¿Qué vitamina obtenemos principalmente del Sol?', a: 'Vitamina D', opciones: ['Vitamina A', 'Vitamina C', 'Vitamina D', 'Vitamina B12', 'Vitamina K', 'Vitamina E'] },
        { q: '¿Cuál es la unidad básica de la vida?', a: 'Célula', opciones: ['Átomo', 'Célula', 'Molécula', 'Tejido', 'ADN', 'Bacteria'] },
        { q: '¿Cuál es el animal más grande que ha existido?', a: 'Ballena Azul', opciones: ['Megalodón', 'Dinosaurio Rex', 'Ballena Azul', 'Mamut', 'Elefante', 'Diplodocus'] },
        { q: '¿Qué inventó Alexander Fleming?', a: 'Penicilina', opciones: ['Bombilla', 'Teléfono', 'Penicilina', 'Vacuna Rabia', 'Radio', 'Motor'] },
        { q: '¿Cómo se llama la fuerza que nos mantiene en el suelo?', a: 'Gravedad', opciones: ['Magnetismo', 'Fricción', 'Gravedad', 'Inercia', 'Presión', 'Empuje'] },
        { q: '¿Cuál es el satélite natural de la Tierra?', a: 'Luna', opciones: ['Luna', 'Titán', 'Europa', 'Ganimedes', 'Ío', 'Fobos'] },
        { q: '¿Cuál es el único mamífero capaz de volar?', a: 'Murciélago', opciones: ['Ardilla voladora', 'Murciélago', 'Pájaro', 'Avestruz', 'Pingüino', 'Delfín'] }
    ],
    'historia': [
        { q: '¿En qué año terminó la Segunda Guerra Mundial?', a: '1945', opciones: ['1940', '1945', '1950', '1939', '1948', '1944'] },
        { q: '¿Quién fue el primer hombre en pisar la Luna?', a: 'Neil Armstrong', opciones: ['Buzz Aldrin', 'Neil Armstrong', 'Yuri Gagarin', 'Elon Musk', 'Michael Collins', 'John Glenn'] },
        { q: '¿Qué civilización construyó las pirámides de Giza?', a: 'Egipcia', opciones: ['Maya', 'Azteca', 'Egipcia', 'Griega', 'Romana', 'Inca'] },
        { q: '¿En qué año se descubrió América?', a: '1492', opciones: ['1492', '1500', '1485', '1510', '1498', '1470'] },
        { q: '¿Quién fue el primer presidente de EE.UU.?', a: 'George Washington', opciones: ['Lincoln', 'George Washington', 'Jefferson', 'Roosevelt', 'Kennedy', 'Adams'] },
        { q: '¿En qué país nació Adolf Hitler?', a: 'Austria', opciones: ['Alemania', 'Austria', 'Polonia', 'Hungría', 'Suiza', 'Bélgica'] },
        { q: '¿Qué famosa reina gobernó Egipto?', a: 'Cleopatra', opciones: ['Nefertiti', 'Cleopatra', 'Isabel I', 'Victoria', 'Catalina', 'Hatshepsut'] },
        { q: '¿Quién fue el líder de la Revolución Rusa?', a: 'Lenin', opciones: ['Stalin', 'Lenin', 'Trotsky', 'Putin', 'Marx', 'Zar Nicolás'] },
        { q: '¿Qué muro dividió una ciudad alemana hasta 1989?', a: 'Muro de Berlín', opciones: ['Muro de Berlín', 'Muro de China', 'Muro de Adriano', 'Muro de Versalles', 'Muro del Oeste', 'Muro de Frankfurt'] },
        { q: '¿En qué país ocurrió la Revolución Industrial?', a: 'Reino Unido', opciones: ['EE.UU.', 'Francia', 'Alemania', 'Reino Unido', 'Italia', 'Japón'] },
        { q: '¿Quién fue conocido como "El Libertador" en América?', a: 'Simón Bolívar', opciones: ['San Martín', 'Simón Bolívar', 'Miguel Hidalgo', 'Artigas', 'Sucre', 'O\'Higgins'] },
        { q: '¿Qué imperio conquistó gran parte de Europa e Italia?', a: 'Imperio Romano', opciones: ['Imperio Mongol', 'Imperio Romano', 'Imperio Otomano', 'Imperio Británico', 'Imperio Galo', 'Imperio Griego'] },
        { q: '¿En qué ciudad mataron a Julio César?', a: 'Roma', opciones: ['Atenas', 'Roma', 'Cartago', 'Constantinopla', 'Pompeya', 'Alejandría'] },
        { q: '¿Quién fue la primera mujer en ganar un Premio Nobel?', a: 'Marie Curie', opciones: ['Teresa de Calcuta', 'Marie Curie', 'Rosalind Franklin', 'Ada Lovelace', 'Frida Kahlo', 'Amelia Earhart'] },
        { q: '¿Qué barco se hundió en 1912 tras chocar con un iceberg?', a: 'Titanic', opciones: ['Britannic', 'Olympic', 'Titanic', 'Lusitania', 'Santa María', 'Victory'] },
        { q: '¿Cuál era la antigua capital del Imperio Inca?', a: 'Cusco', opciones: ['Lima', 'Quito', 'Cusco', 'Machu Picchu', 'Bogotá', 'La Paz'] },
        { q: '¿Quién escribió el "Diario" más famoso de la 2da Guerra?', a: 'Ana Frank', opciones: ['Ana Frank', 'Rosa Parks', 'Isabel II', 'Eva Perón', 'Virginia Woolf', 'Marie Curie'] },
        { q: '¿Qué guerra duró desde 1914 hasta 1918?', a: 'Primera Guerra Mundial', opciones: ['Guerra de los 100 años', 'Guerra Civil', 'Primera Guerra Mundial', 'Segunda Guerra Mundial', 'Guerra Fría', 'Guerra de Vietnam'] },
        { q: '¿Quién liberó a los esclavos en EE.UU.?', a: 'Abraham Lincoln', opciones: ['George Washington', 'Abraham Lincoln', 'Martin Luther King', 'Obama', 'Jefferson', 'Grant'] },
        { q: '¿Qué civilización usaba jeroglíficos?', a: 'Egipcia', opciones: ['China', 'Egipcia', 'Romana', 'Vikinga', 'Fenicia', 'Gallega'] }
    ]
};

const salasActivas = new Map();

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender]
    if (!user.premium) return m.reply(`> 💎 *ACCESO PREMIUM*\n\n> Mis trivias son solo para mentes Élite, corazón.`)
    if (salasActivas.has(m.sender)) return m.reply('> ⏳ Ya tienes una pregunta pendiente.')

    let category = text?.toLowerCase().trim()
    let validCategories = Object.keys(triviaData)
    let s = premiumStyles[user.prefStyle] || premiumStyles["luxury"]

    if (!category || !validCategories.includes(category)) {
        let help = s ? `${s.top}\n\n` : ''
        help += `📚 *TRIVIA ELITE*\n\n`
        help += `> Elige tu categoría, cielo:\n\n`
        validCategories.forEach(cat => help += `• ${cat.toUpperCase()}\n`)
        help += `\n💡 *Uso:* \`${usedPrefix + command} historia\``
        if (s) help += `\n\n${s.footer}`
        return conn.sendMessage(m.chat, { text: help, mentions: [m.sender] }, { quoted: m })
    }

    let questions = triviaData[category]
    let q = questions[Math.floor(Math.random() * questions.length)]
    let options = [...q.opciones].sort(() => Math.random() - 0.5)
    let correctIndex = options.findIndex(op => op.toLowerCase() === q.a.toLowerCase()) + 1

    let caption = s ? `${s.top}\n\n` : ''
    caption += `📝 *TRIVIA: ${category.toUpperCase()}*\n`
    caption += `❓ *${q.q}*\n\n`
    options.forEach((op, i) => {
        caption += `${i + 1}- ${toBoldMono(op)}\n`
    })
    caption += `\n> 🛡️ Tienes *2 intentos*.\n`
    caption += `> ⏰ *45s* | Responde solo el número.`
    if (s) caption += `\n\n${s.footer}`

    let { key } = await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] }, { quoted: m })

    salasActivas.set(m.sender, {
        key,
        style: s,
        correct: correctIndex,
        ans: q.a,
        intentos: 2,
        chat: m.chat,
        timeout: setTimeout(() => {
            if (salasActivas.has(m.sender)) {
                let expLost = Math.floor(Math.random() * 100) + 100
                user.exp = Math.max(0, (user.exp || 0) - expLost)
                conn.sendMessage(m.chat, { text: `> ⏰ *TIEMPO AGOTADO*\n\n> @${m.sender.split('@')[0]}, fuiste muy lento. La respuesta era: *${q.a}*. Te quité **${expLost}** de EXP por hacerme esperar.`, mentions: [m.sender] }, { quoted: key })
                salasActivas.delete(m.sender)
            }
        }, 45000)
    })
}

handler.before = async (m, { conn }) => {
    let game = salasActivas.get(m.sender)
    if (!game || m.isBaileys || m.chat !== game.chat) return 
    if (!/^[1-6]$/.test(m.text.trim())) return 

    let input = parseInt(m.text.trim())
    let user = global.db.data.users[m.sender]
    let s = game.style

    if (input === game.correct) {
        // Recompensas variables
        let ganK = Math.floor(Math.random() * 10) + 10
        let ganC = Math.floor(Math.random() * 400) + 300
        let ganE = Math.floor(Math.random() * 200) + 200
        let ganD = 1

        user.kryons += ganK; user.coin += ganC; user.diamond += ganD; user.exp += ganE

        clearTimeout(game.timeout)
        salasActivas.delete(m.sender)
        await m.react('✅')

        let win = s ? `${s.top}\n\n` : ''
        win += `🎉 *¡CORRECTO! @${m.sender.split('@')[0]}*\n\n`
        win += `> Sabía que eras inteligente... me has ganado **${ganC}** coins y **${ganE}** de exp. ¡Sigue así! ✨\n\n`
        win += `🎁 *BOTÍN:* \n`
        win += `> ⚡ +${ganK} Kryons | 💎 +1 Diamante\n`
        win += `> 🪙 +${ganC} Coins | ✨ +${ganE} EXP`
        if (s) win += `\n\n${s.footer}`

        await conn.sendMessage(m.chat, { text: win, mentions: [m.sender] }, { quoted: m })
    } else {
        game.intentos--
        if (game.intentos <= 0) {
            let expLost = Math.floor(Math.random() * 150) + 150
            user.exp = Math.max(0, (user.exp || 0) - expLost)

            clearTimeout(game.timeout)
            salasActivas.delete(m.sender)
            await m.react('💀')

            let fail = s ? `${s.top}\n\n` : ''
            fail += `💀 *¡AJAJAJ PERDISTE!*\n\n`
            fail += `> @${m.sender.split('@')[0]}, me decepcionaste. La respuesta era: *${game.ans}*.\n`
            fail += `> Por fallar tanto te he robado **${expLost}** de tu exp. 💋`
            if (s) fail += `\n\n${s.footer}`
            await conn.sendMessage(m.chat, { text: fail, mentions: [m.sender] }, { quoted: m })
        } else {
            await m.react('⚠️')
            conn.reply(m.chat, `> ❌ *ERROR*\n\n> Te queda *1 última oportunidad*, piénsalo bien @${m.sender.split('@')[0]}... no querrás que te robe experiencia.`, m, { mentions: [m.sender] })
        }
    }
    return true
}

handler.help = ['trivia']
handler.tags = ['premium']
handler.command = /^(trivia|ptrivia)$/i
handler.group = true

export default handler