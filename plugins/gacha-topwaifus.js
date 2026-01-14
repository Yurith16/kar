import { promises as fs } from 'fs'

const charactersFilePath = './src/database/characters[1].json'

async function loadCharacters() {
    try {
        const data = await fs.readFile(charactersFilePath, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        throw new Error('> ⓘ \`No se pudo cargar el archivo characters.json\`')
    }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        const characters = await loadCharacters()
        const page = parseInt(args[0]) || 1
        const itemsPerPage = 10
        const sortedCharacters = characters.sort((a, b) => Number(b.value) - Number(a.value))

        const totalCharacters = sortedCharacters.length
        const totalPages = Math.ceil(totalCharacters / itemsPerPage)
        const startIndex = (page - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage

        if (page < 1 || page > totalPages) {
            return await conn.reply(m.chat, 
                `> ⓘ \`Página no válida\`\n> ⓘ \`Páginas disponibles:\` *1 - ${totalPages}*`,
                m
            )
        }

        const charactersToShow = sortedCharacters.slice(startIndex, endIndex)

        let message = `> ⓘ \`Top Personajes por Valor\`\n> ⓘ \`Página:\` *${page}/${totalPages}*\n\n`

        charactersToShow.forEach((character, index) => {
            const position = startIndex + index + 1
            const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '🎴'
            message += `${medal} *#${position}* - ${character.name}\n`
            message += `   💎 ${character.value}\n`
            message += `   🎬 ${character.source}\n\n`
        })

        if (page < totalPages) {
            message += `> ⓘ \`Usa:\` *${usedPrefix}${command} ${page + 1} para ver más*`
        }

        await conn.reply(m.chat, message, m)
    } catch (error) {
        await conn.reply(m.chat, `> ⓘ \`Error:\` *${error.message}*`, m)
    }
}

handler.help = ['topwaifus']
handler.tags = ['gacha']
handler.command = ['topwaifus']
handler.group = true
export default handler