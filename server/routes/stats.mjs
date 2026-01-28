import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATS_FILE = path.join(__dirname, '../../ip-stats.json');

// IP istatistiklerini yükle
async function loadStats() {
  try {
    const data = await fs.readFile(STATS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Dosya yoksa boş veri döndür
    return {
      ipRecords: {}, // { "ip": { "names": { "name1": count, "name2": count }, "total": count, "lastSeen": timestamp } }
      totalRequests: 0
    };
  }
}

// IP istatistiklerini kaydet
async function saveStats(stats) {
  try {
    await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Stats kayıt hatası:', error);
    return false;
  }
}

// IP adresini al
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         'unknown';
}

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Stats API çalışıyor!' });
});

// Tüm IP istatistiklerini getir - SINIRSIZ
router.get('/', async (req, res) => {
  try {
    const stats = await loadStats();
    
    // IP'leri liste halinde formatla
    const ipList = Object.entries(stats.ipRecords).map(([ip, data]) => ({
      ip,
      names: data.names,
      total: data.total,
      lastSeen: data.lastSeen
    }));
    
    // En çok kullanan IP'leri sırala
    ipList.sort((a, b) => b.total - a.total);
    
    res.json({
      totalRequests: stats.totalRequests,
      totalIPs: ipList.length,
      ipRecords: ipList
    });
  } catch (error) {
    console.error('Stats yükleme hatası:', error);
    res.status(500).json({ error: 'İstatistikler yüklenemedi' });
  }
});

// Belirli bir IP'nin istatistiklerini getir
router.get('/ip/:ip', async (req, res) => {
  try {
    const stats = await loadStats();
    const ip = req.params.ip;
    const ipData = stats.ipRecords[ip];
    
    if (!ipData) {
      return res.json({
        ip,
        found: false,
        message: 'Bu IP için kayıt bulunamadı'
      });
    }
    
    res.json({
      ip,
      found: true,
      names: ipData.names,
      total: ipData.total,
      lastSeen: ipData.lastSeen
    });
  } catch (error) {
    console.error('IP stats hatası:', error);
    res.status(500).json({ error: 'IP istatistiği alınamadı' });
  }
});

// Video indirme istatistiği ekle - SINIRSIZ
router.post('/download', async (req, res) => {
  try {
    const stats = await loadStats();
    const ip = getClientIP(req);
    const { name } = req.body;
    
    // IP kaydı yoksa oluştur
    if (!stats.ipRecords[ip]) {
      stats.ipRecords[ip] = {
        names: {},
        total: 0,
        lastSeen: new Date().toISOString()
      };
    }
    
    // İsim kaydı yoksa oluştur
    if (!stats.ipRecords[ip].names[name]) {
      stats.ipRecords[ip].names[name] = 0;
    }
    
    // İstatistikleri güncelle
    stats.ipRecords[ip].names[name]++;
    stats.ipRecords[ip].total++;
    stats.ipRecords[ip].lastSeen = new Date().toISOString();
    stats.totalRequests++;
    
    // Kaydet
    await saveStats(stats);
    
    console.log(`📊 IP: ${ip} | İsim: ${name} | Toplam: ${stats.ipRecords[ip].names[name]}`);
    
    res.json({ 
      message: 'İstatistik eklendi',
      ip,
      name,
      count: stats.ipRecords[ip].names[name],
      ipTotal: stats.ipRecords[ip].total
    });
  } catch (error) {
    console.error('Stats kayıt hatası:', error);
    res.status(500).json({ error: 'İstatistik kaydedilemedi' });
  }
});

// İstatistikleri sıfırla (isteğe bağlı - admin için)
router.delete('/reset', async (req, res) => {
  try {
    const emptyStats = {
      ipRecords: {},
      totalRequests: 0
    };
    await saveStats(emptyStats);
    res.json({ message: 'İstatistikler sıfırlandı' });
  } catch (error) {
    console.error('Stats sıfırlama hatası:', error);
    res.status(500).json({ error: 'İstatistikler sıfırlanamadı' });
  }
});

export default router;