/**
 * Song Downloader - Download audio from YouTube
 */

const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const APIs = require('../utils/api');
const { toAudio } = require('../utils/converter');

const AXIOS_DEFAULTS = {
  timeout: 60000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*'
  }
};

let handler = async (m, { conn, text, args }) => {
    try {
      const searchQuery = text || args.join(' ');

      if (!searchQuery) {
        return await conn.sendMessage(m.chat, { 
          text: 'Uso: .song <nombre de canción o link de YouTube>' 
        }, { quoted: m });
      }

      let video;

      if (searchQuery.includes('youtube.com') || searchQuery.includes('youtu.be')) {
        video = { url: searchQuery };
      } else {
        const search = await yts(searchQuery);
        if (!search || !search.videos.length) {
          return await conn.sendMessage(m.chat, { 
            text: 'No se encontraron resultados.' 
          }, { quoted: m });
        }
        video = search.videos[0];
      }

      // Inform user
      await conn.sendMessage(m.chat, {
        image: { url: video.thumbnail },
        caption: `🎵 Descargando: *${video.title}*\n⏱ Duración: ${video.timestamp}`
      }, { quoted: m });

      // Try multiple APIs with fallback chain
      let audioData;
      let audioBuffer;
      let downloadSuccess = false;

      // List of API methods to try
      const apiMethods = [
        { name: 'EliteProTech', method: () => APIs.getEliteProTechDownloadByUrl(video.url) },
        { name: 'Yupra', method: () => APIs.getYupraDownloadByUrl(video.url) },
        { name: 'Okatsu', method: () => APIs.getOkatsuDownloadByUrl(video.url) },
        { name: 'Izumi', method: () => APIs.getIzumiDownloadByUrl(video.url) }
      ];

      // Try each API until we successfully download audio
      for (const apiMethod of apiMethods) {
        try {
          audioData = await apiMethod.method();
          const audioUrl = audioData.download || audioData.dl || audioData.url;

          if (!audioUrl) {
            console.log(`${apiMethod.name} returned no download URL, trying next API...`);
            continue;
          }

          // Try to download the audio file - arraybuffer first
          try {
            const audioResponse = await axios.get(audioUrl, {
              responseType: 'arraybuffer',
              timeout: 90000,
              maxContentLength: Infinity,
              maxBodyLength: Infinity,
              decompress: true,
              validateStatus: s => s >= 200 && s < 400,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Encoding': 'identity'
              }
            });
            audioBuffer = Buffer.from(audioResponse.data);

            if (audioBuffer && audioBuffer.length > 0) {
              downloadSuccess = true;
              break;
            }
          } catch (downloadErr) {
            const statusCode = downloadErr.response?.status || downloadErr.status;
            if (statusCode === 451) {
              console.log(`Download blocked (451) from ${apiMethod.name}, trying next API...`);
              continue;
            }

            // Try stream mode as fallback
            try {
              const audioResponse = await axios.get(audioUrl, {
                responseType: 'stream',
                timeout: 90000,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                validateStatus: s => s >= 200 && s < 400,
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': '*/*',
                  'Accept-Encoding': 'identity'
                }
              });
              const chunks = [];
              await new Promise((resolve, reject) => {
                audioResponse.data.on('data', c => chunks.push(c));
                audioResponse.data.on('end', resolve);
                audioResponse.data.on('error', reject);
              });
              audioBuffer = Buffer.concat(chunks);

              if (audioBuffer && audioBuffer.length > 0) {
                downloadSuccess = true;
                break;
              }
            } catch (streamErr) {
              const streamStatusCode = streamErr.response?.status || streamErr.status;
              if (streamStatusCode === 451) {
                console.log(`Stream download blocked (451) from ${apiMethod.name}, trying next API...`);
              } else {
                console.log(`Stream download failed from ${apiMethod.name}:`, streamErr.message);
              }
              continue;
            }
          }
        } catch (apiErr) {
          console.log(`${apiMethod.name} API failed:`, apiErr.message);
          continue;
        }
      }

      if (!downloadSuccess || !audioBuffer) {
        throw new Error('All download sources failed. The content may be unavailable or blocked in your region.');
      }

      if (!audioBuffer || audioBuffer.length === 0) {
        throw new Error('Downloaded audio buffer is empty');
      }

      // Detect actual file format from signature
      const firstBytes = audioBuffer.slice(0, 12);
      const hexSignature = firstBytes.toString('hex');
      const asciiSignature = firstBytes.toString('ascii', 4, 8);

      let actualMimetype = 'audio/mpeg';
      let fileExtension = 'mp3';
      let detectedFormat = 'unknown';

      if (asciiSignature === 'ftyp' || hexSignature.startsWith('000000')) {
        const ftypBox = audioBuffer.slice(4, 8).toString('ascii');
        if (ftypBox === 'ftyp') {
          detectedFormat = 'M4A/MP4';
          actualMimetype = 'audio/mp4';
          fileExtension = 'm4a';
        }
      }
      else if (audioBuffer.toString('ascii', 0, 3) === 'ID3' || 
               (audioBuffer[0] === 0xFF && (audioBuffer[1] & 0xE0) === 0xE0)) {
        detectedFormat = 'MP3';
        actualMimetype = 'audio/mpeg';
        fileExtension = 'mp3';
      }
      else if (audioBuffer.toString('ascii', 0, 4) === 'OggS') {
        detectedFormat = 'OGG/Opus';
        actualMimetype = 'audio/ogg; codecs=opus';
        fileExtension = 'ogg';
      }
      else if (audioBuffer.toString('ascii', 0, 4) === 'RIFF') {
        detectedFormat = 'WAV';
        actualMimetype = 'audio/wav';
        fileExtension = 'wav';
      }
      else {
        actualMimetype = 'audio/mp4';
        fileExtension = 'm4a';
        detectedFormat = 'Unknown (defaulting to M4A)';
      }

      // Convert to MP3 if not already MP3
      let finalBuffer = audioBuffer;
      let finalMimetype = 'audio/mpeg';
      let finalExtension = 'mp3';

      if (fileExtension !== 'mp3') {
        try {
          finalBuffer = await toAudio(audioBuffer, fileExtension);
          if (!finalBuffer || finalBuffer.length === 0) {
            throw new Error('Conversion returned empty buffer');
          }
        } catch (convErr) {
          throw new Error(`Failed to convert ${detectedFormat} to MP3: ${convErr.message}`);
        }
      }

      // Send buffer as MP3
      await conn.sendMessage(m.chat, {
        audio: finalBuffer,
        mimetype: finalMimetype,
        fileName: `${(audioData.title || video.title || 'song').replace(/[^\w\s-]/g, '')}.${finalExtension}`,
        ptt: false
      }, { quoted: m });

      // Cleanup
      try {
        const tempDir = path.join(__dirname, '../temp');
        if (fs.existsSync(tempDir)) {
          const files = fs.readdirSync(tempDir);
          const now = Date.now();
          files.forEach(file => {
            const filePath = path.join(tempDir, file);
            try {
              const stats = fs.statSync(filePath);
              if (now - stats.mtimeMs > 10000) {
                if (file.endsWith('.mp3') || file.endsWith('.m4a') || /^\d+\.(mp3|m4a)$/.test(file)) {
                  fs.unlinkSync(filePath);
                }
              }
            } catch (e) {}
          });
        }
      } catch (cleanupErr) {}

    } catch (err) {
      console.error('Song command error:', err);

      let errorMessage = '❌ Error al descargar la canción.';
      if (err.message && err.message.includes('blocked')) {
        errorMessage = '❌ Descarga bloqueada. El contenido puede no estar disponible en tu región.';
      } else if (err.response?.status === 451 || err.status === 451) {
        errorMessage = '❌ Contenido no disponible (451). Esto puede deberse a restricciones legales.';
      } else if (err.message && err.message.includes('All download sources failed')) {
        errorMessage = '❌ Todas las fuentes de descarga fallaron. El contenido puede no estar disponible.';
      }

      await conn.sendMessage(m.chat, { 
        text: errorMessage 
      }, { quoted: m });
    }
};

handler.help = ['song'];
handler.tags = ['media', 'downloader'];
handler.command = /^(song)$/i;
handler.register = true;

module.exports = handler;