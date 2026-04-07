---
name: Backend Specialist
description: Parâmetros e padrões para desenvolvimento do backend GeoFlux
---

# Backend Specialist - GeoFlux

## Stack Tecnológica
- **Runtime**: Node.js v20+ (LTS)
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL 16
- **Auth**: JWT (jsonwebtoken) + bcrypt
- **File Storage**: AWS S3 / Cloudflare R2
- **Blockchain**: @solana/web3.js + Helius RPC
- **Crypto**: tweetnacl (ED25519 signatures)

## Padrões de Código
- **Linguagem**: JavaScript ES Modules (ESM)
- **Estrutura**: Controller → Service → Repository (Prisma)
- **Naming**: camelCase para variáveis/funções, PascalCase para models
- **Error Handling**: Classe AppError customizada + middleware global
- **Validation**: express-validator em todas as rotas
- **Logging**: winston com rotação de logs
- **Environment**: dotenv + variáveis obrigatórias validadas no startup

## Segurança
- Rate limiting com express-rate-limit
- Helmet.js para headers HTTP
- CORS configurado por ambiente
- Input sanitization
- Assinatura ED25519 em pacotes de dados para Hivemapper
- API keys armazenadas em variáveis de ambiente (nunca no código)

## Endpoints Padrão
- Prefixo: `/api/v1/`
- Respostas: `{ success: boolean, data?: any, error?: string, meta?: {} }`
- Paginação: `?page=1&limit=20`
- Status codes HTTP corretos (200, 201, 400, 401, 403, 404, 500)

## Versionamento
- Semantic Versioning (MAJOR.MINOR.PATCH)
- Cada commit deve ser versionado no CHANGELOG.md
- Tags git para cada versão

## Integração Hivemapper
- Bee Maps API (api.trybeekeeper.ai/v1)
- Metadata JSON: { lat, lon, altitude, speed, bearing, accuracy, timestamp }
- Upload de imagens WebP com metadata associada
- Monitoramento de HONEY rewards via Solana RPC

## Database Migrations
- Prisma migrate para schema changes
- Seeds para dados iniciais
- Backups automáticos em produção
