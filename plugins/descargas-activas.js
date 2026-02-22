/** @type {Map<string, {count: number, timestamp: number}>} */
const activeDownloads = new Map();

// Tiempo máximo que una descarga puede estar activa (30 minutos)
const MAX_DOWNLOAD_TIME = 30 * 60 * 1000;

// Limpieza automática cada 5 minutos
setInterval(() => {
    const now = Date.now();
    for (const [userId, data] of activeDownloads.entries()) {
        if (now - data.timestamp > MAX_DOWNLOAD_TIME) {
            activeDownloads.delete(userId);
        }
    }
}, 5 * 60 * 1000);

/**
 * Verifica si un usuario tiene descargas activas
 * @param {string} userId - ID del usuario
 * @returns {boolean}
 */
function tieneDescargasActivas(userId) {
    return activeDownloads.has(userId);
}

/**
 * Obtiene el número de descargas activas de un usuario
 * @param {string} userId - ID del usuario
 * @returns {number}
 */
function contarDescargasActivas(userId) {
    return activeDownloads.get(userId)?.count || 0;
}

/**
 * Registra una nueva descarga para un usuario
 * @param {string} userId - ID del usuario
 * @param {string} comando - Nombre del comando que inicia la descarga
 */
function registrarDescarga(userId, comando) {
    const data = activeDownloads.get(userId) || { count: 0, timestamp: Date.now(), comandos: [] };
    data.count += 1;
    data.timestamp = Date.now();
    data.comandos.push({ comando, timestamp: Date.now() });
    activeDownloads.set(userId, data);
}

/**
 * Finaliza una descarga de un usuario
 * @param {string} userId - ID del usuario
 */
function finalizarDescarga(userId) {
    const data = activeDownloads.get(userId);
    if (data) {
        data.count -= 1;
        data.timestamp = Date.now();
        if (data.count <= 0) {
            activeDownloads.delete(userId);
        } else {
            activeDownloads.set(userId, data);
        }
    }
}

/**
 * Limpia todas las descargas de un usuario (forzado)
 * @param {string} userId - ID del usuario
 */
function limpiarDescargas(userId) {
    activeDownloads.delete(userId);
}

module.exports = {
    tieneDescargasActivas,
    contarDescargasActivas,
    registrarDescarga,
    finalizarDescarga,
    limpiarDescargas,
    activeDownloads
};