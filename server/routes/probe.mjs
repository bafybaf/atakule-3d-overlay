import { Router } from 'express';
import { ffprobeVideo } from '../services/ffmpeg.mjs';
import path from 'path';

const router = Router();

router.get('/probe/:file', async (req, res) => {
  try {
    const file = path.basename(req.params.file);
    const meta = await ffprobeVideo(path.join('uploads', 'videos', file));
    res.json(meta);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;


