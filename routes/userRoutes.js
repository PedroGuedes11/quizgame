import express from "express";
import {
    updateProfile,
    getProfile,
    decrementEnergy,
    incrementEnergy,
    getLeaderboardGeneral,
    getLeaderboardSubjects,
    getLeaderboardBySubject,
    getLeaderboardQuizzesCompleted
} from "../controllers/userController.js";
import { validateToken, verifyUser } from "../middlewares/authMiddlewares.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// user profile routes
router.put("/update-info", validateToken, verifyUser, upload.single('profile_photo'), updateProfile);
router.get("/user-info", validateToken, verifyUser, getProfile);

//energy routes
router.post("/decrement-energy", validateToken, verifyUser, decrementEnergy);
router.post("/increment-energy", validateToken, verifyUser, incrementEnergy);

// leaderboard routes
router.get("/leaderboard/general", validateToken, verifyUser, getLeaderboardGeneral);
router.get("/leaderboard/subjects", validateToken, verifyUser, getLeaderboardSubjects);
router.get("/leaderboard/subject", validateToken, verifyUser, getLeaderboardBySubject);
router.get("/leaderboard/completed", validateToken, verifyUser, getLeaderboardQuizzesCompleted);

export default router;