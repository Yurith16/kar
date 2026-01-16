const palabras = [
    "ABDUCCION", "ABOGADO", "ABSOLUTO", "ABSTRACTIVO", "ACTOR",
    "ACTRIZ", "ACTUAL", "ACUSTICA", "ADN", "AEREO",
    "AERODINAMICA", "AERONAUTICA", "AFECTIVO", "AGUILA", "AHORRO",
    "ALEGRIA", "ALGEBRA", "ALGORITMO", "ALITERACION", "ALTERNATIVO",
    "AMARILLO", "AMAZONAS", "AMBIENTAL", "AMISTAD", "AMOR",
    "ANAGRAMA", "ANTARTIDA", "ANTROPOCENTRISMO", "ANTROPOLOGIA", "ANTROPOLOGO",
    "APARATO", "ARBOL", "ARCAISMO", "ARQUEOLOGIA", "ARQUEOLOGICO",
    "ARQUEOLOGO", "ARQUEOMETRIA", "ARQUITECTONICO", "ARQUITECTO", "ARRECIFE",
    "ARRREGLISTA", "ARTICULO", "ARTIFICIAL", "ARTISTICO", "ASAMBLEA",
    "ASOCIACION", "ASSONANCIA", "ASTROBIOLOGIA", "ASTROFISICO", "ASTRONAUTA",
    "ASTRONOMIA", "ASTRONOMO", "ASTROMETRIA", "AURORA", "AUTOMOVIL",
    "AUTOR", "AVION", "AXIOMA", "AZUL", "BAILE",
    "BALANCE", "BANCA", "BANDA", "BARCO", "BASQUETBOL",
    "BIBLIOTECA", "BICICLETA", "BIENES", "BIOCENTRISMO", "BIOLOGIA",
    "BIOLOGICO", "BIOTECNOLOGIA", "BIOQUIMICA", "BOLSA", "BOREAL",
    "BOSQUE", "BOTANICA", "BRYOLOGIA", "CACOFONIA", "CALCULO",
    "CALIDAD", "CALEIDOCICLO", "CALEIDOSCOPIO", "CAMAROGRAFO", "CAMISA",
    "CANTIDAD", "CANTANTE", "CAPACIDAD", "CARTOGRAFIA", "CELULA",
    "CENSO", "CENTRIFUGACION", "CHAQUETA", "CHEF", "CICLISMO",
    "CICLOPE", "CIENTIFICO", "CILINDRICO", "CINEMATICA", "CINETOSCOPIO",
    "CIRCULAR", "CIRCUNFERENCIA", "CIRCUNLOQUIO", "CIRCUNNAVEGACION", "CIVILIZACION",
    "CLIENTE", "COCIENTE", "COCINA", "COGNITIVISMO", "COGNITIVO",
    "COLOR", "COLOQUIO", "COMERCIO", "COMUNICACION", "COMUNIDAD",
    "CONCIERTO", "CONCLAVE", "CONCRETO", "CONDUCTISMO", "CONGRESO",
    "CONICO", "CONJUNTO", "CONSCIENTE", "CONSERVADOR", "CONSTANTE",
    "CONSTITUCIONALIDAD", "CONSUMIDOR", "CONTEMPORANEO", "CONTRADICCION", "CONVENCIONAL",
    "CONVENCION", "CORO", "COROLARIO", "CORPORACION", "CORRELACION",
    "COSMICO", "COSMOGONIA", "COSMOLOGIA", "CREADOR", "CREATIVO",
    "CREDITO", "CRIPTOZOOLOGIA", "CRISTALOGRAFIA", "CROMATOGRAFIA", "CROMOSOMA",
    "CUADRADO", "CUADRATICO", "CUBICO", "CUBICO", "CUESTIONARIO",
    "CULTURA", "DECAGONO", "DEDUCCION", "DELFIN", "DEMANDA",
    "DEMOSTRACION", "DENSIOMETRIA", "DEPORTE", "DESIERTO", "DESVIACION",
    "DIACRONIA", "DIAGONAL", "DICCIONARIO", "DIMENSION", "DIAGNOSTICO",
    "DIRECTOR", "DISCOTECA", "DISPOSITIVO", "DISEÑADOR", "DISTRIBUIDOR",
    "DOCTOR", "DODECAGONO", "DONACION", "DRONES", "ECLIPSE",
    "ECLIPTICA", "ECOCENTRISMO", "ECOLOGICO", "ECONOMIA", "ECOSISTEMA",
    "ECUACION", "EDUCACION", "EDITOR", "EFICIENCIA", "EFICACIA",
    "EFIMERO", "EGOCENTRISMO", "EJERCICIO", "ELECTROCARDIOGRAMA", "ELECTROFORESIS",
    "ELECTROMAGNETISMO", "ELEFANTE", "ELIPSE", "ELLIPSE", "EMOCIONAL",
    "EMPIRICO", "EMPLEO", "EMPRESA", "ENCUESTA", "ENCRIPTACION",
    "ENEAGONO", "ENFERMEDAD", "ENTOMOLOGIA", "ENTREVISTA", "EQUIPO",
    "ESCULTORICO", "ESCULTURA", "ESCATOLOGICO", "ESFERICO", "ESOTERICO",
    "ESOTERISMO", "ESPACIAL", "ESPAÑA", "ESPECIAL", "ESPECTROMETRIA",
    "ESPECTROSCOPIA", "ESPERANZA", "ESPIRAL", "ESTABILIDAD", "ESTADISTICA",
    "ESTADO", "ESTALACTITA", "ESTALAGMITA", "ESTELAR", "ESTRATIGRAFIA",
    "ESTRELLA", "ESTROBOSCOPIO", "ETERNIDAD", "ETIMOLOGIA", "ETNOCENTRISMO",
    "EUFONIA", "EVOLUCION", "EVOLUTIVO", "EXOBIOLOGIA", "EXPERIMENTO",
    "EXPONENCIAL", "FABRICANTE", "FAMILIA", "FANTASIA", "FARMACOLOGIA",
    "FELICIDAD", "FENOMENOLOGIA", "FICOLOGIA", "FIGURATIVO", "FILMOTECA",
    "FILOGENETICA", "FILOLOGIA", "FILOSOFIA", "FILOSOFICO", "FINANZAS",
    "FISICO", "FITONIMICO", "FONEMA", "FONETICA", "FONOLOGIA",
    "FOLIOSCOPIO", "FORMULA", "FOTOGRAFIA", "FOTOGRAFO", "FOTOMETRIA",
    "FOTOSINTESIS", "FRACTAL", "FUNCION", "FUNDACION", "FUTBOL",
    "FUTURO", "GALAXIA", "GANANCIA", "GEOCENTRISMO", "GEODESIA",
    "GEOGRAFIA", "GEOLOGIA", "GEOLOGICO", "GEOLOGO", "GEOMETRIA",
    "GEOPOLITICA", "GENETICA", "GIRASOL", "GLOBAL", "GLOSARIO",
    "GNOSTICISMO", "GRAMATICA", "GRUPO", "GUERRA", "GUIA",
    "GUIONISTA", "HELICE", "HELIOCENTRISMO", "HEMEROTECA", "HEPTAGONO",
    "HERALDICA", "HERENCIA", "HERMETISMO", "HERPETOLOGIA", "HEXAGONO",
    "HIDRAULICA", "HIDRODINAMICA", "HIDROLOGIA", "HIMALAYA", "HIPERBATON",
    "HIPOTECA", "HISTORICO", "HORIZONTAL", "HOSPITAL", "ICOSAGONO",
    "ICTIOLOGIA", "IDIOMA", "IMAGINATIVO", "IMPERIO", "IMPRESIONISTA",
    "IMPRESOR", "INCONSCIENTE", "INCONMESURABLE", "INDICE", "INDUCCION",
    "INDUSTRIA", "INFERENCIA", "INFINITO", "INFLACION", "INGENIERIA",
    "INGENIERO", "INGREDIENTES", "INMEDIATO", "INMUNOLOGIA", "INNOVADOR",
    "INSTRUMENTO", "INSTRUCTIVO", "INTELECTUAL", "INTELIGENCIA", "INTERFAZ",
    "INTERES", "INTERESTELAR", "INTERPLANETARIO", "INTERNET", "INTERPRETE",
    "INTERVENCION", "INVENCION", "INVERSION", "INVESTIGACION", "INVESTIGADOR",
    "JARDIN", "JUBILACION", "JUSTICIA", "KALEIDOSCOPIO", "LABORATORIO",
    "LEMA", "LEON", "LEXEMA", "LEXICOGRAFIA", "LEXICOLOGIA",
    "LEXICO", "LIBERTAD", "LINEAL", "LITERARIO", "LITERATURA",
    "LLUVIA", "LOCAL", "LOGARITMICO", "LOGOCENTRISMO", "MACROECONOMIA",
    "MAESTRO", "MAGNETISMO", "MAMALOGIA", "MANUAL", "MAQUINA",
    "MATEMATICO", "MECANICA", "MECANISMO", "MEDIA", "MEDIANA",
    "MEDICINA", "MELANCOLIA", "MELODIA", "MENSAJE", "MERCADO",
    "METAFISICA", "METAFORA", "METODOLOGIA", "METRICA", "MEXICO",
    "MICROECONOMIA", "MICROLOGIA", "MICROSCOPIA", "MICROSCOPIO", "MIEDO",
    "MINERALOGIA", "MITOCONDRIA", "MODA", "MODERNO", "MONOGRAFIA",
    "MONTAÑA", "MORFEMA", "MORFOLOGIA", "MUESTRA", "MUNDIAL",
    "MUSICA", "MUSICAL", "NANOTECNOLOGIA", "NATACION", "NATURALISTA",
    "NEGOCIO", "NEOLOGISMO", "NEUROCIENCIA", "NIEVE", "NOCION",
    "NUCLEO", "NUMERO", "NUMISMATICA", "NUTRICION", "OBLICUO",
    "OBSERVACION", "OCEANO", "OCTOGONO", "OFERTA", "ONIRICO",
    "ONOMASTICO", "ONOMATOPEYA", "ONTOLOGIA", "OPTICA", "ORGANIZACION",
    "ORIGINAL", "ORNITOLOGIA", "ORQUESTA", "OXIGENO", "PACIENTE",
    "PAIS", "PAISAJISTICO", "PALEOCLIMATOLOGIA", "PALEONTOLOGIA", "PALEONTOLOGICO",
    "PALEONTOLOGO", "PALINDROMO", "PARABOLA", "PARADOJA", "PARADIGMATICO",
    "PARAGOGE", "PARALELO", "PARALELOGRAMO", "PARAPSICOLOGIA", "PARIS",
    "PARTICULAR", "PASADO", "PASIVOS", "PATRIMONIO", "PAZ",
    "PELICULA", "PENSION", "PENTAGONO", "PERCEPCION", "PERDIDA",
    "PERPENDICULAR", "PERPLEXIDAD", "PETROLOGIA", "PICTORICO", "PINACOTECA",
    "PINTURA", "PIRAMIDAL", "PLANETA", "PLANETARIO", "PLATAFORMA",
    "PLENARIO", "POBLACION", "POLICIA", "POLIEDRO", "POLIGONO",
    "POLINOMIO", "POSESION", "POSTULADO", "PRACTICO", "PRAGMATICA",
    "PREVENCION", "PRESTAMO", "PRIMORDIAL", "PRISMATICO", "PROBABILIDAD",
    "PROCEDIMIENTO", "PRODUCTIVIDAD", "PRODUCTOR", "PROGRESIVO", "PROGRAMACION",
    "PROPORCION", "PROPOSICION", "PROSODIA", "PROTOCOLO", "PROVEEDOR",
    "PROXIMO", "PSICOANALISIS", "PSICOLOGIA", "PUBLICACION", "PUBLICADOR",
    "PTERIDOLOGIA", "QUANTUM", "QUIMERA", "QUIMERICO", "QUIMICA",
    "QUIMICO", "RACIONAL", "RADIESTESIA", "RADIOCARBONO", "RADIOMETRIA",
    "RADIOSCOPIA", "RAZON", "REALIDAD", "REALISTA", "RECETA",
    "REDES", "REGIONAL", "REGRESION", "RELACION", "RELATIVIDAD",
    "RELATIVO", "REMOTO", "RENOVABLE", "RENTABILIDAD", "RESPETO",
    "RESPIRACION", "RESULTADO", "RESTAURANTE", "REVOLUCION", "REVOLUCIONARIO",
    "RIMA", "RITMO", "ROBOTICA", "ROJO", "ROMBO",
    "ROSA", "SEDIMENTOLOGIA", "SEGURO", "SEMANTICA", "SEMIOTICA",
    "SENOIDAL", "SENSITIVO", "SERENDIPIA", "SERVIDOR", "SILOGISMO",
    "SIMPOSIO", "SINCRONIA", "SINTAXIS", "SISMOLOGIA", "SOCIEDAD",
    "SOCIOLOGIA", "SOL", "SOLIDARIDAD", "SOLIPSISMO", "SOLISTA",
    "SURREALISTA", "SUBCONSCIENTE", "SUBMARINO", "SUBTERRANEO", "SUSTENTABLE",
    "TASA", "TAUMATROPO", "TECTONICA", "TELESCOPIA", "TELEFONO",
    "TELESTICO", "TEOREMA", "TEORICO", "TERMODINAMICA", "TERRESTRE",
    "TESIS", "TIGRE", "TOKYO", "TOPOGRAFIA", "TORMENTA",
    "TOXICOLOGIA", "TRADICION", "TRADICIONAL", "TRAPECIO", "TRASCENDENCIA",
    "TRASCONTINENTAL", "TRATADO", "TRATAMIENTO", "TREM", "TRIANGULO",
    "TRISTEZA", "TROMPO", "TSUNAMI", "UFOLOGIA", "UNICO",
    "UNIVERSAL", "UNIVERSO", "URBANISTICO", "USUARIO", "UTILIDAD",
    "UTOPICO", "VACUNA", "VARIANZA", "VARIABLE", "VERTICAL",
    "VESTIDO", "VIA", "VIDEOJUEGO", "VIENTO", "VIRTUAL",
    "VOCABULARIO", "VOLCAN", "VOLCANOLOGIA", "VOLCANOLOGO", "VOLUMEN",
    "ZOETROPO", "ZONA", "ZOONIMICO", "ZAPATOS", "ZOOLOGIA"
];

