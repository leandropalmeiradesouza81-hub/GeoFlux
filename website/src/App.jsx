import { useState } from 'react';

function App() {
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Preciso comprar algum equipamento especial?',
      a: 'Não! O GeoFlux funciona 100% com o seu smartphone. Basta instalar o app, posicionar o celular no suporte do carro e começar a dirigir. Sem custos de hardware.'
    },
    {
      q: 'Como funciona o pagamento?',
      a: 'Você recebe R$ 0,10 fixo por KM válido percorrido em áreas que precisam de mapeamento. O desempenho do motorista e a qualidade das imagens são validados pelos administradores no nosso painel. Quando validados, o saldo é atualizado automaticamente.'
    },
    {
      q: 'O que é HONEY e como a plataforma ganha dinheiro?',
      a: 'HONEY é o token da rede Hivemapper na blockchain Solana. Quando seus dados são aceitos pela rede, a plataforma GeoFlux recebe tokens HONEY como recompensa. O GeoFlux converte esses tokens em Reais e paga você um valor fixo por KM, assumindo o risco da volatilidade.'
    },
    {
      q: 'Posso usar enquanto dirijo para Uber/99?',
      a: 'Sim! O app funciona em segundo plano. Você inicia uma sessão de captura, posiciona o celular e pode alternar para o app da Uber, 99 ou qualquer outro. O GeoFlux continua capturando automaticamente.'
    },
    {
      q: 'Os dados coletados são seguros e respeitam a privacidade?',
      a: 'Sim. Todas as imagens passam por um processamento de privacidade no nosso servidor que desfoca automaticamente rostos e placas de veículos antes de enviar para a rede de mapeamento. Seus dados pessoais nunca são compartilhados.'
    },
    {
      q: 'Quando o upload dos dados acontece?',
      a: 'Os dados são armazenados localmente no celular durante o dia. Ao final do dia, quando você conectar ao Wi-Fi, o app sincroniza automaticamente tudo com nosso servidor. Sem gastar seus dados móveis.'
    },
    {
      q: 'Preciso de internet o tempo todo?',
      a: 'Não. O app captura os dados offline usando apenas GPS e câmera. A internet só é necessária no momento do upload via Wi-Fi, geralmente quando você chega em casa.'
    }
  ];

  return (
    <>
      {/* Background Effects */}
      <div className="bg-grid" />
      <div className="bg-glow-1" />
      <div className="bg-glow-2" />

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="#" className="navbar-logo">
            <div className="logo-icon">🌐</div>
            <span className="text-gradient">GeoFlux</span>
          </a>

          <ul className="navbar-links">
            <li><a href="#como-funciona">Como Funciona</a></li>
            <li><a href="#beneficios">Benefícios</a></li>
            <li><a href="#recompensas">Recompensas</a></li>
            <li><a href="#pipeline">Tecnologia</a></li>
            <li><a href="#faq">FAQ</a></li>
          </ul>

          <div className="navbar-cta">
            <a href="#download" className="btn btn-secondary" id="nav-login-btn">Entrar</a>
            <a href="#download" className="btn btn-primary" id="nav-download-btn">Baixar App</a>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
            ☰
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" id="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="dot" />
              Rede ativa no Rio de Janeiro
            </div>

            <h1>
              Mapeie o Rio.{' '}
              <span className="highlight">Ganhe Recompensas.</span>
            </h1>

            <p>
              Transforme seu smartphone em uma ferramenta de mapeamento.
              Dirija normalmente, capture imagens das ruas em segundo plano
              e ganhe dinheiro contribuindo para mapas globais descentralizados.
            </p>

            <div className="hero-buttons">
              <a href="#download" className="btn btn-primary btn-lg" id="hero-download-btn">
                📱 Baixar o App Grátis
              </a>
              <a href="#como-funciona" className="btn btn-secondary btn-lg" id="hero-learn-btn">
                Saiba Mais →
              </a>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <div className="number">R$ 0,10</div>
                <div className="label">por KM válido</div>
              </div>
              <div className="hero-stat">
                <div className="number">0</div>
                <div className="label">custo de hardware</div>
              </div>
              <div className="hero-stat">
                <div className="number">24/7</div>
                <div className="label">captura em segundo plano</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-globe" />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section" id="como-funciona">
        <div className="container">
          <div className="section-header">
            <div className="section-label">📋 Passo a Passo</div>
            <h2 className="section-title">Como Funciona</h2>
            <p className="section-subtitle">
              Em 4 passos simples, comece a ganhar dinheiro mapeando o Rio de Janeiro
              apenas com seu smartphone.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Instale o App</h3>
              <p>
                Baixe o GeoFlux na Play Store e crie sua conta em menos de 2 minutos.
                Não precisa de equipamento especial — só seu celular.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Posicione e Inicie</h3>
              <p>
                Coloque o celular no suporte do carro com a câmera voltada para a rua.
                Toque em "Iniciar" e minimize o app. Pronto, pode dirigir normalmente.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Dirija e Mapeie</h3>
              <p>
                O app captura imagens e dados de GPS em segundo plano automaticamente.
                Use Uber, 99 ou qualquer app enquanto mapeia. Sem interferência.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Sincronize e Ganhe</h3>
              <p>
                Ao conectar no Wi-Fi, os dados são enviados automaticamente.
                Após validação, seu saldo é atualizado. Simples assim.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section" id="beneficios">
        <div className="container">
          <div className="section-header">
            <div className="section-label">✨ Vantagens</div>
            <h2 className="section-title">Por que ser um GeoFluxer?</h2>
            <p className="section-subtitle">
              Renda extra sem investimento enquanto faz o que já faz todos os dias.
            </p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon green">💸</div>
              <div>
                <h3>Renda Passiva Real</h3>
                <p>
                  Ganhe R$ 0,10 por KM válido. Todo o seu envio será avaliado 
                  e validado pela nossa administração antes do pagamento.
                </p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon gold">📱</div>
              <div>
                <h3>Zero Investimento</h3>
                <p>
                  Sem dashcam, sem hardware especial. Seu smartphone é tudo
                  que você precisa para começar a ganhar agora.
                </p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon purple">🔒</div>
              <div>
                <h3>Privacidade Garantida</h3>
                <p>
                  Todas as imagens passam por desfoque automático de rostos
                  e placas antes de serem enviadas à rede de mapas.
                </p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon blue">🌐</div>
              <div>
                <h3>Impacto Global</h3>
                <p>
                  Seus dados ajudam a criar mapas descentralizados usados por
                  empresas de mobilidade, entrega e veículos autônomos.
                </p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon green">⚡</div>
              <div>
                <h3>Economia de Dados</h3>
                <p>
                  Upload apenas via Wi-Fi. Sem consumir seus dados móveis.
                  Imagens em WebP para ocupar o mínimo de espaço.
                </p>
              </div>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon gold">🏆</div>
              <div>
                <h3>Áreas Prioritárias</h3>
                <p>
                  O mapa mostra áreas com maior recompensa. Planeje suas
                  corridas para maximizar seus ganhos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rewards */}
      <section className="section" id="recompensas">
        <div className="container">
          <div className="section-header">
            <div className="section-label">🍯 Smart Rewards</div>
            <h2 className="section-title">Sistema de Pagamentos Justo</h2>
            <p className="section-subtitle">
              Sua rota do dia a dia se transforma em ganhos reais,
              assegurados pela nossa plataforma mediante validação diária.
            </p>
          </div>

          <div className="rewards-showcase">
            <div className="reward-tiers">
              <div className="tier">
                <div className="tier-dot green" />
                <div className="tier-info">
                  <h4>🛣️ KM Válido & Aprovado</h4>
                  <p>Dados devidamente aprovados no controle de qualidade</p>
                </div>
                <div className="tier-value">R$ 0,10 FIXO</div>
              </div>

              <div className="tier">
                <div className="tier-dot red" />
                <div className="tier-info">
                  <h4>🚧 Em Avaliação</h4>
                  <p>Início das operações de motorista (Avaliação de desempenho)</p>
                </div>
                <div className="tier-value">0 a 100%</div>
              </div>
            </div>

            <div className="reward-visual">
              <div className="honey-token">🍯</div>
              <div className="honey-label">HONEY Token</div>
              <div className="honey-sublabel">Recompensa da rede Hivemapper (Solana)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pipeline */}
      <section className="section" id="pipeline">
        <div className="container">
          <div className="section-header">
            <div className="section-label">⚙️ Tecnologia</div>
            <h2 className="section-title">Pipeline de Processamento</h2>
            <p className="section-subtitle">
              Do seu smartphone até o mapa global — cada frame passa por
              um pipeline automatizado de qualidade e privacidade.
            </p>
          </div>

          <div className="pipeline-flow">
            <div className="pipeline-step">
              <div className="icon">📱</div>
              <div className="name">Captura</div>
              <div className="desc">Câmera + GPS</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="icon">📡</div>
              <div className="name">Upload Wi-Fi</div>
              <div className="desc">Sync automático</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="icon">🔒</div>
              <div className="name">Privacidade</div>
              <div className="desc">Blur rostos/placas</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="icon">✅</div>
              <div className="name">Validação</div>
              <div className="desc">Qualidade + GPS</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="icon">🌐</div>
              <div className="name">Hivemapper</div>
              <div className="desc">Rede global</div>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-step">
              <div className="icon">🍯</div>
              <div className="name">HONEY</div>
              <div className="desc">Recompensa</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="container">
          <div className="section-header">
            <div className="section-label">❓ Perguntas Frequentes</div>
            <h2 className="section-title">Tire suas Dúvidas</h2>
          </div>

          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`} id={`faq-item-${i}`}>
                <button className="faq-question" onClick={() => toggleFaq(i)}>
                  {faq.q}
                  <span className="faq-chevron">▼</span>
                </button>
                <div className="faq-answer">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="download">
        <div className="container">
          <div className="cta-card">
            <h2>Comece a Mapear <span className="highlight">Agora</span></h2>
            <p>
              Junte-se à rede de mapeamento descentralizado do Rio de Janeiro.
              Sem custos, sem complicação. Só você, seu celular e a estrada.
            </p>
            <div className="cta-buttons">
              <a href="#" className="btn btn-accent btn-lg" id="cta-download-btn">
                📱 Baixar para Android
              </a>
              <a href="#" className="btn btn-secondary btn-lg" id="cta-dashboard-btn">
                🖥️ Acessar Dashboard
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                <li><a href="https://discord.gg/hivemapper" target="_blank" rel="noopener noreferrer">Discord Hivemapper</a></li>
                <li><a href="https://github.com/hivemapper" target="_blank" rel="noopener noreferrer">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 GeoFlux Rio. Todos os direitos reservados.</span>
            <span>Powered by Hivemapper Network · Solana Blockchain</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
