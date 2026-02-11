// keepalive.js - Versión ES Modules
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rutas
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>🤖 Karbot Activo</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #f0f0f0; 
          }
          .container { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🤖 Karbot está activo</h1>
          <p>🕐 Hora del servidor: ${new Date().toLocaleString()}</p>
          <p>📊 Estado: <strong>Operacional</strong></p>
          <p>🔗 <a href="/ping">Ver estado JSON</a></p>
        </div>
      </body>
    </html>
  `);
});

app.get('/ping', (req, res) => {
  res.json({ 
    status: 'active', 
    timestamp: new Date().toISOString(),
    service: 'karbot-keepalive',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Health check para PM2
app.get('/health', (req, res) => {
  res.json({ 
    healthy: true,
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Keep-alive activo en puerto ${PORT}`);
  console.log(`📅 Iniciado: ${new Date().toLocaleString()}`);
});

// Manejar cierre limpio
process.on('SIGINT', () => {
  console.log('🛑 Recibido SIGINT. Cerrando servidor...');
  process.exit(0);
});