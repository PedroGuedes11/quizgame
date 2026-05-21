import express from "express";
import { register, login } from "../controllers/authController.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/register", upload.single('profile_photo'), register);
router.post("/login", login); 

export default router;