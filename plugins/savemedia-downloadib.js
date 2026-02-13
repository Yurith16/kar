// plugins/savemedia-downloadib.js
import axios from 'axios';

class DownloadibScraper {
    constructor() {
        this.formats = ['mp3', '144', '240', '360', '480', '720', '1080'];
        // Misma API key que usa Downloadib
        this.apiKey = 'd40c265118mshdc90194a533aa99p18842bjsn18247c206e8e';
        this.apiHost = 'ytstream-download-youtube-videos.p.rapidapi.com';
    }

    extractVideoId(url) {
        if (!url) return null;
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&]+)/
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) return match[1];
        }
        return null;
    }

    async download(url, format = 'mp3') {
        try {
            const videoId = this.extractVideoId(url);
            if (!videoId) {
                return {
                    status: false,
                    code: 400,
                    error: 'URL de YouTube inválida'
                };
            }

            // Llamar a la API de RapidAPI (igual que Downloadib)
            const apiUrl = `https://${this.apiHost}/dl?id=${videoId}`;
            
            const response = await axios.get(apiUrl, {
                headers: {
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': this.apiHost
                },
                timeout: 30000
            });

            const data = response.data;
            
            if (!data.formats || data.formats.length === 0) {
                return {
                    status: false,
                    code: 404,
                    error: 'No se encontraron formatos'
                };
            }

            // Obtener thumbnail
            const thumbnail = data.thumbnail && data.thumbnail.length > 0 
                ? data.thumbnail[data.thumbnail.length - 1].url 
                : `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

            // Buscar el formato solicitado
            let selectedFormat;
            
            if (format === 'mp3') {
                // Buscar formato solo de audio
                selectedFormat = data.formats.find(f => f.hasAudio && !f.hasVideo) ||
                                data.formats.find(f => f.audioChannels > 0);
                
                // Si no hay, tomar el primer formato
                if (!selectedFormat) selectedFormat = data.formats[0];
            } else {
                // Buscar video con la calidad solicitada
                const qualityNum = parseInt(format);
                selectedFormat = data.formats.find(f => 
                    f.qualityLabel && f.qualityLabel.includes(format + 'p')
                ) || data.formats.find(f => f.hasVideo); // Si no, cualquier video
            }

            if (!selectedFormat || !selectedFormat.url) {
                return {
                    status: false,
                    code: 404,
                    error: `No se encontró formato ${format}`
                };
            }

            // Para MP3, necesitamos el audio real (la URL puede ser un stream)
            if (format === 'mp3') {
                // Intentar descargar el audio
                try {
                    const audioResponse = await axios.get(selectedFormat.url, {
                        responseType: 'arraybuffer',
                        timeout: 60000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });
                    
                    return {
                        status: true,
                        code: 200,
                        result: {
                            title: data.title || 'Video',
                            type: 'audio',
                            format: 'mp3',
                            quality: '128kbps',
                            thumbnail: thumbnail,
                            download: Buffer.from(audioResponse.data),
                            id: videoId,
                            duration: data.lengthSeconds || 0,
                            author: data.author || 'YouTube',
                            fileSize: audioResponse.data.length / (1024 * 1024)
                        }
                    };
                } catch (audioError) {
                    // Si falla la descarga, devolver la URL
                    return {
                        status: true,
                        code: 200,
                        result: {
                            title: data.title || 'Video',
                            type: 'audio',
                            format: 'mp3',
                            quality: '128kbps',
                            thumbnail: thumbnail,
                            download: selectedFormat.url,
                            id: videoId,
                            duration: data.lengthSeconds || 0,
                            author: data.author || 'YouTube',
                            fileSize: 0
                        }
                    };
                }
            } else {
                // Para video, devolver la URL
                return {
                    status: true,
                    code: 200,
                    result: {
                        title: data.title || 'Video',
                        type: 'video',
                        format: format,
                        quality: selectedFormat.qualityLabel || format + 'p',
                        thumbnail: thumbnail,
                        download: selectedFormat.url,
                        id: videoId,
                        duration: data.lengthSeconds || 0,
                        author: data.author || 'YouTube',
                        fileSize: selectedFormat.contentLength ? 
                                 selectedFormat.contentLength / (1024 * 1024) : 0
                    }
                };
            }

        } catch (error) {
            console.error('[Downloadib Error]:', error.message);
            
            if (error.response?.status === 429) {
                return {
                    status: false,
                    code: 429,
                    error: 'Límite de API excedido. Espera un momento.'
                };
            }

            return {
                status: false,
                code: 500,
                error: error.message || 'Error al obtener información'
            };
        }
    }

    isValidUrl(url) {
        return this.extractVideoId(url) !== null;
    }
}

const downloadib = new DownloadibScraper();
export default downloadib;