import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload.mjs';
import overlayRoutes from './routes/overlay.mjs';
import probeRoutes from './routes/probe.mjs';
import renderRoutes from './routes/render.mjs';
import statsRoutes from './routes/stats.mjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Proxy (Coolify/Traefik/nginx) arkasında gerçek client IP için
app.set('trust proxy', 1);
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cross-Origin-Embedder-Policy', 'Cross-Origin-Opener-Policy']
}));
app.use(express.json({ limit: '50mb' }));

// CORS header'ları
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Static files: client build and uploads
app.use('/outputs', express.static(path.join(__dirname, '..', 'uploads', 'outputs')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/public', express.static(path.join(__dirname, '..', 'client', 'public')));

// API routes
app.use('/api', uploadRoutes);
app.use('/api', overlayRoutes);
app.use('/api', probeRoutes);
app.use('/api', renderRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ 
    ok: true, 
    message: 'Atakule 3D Overlay API - Health Check',
    timestamp: new Date().toISOString(),
    endpoints: {
      stats: '/api/stats',
      statsTest: '/api/stats/test',
      statsDownload: '/api/stats/download'
    }
  });
});

// Vite dev server proxy note: in dev, client runs on separate port.
app.get('/', (_req, res) => {
  res.json({ ok: true, message: 'Atakule 3D Overlay API' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});


