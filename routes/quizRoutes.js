import express from "express";
import {
    getQuizData,
    submitQuiz,
    searchQuizzes,
    getSubjects,
    
    createQuiz,
    getTeacherQuizzes,
    deleteQuiz,
    
    getPlayedQuizzes,

    insertDoAfterQuiz,
    getDoAfterQuizzes,
    deleteDoAfterQuiz,
} from "../controllers/quizController.js";
import { validateToken, verifyUser } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// general quiz routes
router.get("/get-quiz-data/:quizId", validateToken, verifyUser, getQuizData);
router.post("/submit", validateToken, verifyUser, submitQuiz);
router.get("/search", validateToken, verifyUser, searchQuizzes);
router.get("/subjects", validateToken, verifyUser, getSubjects);

//teacher quizzes management
router.post("/teacher-quizzes", validateToken, verifyUser, createQuiz);
router.get("/teacher-quizzes", validateToken, verifyUser, getTeacherQuizzes);
router.delete("/teacher-quizzes/:quizId", validateToken, verifyUser, deleteQuiz);

//student played quizzes management
router.get("/played-quizzes/:userId", validateToken, verifyUser, getPlayedQuizzes);

//student "do after" quizzes management
router.post("/do-after", validateToken, verifyUser, insertDoAfterQuiz);
router.get("/do-after/:userId", validateToken, verifyUser, getDoAfterQuizzes);
router.delete("/do-after/:userId/:quizId", validateToken, verifyUser, deleteDoAfterQuiz);

export default router;