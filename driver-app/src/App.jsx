import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  Menu, X, Wallet, User, Play, Square, Wifi, Navigation, 
  Settings, LogOut, ChevronRight, Activity, Zap, ShieldCheck,
  ChevronRightIcon, Camera, CreditCard, History, AlertCircle,
  LocateFixed
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

function MapEventsHandler({ onManualControl }) {
  useMapEvents({
    dragstart: () => onManualControl(true),
    zoomstart: () => onManualControl(true),
  });
  return null;
}

function MapRefresher({ center, isManual }) {
  const map = useMap();
  useEffect(() => { 
    if (center && !isManual) {
      map.setView(center, map.getZoom()); 
    }
  }, [center, map, isManual]);
  return null;
}

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
  const [isManualMapControl, setIsManualMapControl] = useState(false);
  const [lastDetections, setLastDetections] = useState([]);
  const videoRef = useRef(null);

  // 1. CAMERA ACCESS
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
        setCameraError("Câmera não detectada.");
        setCameraActive(false);
      }
    }
    if (screen === 'map') setupCamera();
  }, [screen]);

  // 2. GEOLOCATION
  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) => setPos([position.coords.latitude, position.coords.longitude]),
      (err) => { if (!pos) setPos([-22.9719, -43.1843]); },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 3. FETCH TILES (SEGMENTS)
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

  // 4. CAPTURE LOGIC & AI UPLOAD (5 seconds)
  useEffect(() => {
    let interval;
    if (isCapturing && cameraActive) {
      interval = setInterval(async () => {
        setKm(prev => prev + 0.012);
        setEarnings(prev => prev + (0.012 * 0.10));

        if (videoRef.current && pos) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(videoRef.current, 0, 0);
          const frameData = canvas.toDataURL('image/webp', 0.5);

          const payload = {
            latitude: pos[0],
            longitude: pos[1],
            timestamp: new Date().toISOString(),
            image: frameData
          };

          try {
            const host = window.location.hostname;
            const res = await fetch(`http://${host}:3001/api/v1/frames/upload`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            const result = await res.json();
            
            if (result.success && result.detections) {
              setLastDetections(prev => [...result.detections, ...prev].slice(0, 3));
              setProofs(prev => [{
                id: Math.random().toString(36).substr(2, 5),
                hash: 'AI_DET_' + result.frameId.substr(0, 6).toUpperCase(),
                time: new Date().toLocaleTimeString(),
                status: 'UPLOADED'
              }, ...prev.slice(0, 3)]);
            }
          } catch (err) {}
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isCapturing, cameraActive, pos]);

  const handleSlider = (e) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
    if (val > 80) {
      if (!cameraActive) {
        alert("Câmera obrigatória!");
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
                <span>Saldo Disponível</span>
                <h1>R$ {earnings.toFixed(2)}</h1>
                <p>Pagamentos diários automáticos</p>
             </div>
             <button className="btn-withdraw">SAQUE PIX AGORA</button>
          </div>
        );
      case 'history':
        return (
          <div className="sub-screen">
             <header className="sub-header">
                <button onClick={() => setScreen('map')}><ChevronRight style={{transform: 'rotate(180deg)'}} /></button>
                <h2>Histórico de Coleta</h2>
                <div />
             </header>
             <div className="history-list">
                <div className="hist-item">
                   <Navigation size={20} />
                   <div className="hist-meta">
                      <strong>Rio de Janeiro - Região Central</strong>
                      <span>{km.toFixed(1)} km hoje • R$ {earnings.toFixed(2)}</span>
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
              <MapContainer center={pos} zoom={18} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                <MapEventsHandler onManualControl={setIsManualMapControl} />

                {/* Road Painting - Caminhos liberados para ganho (Hivmapper Style) */}
                {tiles.filter(t => t.status === 'stale').map((seg, idx) => (
                  <Polyline 
                    key={idx}
                    positions={seg.path}
                    pathOptions={{ 
                      color: '#00D4AA', 
                      weight: 12, 
                      opacity: 0.7,
                      lineCap: 'round',
                      className: 'reward-road-path'
                    }}
                  />
                ))}

                <Marker position={pos} icon={carIcon} />
                <MapRefresher center={pos} isManual={isManualMapControl} />
              </MapContainer>
            ) : (
              <div className="map-init-loader">Localizando...</div>
            )}

            {isManualMapControl && (
              <button className="btn-recenter" onClick={() => setIsManualMapControl(false)}>
                <LocateFixed size={20} /> Centralizar
              </button>
            )}

            <div className={`camera-pip ${cameraActive ? 'active' : 'error'}`}>
               <video ref={videoRef} autoPlay playsInline muted />
               {!cameraActive && <AlertCircle size={20} />}
            </div>
            
            <div className="map-hud-stats">
               <div className="hud-card"><span>GANHO</span><strong>R$ {earnings.toFixed(2)}</strong></div>
               <div className="hud-break"></div>
               <div className="hud-card"><span>KM VÁLIDO</span><strong>{(km).toFixed(2)} km</strong></div>
               <div className="hud-break"></div>
               <div className="hud-card"><span>IA DET</span><strong>{lastDetections.length > 0 ? lastDetections[0] : 'Idle'}</strong></div>
            </div>

            <div className="map-slider-area">
                {!cameraActive && <div className="cam-warning">Câmera necessária para monitorar</div>}
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
      <div className="app-container login-screen-premium">
        <div className="login-overlay"></div>
        <div className="login-form-container">
          <div className="login-brand">
             <div className="brand-logo-glow">G</div>
             <h1>GeoFlux</h1>
             <p>DRIVER PLATFORM</p>
          </div>
          
          <div className="login-inputs">
             <div className="input-group">
                <label>E-MAIL DO MOTORISTA</label>
                <input type="email" placeholder="ex: leandro@geoflux.com.br" />
             </div>
             <div className="input-group">
                <label>SENHA DE ACESSO</label>
                <input type="password" placeholder="••••••••" />
             </div>
          </div>

          <button className="btn-login-gradient" onClick={() => setScreen('map')}>
             ENTRAR NO SISTEMA
          </button>
          
          <div className="login-footer">
             <span>Esqueceu a senha?</span>
             <span>Suporte GeoFlux</span>
          </div>
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

      <div className={`app-side-menu ${menuOpen ? 'open' : ''}`}>
         <div className="menu-backdrop" onClick={() => setMenuOpen(false)}></div>
         <div className="menu-content-glass">
            <header className="menu-header">
               <div className="user-profile">
                  <div className="u-avatar">LP</div>
                  <div className="u-meta"><h3>Leandro Palmeira</h3><span>Motorista • Rio</span></div>
               </div>
               <button className="btn-close-menu" onClick={() => setMenuOpen(false)}><X size={24} /></button>
            </header>
            <div className="menu-scroll-area">
               <div className="menu-balance-pill">
                  <span>SALDO ACUMULADO</span>
                  <strong>R$ {earnings.toFixed(2)}</strong>
               </div>
               <nav className="menu-nav-links">
                  <div className="menu-link-item" onClick={() => { setScreen('wallet'); setMenuOpen(false); }}>
                     <CreditCard size={20} /><span>Carteira & Saques</span>
                  </div>
                  <div className="menu-link-item" onClick={() => { setScreen('history'); setMenuOpen(false); }}>
                     <History size={20} /><span>Histórico de Coleta</span>
                  </div>
                  <div className="menu-link-item" onClick={() => setScreen('login')}><LogOut size={20} /><span>Sair</span></div>
               </nav>
               <section className="menu-audit-section">
                  <header>INTELIGÊNCIA ARTIFICIAL (LOG)</header>
                  <div className="proof-list">
                     {lastDetections.map((d, i) => (
                        <div key={i} className="proof-item" style={{color: '#00D4AA'}}>Detectado: {d}</div>
                     ))}
                     {proofs.map(p => (
                        <div key={p.id} className="proof-item">{p.hash} • {p.time}</div>
                     ))}
                  </div>
               </section>
            </div>
         </div>
      </div>
    </div>
  );
}