const ordenaActivo = new Map();

let handler = async (m, { conn, usedPrefix, command }) => {
    if (ordenaActivo.has(m.sender)) return m.reply(`> ⚠️ Ya tienes un reto activo, corazón. ¡Termina ese primero!`)

    const palabraOriginal = palabras[Math.floor(Math.random() * palabras.length)]
    let palabraDesordenada = palabraOriginal.split('').sort(() => Math.random() - 0.5).join('')

    if (palabraDesordenada === palabraOriginal) {
        palabraDesordenada = palabraOriginal.split('').reverse().join('')
    }

    let palabraMostrar = palabraDesordenada.split('').join(' ')

    // Premios balanceados para no romper la economía
    let premios = {
        coin: 350, // Ajustado para ser realista
        kryons: 5,
        diamonds: 1,
        exp: 150
    }

    let caption = `> 🧩 *𝗢𝗥𝗗𝗘𝗡𝗔 𝗟𝗔 𝗣𝗔𝗟𝗔𝗕𝗥𝗔*\n\n`
    caption += "```\n" + palabraMostrar + "\n```\n\n"
    caption += `> 👤 *Jugador:* @${m.sender.split('@')[0]}\n`
    caption += `> 🎯 *Intentos:* 3\n`
    caption += `> 💡 Escribe *"pista"* por 200 coins.\n\n`
    caption += `_¿Qué palabra crees que sea? Escríbela._`

    await m.react('🧩')

    ordenaActivo.set(m.sender, {
        solucion: palabraOriginal,
        premios: premios,
        intentos: 3,
        chat: m.chat,
        pistaUsada: false
    })

    return conn.reply(m.chat, caption, m, { mentions: [m.sender] })
}

