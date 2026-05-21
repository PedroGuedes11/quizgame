import db from "../model/db.js";
import {
    //general quiz queries
    insertQuiz,
    insertQuestion,
    insertAlternative,
    getQuizMetadataByIdQuiz,
    getQuizQuestionsByIdQuiz,
    getQuestionAlternativesByIdQuestion,
    getTeacherNameByIdTeacher,
    
    //Searh quiz queries
    getQuizzesWithFilters,
    
    //teacher quizzes queries
    getQuizzesByTeacherId,
    deleteQuizByQuizId,

    //student played quizzes queries
    getPlayedQuizzesByStudentId,
    
    //student "do after" quizzes queries
    insertDoAfterQuizForStudent,
    getDoAfterQuizzesByStudentId,
    deleteDoAfterQuizForStudent,
    
} from "../model/quizQueries.js";

//general quiz controllers
export const createQuiz = async (req, res) => {
    if (req.user.type !== "teacher") {
        return res.status(403).json({ error: "Acesso negado." });
    }

    const { subject, theme, questions } = req.body;
    const teacherId = req.user.id_teacher;

    if (!subject || !theme || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: "Dados do quiz incompletos." });
    }

    try {
        await db.query("BEGIN");

        const quiz = await insertQuiz(teacherId, subject, theme);
        const createdQuizId = quiz.id_quiz;

        for (const question of questions) {
            if (!question.questionText || !Array.isArray(question.alternatives) || question.alternatives.length < 2) {
                throw new Error("Questão inválida.");
            }

            const createdQuestion = await insertQuestion(createdQuizId, question.questionText, question.questionOrder);
            const createdQuestionId = createdQuestion.id_question;

            for (const alternative of question.alternatives) {
                if (!alternative.label || !alternative.text) {
                    throw new Error("Alternativa inválida.");
                }

                await insertAlternative(createdQuestionId, alternative.label, alternative.text, alternative.isCorrect);
            }
        }

        await db.query("COMMIT");
        return res.status(201).json({ quizId: createdQuizId });
    } catch (error) {
        await db.query("ROLLBACK");
        console.error("createTeacherQuiz error:", error);
        return res.status(500).json({ error: "Erro ao criar o quiz." });
    }
};

export const getQuizData = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const quizMetadata = await getQuizMetadataByIdQuiz(quizId);
        const quizQuestions = await getQuizQuestionsByIdQuiz(quizId);
        const quizData = {
            metadata: quizMetadata,
            teacher_username: await getTeacherNameByIdTeacher(quizMetadata.teacher_id),
            questions: quizQuestions,
            options: []
        };
        for (let question of quizQuestions) {
            let questionId = question.id_question;
            let quizAlternatives = await getQuestionAlternativesByIdQuestion(questionId);
            quizData.options.push(quizAlternatives);
        }
        return res.status(200).json(quizData);
    }
    catch (error) {
        return res.status(500).json({ error: true, message: "Erro ao buscar dados do quiz." });
    }
};

export const submitQuiz = async (req, res) => {
    const { quizId, answers, correctCount, timePoints, startedAt, finishedAt } = req.body;
    const studentId = req.user.id_student;
    const totalPoints = correctCount * timePoints;

    try {
        await db.query("BEGIN");

        const playedResult = await db.query(
            "INSERT INTO played_quizzes (id_student, id_quiz, total_points, started_at, finished_at) VALUES ($1, $2, $3, $4, $5) RETURNING id_played",
            [studentId, quizId, totalPoints, startedAt, finishedAt]
        );
        const playedId = playedResult.rows[0].id_played;

        for (const answer of answers) {
            const altResult = await db.query(
                "SELECT is_correct FROM alternatives WHERE id_alternative = $1",
                [answer.alternativeId]
            );
            const isCorrect = altResult.rows[0].is_correct;

            await db.query(
                "INSERT INTO played_answers (id_played, id_question, id_alternative, is_correct) VALUES ($1, $2, $3, $4)",
                [playedId, answer.questionId, answer.alternativeId, isCorrect]
            );
        }

        await db.query("COMMIT");

        res.json({ score, correctCount });
    } catch (error) {
        await db.query("ROLLBACK");
        console.error("Submit quiz error:", error);
        res.status(500).json({ error: "Erro ao submeter o quiz." });
    }
};

