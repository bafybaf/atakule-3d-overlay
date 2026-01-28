import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { renderWithOverlay } from '../services/ffmpeg.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Store overlay webm
const storageOverlay = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, '..', '..', 'uploads', 'overlays')),
  filename: (_req, _file, cb) => cb(null, `overlay_${Date.now()}.webm`),
});
const uploadOverlay = multer({ storage: storageOverlay, limits: { fileSize: 200 * 1024 * 1024 } });

router.post('/upload-overlay', uploadOverlay.single('overlay'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Overlay dosyası yok' });
    res.json({ file: req.file.filename, path: `uploads/overlays/${req.file.filename}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/render', async (req, res) => {
  try {
    const { videoFile, overlayFile, outputName = `output_${Date.now()}.mp4`, crf = 18, preset = 'medium', duration } = req.body || {};
    if (!videoFile || !overlayFile) return res.status(400).json({ error: 'videoFile ve overlayFile zorunlu' });
    // Support absolute/public atakule.mp4 as well as uploaded files
    const isPublic = /\.mp4$/i.test(videoFile) && !videoFile.includes('uploads/');
    const videoPath = isPublic ? path.join('client', 'public', path.basename(videoFile)) : path.join('uploads', 'videos', path.basename(videoFile));
    const overlayPath = path.join('uploads', 'overlays', path.basename(overlayFile));
    const outputPath = path.join('uploads', 'outputs', path.basename(outputName));
    const fullOutput = await renderWithOverlay({ videoPath, overlayPath, outputPath, crf, preset, duration });
    res.json({ output: fullOutput.replace(/\\/g, '/'), url: `/outputs/${path.basename(fullOutput)}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;


