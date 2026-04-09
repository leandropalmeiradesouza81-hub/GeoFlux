import express from 'express';
const router = express.Router();

// Mock global stats that are updated when frames are uploaded
// In a real system, these would be Aggregated in DB
const globalStats = {
  totalFrames: 58210,
  hivemapperRewards: 1245.8,
  mapillarySequences: 128,
  natixPoints: 450,
  activeDrivers: 12
};

router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: globalStats
  });
});

router.get('/recent-frames', (req, res) => {
  // Return last few processed frames
  res.json({
    success: true,
    data: [
      { id: '6E5INJ', driver: 'Leandro P.', location: 'Rio de Janeiro, RJ', status_hm: 'done', status_mpl: 'done', status_ntx: 'pending' },
      { id: 'BWZVC9', driver: 'Leandro P.', location: 'Rio de Janeiro, RJ', status_hm: 'done', status_mpl: 'done', status_ntx: 'pending' }
    ]
  });
});

export default router;
