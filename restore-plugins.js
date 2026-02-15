const fs = require('fs');
const path = require('path');

const pluginsDir = path.join(__dirname, 'plugins');

if (!fs.existsSync(pluginsDir)) {
    console.error('❌ La carpeta "plugins" no existe.');
    process.exit(1);
}

const files = fs.readdirSync(pluginsDir);
let restoredCount = 0;

files.forEach(file => {
    const filePath = path.join(pluginsDir, file);
    
    if (fs.statSync(filePath).isFile() && file.endsWith('.txt')) {
        // Quitar la extensión .txt
        const originalName = file.slice(0, -4);
        const originalPath = path.join(pluginsDir, originalName);
        
        fs.renameSync(filePath, originalPath);
        console.log(`✅ Restaurado: ${file} → ${originalName}`);
        restoredCount++;
    }
});

console.log(`\n📊 Total de archivos restaurados: ${restoredCount}`);