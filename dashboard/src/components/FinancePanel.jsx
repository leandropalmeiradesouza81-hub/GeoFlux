import React from 'react';

export default function FinancePanel() {
  return (
    <>
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-title">Receita Bruta Multi-Channel</div>
        <div className="metrics-row">
          <div style={{ padding: "16px", background: "var(--bg-surface)", borderRadius: "8px", borderTop: "3px solid var(--primary)" }}>
            <h5 style={{ color: "var(--text-muted)", display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span role="img" aria-label="hive">🍯</span> Hivemapper (Solana)
            </h5>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "8px 0" }}>R$ 0,35 / km</div>
            <p className="metric-sub">Base source. Conversão Jupiter (HONEY → USDC → BRL).</p>
          </div>

          <div style={{ padding: "16px", background: "var(--bg-surface)", borderRadius: "8px", borderTop: "3px solid #FF5252" }}>
            <h5 style={{ color: "var(--text-muted)", display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span role="img" aria-label="camera">📷</span> NATIX (Drive&Earn)
            </h5>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "8px 0" }}>R$ 0,12 / km</div>
            <p className="metric-sub">Tráfego estático e sensores IoT.</p>
          </div>

          <div style={{ padding: "16px", background: "var(--bg-surface)", borderRadius: "8px", borderTop: "3px solid #6C5CE7" }}>
            <h5 style={{ color: "var(--text-muted)", display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span role="img" aria-label="map">🗺️</span> Mapillary (Meta)
            </h5>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "8px 0" }}>R$ 0,05 / km</div>
            <p className="metric-sub">Fee fixa por licenciamento Sequence API.</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "24px", background: "rgba(0, 212, 170, 0.05)", border: "1px solid var(--primary)" }}>
        <div className="card-title" style={{ color: "var(--primary)" }}>Inteligência de Custos Mapeados (Spread Operacional)</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
            <div>
              <p style={{ color: 'var(--text-muted)' }}>Receita Total Projetada</p>
              <h3 style={{ fontSize: '2rem' }}>R$ 0,52 <span style={{fontSize: '1rem'}}>/ km</span></h3>
            </div>
            <div style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>-</div>
            <div>
               <p style={{ color: 'var(--text-muted)' }}>Custo Motorista (GeoFlux App)</p>
               <h3 style={{ fontSize: '2rem', color: 'var(--danger)' }}>R$ 0,10 <span style={{fontSize: '1rem'}}>/ km</span></h3>
            </div>
            <div style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>=</div>
            <div>
               <p style={{ color: 'var(--text-muted)' }}>Lucro Líquido</p>
               <h3 style={{ fontSize: '2.5rem', color: 'var(--success)' }}>R$ 0,42 <span style={{fontSize: '1rem'}}>/ km</span></h3>
            </div>
        </div>
        <p className="metric-sub" style={{ marginTop: '16px' }}>Simulação 20 carros rodando 150km/dia: <strong>R$ 1.260,00/dia de lucro líquido.</strong></p>
      </div>

      <div className="card">
        <div className="card-title">Caixa & Movimentações</div>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Origem/Tipo</th>
              <th>Hash da Transação / Destino</th>
              <th>Valor (BRL)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hoje, 14:20</td>
              <td>Swap BeeMaps (HONEY) Jupiter</td>
              <td><a href="#" style={{ color: "var(--primary)" }}>5xt9...uR2x</a></td>
              <td style={{ color: "var(--success)" }}>+ R$ 420.50</td>
              <td><span className="status-pill approved">Liquidez Adicionada</span></td>
            </tr>
            <tr>
              <td>Hoje, 11:45</td>
              <td>Liquidação NATIX Drive&Earn</td>
              <td><a href="#" style={{ color: "var(--primary)" }}>ntx...99p1</a></td>
              <td style={{ color: "var(--success)" }}>+ R$ 145.20</td>
              <td><span className="status-pill approved">Liquidez Adicionada</span></td>
            </tr>
            <tr>
              <td>Hoje, 10:15</td>
              <td>Saque PIX (Motorista Carlos M.)</td>
              <td>Chave: carlos@uber..</td>
              <td style={{ color: "var(--danger)" }}>- R$ 120.00</td>
              <td><span className="status-pill approved">Enviado PIX</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
