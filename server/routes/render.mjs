import express from 'express';
import { renderWithOverlay } from '../services/ffmpeg.mjs';
import path from 'path';
import fs from 'fs/promises';

const router = express.Router();

// İstatistik dosyası yolu
const STATS_FILE = path.join(process.cwd(), 'stats.json');

// Varsayılan istatistik yapısı
const defaultStats = {
  totalVideos: 0,
  totalDownloads: 0,
  uniqueIPs: [],
  names: {},
  activities: [],
  hourlyStats: {},
  dailyStats: {}
};

// İstatistikleri yükle
async function loadStats() {
  try {
    const data = await fs.readFile(STATS_FILE, 'utf8');
    const stats = JSON.parse(data);
    return { ...defaultStats, ...stats };
  } catch (error) {
    console.log('İstatistik dosyası bulunamadı, varsayılan değerler kullanılıyor');
    return { ...defaultStats };
  }
}

// İstatistikleri kaydet
async function saveStats(stats) {
  try {
    console.log('💾 İstatistikler kaydediliyor:', STATS_FILE);
    await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2));
    console.log('✅ İstatistikler başarıyla kaydedildi');
  } catch (error) {
    console.error('❌ İstatistik kaydetme hatası:', error);
  }
}

// Video oluşturma istatistiği ekle
async function addVideoStats(ip, name) {
  const stats = await loadStats();
  
  // Toplam video sayısını artır
  stats.totalVideos++;
  
  // IP'yi benzersiz IP'lere ekle
  if (ip && !stats.uniqueIPs.includes(ip)) {
    stats.uniqueIPs.push(ip);
  }
  
  // İsim sayısını artır
  if (name && name.trim()) {
    stats.names[name] = (stats.names[name] || 0) + 1;
  }
  
  // Aktivite ekle
  stats.activities.push({
    timestamp: new Date().toISOString(),
    ip: ip || 'unknown',
    name: name || 'Anonim',
    action: 'Video Oluşturuldu'
  });
  
  // Saatlik istatistik
  const hour = new Date().getHours();
  stats.hourlyStats[hour] = (stats.hourlyStats[hour] || 0) + 1;
  
  // Günlük istatistik
  const today = new Date().toISOString().split('T')[0];
  stats.dailyStats[today] = (stats.dailyStats[today] || 0) + 1;
  
  // Son 100 aktiviteyi tut
  if (stats.activities.length > 100) {
    stats.activities = stats.activities.slice(-100);
  }
  
  console.log('📊 Kaydetmeden önce stats:', stats);
  await saveStats(stats);
  console.log('✅ Video istatistiği eklendi:', { ip, name });
}

// POST /api/render - Video + overlay birleştir
router.post('/', async (req, res) => {
  try {
    const { videoFile, overlayFile, outputName, name } = req.body;
    
    if (!videoFile || !overlayFile || !outputName) {
      return res.status(400).json({ error: 'videoFile, overlayFile ve outputName gerekli' });
    }
    
    console.log('🎬 Render başlıyor:', { videoFile, overlayFile, outputName });
    
    // Dosya yollarını oluştur
    const videoPath = path.join(process.cwd(), 'uploads', 'videos', videoFile);
    const overlayPath = path.join(process.cwd(), 'uploads', 'overlays', overlayFile);
    const outputPath = path.join(process.cwd(), 'uploads', 'outputs', outputName);
    
    console.log('📁 Dosya yolları:', { videoPath, overlayPath, outputPath });
    
    // FFmpeg ile render
    const resultPath = await renderWithOverlay({
      videoPath,
      overlayPath,
      outputPath,
      crf: 23,
      preset: 'ultrafast',
      duration: 5 // 5 saniye
    });
    
    console.log('✅ Render tamamlandı:', resultPath);
    
    // İstatistik ekle
    try {
      const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
      await addVideoStats(clientIP, name || 'Anonim');
    } catch (error) {
      console.log('İstatistik eklenemedi:', error);
    }
    
    // Sonuç URL'i oluştur
    const outputUrl = `/uploads/outputs/${outputName}`;
    
    res.json({
      success: true,
      url: outputUrl,
      path: resultPath,
      message: 'Video render edildi'
    });
    
  } catch (error) {
    console.error('❌ Render hatası:', error);
    res.status(500).json({ 
      error: 'Render hatası: ' + error.message 
    });
  }
});

export default router;
