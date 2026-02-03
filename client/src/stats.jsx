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

// Özel (private) IP mi?
function isPrivateIP(ip) {
  if (!ip || typeof ip !== 'string') return true;
  const s = ip.replace(/^::ffff:/i, '').trim();
  if (/^10\./.test(s) || /^172\.(1[6-9]|2[0-9]|3[01])\./.test(s) || /^192\.168\./.test(s)) return true;
  if (s === '127.0.0.1' || s === '::1' || s.startsWith('fc') || s.startsWith('fd')) return true;
  return false;
}

// IP adresini al (Cloudflare + Coolify/Traefik proxy arkasında gerçek client IP)
function getClientIP(req) {
  // Cloudflare gerçek client IP'yi bu header'larda gönderir (nginx'te proxy'ye iletilmeli)
  const cf = req.headers['cf-connecting-ip'];
  if (cf && !isPrivateIP(cf)) return cf.trim();
  const trueClient = req.headers['true-client-ip'];
  if (trueClient && !isPrivateIP(trueClient)) return trueClient.trim();

  const real = req.headers['x-real-ip'];
  if (real && !isPrivateIP(real)) return real.replace(/^::ffff:/i, '').trim();

  // X-Forwarded-For: proxy zincirinde client genelde sonda (sağda); sağdaki ilk public IP'yi al
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const list = forwarded.split(',').map((s) => s.trim());
    const publicIPs = list.filter((ip) => !isPrivateIP(ip));
    const pick = publicIPs.length ? publicIPs[publicIPs.length - 1] : list[list.length - 1];
    if (pick) return pick.replace(/^::ffff:/i, '');
  }

  const raw = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
  if (typeof raw === 'string' && raw.startsWith('::ffff:')) return raw.slice(7);
  return raw;
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
