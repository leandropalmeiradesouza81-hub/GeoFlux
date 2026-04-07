import React from 'react';

export default function FinancePanel() {
  return (
    <>
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-title">Câmbio e Swap Automático Defi</div>
        <div className="metrics-row">
          <div style={{ padding: "16px", background: "var(--bg-surface)", borderRadius: "8px" }}>
            <h5 style={{ color: "var(--text-muted)" }}>Integração Solana / Jupiter</h5>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold", margin: "8px 0" }}>HONEY → USDC → BRL</div>
            <p className="metric-sub">O servidor faz o Swap automático e retém lucro após cobrir o caixa dos motoristas.</p>
          </div>

          <div style={{ padding: "16px", background: "var(--bg-surface)", borderRadius: "8px" }}>
            <h5 style={{ color: "var(--text-muted)" }}>Caixa Acumulado Total</h5>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "8px 0", color: "var(--primary)" }}>R$ 15.420,00</div>
            <p className="metric-sub">Saldo disponível na sua custódia primária Fiduciária/Stablecoin.</p>
          </div>

          <div style={{ padding: "16px", background: "rgba(255,82,82, 0.1)", borderRadius: "8px", border: "1px solid var(--danger)" }}>
            <h5 style={{ color: "var(--text-muted)" }}>Dever de Pagamento (Liability)</h5>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "8px 0", color: "var(--danger)" }}>- R$ 3.420,00</div>
            <p className="metric-sub">Saldo acumulado livre no app de 20 motoristas ativos que ainda não realizaram saque (PIX).</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Histórico de Movimentações</div>
        <table className="modern-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Origem/Tipo</th>
              <th>Hash da Transação / Destino</th>
              <th>Valor (BR)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hoje, 14:20</td>
              <td>Swap BeeMaps (HONEY) Jupiter</td>
              <td><a href="#" style={{ color: "var(--primary)" }}>5xt9...uR2x</a></td>
              <td style={{ color: "var(--success)" }}>+ R$ 420.50</td>
              <td><span className="status-pill approved">Concluído</span></td>
            </tr>
            <tr>
              <td>Hoje, 10:15</td>
              <td>Saque PIX (Motorista Carlos M.)</td>
              <td>Chave: carlos@uber..</td>
              <td style={{ color: "var(--danger)" }}>- R$ 120.00</td>
              <td><span className="status-pill approved">Enviado</span></td>
            </tr>
            <tr>
              <td>Ontem, 20:00</td>
              <td>Fee Licença (Mapillary Bank)</td>
              <td>Transferência SWIFT/Stripe</td>
              <td style={{ color: "var(--success)" }}>+ R$ 1,200.00</td>
              <td><span className="status-pill pending">Processando Banco</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
