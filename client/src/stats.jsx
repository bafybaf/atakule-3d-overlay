import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function StatsPage() {
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalDownloads: 0,
    uniqueIPs: 0,
    topNames: [],
    recentActivity: [],
    hourlyStats: [],
    dailyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stats');
      if (!response.ok) {
        throw new Error('İstatistikler yüklenemedi');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  const formatIP = (ip) => {
    // IP'nin son 2 okteti gizle
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    return ip;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0b0b0b',
        color: '#ddd'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.2)',
            borderTop: '4px solid #4CAF50',
            borderRight: '4px solid #2196F3',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <div>İstatistikler yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0b0b0b',
        color: '#f44336',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <h2>❌ Hata</h2>
          <p>{error}</p>
          <button 
            onClick={fetchStats}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b0b0b',
      color: '#ddd',
      padding: '20px',
      fontFamily: 'Poppins, system-ui, Segoe UI, Roboto, Arial'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: 'bold' }}>
            📊 Atakule 3D Video İstatistikleri
          </h1>
          <p style={{ margin: '0', opacity: 0.9, fontSize: '16px' }}>
            Gerçek zamanlı kullanım verileri
          </p>
        </div>

        {/* Ana İstatistikler */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
              {stats.totalVideos}
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>
              🎬 Toplam Video
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
              {stats.totalDownloads}
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>
              📥 Toplam İndirme
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
              {stats.uniqueIPs}
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>
              🌐 Benzersiz IP
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
              {stats.topNames.length}
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>
              👤 Farklı İsim
            </div>
          </div>
        </div>

        {/* İçerik Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '30px'
        }}>
          {/* En Popüler İsimler */}
          <div style={{
            background: '#1a1a1a',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#4CAF50' }}>
              🏆 En Popüler İsimler
            </h3>
            {stats.topNames.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.topNames.slice(0, 10).map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#2a2a2a',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        background: index < 3 ? '#FFD700' : '#4CAF50',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#000'
                      }}>
                        {index + 1}
                      </div>
                      <span style={{ fontWeight: '500' }}>{item.name}</span>
                    </div>
                    <div style={{ color: '#888', fontSize: '14px' }}>
                      {item.count} kez
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                Henüz veri yok
              </div>
            )}
          </div>

          {/* Son Aktiviteler */}
          <div style={{
            background: '#1a1a1a',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#2196F3' }}>
              ⏰ Son Aktiviteler
            </h3>
            {stats.recentActivity.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={index} style={{
                    padding: '12px',
                    background: '#2a2a2a',
                    borderRadius: '8px',
                    borderLeft: '4px solid #2196F3'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '500' }}>{activity.name}</span>
                      <span style={{ color: '#888', fontSize: '12px' }}>
                        {formatDate(activity.timestamp)}
                      </span>
                    </div>
                    <div style={{ color: '#888', fontSize: '14px' }}>
                      {formatIP(activity.ip)} • {activity.action}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                Henüz aktivite yok
              </div>
            )}
          </div>

          {/* Saatlik İstatistikler */}
          <div style={{
            background: '#1a1a1a',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#FF9800' }}>
              📈 Son 24 Saat
            </h3>
            {stats.hourlyStats.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.hourlyStats.slice(-12).map((hour, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#2a2a2a',
                    borderRadius: '6px'
                  }}>
                    <span style={{ fontSize: '14px' }}>{hour.hour}:00</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '60px',
                        height: '4px',
                        background: '#333',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(hour.count / Math.max(...stats.hourlyStats.map(h => h.count))) * 100}%`,
                          height: '100%',
                          background: '#FF9800',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#888', minWidth: '20px' }}>
                        {hour.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                Henüz veri yok
              </div>
            )}
          </div>

          {/* Günlük İstatistikler */}
          <div style={{
            background: '#1a1a1a',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#9C27B0' }}>
              📅 Son 7 Gün
            </h3>
            {stats.dailyStats.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.dailyStats.slice(-7).map((day, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#2a2a2a',
                    borderRadius: '6px'
                  }}>
                    <span style={{ fontSize: '14px' }}>{day.date}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '60px',
                        height: '4px',
                        background: '#333',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(day.count / Math.max(...stats.dailyStats.map(d => d.count))) * 100}%`,
                          height: '100%',
                          background: '#9C27B0',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#888', minWidth: '20px' }}>
                        {day.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                Henüz veri yok
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '40px',
          padding: '20px',
          color: '#888',
          fontSize: '14px'
        }}>
          <p>Son güncelleme: {new Date().toLocaleString('tr-TR')}</p>
          <button 
            onClick={fetchStats}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '10px',
              fontSize: '14px'
            }}
          >
            🔄 Yenile
          </button>
        </div>
      </div>
    </div>
  );
}

// Ana sayfaya geri dönüş linki
const backToMain = () => {
  window.location.href = '/';
};

// URL'de stats parametresi varsa istatistik sayfasını göster
if (window.location.pathname.includes('stats') || window.location.search.includes('stats=true')) {
  createRoot(document.getElementById('root')).render(<StatsPage />);
} else {
  // Ana sayfaya geri dönüş butonu ekle
  const backButton = document.createElement('button');
  backButton.textContent = '🏠 Ana Sayfa';
  backButton.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    z-index: 1000;
    box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  `;
  backButton.onclick = backToMain;
  document.body.appendChild(backButton);
}
