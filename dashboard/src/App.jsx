import React, { useState } from 'react';
import { 
  Users, Activity, Wallet, Map, Camera, Settings, AlignLeft 
} from 'lucide-react';

import KYCPanel from './components/KYCPanel';
import FinancePanel from './components/FinancePanel';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  if (!isLoggedIn) {
     return (
       <div className="login-container">
          <div className="login-card">
             <div className="sidebar-logo" style={{justifyContent: 'center', marginBottom: '24px'}}>
                <Map color="#00D4AA" size={32} /> GeoFlux Admin
             </div>
             <p style={{textAlign: 'center', color: 'var(--text-muted)', marginBottom: '32px'}}>Console de Gestão Multi-Marketplace</p>
             <div className="form-group">
                <label>E-mail Corporativo</label>
                <input 
                  type="email" 
                  placeholder="admin@geoflux.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                />
             </div>
             <div className="form-group">
                <label>Senha de Acesso</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                />
             </div>
             <button 
               className="btn-login" 
               onClick={() => {
                 if (loginData.email && loginData.password) setIsLoggedIn(true);
               }}
             >
               Entrar no Console
             </button>
             <p className="login-footer">Acesso restrito a administradores GeoFlux</p>
          </div>
       </div>
     );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Map color="#00D4AA" /> GeoFlux Admin
        </div>
        <ul className="nav-menu">
          <li className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><Activity size={20} /> Dashboard</li>
          <li className={`nav-item ${activeTab === 'fleet' ? 'active' : ''}`} onClick={() => setActiveTab('fleet')}><Users size={20} /> Gestão da Frota</li>
          <li className={`nav-item ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}><Wallet size={20} /> Multi-market Receitas</li>
          <li className={`nav-item ${activeTab === 'validation' ? 'active' : ''}`} onClick={() => setActiveTab('validation')}><Camera size={20} /> Validação / KYC</li>
          <li className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}><Settings size={20} /> Configurações</li>
        </ul>
      </aside>

      {/* Main Content Workspace */}
      <main className="main-content">
        <header className="top-header">
          <div>
            <h2>Visão Geral do Despachante</h2>
            <p className="metric-sub">Multi-Marketplace Dispatcher Status</p>
          </div>
          <div className="header-actions">
            <span className="badge-status market-up">Servidor Operacional</span>
            <span className="badge-status">API BeeMaps Online</span>
            <span className="badge-status">API Mapillary Online</span>
          </div>
        </header>

        {activeTab === 'overview' && <OverviewPanel />}
        {activeTab === 'fleet' && <FleetPanel />}
        {activeTab === 'validation' && <KYCPanel />}
        {activeTab === 'finance' && <FinancePanel />}

      </main>
    </div>
  );
}

function OverviewPanel() {
  return (
    <>
      <div className="metrics-row">
        <div className="card">
          <div className="card-title">Lucro Líquido (Estimado)</div>
          <div className="metric-value primary">R$ 5.420,50</div>
          <div className="metric-sub text-success">↑ +12.4% essa semana</div>
        </div>
        <div className="card">
          <div className="card-title">Receita HONEY (Hivemapper)</div>
          <div className="metric-value honey">3,450.00</div>
          <div className="metric-sub">≈ R$ 4.100,00 USD-Peg</div>
        </div>
        <div className="card">
          <div className="card-title">Receita Mapillary (Licenciamento)</div>
          <div className="metric-value mapillary">$ 450.00 USD</div>
          <div className="metric-sub">≈ R$ 2.450,00 Convertido</div>
        </div>
      </div>

      <div className="metrics-row" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div className="card">
          <div className="card-title">Custo com a Frota (Payouts R$)</div>
          <div className="flex-between" style={{ marginBottom: "16px" }}>
            <span>KM Válidos Pagos:</span>
            <strong>11.295 km</strong>
          </div>
          <div className="metric-value" style={{ color: "#FF5252" }}>
            - R$ 1.129,50
          </div>
          <div className="metric-sub">Base: R$ 0,10/km (Áreas {'>'} 7 dias sem mapear)</div>
        </div>

        <div className="card">
          <div className="card-title">Status da Queue e Processamento Diário</div>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Marketplace</th>
                <th>Frames Processados</th>
                <th>Status da Fila</th>
                <th>Rejeição de GPS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Hivemapper (BeeMaps)</td>
                <td>84,192 img</td>
                <td><span className="status-pill approved">Zerada</span></td>
                <td>1.2% {'>'} 10m de erro</td>
              </tr>
              <tr>
                <td>Mapillary (EXIF)</td>
                <td>84,192 img</td>
                <td><span className="status-pill pending">1,241 em lote</span></td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function FleetPanel() {
  return (
    <div className="card">
      <div className="card-title">Gestão de Motoristas Ativos</div>
      <table className="modern-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>KM Minerador (Total)</th>
            <th>Receber BRL</th>
            <th>Contrato</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Leandro R.</td>
            <td>leandro@geoflux.test</td>
            <td>4,120 km</td>
            <td><strong>R$ 412,00</strong></td>
            <td><span className="status-pill approved">Aprovado (Verificado)</span></td>
          </tr>
          <tr>
            <td>Carlos M.</td>
            <td>carlos.uber@...</td>
            <td>1,420 km</td>
            <td><strong>R$ 142,00</strong></td>
            <td><span className="status-pill approved">Aprovado (Verificado)</span></td>
          </tr>
          <tr>
            <td>Mariana S.</td>
            <td>mary.drive@...</td>
            <td>32 km</td>
            <td><strong>R$ 0,00</strong></td>
            <td><span className="status-pill pending">Aguardando CNH</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
