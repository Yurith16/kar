/**
 * ========================================================
 * 🖼️ KARBOT HD IMAGE UPSCALER (ILOVEIMG EDITION)
 * ========================================================
 */

const got = require('got');
const { randomUUID } = require('crypto');
const { checkReg } = require('../lib/checkReg.js');

// ==================== CONFIGURACIÓN ====================
const PUBLIC_JWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJhdWQiOiIiLCJpYXQiOjE1MjMzNjQ4MjQsIm5iZiI6MTUyMzM2NDgyNCwianRpIjoicHJvamVjdF9wdWJsaWNfYzkwNWRkMWMwMWU5ZmQ3NzY5ODNjYTQwZDBhOWQyZjNfT1Vzd2EwODA0MGI4ZDJjN2NhM2NjZGE2MGQ2MTBhMmRkY2U3NyJ9.qvHSXgCJgqpC4gd6-paUlDLFmg0o2DsOvb1EUYPYx_E';
const TOOL = 'upscaleimage';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36';
const HEADERS = {
    'accept': 'application/json',
    'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'user-agent': UA,
    'referer': 'https://www.iloveimg.com/',
    'origin': 'https://www.iloveimg.com',
};

const activeProcesses = new Map();

// ==================== FUNCIONES AUXILIARES ====================

function multipart(fields, fileField = null) {
    const boundary = '----WebKitFormBoundary' + randomUUID().replace(/-/g, '').slice(0, 16);
    const parts = [];
    for (const [name, val] of Object.entries(fields)) {
        parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${val}\r\n`));
    }
    if (fileField) {
        parts.push(Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="${fileField.name}"; filename="${fileField.filename}"\r\nContent-Type: ${fileField.mime}\r\n\r\n`
        ));
        parts.push(fileField.buffer);
        parts.push(Buffer.from('\r\n'));
    }
    parts.push(Buffer.from(`--${boundary}--\r\n`));
    return { body: Buffer.concat(parts), contentType: `multipart/form-data; boundary=${boundary}` };
}

async function startTask() {
    const resp = await got({
        url: `https://api.iloveimg.com/v1/start/${TOOL}`,
        method: 'GET',
        headers: { ...HEADERS, 'authorization': `Bearer ${PUBLIC_JWT}` },
        timeout: { request: 30000 },
        throwHttpErrors: false,
    });
    if (resp.statusCode !== 200) throw new Error(`Error al iniciar tarea (${resp.statusCode})`);
    const data = JSON.parse(resp.body);
    return { server: data.server, task: data.task };
}

async function uploadImage(server, task, imageBuffer, filename, mime) {
    const { body, contentType } = multipart({ task }, { name: 'file', filename, mime, buffer: imageBuffer });
    const resp = await got({
        url: `https://${server}/v1/upload`,
        method: 'POST',
        headers: { ...HEADERS, 'authorization': `Bearer ${PUBLIC_JWT}`, 'content-type': contentType },
        body,
        timeout: { request: 120000 },
        throwHttpErrors: false,
    });
    if (resp.statusCode !== 200) throw new Error(`Error al subir imagen (${resp.statusCode})`);
    return JSON.parse(resp.body);
}

async function upscaleStep(server, task, serverFilename, scale = '2') {
    const { body, contentType } = multipart({ 'task': task, 'server_filename': serverFilename, 'scale': scale });
    const resp = await got({
        url: `https://${server}/v1/upscale`,
        method: 'POST',
        headers: { ...HEADERS, 'Authorization': `Bearer ${PUBLIC_JWT}`, 'Content-Type': contentType },
        body,
        responseType: 'buffer',
        timeout: { request: 120000 },
        throwHttpErrors: false,
    });
    if (resp.statusCode !== 200) throw new Error(`Error en escalado (${resp.statusCode})`);
    return resp.body;
}

async function processImage(server, task, serverFilename, filename, multiplier = '2') {
    const { body, contentType } = multipart({
        'packaged_filename': 'iloveimg-upscaled',
        'task': task,
        'tool': TOOL,
        'files[0][server_filename]': serverFilename,
        'files[0][filename]': filename,
        'multiplier': multiplier,
    });
    const resp = await got({
        url: `https://${server}/v1/process`,
        method: 'POST',
        headers: { ...HEADERS, 'Authorization': `Bearer ${PUBLIC_JWT}`, 'Content-Type': contentType },
        body,
        timeout: { request: 120000 },
        throwHttpErrors: false,
    });
    if (resp.statusCode !== 200) throw new Error(`Error en procesamiento (${resp.statusCode})`);
    return JSON.parse(resp.body);
}