handler.before = async (m, { conn }) => {
    let game = ordenaActivo.get(m.sender)

    if (!game || m.isBaileys || !m.text) return 
    if (m.chat !== game.chat) return

    // Evitar que detecte comandos como respuestas
    if (m.text.startsWith('.') || m.text.startsWith('/') || m.text.startsWith('#')) return

    let text = m.text.trim().toLowerCase()
    let user = global.db.data.users[m.sender]

    // --- SISTEMA DE PISTAS ---
    if (text === 'pista') {
        if (game.pistaUsada) return m.reply('> ⚠️ Ya te di una pista, ¡tú puedes solo!')
        if (user.coin < 200) return m.reply('> ❌ No tienes coins suficientes para la pista.')

        user.coin -= 200
        game.pistaUsada = true

        let primeraLetra = game.solucion.charAt(0)
        let longitud = game.solucion.length

        return m.reply(`> 💡 *Aquí tienes una ayuda:*\n> Empieza con: *${primeraLetra}*\n> Tiene *${longitud}* letras.`)
    }

    // --- VERIFICAR RESPUESTA ---
    let respuestaUser = m.text.trim().toUpperCase()

    if (respuestaUser === game.solucion) {
        user.coin = (user.coin || 0) + game.premios.coin
        user.kryons = (user.kryons || 0) + game.premios.kryons
        user.diamond = (user.diamond || 0) + game.premios.diamonds
        user.exp = (user.exp || 0) + game.premios.exp

        await m.react('✨')
        let win = `> ✅ *¡𝗟𝗢𝗚𝗥𝗔𝗗𝗢!*\n\n`
        win += `> La palabra era: *${game.solucion}*\n`
        win += `> 👤 @${m.sender.split('@')[0]}\n\n`
        win += `🏆 *Premio:* \n`
        win += `> 🪙 +${game.premios.coin} Coins\n`
        win += `> ⚡ +${game.premios.kryons} Kryons\n`
        win += `> 💎 +${game.premios.diamonds} Diams`

        ordenaActivo.delete(m.sender)
        return m.reply(win, null, { mentions: [m.sender] })
    } else {
        // Ignorar si el mensaje es muy largo (probablemente no es una respuesta)
        if (m.text.length > game.solucion.length + 3) return

        game.intentos -= 1

        if (game.intentos > 0) {
            await m.react('❌')
            return m.reply(`> ❌ *Incorrecto.*\n> Te quedan *${game.intentos}* intentos. ¡Piensa bien!`)
        } else {
            ordenaActivo.delete(m.sender)
            return m.reply(`> 💀 *¡Perdiste!*\n> La palabra era: *${game.solucion}*. No te rindas, intenta otra vez.`)
        }
    }
}

handler.help = ['ordenar']
handler.tags = ['game']
handler.command = /^(ordenar|word|palabra)$/i

export default handler