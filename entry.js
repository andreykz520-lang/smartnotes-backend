const http = require('http');
const next = require('next');
const handleObd2 = require('./obd2/server.js');
const handleAutomechanic = require('./automechanic/server.js');

const dev = false;
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, dir: __dirname });
const handleNext = app.getRequestHandler();

console.log(`[Multi-Site] Initializing SmartNotes, OBD2ScanAI, and AutoMechanic...`);

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const host = (req.headers.host || '').toLowerCase();
    
    // 1. Автомеханик: automechanic.obd2scanai.ru
    if (host.includes('automechanic')) {
      return handleAutomechanic(req, res);
    }

    // 2. OBD2 Сканер: obd2scanai.ru
    if (host.includes('obd2scanai.ru') || host.includes('obd2')) {
      return handleObd2(req, res);
    }

    // 3. SmartNotes: smartnotes-ai.ru и остальные хосты
    return handleNext(req, res);
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`✅ [Multi-Site] Multi-Site Server listening on port ${port}`);
    console.log(`   - SmartNotes AI: smartnotes-ai.ru`);
    console.log(`   - OBD2 SCAN AI: obd2scanai.ru`);
    console.log(`   - AutoMechanic AI: automechanic.obd2scanai.ru`);
  });
}).catch((err) => {
  console.error('[Multi-Site] Error starting server:', err);
  process.exit(1);
});
