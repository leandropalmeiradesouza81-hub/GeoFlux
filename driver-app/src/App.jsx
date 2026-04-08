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

  // 1. CAMERA ACCESS (ULTRA-RESILIENT)
  useEffect(() => {
    async function setupCamera() {
      try {
        const constraints = [
          { video: { facingMode: { exact: 'environment' } }, audio: false },
          { video: { facingMode: 'environment' }, audio: false },
          { video: true, audio: false }
        ];

        let stream;
        for (const constraint of constraints) {
          try {
            stream = await navigator.mediaDevices.getUserMedia(constraint);
            if (stream) break;
          } catch (e) {
            console.warn("Constraint failed:", constraint);
          }
        }

        if (stream) {
          if (videoRef.current) videoRef.current.srcObject = stream;
          setCameraActive(true);
          setCameraError(null);
        } else {
          throw new Error("Não foi possível acessar nenhuma câmera.");
        }
      } catch (err) {
        setCameraError("Câmera bloqueada. Permita o acesso nas configurações do navegador.");
        setCameraActive(false);
      }
    }
    if (screen === 'map' || screen === 'login') setupCamera();
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

  // 3. FETCH REAL HIVEMAPPER ROAD DATA
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
    const interval = setInterval(fetchTiles, 30000); // 30s update
    return () => clearInterval(interval);
  }, [pos, screen]);

  // 4. CAPTURE & UPLOAD (FOR HONEY REWARDS)
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
          const frameData = canvas.toDataURL('image/webp', 0.6);

          const payload = {
            latitude: pos[0],
            longitude: pos[1],
            timestamp: new Date().toISOString(),
            image: frameData,
            precision: 1.0, // GPS Precision
            speed: 40 // Simulated speed
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
        alert("Câmera é obrigatória para ganhar recompensas!");
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
                <span>Saldo HONEY Acumulado</span>
                <h1>R$ {earnings.toFixed(2)}</h1>
                <p>Equivalente Digital • Pagamento Solana</p>
             </div>
             <button className="btn-withdraw">RESGATAR PARA PHANTOM</button>
          </div>
        );
      case 'map':
      default:
        return (
          <main className="app-fullscreen-map">
            {pos ? (
              <MapContainer center={pos} zoom={18} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer 
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
                  attribution="" 
                />
                <MapEventsHandler onManualControl={setIsManualMapControl} />

                {/* Pintura de Ruas Real (Hivemapper Pattern) */}
                {tiles.filter(t => t.status === 'stale').map((seg, idx) => (
                  <Polyline 
                    key={idx}
                    positions={seg.path}
                    pathOptions={{ 
                      color: '#00D4AA', 
                      weight: 15, 
                      opacity: 0.8,
                      lineCap: 'round',
                      className: 'reward-road-path'
                    }}
                  />
                ))}

                <Marker position={pos} icon={carIcon} />
                <MapRefresher center={pos} isManual={isManualMapControl} />
              </MapContainer>
            ) : (
              <div className="map-init-loader">Localizando GPS...</div>
            )}

            {isManualMapControl && (
              <button className="btn-recenter" onClick={() => setIsManualMapControl(false)}>
                <LocateFixed size={18} /> Centralizar
              </button>
            )}

            {/* Camera PIP HUD */}
            <div className={`camera-pip ${cameraActive ? 'active' : 'error'}`}>
               <video ref={videoRef} autoPlay playsInline muted />
               {!cameraActive && <AlertCircle size={20} />}
            </div>
            
            <div className="map-hud-stats">
               <div className="hud-card"><span>GANHO</span><strong style={{color: '#00D4AA'}}>R$ {earnings.toFixed(2)}</strong></div>
               <div className="hud-break"></div>
               <div className="hud-card"><span>DASHCAM</span><strong style={{color: cameraActive ? '#00D4AA' : '#FF5252'}}>{cameraActive ? 'WIFI-LINK' : 'OFFLINE'}</strong></div>
               <div className="hud-break"></div>
               <div className="hud-card"><span>COBERTURA</span><strong>{km.toFixed(2)} km</strong></div>
            </div>

            <div className="map-slider-area">
                {cameraError && <div className="cam-warning">{cameraError}</div>}
                <div className={`slider-track ${isCapturing ? 'active' : ''} ${!cameraActive ? 'disabled' : ''}`}>
                   <div className="slider-label">
                      {isCapturing ? 'DESLIZE PARA PARAR' : 'DESLIZE PARA GANHAR'}
                   </div>
                   <input type="range" min="0" max="100" value={sliderValue} 
                      onChange={handleSlider} onMouseUp={() => setSliderValue(0)} onTouchEnd={() => setSliderValue(0)}
                      className="slider-input" disabled={!cameraActive} />
                   <div className="slider-thumb" style={{ left: `${sliderValue}%` }}>
                      {isCapturing ? <Square size={20} fill="white" /> : <ChevronRightIcon size={24} />}
                   </div>
                </div>
            </div>

            {isCapturing && (
              <div className="status-recording">
                <div className="rec-dot"></div>
                <span>COLETANDO DADOS</span>
              </div>
            )}
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
             <h1>GeoF<span className="logo-f-container">lux<br/><i className="logo-maps-italic">Maps</i></span></h1>
             <p>DRIVER REWARDS</p>
          </div>
          
          <div className="login-inputs">
             <div className="input-group">
                <label>E-MAIL CADASTRADO</label>
                <input type="email" placeholder="motorista@geoflux.com.br" />
             </div>
             <div className="input-group">
                <label>SENHA DE ACESSO</label>
                <input type="password" placeholder="••••••••" />
             </div>
          </div>

          <button className="btn-login-gradient" onClick={() => setScreen('map')}>
             INICIAR PLANTÃO
          </button>
          
          <div className="login-footer">
             <span>Esqueceu a senha?</span>
             <span>Suporte 24h</span>
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
         <div className="nav-logo-right">
            GeoF<span className="logo-f-container">lux<br/><i className="logo-maps-italic">Maps</i></span>
         </div>
      </header>

      {renderContent()}

      {/* Side Menu */}
      <div className={`app-side-menu ${menuOpen ? 'open' : ''}`}>
         <div className="menu-backdrop" onClick={() => setMenuOpen(false)}></div>
         <div className="menu-content-glass">
            <header className="menu-header">
               <div className="user-profile">
                  <div className="u-avatar">LP</div>
                  <div className="u-meta"><h3>{screen === 'login' ? 'Login' : 'Leandro Palmeira'}</h3><span>Motorista Verificado #882</span></div>
               </div>
               <button className="btn-close-menu" onClick={() => setMenuOpen(false)}><X size={24} /></button>
            </header>
            <div className="menu-scroll-area">
               <div className="menu-balance-pill">
                  <span>GANHOS HOJE</span>
                  <strong>R$ {earnings.toFixed(2)}</strong>
               </div>
               <nav className="menu-nav-links">
                  <div className="menu-link-item" onClick={() => { setScreen('wallet'); setMenuOpen(false); }}>
                     <CreditCard size={20} /><span>Carteira Solana</span>
                  </div>
                  <div className="menu-link-item" onClick={() => { setScreen('history'); setMenuOpen(false); }}>
                     <History size={20} /><span>Minhas Rotas</span>
                  </div>
                  <div className="menu-link-item" onClick={() => setScreen('login')}><LogOut size={20} /><span>Sair</span></div>
               </nav>
               <section className="menu-audit-section">
                  <header><Zap size={14} /> HIvemapper AI LOG</header>
                  <div className="proof-list">
                     {lastDetections.map((d, i) => (
                        <div key={i} className="proof-item" style={{color: '#00D4AA'}}>Detectado: {d}</div>
                     ))}
                  </div>
               </section>
            </div>
         </div>
      </div>
    </div>
  );
}
