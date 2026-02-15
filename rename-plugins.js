const fs = require('fs');
const path = require('path');

const pluginsDir = path.join(__dirname, 'plugins');

// Verificar si la carpeta existe
if (!fs.existsSync(pluginsDir)) {
    console.error('❌ La carpeta "plugins" no existe en la raíz del proyecto.');
    process.exit(1);
}

// Leer todos los archivos de la carpeta plugins
const files = fs.readdirSync(pluginsDir);

let renamedCount = 0;

files.forEach(file => {
    const filePath = path.join(pluginsDir, file);
    
    // Verificar que sea un archivo (no una carpeta)
    if (fs.statSync(filePath).isFile()) {
        // Verificar que no termine ya en .txt
        if (!file.endsWith('.txt')) {
            const newFileName = file + '.txt';
            const newFilePath = path.join(pluginsDir, newFileName);
            
            fs.renameSync(filePath, newFilePath);
            console.log(`✅ Renombrado: ${file} → ${newFileName}`);
            renamedCount++;
        } else {
            console.log(`⏭️  Saltado (ya es .txt): ${file}`);
        }
    }
});

console.log(`\n📊 Total de archivos renombrados: ${renamedCount}`);