import React, { useState, useEffect } from 'react';

export default function AppSimulator() {
  const [screen, setScreen] = useState('login');
  const [isCapturing, setIsCapturing] = useState(false);
  const [kilometers, setKilometers] = useState(124.5);
  const [balance, setBalance] = useState(12.45);

  const simulateCapture = () => {
    if (isCapturing) {
      setKilometers(prev => prev + 0.01);
      setBalance(prev => prev + 0.001);
    }
  };

  useEffect(() => {
    const interval = setInterval(simulateCapture, 1000);
    return () => clearInterval(interval);
  }, [isCapturing]);

  return (
    <div className="phone-wrapper">
      <div className="phone-body">
        <div className="phone-screen">
          <div className="phone-header">
            <span className="time">17:42</span>
            <div className="status-icons">📶 🔋</div>
          </div>

          {screen === 'login' && (
            <div className="app-screen login">
              <div className="app-logo">🌐</div>
              <h2>GeoFlux Rio</h2>
              <p>Mapeie & Ganhe</p>
              
              <div className="app-input-group">
                <input type="email" placeholder="E-mail" defaultValue="motorista@uber.com" />
                <input type="password" placeholder="Senha" defaultValue="••••••••" />
              </div>
              
              <button className="app-btn-primary" onClick={() => setScreen('map')}>
                Entrar
              </button>
              <p className="app-footer-link">Esqueceu a senha?</p>
            </div>
          )}

          {screen === 'map' && (
            <div className="app-screen map-view">
              <div className="map-bg">
                <div className="car-indicator">▲</div>
                <div className="hex-grid"></div>
                {isCapturing && <div className="recording-dot">REC</div>}
              </div>

              <div className="map-overlay-top">
                <div className="stat-pill">
                  <span className="label">Saldo</span>
                  <span className="value">R$ {balance.toFixed(2)}</span>
                </div>
                <div className="stat-pill">
                  <span className="label">KM</span>
                  <span className="value">{kilometers.toFixed(2)}</span>
                </div>
              </div>

              <div className="map-controls">
                <button 
                  className={`app-btn-capture ${isCapturing ? 'active' : ''}`}
                  onClick={() => setIsCapturing(!isCapturing)}
                >
                  {isCapturing ? '🛑 Parar' : '🛰️ Iniciar'}
                </button>
                <div className="bottom-nav">
                  <div className="nav-icon active">🗺️</div>
                  <div className="nav-icon" onClick={() => setScreen('wallet')}>💰</div>
                  <div className="nav-icon">👤</div>
                </div>
              </div>
            </div>
          )}

          {screen === 'wallet' && (
            <div className="app-screen wallet-view">
              <div className="wallet-header">
                <h3>Minha Carteira</h3>
                <div className="total-balance">
                  <span className="curr">R$</span>
                  <span className="amt">{balance.toFixed(2)}</span>
                </div>
                <p>Equivalente a {kilometers.toFixed(1)} km válidos</p>
              </div>

              <div className="payout-card">
                <div className="pix-info">
                  <span className="label">Chave PIX cadastrada</span>
                  <span className="value">leandro***@geoflux.com</span>
                </div>
                <button className="app-btn-secondary">Solicitar Saque (PIX)</button>
              </div>

              <div className="recent-activity">
                <h4>Atividades Recentes</h4>
                <div className="activity-item">
                  <div className="activity-icon">🚗</div>
                  <div className="activity-info">
                    <p className="title">Sessão Rio Centro</p>
                    <p className="date">Hoje, 14:10 • 12.4 km</p>
                  </div>
                  <div className="activity-value text-success">+R$ 1.24</div>
                </div>
              </div>

              <div className="bottom-nav">
                  <div className="nav-icon" onClick={() => setScreen('map')}>🗺️</div>
                  <div className="nav-icon active">💰</div>
                  <div className="nav-icon">👤</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
