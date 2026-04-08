import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Wallet, User, Play, Square, Wifi, Navigation } from 'lucide-react';
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
  html: `<div class="car-marker">▲</div>`,
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

const getHexBounds = (lat, lon, r = 0.002) => {
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
  const [pos, setPos] = useState(null); // Will be set by Geolocation
  const [tiles, setTiles] = useState([]);

  // 1. REAL-TIME GEOLOCATION
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPos([latitude, longitude]);
      },
      (err) => console.error("Erro GPS:", err),
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 2. FETCH REAL TILES (using current window location to find backend)
  useEffect(() => {
    if (!pos || screen !== 'map') return;

    const fetchTiles = async () => {
      try {
        const host = window.location.hostname;
        const res = await fetch(`http://${host}:3001/api/v1/tiles/freshness?lat=${pos[0]}&lon=${pos[1]}`);
        const result = await res.json();
        if (result.success) {
          setTiles(result.data);
        }
      } catch (err) {
        console.error("Erro ao buscar tiles:", err);
      }
    };
    fetchTiles();
  }, [pos, screen]);

  // 3. CAPTURE LOGIC
  useEffect(() => {
    let interval;
    if (isCapturing) {
      interval = setInterval(() => {
        setKm(prev => prev + 0.005);
        setEarnings(prev => prev + (0.005 * 0.10));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCapturing]);

  if (screen === 'login') {
    return (
      <div className="app-container login-bg">
        <div className="login-content">
          <div className="logo-box">🌐</div>
          <h1>GeoFlux Driver</h1>
          <p>Mapeamento Viário Rio</p>
          <div className="input-group">
            <input type="email" placeholder="E-mail" defaultValue="leandro@geoflux.com" />
            <input type="password" placeholder="Senha" defaultValue="••••••••" />
          </div>
          <button className="btn-primary-app" onClick={() => setScreen('map')}>ACESSAR PAINEL</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container main-bg">
      <header className="app-header">
         <div className="user-info">
            <div className="avatar">LR</div>
            <div>
               <p className="welcome">Bem-vindo,</p>
               <p className="name">Leandro R.</p>
            </div>
         </div>
         <div className="cam-status-badge">
            <Wifi color="#00D4AA" size={16} />
            <span>Cam: OK</span>
         </div>
      </header>

      <main className="app-content">
        {screen === 'map' && (
          <div className="map-view">
             <div className="map-wrapper">
                {pos ? (
                  <MapContainer center={pos} zoom={15} zoomControl={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    
                    {tiles.map((tile, idx) => (
                      <Polygon 
                        key={idx}
                        positions={getHexBounds(tile.lat, tile.lon)}
                        pathOptions={{
                          fillColor: tile.color,
                          fillOpacity: 0.4,
                          color: tile.color,
                          weight: 1
                        }}
                      />
                    ))}

                    <Marker position={pos} icon={carIcon} />
                    <MapRefresher center={pos} />
                  </MapContainer>
                ) : (
                  <div className="map-loading">Obtendo GPS...</div>
                )}
                
                {isCapturing && (
                  <div className="rec-box">
                    <div className="blink-dot"></div> REC
                  </div>
                )}

                <div className="map-legend">
                   <div className="leg-item"><span style={{background: '#00D4AA'}}></span> R$ 0,10/km ({'>'}7 dias)</div>
                   <div className="leg-item"><span style={{background: '#FF9F43'}}></span> Sem Bônus (Atualizado)</div>
                </div>
             </div>
             
             <div className="live-stats">
                <div className="stat-box">
                   <span>GANHO (R$)</span>
                   <strong>{earnings.toFixed(2)}</strong>
                </div>
                <div className="stat-box">
                   <span>KM VÁLIDOS</span>
                   <strong>{km.toFixed(2)}</strong>
                </div>
             </div>

             <div className="control-center">
                <button className={`btn-action ${isCapturing ? 'stop' : 'start'}`} onClick={() => setIsCapturing(!isCapturing)}>
                  {isCapturing ? <Square size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                  {isCapturing ? 'PARAR COLETA' : 'INICIAR SESSÃO'}
                </button>
             </div>
          </div>
        )}
      </main>

      <nav className="app-bottom-nav">
        <div className={`nav-item ${screen === 'map' ? 'active' : ''}`} onClick={() => setScreen('map')}>
          <Navigation size={20} />
          <span>Mapa</span>
        </div>
        <div className={`nav-item ${screen === 'wallet' ? 'active' : ''}`} onClick={() => setScreen('wallet')}>
          <Wallet size={20} />
          <span>Carteira</span>
        </div>
        <div className={`nav-item ${screen === 'profile' ? 'active' : ''}`} onClick={() => setScreen('profile')}>
          <User size={20} />
          <span>Perfil</span>
        </div>
      </nav>
    </div>
  );
}
