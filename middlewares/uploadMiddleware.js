import fs from 'fs';
import multer from 'multer';
import path from 'path';

const defaultProfilesDir = path.join(process.cwd(), 'public', 'img', 'profiles');
const profilesDir = process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : defaultProfilesDir;

fs.mkdirSync(profilesDir, { recursive: true });

export const profilesUploadDir = profilesDir;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        fs.mkdirSync(profilesDir, { recursive: true });
        cb(null, profilesDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif).'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

export default upload;
