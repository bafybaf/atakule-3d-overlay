# 🏛️ Atakule 3D Overlay

![Proje Lisansı](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-18+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![Three.js](https://img.shields.io/badge/three.js-r150+-orange.svg)

## 📖 Proje Açıklaması

Atakule 3D Overlay, kullanıcıların isimlerini Atakule'nin 3D modeli üzerinde görüntüleyebileceği interaktif bir web uygulamasıdır. Kullanıcılar isimlerini girebilir, 3D metin overlay'i ile video oluşturabilir ve bu videoları indirebilirler.

## ✨ Özellikler

### 🎯 Ana Özellikler
- **3D Metin Overlay**: Kullanıcı isimlerini Atakule modeli üzerinde 3D metin olarak görüntüleme
- **Video Oluşturma**: 3D overlay ile birlikte MP4 video oluşturma
- **Gerçek Zamanlı İstatistikler**: Kullanıcı aktivitelerini takip etme
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu arayüz
- **Yüksek Performans**: 25 FPS optimize edilmiş video çıktısı

### 🛠️ Teknik Özellikler
- **Frontend**: React 18 + Three.js + Vite
- **Backend**: Node.js + Express
- **Video İşleme**: FFmpeg ile server-side rendering
- **3D Grafik**: Troika-Three-Text ile gelişmiş metin rendering
- **API**: RESTful API endpoints
- **Build**: Vite ile modern build sistemi

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- FFmpeg (video işleme için)

### Adım Adım Kurulum

1. **Depoyu Klonlayın:**
```bash
git clone https://github.com/bafybaf/atakule-3d-overlay.git
cd atakule-3d-overlay
```

2. **Bağımlılıkları Yükleyin:**
```bash
npm install
```

3. **FFmpeg Kurulumu:**
   - **Windows**: [FFmpeg Windows Builds](https://www.gyan.dev/ffmpeg/builds/)
   - **macOS**: `brew install ffmpeg`
   - **Linux**: `sudo apt install ffmpeg`

4. **Geliştirme Sunucusunu Başlatın:**
```bash
npm run dev
```

5. **Tarayıcıda Açın:**
```
http://localhost:3000
```

## 📁 Proje Yapısı

```
atakule-3d-overlay/
├── client/                 # Frontend React uygulaması
│   ├── src/
│   │   ├── main.jsx       # Ana React bileşeni
│   │   ├── styles.css     # CSS stilleri
│   │   ├── three/         # Three.js bileşenleri
│   │   │   ├── createScene.js
│   │   │   ├── CircularText.js
│   │   │   └── TextManager.js
│   │   └── utils/         # Yardımcı fonksiyonlar
│   ├── public/            # Statik dosyalar
│   │   ├── atakule.mp4    # Arka plan video
│   │   ├── bg.webp        # Arka plan resmi
│   │   └── logo.png       # Logo
│   ├── stats.html         # İstatistik sayfası
│   └── vite.config.js     # Vite konfigürasyonu
├── server/                # Backend Node.js uygulaması
│   ├── index.mjs          # Ana sunucu dosyası
│   ├── routes/            # API route'ları
│   │   ├── overlay.mjs    # Overlay işlemleri
│   │   ├── render.mjs     # Video rendering
│   │   ├── stats.mjs      # İstatistik API
│   │   └── upload.mjs     # Dosya yükleme
│   └── services/          # Servis dosyaları
│       └── ffmpeg.mjs     # FFmpeg servisi
├── package.json           # Proje bağımlılıkları
├── vite.config.js         # Vite konfigürasyonu
└── README.md             # Bu dosya
```

## 🎮 Kullanım

### Ana Uygulama
1. **İsim Girin**: Sayfadaki input alanına isminizi yazın
2. **Video Oluştur**: "Video Oluştur" butonuna tıklayın
3. **İndirin**: Oluşturulan videoyu indirin

### İstatistik Sayfası
- `http://localhost:3000/stats.html` adresinden erişebilirsiniz
- Gerçek zamanlı kullanıcı istatistikleri
- Video oluşturma sayıları
- IP bazlı analiz

## 🔧 API Endpoints

### Video İşleme
- `POST /api/overlay` - 3D overlay oluşturma
- `POST /api/render` - Video rendering
- `GET /api/stats` - İstatistik verileri
- `GET /health` - Sunucu durumu

### Örnek API Kullanımı
```javascript
// Video oluşturma
const response = await fetch('/api/overlay', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Ahmet' })
});

// İstatistik alma
const stats = await fetch('/api/stats');
const data = await stats.json();
```

## ⚙️ Konfigürasyon

### Environment Variables
```bash
PORT=3000                 # Sunucu portu
NODE_ENV=production       # Ortam (development/production)
```

### Video Ayarları
- **FPS**: 25 (optimize edilmiş)
- **Bitrate**: 800Kbps video, 64Kbps ses
- **Format**: MP4 (H.264)
- **Preset**: ultrafast (hızlı encoding)

## 🚀 Production Deployment

### Build Alma
```bash
npm run build
```

### Production Sunucusu
```bash
npm run server
```

### Docker ile Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "server"]
```

## 📊 Performans Optimizasyonları

### Frontend
- **Lazy Loading**: Bileşenler ihtiyaç duyulduğunda yüklenir
- **Memory Management**: Garbage collection optimizasyonu
- **Chunking**: MediaRecorder ile 1 saniye chunk'lar
- **Error Handling**: Kapsamlı hata yönetimi

### Backend
- **FFmpeg Presets**: ultrafast encoding
- **CRF Optimization**: 23 kalite seviyesi
- **Audio Compression**: 64kbps ses bitrate
- **File Cleanup**: Otomatik geçici dosya temizleme

## 🐛 Sorun Giderme

### Yaygın Sorunlar

**Video Oluşturulmuyor:**
- FFmpeg kurulu olduğundan emin olun
- Sunucu loglarını kontrol edin
- Disk alanı yeterli olduğundan emin olun

**3D Model Yüklenmiyor:**
- WebGL desteğini kontrol edin
- Tarayıcı cache'ini temizleyin
- Console hatalarını kontrol edin

**API Çalışmıyor:**
- Port 3000'in açık olduğundan emin olun
- CORS ayarlarını kontrol edin
- Network bağlantısını test edin

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Geliştirme Kuralları
- ESLint kurallarına uyun
- Test yazın
- Documentation güncelleyin
- Commit mesajlarını açıklayıcı yazın

## 📝 Changelog

### v1.0.0 (2024-01-17)
- ✨ İlk sürüm yayınlandı
- 🎯 3D metin overlay özelliği
- 📹 Video oluşturma sistemi
- 📊 İstatistik takip sistemi
- 🚀 25 FPS performans optimizasyonu

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

## 👥 Geliştiriciler

- **bafybaf** - *Ana Geliştirici* - [GitHub](https://github.com/bafybaf)

## 🙏 Teşekkürler

- [Three.js](https://threejs.org/) - 3D grafik kütüphanesi
- [React](https://reactjs.org/) - UI framework
- [FFmpeg](https://ffmpeg.org/) - Video işleme
- [Troika-Three-Text](https://github.com/protectwise/troika) - 3D metin rendering

## 📞 İletişim

- **GitHub Issues**: [Proje Issues](https://github.com/bafybaf/atakule-3d-overlay/issues)
- **Email**: burakkiziltas@hotmail.com

## 🔗 Bağlantılar

- **Canlı Demo**: [atakule.pages.dev](https://atakule.pages.dev)
- **GitHub Repository**: [atakule-3d-overlay](https://github.com/bafybaf/atakule-3d-overlay)
- **Documentation**: [Wiki](https://github.com/bafybaf/atakule-3d-overlay/wiki)

---

⭐ **Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**

