const yts = require("yt-search");
const axios = require("axios");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const fs = require("fs");
const path = require("path");
const {
    proto,
    generateWAMessageFromContent,
    prepareWAMessageMedia,
} = require("@whiskeysockets/baileys");
const { checkReg } = require("../lib/checkReg.js");
const descargas = require("./descargas-activas.js");

ffmpeg.setFfmpegPath(ffmpegPath);

// Configuración optimizada
const CONFIG = {
    maxFileSize: 50, // MB
    videoQuality: "360", // Altura en px (rápido y ligero)
    ffmpegPreset: "ultrafast", // Velocidad > calidad
    timeout: 120000, // 2 minutos
    tmpDir: path.join(process.cwd(), "tmp")
};

// Asegurar directorio tmp
if (!fs.existsSync(CONFIG.tmpDir)) {
    fs.mkdirSync(CONFIG.tmpDir, { recursive: true });
}

// API de descarga
const ytdlVideoScraper = async (videoUrl) => {
    const apiUrl = `https://api.princetechn.com/api/download/ytv?apikey=prince&url=${encodeURIComponent(videoUrl)}`;
    const { data } = await axios.get(apiUrl, { timeout: 10000 });
    if (!data?.success) throw new Error("API error");
    return data.result;
};

// Procesamiento rápido con FFmpeg (streaming)
const processVideo = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .videoCodec("libx264")
            .audioCodec("aac")
            .size(`?x${CONFIG.videoQuality}`)
            .outputOptions([
                "-preset", CONFIG.ffmpegPreset,
                "-crf", "28",
                "-movflags", "faststart",
                "-threads", "2"
            ])
            .on("end", () => resolve(true))
            .on("error", (err) => reject(err))
            .save(outputPath);
    });
};

// Limpiar archivos temporales
const cleanup = (files) => {
    files.forEach(f => {
        try {
            if (fs.existsSync(f)) fs.unlinkSync(f);
        } catch (e) {}
    });
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    // Verificar registro
    if (await checkReg(m, user)) return;

    // Verificar descarga activa
    if (descargas.tieneDescargasActivas(userId)) {
        return m.reply(`> ⏳ *Ya tienes una descarga activa, espera un momento.*`);
    }

    // Modo descarga directa (desde botón)
    if (text?.startsWith("http")) {
        const args = text.split(" ");
        const url = args[0];

        // Validar URL
        const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        if (!ytRegex.test(url)) {
            return m.reply(`> ❌ *URL no válida.*`);
        }

        const tempRaw = path.join(CONFIG.tmpDir, `raw_${userId}_${Date.now()}`);
        const tempFixed = path.join(CONFIG.tmpDir, `vid_${userId}_${Date.now()}.mp4`);
        const tempFiles = [tempRaw, tempFixed];

        try {
            descargas.registrarDescarga(userId, command);
            await m.react("📥");

            // Descarga en streaming (bajo consumo RAM)
            const result = await ytdlVideoScraper(url);
            const response = await axios({
                url: result.download_url,
                method: "GET",
                responseType: "stream",
                timeout: CONFIG.timeout
            });

            // Guardar a disco en lugar de buffer
            const writer = fs.createWriteStream(tempRaw);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            // Verificar tamaño antes de procesar
            const rawStats = fs.statSync(tempRaw);
            if (rawStats.size > 200 * 1024 * 1024) { // 200MB raw max
                throw new Error("Archivo demasiado grande");
            }

            await m.react("⚙️");

            // Procesamiento rápido
            await processVideo(tempRaw, tempFixed);

            await m.react("📦");

            const finalPath = fs.existsSync(tempFixed) ? tempFixed : tempRaw;
            const stats = fs.statSync(finalPath);
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            const title = (result.title || "video").substring(0, 50).replace(/[<>:"/\\|?*]/g, "");

            // Enviar como stream si es posible, si no como buffer
            const sendOptions = { quoted: m };

            if (sizeMB > CONFIG.maxFileSize) {
                await conn.sendMessage(m.chat, {
                    document: fs.createReadStream(finalPath),
                    mimetype: "video/mp4",
                    fileName: `${title}.mp4`,
                    caption: `> 📦 *${sizeMB} MB* (Documento por tamaño)`
                }, sendOptions);
            } else {
                await conn.sendMessage(m.chat, {
                    video: fs.createReadStream(finalPath),
                    caption: `> ✅ *¡Listo!*`,
                    mimetype: "video/mp4"
                }, sendOptions);
            }

            await m.react("✅");

        } catch (error) {
            console.error(`[VID ERROR] ${error.message}`);
            await m.react("❌");
            await m.reply(`> 🌪️ *Error:* ${error.message}`);
        } finally {
            descargas.finalizarDescarga(userId);
            cleanup(tempFiles);
        }

        return;
    }

    // Modo búsqueda (sin texto o texto normal)
    if (!text) {
        return m.reply(`> *¿Qué video buscas, cielo?*\n> Ejemplo: \`${usedPrefix + command} Bad Bunny\``);
    }

    try {
        descargas.registrarDescarga(userId, command);
        await m.react("🔍");

        const search = await yts(text);
        if (!search.videos.length) throw new Error("No encontrado");

        const video = search.videos[0];
        const { title, author, duration, views, ago, thumbnail, url } = video;

        // Preparar imagen
        const mediaMsg = await prepareWAMessageMedia(
            { image: { url: thumbnail } },
            { upload: conn.waUploadToServer }
        );

        const infoText =
            `> 🎬 *「🌱」 ${title}*\n\n` +
            `> 🍃 *Canal:* » ${author.name}\n` +
            `> ⚘ *Duración:* » ${duration.timestamp}\n` +
            `> 🌼 *Vistas:* » ${(views || 0).toLocaleString()}\n` +
            `> 🍀 *Publicado:* » ${ago || "Reciente"}\n` +
            `> 🌿 *Link:* » ${url}`;

        const interactiveMessage = proto.Message.InteractiveMessage.fromObject({
            body: { text: infoText },
            footer: { text: `⚙️ 𝙺𝙰𝚁 𝚂𝙸𝚂𝚃𝙴𝙼𝙰 𝙳𝚄𝙰𝙻 ⚙️` },
            header: {
                hasMediaAttachment: true,
                imageMessage: mediaMsg.imageMessage,
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "🎥 Descargar Video",
                            id: `${usedPrefix}${command} ${url}`,
                        }),
                    },
                    {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                            display_text: "📂 Video como Doc",
                            id: `${usedPrefix}${command} ${url} doc`,
                        }),
                    },
                ],
            },
        });

        const messageContent = generateWAMessageFromContent(
            m.chat,
            {
                viewOnceMessage: { message: { interactiveMessage } },
            },
            { userJid: conn.user.jid, quoted: m }
        );

        await conn.relayMessage(m.chat, messageContent.message, {
            messageId: messageContent.key.id,
        });

        await m.react("✅");

    } catch (error) {
        await m.react("❌");
        await m.reply(`> *Error:* ${error.message}`);
    } finally {
        descargas.finalizarDescarga(userId);
    }
};

handler.tags = ["downloader"];
handler.help = ["vid"];
handler.command = ["vid"];
handler.group = true;

module.exports = handler;