async function downloadResult(server, task) {
    const resp = await got({
        url: `https://${server}/v1/download/${task}`,
        method: 'GET',
        headers: { 'user-agent': UA, 'referer': 'https://www.iloveimg.com/' },
        responseType: 'buffer',
        timeout: { request: 120000 },
        throwHttpErrors: false,
    });
    if (resp.statusCode !== 200) throw new Error(`Error al descargar resultado (${resp.statusCode})`);
    return resp.body;
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];
    if (await checkReg(m, user)) return;

    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted.msg || quoted).mimetype || '';
    const h = ["🍃", "🌿", "🍀", "🌱", "☘️"].getRandom();

    if (!/image\/(png|jpe?g|webp)/.test(mime) && !args[0]) {
        await m.react('🤔');
        let info = `> ${h} *「 𝙷𝙳 𝚄𝙿𝚂𝙲𝙰𝙻𝙴𝚁 」* ${h}\n\n`
        info += `> ⚠️ *Necesito una imagen para brillar.*\n\n`
        info += `> 📝 *Uso:* Responde a una foto con:\n`
        info += `> *${usedPrefix + command} [2|4]*\n\n`
        info += `> 📌 *Factores:* x2 o x4 de resolución.`
        return m.reply(info);
    }

    if (activeProcesses.has(userId)) {
        await m.react('⏳');
        return m.reply(`> ⏳ *No te desesperes, vida mía.* Ya estoy procesando una imagen para ti.`);
    }

    activeProcesses.set(userId, true);

    try {
        await m.react('🔍');
        let scale = (args[0] === '4' || args[0] === '4x') ? '4' : '2';

        let imageBuffer = await quoted.download();
        let filename = mime.includes('png') ? 'imagen.png' : mime.includes('webp') ? 'imagen.webp' : 'imagen.jpg';

        let progressMsg = await conn.sendMessage(m.chat, { text: `> 🚀 *Iniciando proceso HD x${scale}...*` });

        const editMsg = async (text) => await conn.sendMessage(m.chat, { text, edit: progressMsg.key });

        await editMsg(`> 📤 *Subiendo imagen a los servidores...*`);
        const { server, task } = await startTask();
        const upload = await uploadImage(server, task, imageBuffer, filename, mime);
        const serverFilename = upload.server_filename;

        await editMsg(`> 🔍 *Escalando cada detalle...*`);
        await upscaleStep(server, task, serverFilename, scale);

        await editMsg(`> ⚙️ *Puliendo los pixeles, tesoro...*`);
        await processImage(server, task, serverFilename, filename, scale);

        await editMsg(`> 📥 *Descargando tu obra de arte...*`);
        const resultBuffer = await downloadResult(server, task);

        const originalSize = (imageBuffer.length / 1024).toFixed(1);
        const hdSize = (resultBuffer.length / 1024).toFixed(1);

        let cap = `> ${h} *「 𝙷𝙳 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙰𝙳𝙾 」* ${h}\n\n`
        cap += `> ✅ *¡Tu imagen ha evolucionado!*\n\n`
        cap += `> 📊 *Detalles:*\n`
        cap += `> • Escala: » x${scale}\n`
        cap += `> • Antes: » ${originalSize} KB\n`
        cap += `> • Ahora: » ${hdSize} KB\n\n`
        cap += `> 🔥 _Luce increíble, como tú._`

        let messageOptions = { image: resultBuffer, caption: cap };
        if (global.rcanal?.contextInfo) messageOptions.contextInfo = global.rcanal.contextInfo;

        await conn.sendMessage(m.chat, messageOptions, { quoted: m });
        await editMsg(`> ✅ *Proceso finalizado con éxito.*`);
        await m.react('✨');

    } catch (error) {
        console.error('[HD Error]:', error);
        await m.react('❌');
        m.reply(`> 🌪️ *Hubo un drama técnico:* ${error.message}`);
    } finally {
        activeProcesses.delete(userId);
    }
};

handler.help = ['hd [2|4]'];
handler.tags = ['tools'];
handler.command = ['hd'];
handler.register = true;

module.exports = handler;