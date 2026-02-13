// plugins/descarga-audio.js
import downloadib from './savemedia-downloadib.js';
import { checkReg } from '../lib/checkReg.js';
import fs from 'fs';
import path from 'path';
import yts from 'yt-search';
import axios from 'axios';

const activeDownloads = new Map();

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const userId = m.sender;
    const user = global.db.data.users[userId];

    if (await checkReg(m, user)) return;

    if (!text) {
        await m.react('🤔');
        return m.reply(`> ¿Qué canción desea descargar, corazón?\n> *Ejemplo:* ${usedPrefix + command} Maluma - Hawái`);
    }

    if (activeDownloads.has(userId)) {
        await m.react('⏳');
        return m.reply(`> ⏳ *Ya estoy procesando un audio para ti, paciencia.*`);
    }

    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    
    const tempAudio = path.join(tmpDir, `audio_${Date.now()}.mp3`);

    try {
        activeDownloads.set(userId, true);
        
        await m.react('🔍');
        
        let videoUrl = text;
        let videoInfo = null;
        
        // Si no es URL, buscar en YouTube
        if (!downloadib.isValidUrl(text)) {
            await m.reply(`> 🔍 Buscando: "${text}"...`);
            
            const searchResult = await yts(text);
            if (!searchResult.videos || searchResult.videos.length === 0) {
                throw new Error('No se encontraron resultados');
            }
            
            videoInfo = searchResult.videos[0];
            videoUrl = videoInfo.url;
            
            // Verificar duración (30 minutos = 1800 segundos)
            if (videoInfo.seconds > 1800) {
                await m.react('❌');
                activeDownloads.delete(userId);
                return m.reply(`> 🌪️ *La canción excede 30 minutos.*`);
            }
            
            // Mostrar información de la búsqueda
            const searchInfo = `> 🎵 *「🔍」 ${videoInfo.title}*\n\n` +
                `> ⏱️ *Duración:* ${videoInfo.timestamp}\n` +
                `> 🎤 *Artista:* ${videoInfo.author.name || 'Desconocido'}\n` +
                `> ⏳ *Obteniendo enlace de descarga...*`;
            
            await conn.sendMessage(m.chat, {
                image: { url: videoInfo.thumbnail },
                caption: searchInfo
            }, { quoted: m });
        }
        
        // Obtener enlace de descarga usando Downloadib
        await m.react('📥');
        
        const downloadResult = await downloadib.download(videoUrl, 'mp3');
        
        if (!downloadResult.status) {
            throw new Error(downloadResult.error);
        }
        
        const { title, download, thumbnail, duration, author, fileSize } = downloadResult.result;
        const finalTitle = videoInfo ? videoInfo.title : title;
        
        // Si es una URL, descargar el archivo
        let audioBuffer;
        if (typeof download === 'string' && download.startsWith('http')) {
            await m.reply(`> ⏳ *Descargando archivo...*`);
            
            const response = await axios.get(download, { 
                responseType: 'stream',
                timeout: 120000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            const writer = fs.createWriteStream(tempAudio);
            response.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            
            audioBuffer = fs.readFileSync(tempAudio);
        } else {
            audioBuffer = download;
        }
        
        await m.react('⚙️');
        
        // Formatear duración
        const duracion = duration > 0 
            ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` 
            : 'Desconocida';
        
        // Enviar el archivo
        await m.react('🎵');
        
        const safeTitle = finalTitle.substring(0, 50).replace(/[<>:"/\\|?*]/g, '');
        const actualFileSize = fileSize || (audioBuffer.length / (1024 * 1024));
        
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${safeTitle}.mp3`,
            ptt: false
        }, { quoted: m });

        await m.react('✅');
        
        // Mensaje de éxito
        await conn.sendMessage(m.chat, {
            text: `> ✅ *Audio descargado*\n` +
                  `> 🎵 *${finalTitle}*\n` +
                  `> 🎤 *${author}*\n` +
                  `> ⏱️ *${duracion}*\n` +
                  `> 💾 *${actualFileSize.toFixed(2)} MB*`
        }, { quoted: m });

    } catch (error) {
        console.error('[Audio Error]:', error);
        await m.react('❌');
        
        let errorMsg = '> 🌪️ *Error:* ';
        if (error.message.includes('No se encontraron resultados')) {
            errorMsg += 'No encontré esa canción.';
        } else if (error.message.includes('excede 30 minutos')) {
            errorMsg += 'La canción es muy larga (máx 30 min).';
        } else if (error.message.includes('429')) {
            errorMsg += 'Límite de API excedido. Espera un momento.';
        } else {
            errorMsg += error.message;
        }
        
        await m.reply(errorMsg);
    } finally {
        activeDownloads.delete(userId);
        if (fs.existsSync(tempAudio)) {
            try { fs.unlinkSync(tempAudio); } catch (e) {}
        }
    }
};

handler.help = ['audio'];
handler.tags = ['downloader'];
handler.command = /^(audio|ytaudio|ytmp3|descargar)$/i;
handler.group = true;

export default handler;