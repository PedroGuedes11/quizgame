import multer from "multer";
import path from "path";

const fileFilter = (req, file, cb) => {
    const allowedExtensions = [".jpeg", ".jpg", ".png", ".gif"];
    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(extension)) {
        cb(null, true);
    } else {
        cb(new Error("Apenas imagens são permitidas."));
    }
};

export const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});

export default upload;
