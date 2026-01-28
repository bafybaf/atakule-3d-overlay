import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads', 'videos'));
  },
  filename: (_req, file, cb) => {
    const id = uuidv4();
    const ext = path.extname(file.originalname) || '.mp4';
    cb(null, `${id}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  if (/video\/(mp4|quicktime|webm|x-matroska)/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Geçersiz video türü'));
  }
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 80 * 1024 * 1024 } });

router.post('/upload-video', upload.single('video'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Dosya yok' });
    res.json({ file: req.file.filename, path: `uploads/videos/${req.file.filename}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


