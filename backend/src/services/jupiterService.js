/**
 * Jupiter Swap Service
 * 
 * Gerencia a venda automatizada de HONEY por USDC/BRL.
 * O Jupiter é um DEX aggregator na Solana que garante as melhores 
 * taxas de conversão de mercado.
 */

import { logger } from '../utils/logger.js';

class JupiterService {
  constructor() {
    this.quoteUrl = process.env.JUPITER_API_URL || 'https://quote-api.jup.ag/v6';
    this.usdcMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
    this.honeyMint = process.env.HONEY_TOKEN_MINT || '4vMsoUT2BWatFweudnQM1xedRLfJgJ7hswhcpz4xgBTy';
  }

  /**
   * Busca a melhor cotação via Jupiter API para converter HONEY -> USDC
   * 
   * @param {number} honeyAmount - Quantidade de HONEY (em unidades brutas, ajustado por decimais)
   */
  async getHoneyToUsdcQuote(honeyAmount) {
    try {
      // HONEY e USDC têm geralmente um número diferente de decimais no SPL token
      // HONEY tem 9 decimais, USDC tem 6 decimais
      const url = `${this.quoteUrl}/quote?inputMint=${this.honeyMint}&outputMint=${this.usdcMint}&amount=${honeyAmount}&slippageBps=50`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Jupiter API erro: ${response.statusText}`);
      }

      const quoteResponse = await response.json();
      return quoteResponse;
    } catch (error) {
      logger.error(`❌ Erro em JupiterService (Cotação): ${error.message}`);
      return null;
    }
  }

  /**
   * Monta e executa a transação de "Swap" simulada 
   * (A execução real exige envio da Tx assinada pela keypair via Connection)
   */
  async executeSwap(quoteResponse) {
    try {
      logger.info(`💱 Executando SWAP no Jupiter: HONEY para USDC`);
      
      // Chamada real seria:
      // fetch('https://quote-api.jup.ag/v6/swap', { ... })
      // assinar a transaction recebida
      // connection.sendRawTransaction(...)

      return {
        success: true,
        receivedUsdc: quoteResponse.outAmount, // em unidades convertidas
        txId: `tx_swap_${Date.now()}`
      };
    } catch (error) {
      logger.error(`❌ Erro em JupiterService (Swap): ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

export const jupiterService = new JupiterService();
