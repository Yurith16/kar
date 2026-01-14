import { promises as fs } from 'fs'

const charactersFilePath = './src/database/characters[1].json'
const haremFilePath = './src/database/harem.json'

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        throw new Error('> ⓘ \`No se pudo cargar el archivo characters.json\`')
    }
}

async function saveCharacters(characters) {
    try {
        await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2))
    } catch (error) {
        throw new Error('> ⓘ \`No se pudo guardar el archivo characters.json\`')
    }
}

let cooldowns = new Map()
let characterVotes = new Map()

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        const userId = m.sender
        const cooldownTime = 1 * 60 * 60 * 1000

        if (cooldowns.has(userId)) {
            const expirationTime = cooldowns.get(userId) + cooldownTime
            const now = Date.now()
            if (now < expirationTime) {
                const timeLeft = expirationTime - now
                const minutes = Math.floor((timeLeft / 1000 / 60) % 60)
                const seconds = Math.floor((timeLeft / 1000) % 60)
                await conn.reply(m.chat, 
                    `> ⓘ \`Debes esperar:\` *${Math.floor(minutes)} minutos y ${seconds} segundos*`,
                    m
                )
                return
            }
        }

        const characters = await loadCharacters()
        const characterName = args.join(' ')

        if (!characterName) {
            return conn.reply(m.chat, `> ⓘ \`Uso:\` *${usedPrefix}${command} nombre del personaje*`, m)
        }

        const character = characters.find(c => c.name.toLowerCase() === characterName.toLowerCase())

        if (!character) {
            return conn.reply(m.chat, `> ⓘ \`No se encontró el personaje:\` *${characterName}*`, m)
        }

        const incrementValue = Math.floor(Math.random() * 10) + 1
        character.value = String(Number(character.value) + incrementValue)
        character.votes = (character.votes || 0) + 1
        await saveCharacters(characters)

        cooldowns.set(userId, Date.now())

        await conn.reply(m.chat, 
            `> ⓘ \`Has votado por:\` *${character.name}*\n> ⓘ \`Incremento:\` *+${incrementValue}*\n> ⓘ \`Valor nuevo:\` *${character.value}*`,
            m
        )
    } catch (error) {
        await conn.reply(m.chat, `> ⓘ \`Error:\` *${error.message}*`, m)
    }
}

handler.help = ['vote']
handler.tags = ['gacha']
handler.command = ['vote']
handler.group = true
export default handler