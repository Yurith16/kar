const { Low } = require('lowdb')
const { join, dirname } = require('path')
const { fileURLToPath } = require('url')
const fs = require('fs/promises')

// En CommonJS, __filename y __dirname ya existen globalmente
// No necesitas declararlos con fileURLToPath
const file = join(__dirname, '..', 'database.json')

const DB_PATH = file

// ⭐ NUEVA CLASE ADAPTADORA PARA REEMPLAZAR JSONFile
class SimpleAdapter {
  constructor(filePath) {
    this.filePath = filePath
  }

  async read() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8')
      return JSON.parse(data) // Retorna los datos JSON
    } catch (e) {
      if (e.code === 'ENOENT') {
        // Archivo no existe, retorna null (comportamiento similar a JSONFile)
        return null
      }
      throw e
    }
  }

  async write(data) {
    // Escribe los datos serializados a la ruta del archivo
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2)) 
  }
}

const adapter = new SimpleAdapter(file) // 👈 Usamos el adaptador simple
const db = new Low(adapter, { users: {}, chats: {}, stats: {}, settings: {} })

async function loadDatabase() {
  await db.read()
  db.data ||= { users: {}, chats: {}, stats: {}, settings: {} }

  // Bind global.db to lowdb instance for consistency
  if (!global.db) global.db = db
  if (!global.db.data) global.db.data = db.data

  // Expose helpers globally if needed
  global.loadDatabase = loadDatabase
  global.saveDatabase = saveDatabase
}

async function saveDatabase() {
  try {
    if (global.db && global.db.data) db.data = global.db.data
  } catch (e) {
    console.log('[DB] sync error:', e?.message || e)
  }
  try {
    await db.write()
  } catch (e) {
    console.log('[DB] write error:', e?.message || e)
  }
}

module.exports = {
  DB_PATH,
  db,
  loadDatabase,
  saveDatabase
}