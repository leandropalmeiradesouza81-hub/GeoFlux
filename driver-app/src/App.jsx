import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Menu, X, Wallet, User, Play, Square, Wifi, Navigation, 
  Settings, LogOut, ChevronRight, Activity, Zap, ShieldCheck,
  ChevronRightIcon
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
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const getHexBounds = (lat, lon, r = 0.0022) => {
  const bounds = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + (Math.PI / 6);
    bounds.push([
      lat + r * Math.sin(angle),
      lon + (r / Math.cos(lat * Math.PI / 180)) * Math.cos(angle)
    ]);
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

  // 1. GEOLOCATION with Simulator Fallback
  useEffect(() => {
    if (!navigator.geolocation) {
      setPos([-22.9719, -43.1843]);
      return;
    }
    const timer = setTimeout(() => { if (!pos) setPos([-22.9719, -43.1843]); }, 5000);
    const watchId = navigator.geolocation.watchPosition(
      (position) => setPos([position.coords.latitude, position.coords.longitude]),
      (err) => setPos([-22.9719, -43.1843]),
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    return () => { navigator.geolocation.clearWatch(watchId); clearTimeout(timer); };
  }, []);

  // 2. FETCH TILES
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

  // 3. CAPTURE LOGIC
  useEffect(() => {
    let interval;
    if (isCapturing) {
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
  }, [isCapturing]);

  const handleSlider = (e) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);
    if (val > 80) {
      setIsCapturing(!isCapturing);
      setSliderValue(0);
    }
  };

  if (screen === 'login') {
    return (
      <div className="app-container login-bg">
        <div className="login-glass">
          <h1>GeoFlux</h1>
          <p>Plataforma de Mapeamento</p>
          <button className="btn-primary-app" onClick={() => setScreen('map')}>ENTRAR NO MAPA</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container main-bg">
      {/* Navbar Translucida Swapped */}
      <header className="app-navbar-minimal">
         <button className="btn-hamburger" onClick={() => setMenuOpen(true)}>
            <Menu size={26} strokeWidth={2.5} />
         </button>
         <div className="nav-logo-right">GeoFlux</div>
      </header>

      {/* Main Map Background */}
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
          <div className="map-init-loader">Sincronizando...</div>
        )}
        
        {/* HUD Stats Overlay Top Discreet */}
        <div className="map-hud-stats">
           <div className="hud-card">
              <span>GANHO</span>
              <strong>R$ {earnings.toFixed(2)}</strong>
           </div>
           <div className="hud-break"></div>
           <div className="hud-card">
              <span>KM VÁLIDO</span>
              <strong>{(km).toFixed(2)} km</strong>
           </div>
           <div className="hud-break"></div>
           <div className="hud-card">
              <span>MAPA</span>
              <strong>12%</strong>
           </div>
        </div>

        {/* Start/Stop SLIDER Center-Bottom */}
        <div className="map-slider-area">
            <div className={`slider-track ${isCapturing ? 'active' : ''}`}>
               <div className="slider-label">
                  {isCapturing ? 'DESLIZE PARA PARAR' : 'DESLIZE PARA INICIAR'}
               </div>
               <input 
                  type="range" 
                  min="0" max="100" 
                  value={sliderValue} 
                  onChange={handleSlider}
                  onMouseUp={() => setSliderValue(0)}
                  onTouchEnd={() => setSliderValue(0)}
                  className="slider-input" 
               />
               <div className="slider-thumb" style={{ left: `${sliderValue}%` }}>
                  {isCapturing ? <Square size={20} fill="white" /> : <ChevronRightIcon size={24} />}
               </div>
            </div>
        </div>

        {isCapturing && <div className="rec-indicator-dot"></div>}
      </main>

      {/* Side Menu */}
      <div className={`app-side-menu ${menuOpen ? 'open' : ''}`}>
         <div className="menu-backdrop" onClick={() => setMenuOpen(false)}></div>
         <div className="menu-content-glass">
            <header className="menu-header">
               <div className="user-profile">
                  <div className="u-avatar">LR</div>
                  <div className="u-meta">
                     <h3>Leandro Palmeira</h3>
                     <span>Ativo: {km.toFixed(1)} km</span>
                  </div>
               </div>
               <button className="btn-close-menu" onClick={() => setMenuOpen(false)}><X size={24} /></button>
            </header>
            <div className="menu-scroll-area">
               <section className="menu-audit-section">
                  <header><ShieldCheck size={14} /> PROVAS DE UPLOAD</header>
                  <div className="proof-list">
                     {proofs.map(p => (
                        <div key={p.id} className="proof-item">
                           <div className="p-hash">{p.hash}</div>
                           <div className="p-meta"><span>{p.time}</span><span className="p-status">{p.status}</span></div>
                        </div>
                     ))}
                  </div>
               </section>
               <nav className="menu-nav-links">
                  <div className="menu-link-item"><Wallet size={20} /><span>Carteira & Saques</span></div>
                  <div className="menu-link-item"><Activity size={20} /><span>Histórico de Rotas</span></div>
                  <div className="menu-link-item" onClick={() => setScreen('login')}><LogOut size={20} /><span>Sair</span></div>
               </nav>
            </div>
         </div>
      </div>
    </div>
  );
}
