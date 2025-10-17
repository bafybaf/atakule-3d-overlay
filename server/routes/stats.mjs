import express from 'express';

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Stats API çalışıyor!' });
});

// Debug endpoint
router.get('/debug', (req, res) => {
  res.json({ 
    message: 'Stats debug endpoint',
    timestamp: new Date().toISOString(),
    fileExists: 'Checking...'
  });
});

// Ana istatistik endpoint'i
router.get('/', (req, res) => {
  res.json({
    totalVideos: 0,
    totalDownloads: 0,
    uniqueIPs: 0,
    topNames: [],
    recentActivity: [],
    hourlyStats: [],
    dailyStats: []
  });
});

// Video oluşturma istatistiği ekle
router.post('/video', (req, res) => {
  console.log('Video oluşturma istatistiği:', req.body);
  res.json({ message: 'Video istatistiği eklendi' });
});

// Video indirme istatistiği ekle
router.post('/download', (req, res) => {
  console.log('Video indirme istatistiği:', req.body);
  res.json({ message: 'İndirme istatistiği eklendi' });
});

export default router;