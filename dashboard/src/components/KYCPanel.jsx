import React from 'react';

export default function KYCPanel() {
  return (
    <div className="card">
      <div className="card-title">Validação e Desempenho (Controle de Qualidade)</div>
      <p className="metric-sub" style={{marginBottom: "24px"}}>
        Aprove motoristas novatos e analise o lote de imagens recém recebidas
        antes de liberar o pagamento de R$ 0,10 por km no saldo deles.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Painel de Motoristas Pendentes */}
        <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
          <h4>Inscrição de Novos Parceiros</h4>
          <table className="modern-table" style={{ marginTop: '8px' }}>
            <tbody>
              <tr>
                <td>João F. <br/><small className="metric-sub">joao.v5@gmail.com</small></td>
                <td><span className="status-pill pending">Enviou CNH</span></td>
                <td>
                  <button className="status-pill approved" style={{border:'none', cursor:'pointer'}}>Aprovar</button>
                </td>
              </tr>
              <tr>
                <td>Vitor Hugo <br/><small className="metric-sub">vitor@...gmail</small></td>
                <td><span className="status-pill pending">Validação Facil</span></td>
                <td>
                  <button className="status-pill approved" style={{border:'none', cursor:'pointer'}}>Aprovar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Lotes de KMs para Aprovar */}
        <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
          <h4>Desempenho: KMs em Avaliação (Para pagar)</h4>
          <table className="modern-table" style={{ marginTop: '8px' }}>
            <tbody>
              <tr>
                <td>Leandro R. <br/> <small className="metric-sub">Lote de Hoje (Barra da Tijuca)</small></td>
                <td><strong>145 km</strong> ($ 14.50)</td>
                <td>
                  <button className="status-pill approved" style={{border:'none', cursor:'pointer'}}>Liberar R$</button>
                </td>
              </tr>
              <tr>
                <td>Carlos M. <br/> <small className="metric-sub">Lote de Ontem (Madrugada)</small></td>
                <td><strong>45 km</strong></td>
                <td>
                  <button className="status-pill" style={{border:'none', cursor:'pointer', background: 'var(--danger)', color: 'white'}}>Bloquear (Imagem Escura)</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
