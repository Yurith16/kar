import fetch from 'node-fetch'
import util from 'util'
import axios from 'axios'
import cheerio from 'cheerio'

async function mediafire(url){
return new Promise(async(resolve, reject) => {
    try {
        const { data, status } = await axios.get(url)
        const $ = cheerio.load(data);

        let filename = $('.dl-info > div > div.filename').text();
        let filetype = $('.dl-info > div > div.filetype').text();
        let filesize = $('a#downloadButton').text().split("(")[1].split(")")[0];
        let uploadAt = $('ul.details > li:nth-child(2)').text().split(": ")[1];
        let link = $('#downloadButton').attr('href');
        let desc = $('div.description > p.description-subheading').text();

        if (typeof link === undefined) 
            return resolve({ status: false, msg: 'No se encontraron resultados.' })

        let result = {
            status: true,
            filename: filename,
            filetype: filetype,
            filesize: filesize,
            uploadAt: uploadAt,
            link: link,
            desc: desc
        }

        console.log(result)
        resolve(result)

    } catch (err) {
        console.error(err)
        resolve({ status: false, msg: 'No se encontraron resultados.' })
    }
})
}

let handler = async (m, { usedPrefix, command, conn, text }) => {

    let input = `[❗] *Formato incorrecto*

Ejemplo:
${usedPrefix + command} https://www.mediafire.com/file/pwxob70rpgma9lz/ejemplo.apk/file
*`

    if (!text) return m.reply(input)

    if (!(text.includes('http://') || text.includes('https://'))) 
        return m.reply(`❌ URL no válida. Asegúrate de incluir http:// o https://`)

    if (!text.includes('mediafire.com')) 
        throw '❌ El enlace no pertenece a MediaFire.'

    m.reply(wait)

    const baby1 = await mediafire(text)

    if (baby1.filesize.split('MB')[0] >= 100) 
        return m.reply('*⚠️ Archivo excede el límite permitido.*\n' + util.format(baby1))

    await conn.delay(500)

    const result = `*📥 MEDIAFIRE DOWNLOADER*

> 📄 *Nombre:* ${baby1.filename}
> ⚖️ *Tamaño:* ${baby1.filesize}
> 📨 *Tipo:* ${baby1.filetype}
> 🔗 *Enlace:* ${baby1.link}
> 📅 *Subido el:* ${baby1.uploadAt}
`

    conn.sendFile(
        m.chat, 
        baby1.link || emror, 
        `${baby1.filename}`, 
        result, 
        m, 
        null, 
        { mimetype: `${baby1.filetype}`, asDocument: true }
    )
}

handler.help = ['mediafire <link>']
handler.tags = ['downloader']
handler.command = ['detectar']

export default handler