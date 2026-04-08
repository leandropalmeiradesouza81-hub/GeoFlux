import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Database, Share2, Users, Map as MapIcon, 
  Settings, Activity, CheckCircle2, AlertCircle, Clock,
  Layers, Lock, ExternalLink, ShieldCheck, Zap
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('integrations');
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ honey: 1245.8, mapillary: 8522, natix: 450 });

  // Simular recebimento de dados em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      const newLog = {
        id: Math.random().toString(36).substr(2, 6).toUpperCase(),
        time: new Date().toLocaleTimeString(),
        driver: "Leandro P.",
        location: "Rio de Janeiro, RJ",
        status: "Ingested",
        platforms: {
          hivemapper: Math.random() > 0.1 ? 'success' : 'pending',
          mapillary: Math.random() > 0.2 ? 'success' : 'pending',
          natix: Math.random() > 0.3 ? 'success' : 'pending'
        }
      };
      setLogs(prev => [newLog, ...prev].slice(0, 10));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="logo-box">G</div>
          <span>GeoFlux Admin</span>
        </div>
        <nav className="admin-nav">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <BarChart3 size={20} /> Dashboard
          </button>
          <button className={activeTab === 'integrations' ? 'active' : ''} onClick={() => setActiveTab('integrations')}>
            <Share2 size={20} /> Multi-Relay
          </button>
          <button className={activeTab === 'map' ? 'active' : ''} onClick={() => setActiveTab('map')}>
            <MapIcon size={20} /> Mapa Global
          </button>
          <button className={activeTab === 'drivers' ? 'active' : ''} onClick={() => setActiveTab('drivers')}>
            <Users size={20} /> Gestão Frotas
          </button>
        </nav>
        <div className="sidebar-footer">
          <button><Settings size={18} /> Configurações</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-info">
             <h2>{activeTab.toUpperCase()}</h2>
             <span>Central de Processamento de Dados Geosensoriais</span>
          </div>
          <div className="system-status">
             <div className="status-pill online"><Activity size={14} /> BACKEND ONLINE</div>
          </div>
        </header>

        {activeTab === 'integrations' && (
          <div className="integrations-view">
             {/* Platform Cards */}
             <div className="platform-grid">
                <div className="platform-card hivemapper">
                   <div className="p-header">
                      <div className="p-logo">HM</div>
                      <h3>Hivemapper</h3>
                      <span className="p-badge solana">Solana / Honey</span>
                   </div>
                   <div className="p-stats">
                      <div className="s-item"><span>Total Relay</span><strong>54.2k frames</strong></div>
                      <div className="s-item"><span>Rewards</span><strong>{stats.honey} HONEY</strong></div>
                   </div>
                   <div className="p-config">
                      <p>Protocolo: ODC Metadados + ED25519 Signing</p>
                      <div className="status-indicator success">INTEGRADO</div>
                   </div>
                </div>

                <div className="platform-card mapillary">
                   <div className="p-header">
                      <div className="p-logo">M</div>
                      <h3>Mapillary</h3>
                      <span className="p-badge meta">Meta / OpenMap</span>
                   </div>
                   <div className="p-stats">
                      <div className="s-item"><span>Sequências</span><strong>128</strong></div>
                      <div className="s-item"><span>Uploads</span><strong>{stats.mapillary}</strong></div>
                   </div>
                   <div className="p-config">
                      <p>Protocolo: REST Ingestion v4 + Exif Bridge</p>
                      <div className="status-indicator success">CONECTADO</div>
                   </div>
                </div>

                <div className="platform-card natix">
                   <div className="p-header">
                      <div className="p-logo">N</div>
                      <h3>NATIX Network</h3>
                      <span className="p-badge deppin">Privacy-First</span>
                   </div>
                   <div className="p-stats">
                      <div className="s-item"><span>Privacy Points</span><strong>{stats.natix}</strong></div>
                      <div className="s-item"><span>Data Trust</span><strong>99.4%</strong></div>
                   </div>
                   <div className="p-config">
                      <p>Filtro: Privacy Obfuscation (Blur faces/plates)</p>
                      <div className="status-indicator active">PROCESSANDO</div>
                   </div>
                </div>
             </div>

             {/* Live Data Feed */}
             <section className="live-feed">
                <div className="section-header">
                   <h3><Zap size={18} /> Fluxo de Dados Multi-Injeção</h3>
                   <span className="live-pill">LIVE</span>
                </div>
                <div className="feed-table">
                   <div className="table-header">
                      <span>ID FRAME</span>
                      <span>MOTORISTA</span>
                      <span>LOCAL</span>
                      <span>STATUS HM</span>
                      <span>STATUS MPL</span>
                      <span>STATUS NTX</span>
                   </div>
                   <div className="table-rows">
                      {logs.map(log => (
                        <div key={log.id} className="table-row">
                           <span className="log-id">{log.id}</span>
                           <span>{log.driver}</span>
                           <span>{log.location}</span>
                           <span className={`status-icon ${log.platforms.hivemapper}`}><CheckCircle2 size={16} /></span>
                           <span className={`status-icon ${log.platforms.mapillary}`}><CheckCircle2 size={16} /></span>
                           <span className={`status-icon ${log.platforms.natix}`}><Clock size={16} /></span>
                        </div>
                      ))}
                   </div>
                </div>
             </section>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="admin-map-container">
             <MapContainer center={[-22.9719, -43.1843]} zoom={12} style={{ height: 'calc(100vh - 120px)', borderRadius: '24px' }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <Marker position={[-22.9719, -43.1843]}>
                   <Popup>Motorista Leandro P. <br /> Status: Ativo (HIVEMAPPER TARGET)</Popup>
                </Marker>
             </MapContainer>
          </div>
        )}
      </main>
    </div>
  );
}