// Search quizzes controller
export const searchQuizzes = async (req, res) => {
    try {
        const { id, subject, theme, teacher } = req.query;
        const quizId = id ? parseInt(id, 10) : null;
        const quizzes = await getQuizzesWithFilters({ quizId, subject, theme, teacher });
        return res.status(200).json({ quizzes });
    } catch (error) {
        console.error("searchQuizzes error:", error);
        return res.status(500).json({ error: "Erro ao buscar quizzes." });
    }
};

// teacher quizzes controllers
export const getTeacherQuizzes = async (req, res) => {
    if (req.user.type !== "teacher") {
        return res.status(403).json({ error: "Acesso negado." });
    }

    try {
        const teacherId = req.user.id_teacher;
        const quizzes = await getQuizzesByTeacherId(teacherId);
        return res.status(200).json({ quizzes });
    } catch (error) {
        console.error("getTeacherQuizzes error:", error);
        return res.status(500).json({ error: "Erro ao buscar quizzes do professor." });
    }
};

export const deleteQuiz = async (req, res) => {
    if (req.user.type !== "teacher") {
        return res.status(403).json({ error: "Acesso negado." });
    }

    try {
        const teacherId = req.user.id_teacher;
        const quizId = req.params.quizId;
        const deletedQuiz = await deleteQuizByQuizId(quizId, teacherId);

        if (!deletedQuiz) {
            return res.status(404).json({ error: "Quiz não encontrado ou não pertence a este professor." });
        }

        return res.status(200).json({ message: "Quiz removido com sucesso." });
    } catch (error) {
        console.error("deleteTeacherQuiz error:", error);
        return res.status(500).json({ error: "Erro ao remover o quiz." });
    }
};

// Student "Played quizzes" controllers
export const getPlayedQuizzes = async (req, res) => {
    try {
        const userType = req.user.type;
        if (userType !== 'student') {
            return res.status(403).json({ error: 'Apenas estudantes têm histórico de quizzes.' });
        }

        const userId = req.params.userId;

        const result = await getPlayedQuizzesByStudentId(userId);

        res.json({ played: result.rows });
    } catch (error) {
        console.error('Get played quizzes error:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

// Student "Do after" quizzes controllers
export const insertDoAfterQuiz = async (req, res) => {
    if (req.user.type !== "student") {
        return res.status(403).json({ error: "Acesso negado." });
    }
    const { userId , quizId } = req.body;
    try {
        const doAfterQuiz = await insertDoAfterQuizForStudent(userId,quizId); //
        return res.status(201).json({ doAfterQuiz });
    } catch (error) {
        console.error("insertDoAfterQuiz error:", error);
        return res.status(500).json({ error: "Erro ao marcar o quiz para fazer mais tarde." });
    }
};

export const getDoAfterQuizzes = async (req, res) => {
    try {
        const userType = req.user.type;
        if (userType !== 'student') {
            return res.status(403).json({ error: 'Apenas estudantes têm lista de "fazer mais tarde".' });
        }

        const userId = req.params.userId;

        const result = await getDoAfterQuizzesByStudentId(userId);
        res.json({ do_after: result });
    } catch (error) {
        console.error('Get do after quizzes error:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

export const deleteDoAfterQuiz = async (req, res) => {
    if (req.user.type !== "student") {
        return res.status(403).json({ error: "Acesso negado." });
    }

    const { userId , quizId } = req.params; 
    
    try {
        const deletedDoAfterQuiz = await deleteDoAfterQuizForStudent(userId, quizId);

        if (!deletedDoAfterQuiz) {
            return res.status(404).json({ error: "Quiz não encontrado na lista de 'fazer mais tarde'." });
        }

        return res.status(200).json({ message: "Quiz removido da lista de 'fazer mais tarde'." });
    } catch (error) {
        console.error("removeDoAfterQuiz error:", error);
        return res.status(500).json({ error: "Erro ao remover o quiz da lista de 'fazer mais tarde'." });
    }
};