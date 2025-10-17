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
// app.use('/api', statsRoutes);

// Stats route'larını direkt buraya ekle
app.get('/api/stats', async (req, res) => {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const STATS_FILE = path.join(process.cwd(), 'stats.json');
    
    try {
      const statsData = await fs.readFile(STATS_FILE, 'utf8');
      const stats = JSON.parse(statsData);
      
      // En popüler isimleri sırala
      const topNames = Object.entries(stats.names || {})
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));
      
      // Son aktiviteleri sırala
      const recentActivity = (stats.activities || [])
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 20);
      
      // Saatlik istatistikleri diziye çevir
      const hourlyStats = Object.entries(stats.hourlyStats || {})
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour - b.hour);
      
      // Günlük istatistikleri diziye çevir
      const dailyStats = Object.entries(stats.dailyStats || {})
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      res.json({
        totalVideos: stats.totalVideos || 0,
        totalDownloads: stats.totalDownloads || 0,
        uniqueIPs: (stats.uniqueIPs || []).length,
        topNames,
        recentActivity,
        hourlyStats,
        dailyStats
      });
    } catch (error) {
      console.log('Stats dosyası okunamadı, varsayılan değerler döndürülüyor:', error.message);
      res.json({
        totalVideos: 0,
        totalDownloads: 0,
        uniqueIPs: 0,
        topNames: [],
        recentActivity: [],
        hourlyStats: [],
        dailyStats: []
      });
    }
  } catch (error) {
    console.error('Stats endpoint hatası:', error);
    res.status(500).json({ error: 'Stats yüklenemedi' });
  }
});

app.get('/api/stats/test', (req, res) => {
  res.json({ message: 'Stats API çalışıyor!' });
});

app.get('/api/stats/debug', (req, res) => {
  res.json({ 
    message: 'Stats debug endpoint',
    timestamp: new Date().toISOString(),
    fileExists: 'Checking...'
  });
});

app.post('/api/stats/video', (req, res) => {
  console.log('Video oluşturma istatistiği:', req.body);
  res.json({ message: 'Video istatistiği eklendi' });
});

app.post('/api/stats/download', async (req, res) => {
  try {
    console.log('Video indirme istatistiği:', req.body);
    
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const STATS_FILE = path.join(process.cwd(), 'stats.json');
    const { name } = req.body;
    
    // İstatistikleri yükle
    let stats;
    try {
      const statsData = await fs.readFile(STATS_FILE, 'utf8');
      stats = JSON.parse(statsData);
    } catch (error) {
      stats = {
        totalVideos: 0,
        totalDownloads: 0,
        uniqueIPs: [],
        names: {},
        activities: [],
        hourlyStats: {},
        dailyStats: {}
      };
    }
    
    // İndirme sayısını artır
    stats.totalDownloads++;
    
    // İsim sayısını artır
    if (name && name.trim()) {
      stats.names[name] = (stats.names[name] || 0) + 1;
    }
    
    // Aktivite ekle
    stats.activities.push({
      timestamp: new Date().toISOString(),
      name: name || 'Anonim',
      action: 'Video İndirildi'
    });
    
    // Son 100 aktiviteyi tut
    if (stats.activities.length > 100) {
      stats.activities = stats.activities.slice(-100);
    }
    
    // İstatistikleri kaydet
    await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2));
    console.log('✅ İndirme istatistiği kaydedildi');
    
    res.json({ message: 'İndirme istatistiği eklendi' });
  } catch (error) {
    console.error('❌ İndirme istatistiği hatası:', error);
    res.status(500).json({ error: 'İndirme istatistiği eklenemedi' });
  }
});

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


