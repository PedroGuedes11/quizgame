import fs from 'fs';
import multer from 'multer';
import path from 'path';

const getWritableProfilesDir = () => {
    const candidates = [
        process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : null,
        path.join(process.cwd(), 'public', 'img', 'profiles'),
        path.join(process.cwd(), 'tmp', 'profiles')
    ].filter(Boolean);

    for (const candidate of candidates) {
        try {
            fs.mkdirSync(candidate, { recursive: true, mode: 0o755 });
            fs.accessSync(candidate, fs.constants.W_OK);
            return candidate;
        } catch (error) {
            // tenta o próximo diretório
        }
    }

    return path.join(process.cwd(), 'public', 'img', 'profiles');
};

const profilesDir = getWritableProfilesDir();
if (process.env.UPLOAD_DIR && profilesDir !== path.resolve(process.env.UPLOAD_DIR)) {
    console.warn(`[upload] Diretório de upload configurado indisponível. Usando fallback: ${profilesDir}`);
}

export const profilesUploadDir = profilesDir;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            fs.mkdirSync(profilesDir, { recursive: true, mode: 0o755 });
            cb(null, profilesDir);
        } catch (error) {
            cb(error);
        }
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
