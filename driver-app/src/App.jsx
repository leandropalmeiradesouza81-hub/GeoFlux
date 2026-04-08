import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Menu, X, Wallet, User, Play, Square, Wifi, Navigation, 
  Settings, LogOut, ChevronRight, Activity, Zap, ShieldCheck
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
  const [proofs, setProofs] = useState([]); // Solana/Hivemapper proofs

  // 1. GEOLOCATION with Simulator Fallback
  useEffect(() => {
    if (!navigator.geolocation) {
      setPos([-22.9719, -43.1843]); // Fallback Rio
      return;
    }

    const timer = setTimeout(() => {
      if (!pos) {
        console.warn("GPS demorando... ativando simulador para demonstração.");
        setPos([-22.9719, -43.1843]);
      }
    }, 5000);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPos([latitude, longitude]);
      },
      (err) => {
        console.error("GPS Error:", err);
        setPos([-22.9719, -43.1843]); // Ativa simulador se falhar (ex: HTTP s/ SSL)
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearTimeout(timer);
    };
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
      } catch (err) {
        console.error("Erro ao buscar tiles:", err);
      }
    };
    fetchTiles();
  }, [pos, screen]);

  // 3. CAPTURE LOGIC & PROOFS
  useEffect(() => {
    let interval;
    if (isCapturing) {
      interval = setInterval(() => {
        setKm(prev => prev + 0.008);
        setEarnings(prev => prev + (0.008 * 0.10));
        
        // Simular envio de Prova de Upload (Hash Solana)
        if (Math.random() > 0.7) {
           const newProof = {
              id: Math.random().toString(36).substr(2, 9),
              hash: 'SOL_' + Math.random().toString(16).substr(2, 12),
              time: new Date().toLocaleTimeString(),
              status: 'CONFIRMED'
           };
           setProofs(prev => [newProof, ...prev.slice(0, 4)]);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCapturing]);

  if (screen === 'login') {
    return (
      <div className="app-container login-bg">
        <div className="login-glass">
          <div className="logo-box">🌐</div>
          <h1>GeoFlux</h1>
          <p>Mapeamento de Alta Precisão</p>
          <div className="input-group">
            <input type="email" placeholder="Seu E-mail" defaultValue="leandro@geoflux.com" />
            <input type="password" placeholder="Sua Senha" defaultValue="••••••••" />
          </div>
          <button className="btn-primary-app" onClick={() => setScreen('map')}>ENTRAR</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container main-bg">
      {/* Top Navbar Minimalist */}
      <header className="app-navbar-translucent">
         <div className="nav-logo">GeoFlux</div>
         <button className="btn-icon-nav" onClick={() => setMenuOpen(true)}>
            <Menu size={28} />
         </button>
      </header>

      {/* Main Map Background */}
      <main className="app-fullscreen-map">
        {pos ? (
          <MapContainer center={pos} zoom={14} zoomControl={false} style={{ height: '100%', width: '100%' }}>
            {/* 99/Uber Style Map: Voyager */}
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            
            {tiles.filter(t => t.status === 'stale').map((tile, idx) => (
              <Polygon 
                key={idx}
                positions={getHexBounds(tile.lat, tile.lon, 0.002)}
                pathOptions={{
                  fillColor: '#00D4AA',
                  fillOpacity: 0.12,
                  color: '#00D4AA',
                  weight: 0,
                  className: 'heatmap-zone'
                }}
              />
            ))}

            <Marker position={pos} icon={carIcon} />
            <MapRefresher center={pos} />
          </MapContainer>
        ) : (
          <div className="map-init-loader">
             <Navigation className="spin" size={32} />
             <span>Sincronizando GPS...</span>
          </div>
        )}
        
        {/* Floating Recording Info Over Map */}
        {isCapturing && (
          <div className="map-overlay-status">
             <div className="pulse-dot"></div>
             <span>GRAVANDO SESSÃO</span>
          </div>
        )}

        {/* Start/Stop Floating Center-Bottom */}
        <div className="map-action-center">
            <button className={`btn-fab-main ${isCapturing ? 'active' : ''}`} onClick={() => setIsCapturing(!isCapturing)}>
               {isCapturing ? <Square size={32} fill="white" /> : <Play size={32} fill="white" />}
            </button>
            <p className="fab-hint">{isCapturing ? 'Parar Coleta' : 'Iniciar Mapeamento'}</p>
        </div>
      </main>

      {/* Side Menu / Sidebar Overlay */}
      <div className={`app-side-menu ${menuOpen ? 'open' : ''}`}>
         <div className="menu-backdrop" onClick={() => setMenuOpen(false)}></div>
         <div className="menu-content-glass">
            <header className="menu-header">
               <div className="user-profile">
                  <div className="u-avatar">LR</div>
                  <div className="u-meta">
                     <h3>Leandro Palmeira</h3>
                     <span>ID: #12942</span>
                  </div>
               </div>
               <button className="btn-close-menu" onClick={() => setMenuOpen(false)}>
                  <X size={24} />
               </button>
            </header>

            <div className="menu-scroll-area">
               {/* Stats Integrated into Menu */}
               <section className="menu-stats-grid">
                  <div className="menu-stat-card">
                     <span className="label">Saldo BRL (Estimado)</span>
                     <div className="value primary">R$ {earnings.toFixed(2)}</div>
                  </div>
                  <div className="menu-stat-card">
                     <span className="label">KM Coletados</span>
                     <div className="value">{(km).toFixed(1)} km</div>
                  </div>
               </section>

               {/* Audit / Proof Section for Trust */}
               <section className="menu-audit-section">
                  <header>
                     <ShieldCheck size={14} /> PROVAS DE UPLOAD (SOLANA)
                  </header>
                  <div className="proof-list">
                     {proofs.length > 0 ? proofs.map(p => (
                        <div key={p.id} className="proof-item">
                           <div className="p-hash">{p.hash}</div>
                           <div className="p-meta">
                              <span>{p.time}</span>
                              <span className="p-status">{p.status}</span>
                           </div>
                        </div>
                     )) : (
                        <p className="no-proofs">Nenhum upload ativo ainda.</p>
                     )}
                  </div>
               </section>

               <nav className="menu-nav-links">
                  <div className="menu-link-item">
                     <Wallet className="icon" size={20} />
                     <span>Minha Carteira</span>
                     <ChevronRight className="arrow" size={16} />
                  </div>
                  <div className="menu-link-item">
                     <Activity className="icon" size={20} />
                     <span>Registros de Histórico</span>
                     <ChevronRight className="arrow" size={16} />
                  </div>
                  <div className="menu-link-item">
                     <Zap className="icon" size={20} />
                     <span>Status da Câmera (Wi-Fi)</span>
                     <span className="status-badge green">CONECTADA</span>
                  </div>
                  <div className="menu-link-item">
                     <Settings className="icon" size={20} />
                     <span>Configurações</span>
                  </div>
               </nav>

               <div className="menu-footer">
                  <button className="btn-logout" onClick={() => setScreen('login')}>
                     <LogOut size={18} /> Sair da Conta
                  </button>
                  <p className="v-tag">GeoFlux v0.6.0-PRO</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
