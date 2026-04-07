import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/tiles/status?lat=X&lon=Y - Verificar status do tile na coordenada
router.get('/status', authenticate, async (req, res, next) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ success: false, error: 'lat e lon são obrigatórios' });
    }

    // TODO: Consultar Hivemapper Explorer API para status real do tile
    // Por enquanto, retorna mock baseado em lógica simples
    const prisma = req.app.locals.prisma;

    // Calcular H3 hex ID aproximado (simplificado)
    const hexId = `h3_${Math.floor(parseFloat(lat) * 100)}_${Math.floor(parseFloat(lon) * 100)}`;

    // Verificar cache local
    let tile = await prisma.tileCache.findUnique({ where: { hexId } });

    if (!tile || isExpired(tile.lastChecked)) {
      // Cache miss ou expirado - consultar API (mock por enquanto)
      const freshness = getMockFreshness(parseFloat(lat), parseFloat(lon));

      tile = await prisma.tileCache.upsert({
        where: { hexId },
        create: {
          hexId,
          freshness: freshness.status,
          daysSinceMapped: freshness.days,
          lastChecked: new Date(),
          lastMapped: freshness.lastMapped
        },
        update: {
          freshness: freshness.status,
          daysSinceMapped: freshness.days,
          lastChecked: new Date()
        }
      });
    }

    // Determinar valor do tile
    const reward = getRewardMultiplier(tile.freshness);

    res.json({
      success: true,
      data: {
        hexId: tile.hexId,
        freshness: tile.freshness,
        daysSinceMapped: tile.daysSinceMapped,
        reward: {
          multiplier: reward.multiplier,
          color: reward.color,
          label: reward.label,
          perKm: (0.10 * reward.multiplier).toFixed(2)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/tiles/area?bounds=lat1,lon1,lat2,lon2 - Tiles em uma área
router.get('/area', authenticate, async (req, res, next) => {
  try {
    const { bounds } = req.query;
    if (!bounds) {
      return res.status(400).json({ success: false, error: 'bounds é obrigatório (lat1,lon1,lat2,lon2)' });
    }

    // TODO: Implementar consulta de tiles em área via Hivemapper API
    res.json({
      success: true,
      data: [],
      message: 'Em implementação - requer integração com Hivemapper Explorer API'
    });
  } catch (error) {
    next(error);
  }
});

function isExpired(lastChecked) {
  const hoursSince = (Date.now() - new Date(lastChecked).getTime()) / (1000 * 60 * 60);
  return hoursSince > 6; // Cache expira em 6 horas
}

function getMockFreshness(lat, lon) {
  // Simulação: áreas mais afastadas do centro tendem a ser menos mapeadas
  const distFromCenter = Math.sqrt(
    Math.pow(lat - (-22.9068), 2) + Math.pow(lon - (-43.1729), 2)
  );

  if (distFromCenter > 0.1) {
    return { status: 'unmapped', days: null, lastMapped: null };
  } else if (distFromCenter > 0.05) {
    const days = Math.floor(Math.random() * 20) + 7;
    return { status: 'stale', days, lastMapped: new Date(Date.now() - days * 86400000) };
  } else {
    const days = Math.floor(Math.random() * 5);
    return { status: 'fresh', days, lastMapped: new Date(Date.now() - days * 86400000) };
  }
}

function getRewardMultiplier(freshness) {
  switch (freshness) {
    case 'unmapped':
      return { multiplier: 3.0, color: '#FFD700', label: 'Ouro – Área não mapeada' };
    case 'stale':
      return { multiplier: 2.0, color: '#00E676', label: 'Verde – Precisa atualização' };
    case 'fresh':
      return { multiplier: 1.0, color: '#FF5252', label: 'Vermelho – Já mapeado recentemente' };
    default:
      return { multiplier: 1.0, color: '#888', label: 'Desconhecido' };
  }
}

export default router;
