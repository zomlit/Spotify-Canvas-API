import { getCanvases } from '../services/spotifyCanvasService.js';

export const fetchCanvas = async (req, res) => {
  const { trackId } = req.query;
  if (!trackId) {
    return res.status(400).json({ error: 'Missing trackId parameter' });
  }

  try {
    const canvasData = await getCanvases(`spotify:track:${trackId}`);
    res.json(canvasData);
  } catch (error) {
    console.error('Failed to fetch canvas data:', {
      stage: error.stage,
      status: error.status,
      message: error.message,
      body: error.body,
    });

    return res.status(502).json({
      error: 'Failed to fetch canvas data',
      stage: error.stage || 'unknown',
      status: error.status,
      message: error.message,
    });
  }
};
