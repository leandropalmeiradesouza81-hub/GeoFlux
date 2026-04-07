# 🌐 GeoFlux Rio

> Plataforma DePIN de coleta de dados geoespaciais descentralizada para o Rio de Janeiro.

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()

## 🎯 Sobre

O GeoFlux transforma motoristas de aplicativo do Rio de Janeiro em coletores de dados de mapeamento. Usando apenas o smartphone, motoristas capturam imagens e telemetria em segundo plano enquanto dirigem, contribuindo para a rede descentralizada **Hivemapper** e ganhando tokens **HONEY**.

### Componentes

| Componente | Tecnologia | Descrição |
|-----------|-----------|-----------|
| **Website** | React + Vite | Site institucional com informações do projeto |
| **Dashboard** | React + Vite | Painel administrativo para gestão de frota |
| **Backend** | Node.js + Express | API central, integração Hivemapper/Solana |
| **App Android** | Kotlin | App para motoristas com captura em segundo plano |

## 🚀 Quick Start

```bash
# Clonar repositório
git clone https://github.com/SEU_USUARIO/GeoFlux.git
cd GeoFlux

# Instalar dependências
npm install

# Iniciar backend
cd backend && npm run dev

# Iniciar website (outra terminal)
cd website && npm run dev

# Iniciar dashboard (outra terminal)
cd dashboard && npm run dev
```

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.
