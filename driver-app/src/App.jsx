import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Menu, X, Wallet, User, Play, Square, Wifi, Navigation, 
  Settings, LogOut, ChevronRight, Activity, Zap, ShieldCheck,
  ChevronRightIcon, Camera, CreditCard, History, AlertCircle
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const carIcon = new L.DivIcon({
  className: 'car-icon-container',
  html: `<div class="car-marker-core">▲</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function MapRefresher({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

const getHexBounds = (lat, lon, r = 0.0022) => {
  const bounds = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + (Math.PI / 6);
    bounds.push([lat + r * Math.sin(angle), lon + (r / Math.cos(lat * Math.PI / 180)) * Math.cos(angle)]);
  }
  return bounds;
};

export default function App() {
  const [screen, setScreen] = useState('login');
  const [isCapturing, setIsCapturing] = useState(false);
  const [km, setKm] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [pos, setPos] = useState(null);
  const [tiles, setTiles] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [proofs, setProofs] = useState([]);
  const [sliderValue, setSliderValue] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);

  // 1. CAMERA ACCESS (Required for functioning)
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError("Câmera não detectada. O mapeamento requer uma câmera ativa.");
        setCameraActive(false);
      }
    }
    if (screen === 'map') setupCamera();
  }, [screen]);

  // 2. GEOLOCATION (No auto-fallback to simulation unless camera is active)
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => setPos([position.coords.latitude, position.coords.longitude]),
      (err) => setPos([-22.9719, -43.1843]), // Fallback coordinates but app will block if no camera
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 3. FETCH TILES
  useEffect(() => {
    if (!pos || screen !== 'map') return;
    const fetchTiles = async () => {
      try {
        const host = window.location.hostname;
        const res = await fetch(`http://${host}:3001/api/v1/tiles/freshness?lat=${pos[0]}&lon=${pos[1]}`);
        const result = await res.json();
        if (result.success) setTiles(result.data);
      } catch (err) {}
    };
    fetchTiles();
  }, [pos, screen]);

  // 4. CAPTURE LOGIC
  useEffect(() => {
    let interval;
    if (isCapturing && cameraActive) {
      interval = setInterval(() => {
        setKm(prev => prev + 0.008);
        setEarnings(prev => prev + (0.008 * 0.10));
        if (Math.random() > 0.8) {
           setProofs(prev => [{
              id: Math.random().toString(36).substr(2, 5),
              hash: 'SOL_' + Math.random().toString(16).substr(2, 8),
              time: new Date().toLocaleTimeString(),
              status: 'OK'
           }, ...prev.slice(0, 3)]);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCapturing, cameraActive]);

  const handleSlider = (e) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
    if (val > 80) {
      if (!cameraActive) {
        alert("Erro: Câmera obrigatória para iniciar mapeamento!");
        setSliderValue(0);
        return;
      }
      setIsCapturing(!isCapturing);
      setSliderValue(0);
    }
  };

  const renderContent = () => {
    switch (screen) {
      case 'wallet':
        return (
          <div className="sub-screen">
             <header className="sub-header">
                <button onClick={() => setScreen('map')}><ChevronRight style={{transform: 'rotate(180deg)'}} /></button>
                <h2>Minha Carteira</h2>
                <div />
             </header>
             <div className="wallet-card">
                <span>Saldo Disponível (PIX)</span>
                <h1>R$ {earnings.toFixed(2)}</h1>
                <p>Transferências instantâneas via frotistas</p>
             </div>
             <div className="wallet-actions">
                <button className="btn-withdraw">SOLICITAR SAQUE PIX</button>
             </div>
             <div className="transactions-list">
                <h3>Atividade Recente</h3>
                <div className="trx-item">
                   <div className="trx-info">
                      <strong>Mapeamento Regional</strong>
                      <span>8 de Abr, 2026 - Rio</span>
                   </div>
                   <div className="trx-val">+ R$ {earnings.toFixed(2)}</div>
                </div>
             </div>
          </div>
        );
      case 'history':
        return (
          <div className="sub-screen">
             <header className="sub-header">
                <button onClick={() => setScreen('map')}><ChevronRight style={{transform: 'rotate(180deg)'}} /></button>
                <h2>Histórico de Rotas</h2>
                <div />
             </header>
             <div className="history-list">
                <div className="hist-item">
                   <Navigation size={20} />
                   <div className="hist-meta">
                      <strong>Barra da Tijuca - Sul</strong>
                      <span>12.4 km coletados • R$ 1.24</span>
                   </div>
                </div>
                <div className="hist-item">
                   <Navigation size={20} />
                   <div className="hist-meta">
                      <strong>Copacabana - Orla</strong>
                      <span>5.8 km coletados • R$ 0.58</span>
                   </div>
                </div>
             </div>
          </div>
        );
      case 'map':
      default:
        return (
          <main className="app-fullscreen-map">
            {pos ? (
              <MapContainer center={pos} zoom={14} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                {tiles.filter(t => t.status === 'stale').map((tile, idx) => (
                  <Polygon 
                    key={idx}
                    positions={getHexBounds(tile.lat, tile.lon, 0.002)}
                    pathOptions={{ fillColor: '#00D4AA', fillOpacity: 0.1, color: '#00D4AA', weight: 0, className: 'heatmap-zone' }}
                  />
                ))}
                <Marker position={pos} icon={carIcon} />
                <MapRefresher center={pos} />
              </MapContainer>
            ) : (
              <div className="map-init-loader">Obtendo Posicionamento...</div>
            )}

            {/* Camera Preview PIP */}
            <div className={`camera-pip ${cameraActive ? 'active' : 'error'}`}>
               <video ref={videoRef} autoPlay playsInline muted />
               {!cameraActive && <AlertCircle size={20} />}
            </div>
            
            <div className="map-hud-stats">
               <div className="hud-card"><span>SALDO</span><strong>R$ {earnings.toFixed(2)}</strong></div>
               <div className="hud-break"></div>
               <div className="hud-card"><span>KM TOTAL</span><strong>{(km).toFixed(2)} km</strong></div>
               <div className="hud-break"></div>
               <div className="hud-card"><span>CAMERA</span><strong style={{color: cameraActive ? 'green' : 'red'}}>{cameraActive ? 'OK' : 'OFF'}</strong></div>
            </div>

            <div className="map-slider-area">
                {!cameraActive && <div className="cam-warning">Conecte a câmera para iniciar</div>}
                <div className={`slider-track ${isCapturing ? 'active' : ''} ${!cameraActive ? 'disabled' : ''}`}>
                   <div className="slider-label">
                      {isCapturing ? 'DESLIZE PARA PARAR' : 'DESLIZE PARA INICIAR'}
                   </div>
                   <input type="range" min="0" max="100" value={sliderValue} 
                      onChange={handleSlider} onMouseUp={() => setSliderValue(0)} onTouchEnd={() => setSliderValue(0)}
                      className="slider-input" disabled={!cameraActive} />
                   <div className="slider-thumb" style={{ left: `${sliderValue}%` }}>
                      {isCapturing ? <Square size={20} fill="white" /> : <ChevronRightIcon size={24} />}
                   </div>
                </div>
            </div>

            {isCapturing && <div className="rec-indicator-dot"></div>}
          </main>
        );
    }
  };

  if (screen === 'login') {
    return (
      <div className="app-container login-bg">
        <div className="login-glass">
          <h1>GeoFlux</h1>
          <p>Driver Hub • Mapeamento 0,10/km</p>
          <button className="btn-primary-app" onClick={() => setScreen('map')}>ACESSAR SISTEMA</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container main-bg">
      <header className="app-navbar-minimal">
         <button className="btn-hamburger" onClick={() => setMenuOpen(true)}>
            <Menu size={26} strokeWidth={2.5} />
         </button>
         <div className="nav-logo-right">GeoFlux</div>
      </header>

      {renderContent()}

      {/* Side Menu */}
      <div className={`app-side-menu ${menuOpen ? 'open' : ''}`}>
         <div className="menu-backdrop" onClick={() => setMenuOpen(false)}></div>
         <div className="menu-content-glass">
            <header className="menu-header">
               <div className="user-profile">
                  <div className="u-avatar">LR</div>
                  <div className="u-meta"><h3>Leandro P.</h3><span>Status: Motorista Nível 1</span></div>
               </div>
               <button className="btn-close-menu" onClick={() => setMenuOpen(false)}><X size={24} /></button>
            </header>
            <div className="menu-scroll-area">
               <div className="menu-balance-pill">
                  <span>SALDO ATUAL</span>
                  <strong>R$ {earnings.toFixed(2)}</strong>
               </div>
               <nav className="menu-nav-links">
                  <div className="menu-link-item" onClick={() => { setScreen('wallet'); setMenuOpen(false); }}>
                     <CreditCard size={20} /><span>Carteira & Saques</span>
                  </div>
                  <div className="menu-link-item" onClick={() => { setScreen('history'); setMenuOpen(false); }}>
                     <History size={20} /><span>Histórico de Coleta</span>
                  </div>
                  <div className="menu-link-item"><Activity size={20} /><span>Ranking Regional</span></div>
                  <div className="menu-link-item"><Settings size={20} /><span>Configurações</span></div>
                  <div className="menu-link-item" onClick={() => setScreen('login')}><LogOut size={20} /><span>Finalizar Plantão</span></div>
               </nav>
               <section className="menu-audit-section">
                  <header><ShieldCheck size={14} /> PROVAS HIVE / SOL</header>
                  <div className="proof-list">
                     {proofs.map(p => (
                        <div key={p.id} className="proof-item">{p.hash} • {p.time} • {p.status}</div>
                     ))}
                  </div>
               </section>
            </div>
         </div>
      </div>
    </div>
  );
}
