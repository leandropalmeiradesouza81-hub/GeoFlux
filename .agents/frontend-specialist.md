---
name: Frontend Specialist
description: Parâmetros e padrões para desenvolvimento do frontend/website/dashboard GeoFlux
---

# Frontend Specialist - GeoFlux

## Stack Tecnológica
- **Build Tool**: Vite 5+
- **Framework**: React 18+ com JSX
- **Routing**: React Router v6
- **Styling**: Vanilla CSS com design system customizado
- **State Management**: Zustand (leve e eficiente)
- **HTTP Client**: Axios
- **Maps**: Leaflet / Mapbox GL JS (para visualização de frota)
- **Charts**: Chart.js ou Recharts (para analytics)
- **Icons**: Lucide React

## Design System

### Cores
- **Primary**: `#00D4AA` (Verde Neon - symbolizing mapping)
- **Secondary**: `#6C5CE7` (Roxo - Web3/crypto feel)
- **Accent**: `#FFC107` (Dourado - HONEY token)
- **Background Dark**: `#0A0E1A`
- **Background Card**: `#141824`
- **Surface**: `#1E2235`
- **Text Primary**: `#F0F2F5`
- **Text Secondary**: `#8892A6`
- **Success**: `#00E676`
- **Warning**: `#FF9800`
- **Error**: `#FF5252`

### Tipografia
- **Font Family**: 'Inter', sans-serif (Google Fonts)
- **Headings**: Font weight 700-800
- **Body**: Font weight 400-500
- **Scale**: 12px, 14px, 16px, 18px, 24px, 32px, 48px, 64px

### Efeitos Visuais
- Glassmorphism: `backdrop-filter: blur(20px)`
- Gradientes suaves entre primary e secondary
- Border radius: 12px (cards), 8px (buttons), 24px (pills)
- Box shadows com cor (e.g., `0 8px 32px rgba(0, 212, 170, 0.15)`)
- Micro-animações em hover (scale, glow, translateY)
- Transitions: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

### Responsividade
- Mobile-first approach
- Breakpoints: 480px, 768px, 1024px, 1280px, 1536px
- Layout: CSS Grid + Flexbox
- Imagens: WebP com lazy loading

## Padrões de Código
- **Componentes**: Functional components com hooks
- **Naming**: PascalCase para componentes, camelCase para funções
- **Arquivos**: Um componente por arquivo
- **Props**: Destructuring no parâmetro da função
- **CSS**: Um arquivo CSS por componente quando necessário

## Performance
- Code splitting com React.lazy()
- Imagens otimizadas (WebP, lazy loading)
- Memoization com React.memo e useMemo
- Debounce em inputs de busca

## Acessibilidade
- Semantic HTML5
- ARIA labels em elementos interativos
- Focus states visíveis
- Contraste mínimo WCAG AA

## Website (Landing Page)
- Design moderno premium com animações
- Seções: Hero, Como Funciona, Benefícios, Mapa Cobertura, FAQ, CTA
- SEO otimizado (meta tags, headings, structured data)
- Responsivo para todos os dispositivos
