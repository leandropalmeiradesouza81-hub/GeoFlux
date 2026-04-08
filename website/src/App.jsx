import { useState, useEffect } from 'react';

// --- Sub-Component: App Simulator (Visual Proof) ---
function AppSimulator() {
  const [screen, setScreen] = useState('login');
  const [isCapturing, setIsCapturing] = useState(false);
  const [kilometers, setKilometers] = useState(124.5);
  const [balance, setBalance] = useState(12.45);

  useEffect(() => {
    let interval;
    if (isCapturing) {
      interval = setInterval(() => {
        setKilometers(k => k + 0.01);
        setBalance(b => b + 0.001);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCapturing]);

  return (
    <div className="phone-wrapper">
      <div className="phone-body">
        <div className="phone-screen">
          <div className="phone-header">
            <span>17:55</span>
            <div style={{display: 'flex', gap: '4px'}}>📶 🔋</div>
          </div>

          {screen === 'login' && (
            <div className="app-screen login-anim">
              <div className="app-logo">🌐</div>
              <h2>GeoFlux Driver</h2>
              <p>Rio de Janeiro</p>
              <div className="app-inputs">
                <input type="text" placeholder="E-mail" readOnly defaultValue="motorista@rio.com" />
                <input type="password" placeholder="Senha" readOnly defaultValue="••••••••" />
              </div>
              <button className="btn-app-primary" onClick={() => setScreen('map')}>ACESSAR PAINEL</button>
            </div>
          )}

          {screen === 'map' && (
            <div className="app-screen map-anim">
              <div className="map-interface">
                <div className="car-cursor">▲</div>
                {isCapturing && <div className="rec-indicator">GRAVANDO</div>}
              </div>
              <div className="map-stats">
                  <div className="map-pill"><span>SALDO</span><strong>R$ {balance.toFixed(2)}</strong></div>
                  <div className="map-pill"><span>DISTÂNCIA</span><strong>{kilometers.toFixed(2)} km</strong></div>
              </div>
              <div className="map-action">
                <button className={`btn-capture ${isCapturing ? 'active' : ''}`} onClick={() => setIsCapturing(!isCapturing)}>
                  {isCapturing ? 'Parar Coleta' : 'Iniciar Mapeamento'}
                </button>
                <div className="app-nav">
                  <span className="active">🗺️</span>
                  <span onClick={() => setScreen('wallet')}>💰</span>
                  <span>👤</span>
                </div>
              </div>
            </div>
          )}

          {screen === 'wallet' && (
            <div className="app-screen wallet-anim">
              <div className="wallet-header">
                 <h3>Minha Carteira</h3>
                 <div className="big-balance">R$ {balance.toFixed(2)}</div>
                 <p>{kilometers.toFixed(1)} km percorridos</p>
              </div>
              <div className="payout-area">
                 <div className="pix-key"><span>CHAVE PIX</span><strong>leandro***@geoflux.com</strong></div>
                 <button className="btn-app-secondary">SOLICITAR SAQUE</button>
              </div>
              <div className="app-nav">
                  <span onClick={() => setScreen('map')}>🗺️</span>
                  <span className="active">💰</span>
                  <span>👤</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main App Component ---
function App() {
  const [view, setView] = useState('landing'); // 'landing' or 'driver-app-access'

  if (view === 'driver-app-access') {
    return (
       <div className="access-page">
          <nav className="navbar glass">
            <div className="navbar-inner">
               <div className="navbar-logo" onClick={() => setView('landing')} style={{cursor: 'pointer'}}>
                  <div className="logo-icon">🌐</div>
                  <span className="text-gradient">GeoFlux</span>
               </div>
               <button className="btn btn-secondary" onClick={() => setView('landing')}>Voltar ao Site</button>
            </div>
          </nav>
          
          <div className="container center-content">
             <div className="access-card glass-premium">
                <div className="access-badge">Acesso Exclusivo</div>
                <h1>Área do Motorista</h1>
                <p>O GeoFlux funciona exclusivamente em dispositivos Android para garantir a precisão da telemetria e conexão com a câmera externa.</p>
                
                <div className="download-options">
                   <div className="option">
                      <div className="icon">📱</div>
                      <div>
                         <h3>Instalar App (APK)</h3>
                         <p>Versão estável v0.4.0 • Android 12+</p>
                      </div>
                      <button className="btn btn-primary">Baixar APK</button>
                   </div>
                   <div className="option">
                      <div className="icon">🔑</div>
                      <div>
                         <h3>Acesso Web (Preview)</h3>
                         <p>Visualize seu saldo e histórico via navegador.</p>
                      </div>
                      <button className="btn btn-secondary" onClick={() => window.location.href='http://localhost:5173'}>Abrir Dashboard</button>
                   </div>
                </div>
                
                <div className="hardware-note">
                   <strong>IMPORTANTE:</strong> Para validar seus KMs, sua <strong>Câmera Externa</strong> deve estar conectada ao Wi-Fi do smartphone durante toda a sessão.
                </div>
             </div>
          </div>
       </div>
    );
  }

  return (
    <>
      <div className="background-effects">
        <div className="blur-blob purple" />
        <div className="blur-blob cyan" />
        <div className="grid-overlay" />
      </div>

      <nav className="navbar glass">
        <div className="navbar-inner">
          <a href="#" className="navbar-logo">
            <div className="logo-icon">🌐</div>
            <span className="text-gradient">GeoF<span className="logo-f-container">lux<br/><i className="logo-maps-italic">Maps</i></span></span>
          </a>

          <ul className="navbar-links">
            <li><a href="#proposta">Proposta</a></li>
            <li><a href="#ganhos">Ganhos</a></li>
            <li><a href="#hardware">Equipamento</a></li>
          </ul>

          <div className="navbar-cta">
            <button className="btn btn-primary shadow-glow" onClick={() => setView('driver-app-access')}>Acesso Motorista</button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container split">
          <div className="hero-text-content">
            <div className="hero-tag">Mapeamento Viário Rio de Janeiro</div>
            <h1>Monetize seu trajeto diário <span className="highlight-alt">com precisão.</span></h1>
            <p>
              Transformamos motoristas em coletores de dados estratégicos. 
              Mapeie ruas, detecte anomalias e receba por quilômetro percorrido em áreas prioritárias.
            </p>
            <div className="hero-actions">
               <button className="btn btn-primary btn-lg" onClick={() => setView('driver-app-access')}>Começar a Ganhar</button>
               <div className="earnings-preview">
                  <strong>R$ 0,10 / km</strong>
                  <span>Áreas com &gt; 7 dias sem atualização</span>
               </div>
            </div>
          </div>
          
          <div className="hero-visual-content">
             <AppSimulator />
          </div>
        </div>
      </section>

      <section className="section" id="ganhos">
        <div className="container">
           <div className="section-header">
              <h2>Transparência nos <span className="highlight">Ganhos</span></h2>
              <p>O GeoFlux utiliza um algoritmo de frescor para manter o mapa do Rio de Janeiro sempre atualizado.</p>
           </div>
           
           <div className="feature-grid">
              <div className="feature-card glass-card">
                 <div className="feature-icon">📅</div>
                 <h3>Regra dos 7 Dias</h3>
                 <p>Cada vez que você passa por uma rua que não foi mapeada há mais de uma semana, o sistema valida seu ganho de <strong>R$ 0,10 por km</strong>.</p>
              </div>
              <div className="feature-card glass-card">
                 <div className="feature-icon">💸</div>
                 <h3>Saque PIX Instantâneo</h3>
                 <p>Sem tokens complicados. Seu saldo é em Reais e o saque cai direto na sua conta cadastrada.</p>
              </div>
              <div className="feature-card glass-card">
                 <div className="feature-icon">🛣️</div>
                 <h3>Áreas Prioritárias</h3>
                 <p>Consulte no mapa as zonas que precisam de atualização urgente e planeje sua rota para lucrar mais.</p>
              </div>
           </div>
        </div>
      </section>

      <section className="section" id="hardware">
         <div className="container hardware-flex">
            <div className="hardware-image glass-premium">
               <div className="cam-mock">📷</div>
               <div className="cam-signal">📡</div>
            </div>
            <div className="hardware-info">
               <div className="section-label">Equipamento</div>
               <h2>Câmera Externa & Sincronia</h2>
               <p>Para garantir a qualidade das imagens exigida por nossos parceiros corporativos, o GeoFlux utiliza uma câmera externa Wi-Fi (Dashcam).</p>
               <ul className="check-list">
                  <li>✅ Captura em ângulo aberto (140º)</li>
                  <li>✅ Sincronia automática via Wi-Fi Local</li>
                  <li>✅ Sensor G-Force para detecção de buracos</li>
                  <li>✅ Não consome o processamento do celular</li>
               </ul>
            </div>
         </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#" className="navbar-logo">
                <div className="logo-icon">🌐</div>
                <span className="text-gradient">GeoFlux</span>
              </a>
              <p>
                Plataforma DePIN de coleta de dados geoespaciais
                descentralizada para o Rio de Janeiro. Contribua
                com mapas globais e seja recompensado.
              </p>
            </div>

            <div className="footer-col">
              <h4>Produto</h4>
              <ul>
                <li><a href="#como-funciona">Como Funciona</a></li>
                <li><a href="#recompensas">Recompensas</a></li>
                <li><a href="#pipeline">Tecnologia</a></li>
                <li><a href="#download">Download</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Empresa</h4>
              <ul>
                <li><a href="#">Sobre</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Termos de Uso</a></li>
                <li><a href="#">Privacidade</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Suporte</h4>
              <ul>
                <li><a href="#faq">FAQ</a></li>
                <li><a href="#">Contato</a></li>
                <li><a href="https://discord.gg/" target="_blank" rel="noopener noreferrer">Discord Oficial</a></li>
                <li><a href="https://github.com/geoflux" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 GeoFlux Rio. Todos os direitos reservados.</span>
            <span>Powered by GeoFlux Infrastructure</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
