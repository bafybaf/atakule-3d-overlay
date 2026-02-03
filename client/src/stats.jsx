import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function StatsPage() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalIPs: 0,
    ipRecords: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchIP, setSearchIP] = useState('');
  const [sortBy, setSortBy] = useState('total'); // 'total', 'lastSeen', 'ip'

  useEffect(() => {
    fetchStats();
    // Her 30 saniyede bir güncelle
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stats');
      if (!response.ok) {
        throw new Error('İstatistikler yüklenemedi');
      }
      const data = await response.json();
      // Veri yapısını kontrol et ve normalize et
      setStats({
        totalRequests: data.totalRequests || 0,
        totalIPs: data.totalIPs || 0,
        ipRecords: Array.isArray(data.ipRecords) ? data.ipRecords : []
      });
    } catch (err) {
      setError(err.message);
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  // IP listesini filtrele ve sırala
  const getFilteredAndSortedIPs = () => {
    // Array olduğundan emin ol
    let filtered = Array.isArray(stats.ipRecords) ? stats.ipRecords : [];
    
    // Arama filtresi
    if (searchIP.trim()) {
      filtered = filtered.filter(record => 
        record.ip.toLowerCase().includes(searchIP.toLowerCase())
      );
    }
    
    // Sıralama
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'total') return b.total - a.total;
      if (sortBy === 'lastSeen') return new Date(b.lastSeen) - new Date(a.lastSeen);
      if (sortBy === 'ip') return a.ip.localeCompare(b.ip);
      return 0;
    });
    
    return filtered;
  };

  const filteredIPs = getFilteredAndSortedIPs();

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
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px'
        }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: 'bold' }}>
            📊 IP Bazlı Video İstatistikleri
          </h1>
          <p style={{ margin: '0', opacity: 0.9, fontSize: '16px' }}>
            Sınırsız kayıt - Gerçek zamanlı IP takibi
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
              {stats.totalRequests.toLocaleString('tr-TR')}
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>
              📥 Toplam İstek
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
              {stats.totalIPs.toLocaleString('tr-TR')}
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>
              🌐 Benzersiz IP
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
              {filteredIPs.length.toLocaleString('tr-TR')}
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>
              🔍 Filtrelenmiş IP
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
            padding: '24px',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer'
          }}
          onClick={fetchStats}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px' }}>
              🔄
            </div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>
              Yenile
            </div>
          </div>
        </div>

        {/* Arama ve Sıralama */}
        <div style={{
          background: '#1a1a1a',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #333',
          marginBottom: '30px',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>
              🔍 IP Ara
            </label>
            <input
              type="text"
              value={searchIP}
              onChange={(e) => setSearchIP(e.target.value)}
              placeholder="IP adresi girin..."
              style={{
                width: '100%',
                padding: '12px',
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#ddd',
                fontSize: '14px'
              }}
            />
          </div>
          <div style={{ minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#999' }}>
              📊 Sıralama
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#ddd',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="total">En Çok Kullanan</option>
              <option value="lastSeen">Son Görülme</option>
              <option value="ip">IP Adresi</option>
            </select>
          </div>
        </div>

        {/* IP Kayıtları Listesi */}
        <div style={{
          background: '#1a1a1a',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#4CAF50' }}>
            🌐 IP Kayıtları ({filteredIPs.length})
          </h3>
          {filteredIPs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredIPs.map((record, index) => (
                  <div key={index} style={{
                    padding: '20px',
                    background: '#2a2a2a',
                    borderRadius: '12px',
                    border: '1px solid #333'
                  }}>
                    {/* IP Başlığı */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid #444'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          background: index < 3 ? '#FFD700' : '#4CAF50',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: '#000'
                        }}>
                          {index + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '16px', fontFamily: 'monospace' }}>
                            {record.ip}
                          </div>
                          <div style={{ color: '#888', fontSize: '12px', marginTop: '2px' }}>
                            Son görülme: {formatDate(record.lastSeen)}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        background: '#4CAF50',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        {record.total} istek
                      </div>
                    </div>
                    
                    {/* İsim Listesi */}
                    <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>
                      Kullanılan isimler:
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                      gap: '8px'
                    }}>
                      {Object.entries(record.names)
                        .sort((a, b) => b[1] - a[1])
                        .map(([name, count], idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: '#1a1a1a',
                          borderRadius: '6px',
                          fontSize: '13px'
                        }}>
                          <span style={{ fontWeight: '500', color: '#ddd' }}>{name}</span>
                          <span style={{
                            background: '#333',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            color: '#4CAF50'
                          }}>
                            {count}×
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                <div style={{ fontSize: '16px' }}>Henüz IP kaydı yok</div>
                <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
                  Video indirmeleri otomatik olarak kaydedilecek
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Root'a mount et
const root = createRoot(document.getElementById('root'));
root.render(<StatsPage />);
