import multer from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { AppError } from './errorHandler';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${ext}`);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    cb(new AppError(400, 'Only image files (PNG, JPG, JPEG, GIF, WEBP) are allowed'));
    return;
  }
  cb(null, true);
};

export const uploadScreenshots = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});
