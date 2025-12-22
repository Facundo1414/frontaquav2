const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { scheduleBusinessHoursShutdown } = require('./utils/business-hours');

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3001;

// Crear app Next.js sin especificar hostname
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
  .once('error', (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, '0.0.0.0', () => {
    console.log(`> Ready on http://0.0.0.0:${port}`);
    console.log(`🚀 Frontend Next.js running on port ${port}`);
    
    // Configurar auto-shutdown para horario laboral (8-16, lunes a viernes)
    if (!dev) {
      scheduleBusinessHoursShutdown(16);
    }
  });
});