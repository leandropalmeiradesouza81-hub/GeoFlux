<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/globe.svg" width="80" height="80" alt="GeoFlux Icon"/>
  <h1>GeoFlux: Plataforma DePIN de Coleta de Dados Geoespaciais</h1>
  <p><b>Transformando a frota de mobilidade urbana em uma rede global e descentralizada de mapeamento via crowdsourcing no Rio de Janeiro.</b></p>

  [![Versão](https://img.shields.io/badge/versão-v0.4.0-blue.svg)]()
  [![Status](https://img.shields.io/badge/status-ativo-success.svg)]()
  [![Licença](https://img.shields.io/badge/licença-MIT-green.svg)]()
</div>

---

## 🚙 A Visão do Projeto
O **GeoFlux** transforma motoristas de aplicativo (Uber, 99, Waze) em sensores móveis, criando um mapa 3D digital interativo atualizado em tempo real. Nossa plataforma abstrai toda a complexidade tecnológica de mineração de criptomoedas, fornecendo uma remuneração estabilizada em BRL para o motorista, enquanto nosso backend distribui os dados coletados de forma segura e paralela para **várias APIs B2B e Redes DePIN mundiais**.

---

## 📸 Arquitetura de Coleta: Câmera Wi-Fi e Telemetria
Ao invés de consumir a câmera nativa do smartphone (o que limitaria o motorista), desenhamos uma topologia avançada:

1. **Câmera Externa (Dashcam)**: O motorista utiliza uma câmera externa acoplada no parabrisa operando na rede local (Wi-Fi).
2. **Data Logger em Smartphone**: O app Android nativo (`Foreground Service`) conecta-se à câmera para puxar o fluxo de quadros (frames/snaps) em segundo plano enquanto o motorista foca no trânsito e usa seu app de corrida principal.
3. **Sensores de Precisão (< 100ms)**: Cada frame visual é emparelhado com metadados do celular usando *SensorManager*:
   - 🛰️ **GPS/GNSS**: Posição, altitude e bearing filtrados via Fused Location.
   - 🕳️ **Acelerômetro**: Coleta o eixo Z. Qualquer impacto que gere mais de `2.5G` aciona a anomalia `pothole_suspect` (Detecção de Buracos na pista).
   - 🧭 **Giroscópio & Magnetômetro**: Registram a fluidez e os micro-movimentos cruciais para dados de trânsito.

---

## 💰 Modelo Financeiro Multi-Stream
O segredo do GeoFlux é o fluxo "Multi-Marketplace". O motorista coleta um pacote e o nosso servidor, equipado com o **BullMQ**, despacha esse mesmo dado simultaneamente para 3 canais compradores, multiplicando a margem de faturamento.

| Parceiro de Integração | Tipo de Dado e Valor Comercial | Ganho da Plataforma (Bruto) |
|:---:|:---|:---:|
| <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/map-pin.svg" width="20"/> **Hivemapper** | Base de mapeamento em Solana (`$HONEY`). A infraestrutura envia fotos exclusivas para alimentar mapas globais. | **R$ 0,35 / km** |
| <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/camera.svg" width="20"/> **NATIX** (Drive&Earn) | IA de bordo que extrai volumetria de veículos (trânsito denso) e anomalias da via (Buracos alertados pelo nosso Acelerômetro). | **R$ 0,12 / km** |
| <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/image.svg" width="20"/> **Mapillary** (Meta) | Sequências visuais (Graph API) com enjeção dura de Metadados EXIF. Contribui para o grande repositório Open-Source empresarial. | **R$ 0,05 / km** |
| **Faturamento Total** | *Lucratividade corporativa (simulada) por quilômetro rodado.* | **R$ 0,52 / km** |

### 💵 O Lado do Motorista (Opacidade Total)
Os motoristas do GeoFlux **nunca lidam com oscilação de criptomoedas, wallets complicadas ou criação de contas em três redes diferentes**. O aplicativo oculta esse processamento pesado e oferece a proposta estabilizada:
- Pagamento Garantido ao Parceiro: **R$ 0,10 por km validado**.
- **LUCRO LÍQUIDO DO PROJETO:** Faturamento Bruto (R$ 0,52) - Pagamento Driver (R$ 0,10) = **R$ 0,42 de spread puro / km**.
- Usando algoritmos de conversão DeFi (Jupiter na Solana), o tesouro é fechado mensalmente em dólares ou convertido automaticamente em reais (BRL).

---

## 🧬 Componentes do Sistema (Codebase)

A infraestrutura completa foi modularizada da seguinte forma:

```bash
📦 GeoFlux
 ┣ 📂 android/        # App Nativo Kotlin com ForegroundCaptureService e Sockets da Camera.
 ┣ 📂 backend/        # Servidor Express.js (Node) robusto para gerir a frota, rotas e Dispatchers B2B.
 ┣ 📂 dashboard/      # Admin Panel React (Vite) para conferir lucro Multi-channel e saques PIX do motorista.
 ┗ 📂 website/        # Landing Page Opaca voltada para a captação e cadastro de Motoristas locais.
```

### O Pipeline de Privacidade e Envio
1. O upload pesado para o Backend só ocorre quando o motorista chega em casa, via `Wi-Fi Sync`, poupando plano de dados móveis.
2. Chegando no servidor, uma AI interna aplica um _Blur_ contínuo e anônimo em placas e rostos humanos.
3. Somente após a "limpeza", a Queue despacha a imagem para Mapillary, Hivemapper e NATIX.

---

## 🛠️ Como Iniciar a Plataforma para Teste
(Requisito: Node.js 18+)

**1. Dashboard Administrativo**
```bash
cd dashboard
npm install
npm run dev
# Acesse pelo navegador na porta localhost exibida.
```

**2. Landing Page Web**
```bash
cd website
npm install
npm run dev
```

**3. Teste do Aplicativo**
O projeto está em Kotlin Nativo. Abra a pasta `android/` no seu **Android Studio**, deixe o Gradle sincronizar as dependências, e rode a Build com um Emulador (AVD) ou o seu próprio aparelho roteado.

---
<div align="center">
  <sub>Construído com infraestrutura distribuída • GeoFlux 🌍 </sub>
</div>
