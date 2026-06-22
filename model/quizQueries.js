import db from "./db.js";

// General quiz queries
export const getQuizMetadataByIdQuiz = async (quizId) => {
    try {
        if (!quizId || isNaN(quizId)) {
            throw new Error("Invalid quizId");
        }
        const result = await db.query(
            "SELECT * FROM quizzes WHERE id_quiz = $1",
            [quizId]
        );
        if (result.rows.length === 0) {
            throw new Error("Quiz not found");
        }
        return result.rows[0];
    } catch (error) {
        console.error("Database error:", error);
        throw error;
    }
}

export const getQuizQuestionsByIdQuiz = async (quizId) => {
    const result = await db.query(
        "SELECT *  FROM questions WHERE id_quiz = $1 order by question_order",
        [quizId]
    );
    return result.rows;
};

export const getQuestionAlternativesByIdQuestion = async (questionId) => {
    const result = await db.query(
        "SELECT * FROM alternatives WHERE id_question = $1 order by label",
        [questionId]
    );
    return result.rows;
};

export const getTeacherNameByIdTeacher = async (teacherId) => {
    const result = await db.query(
        "SELECT username FROM teachers WHERE id_teacher = $1",
        [teacherId]
    );
    return result.rows.length > 0 ? result.rows[0].username : null;
};

export const insertQuiz = async (teacherId, subject, theme) => {
    const result = await db.query(
        "INSERT INTO quizzes (teacher_id, subject, theme) VALUES ($1, $2, $3) RETURNING *",
        [teacherId, subject, theme]
    );
    return result.rows[0];
};

export const insertQuestion = async (quizId, questionText, questionOrder) => {
    const result = await db.query(
        "INSERT INTO questions (id_quiz, question_text, question_order) VALUES ($1, $2, $3) RETURNING *",
        [quizId, questionText, questionOrder]
    );
    return result.rows[0];
};

export const insertAlternative = async (questionId, label, text, isCorrect) => {
    const result = await db.query(
        "INSERT INTO alternatives (id_question, label, text, is_correct) VALUES ($1, $2, $3, $4) RETURNING *",
        [questionId, label, text, isCorrect]
    );
    return result.rows[0];
};

// Search quizzes with filters
export const getQuizzesWithFilters = async ({ quizId, subject, theme, teacher }) => {
    const clauses = [];
    const params = [];

    if (quizId) {
        params.push(quizId);
        clauses.push(`q.id_quiz = $${params.length}`);
    }

    if (subject) {
        params.push(`%${subject.trim().toLowerCase()}%`);
        clauses.push(`LOWER(q.subject) LIKE $${params.length}`);
    }

    if (theme) {
        params.push(`%${theme.trim().toLowerCase()}%`);
        clauses.push(`LOWER(q.theme) LIKE $${params.length}`);
    }

    if (teacher) {
        params.push(`%${teacher.trim().toLowerCase()}%`);
        clauses.push(`LOWER(t.username) LIKE $${params.length}`);
    }

    const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const result = await db.query(
        `SELECT q.id_quiz,
                q.subject,
                q.theme,
                q.created_at,
                t.username AS teacher_username,
                COUNT(DISTINCT questions.id_question) AS question_count
           FROM quizzes q
           LEFT JOIN teachers t ON q.teacher_id = t.id_teacher
           LEFT JOIN questions ON q.id_quiz = questions.id_quiz
          ${whereClause}
          GROUP BY q.id_quiz, t.username
          ORDER BY q.created_at DESC`,
        params
    );

    return result.rows;
};

// Teacher quizzes management
export const getQuizzesByTeacherId = async (teacherId) => {
    const result = await db.query(
        `SELECT q.id_quiz, q.subject, q.theme, q.created_at,
                COUNT(distinct questions.id_question) AS question_count
           FROM quizzes q
           LEFT JOIN questions ON q.id_quiz = questions.id_quiz
          WHERE q.teacher_id = $1
          GROUP BY q.id_quiz
          ORDER BY q.created_at DESC`,
        [teacherId]
    );
    return result.rows;
};

export const deleteQuizByQuizId = async (quizId, teacherId) => {
    const result = await db.query(
        "DELETE FROM quizzes WHERE id_quiz = $1 AND teacher_id = $2 RETURNING *",
        [quizId, teacherId]
    );
    return result.rowCount ? result.rows[0] : null;
};

// Student played quizzes management
export const getPlayedQuizzesByStudentId = async (studentId) => {
    const result = await db.query(
        `SELECT pq.id_played, pq.id_quiz, q.subject, q.theme, pq.total_points, pq.started_at, pq.finished_at
           FROM played_quizzes pq
           JOIN quizzes q ON q.id_quiz = pq.id_quiz
           WHERE pq.id_student = $1
           ORDER BY pq.started_at DESC`,
        [studentId]
    );
    return result.rows;
};

export const getLeaderboardGeneral = async (limit = 10) => {
    const result = await db.query(
        `SELECT s.id_student, s.username, s.global_points,
                COUNT(DISTINCT pq.id_quiz) AS quizzes_completed
           FROM students s
           LEFT JOIN played_quizzes pq ON pq.id_student = s.id_student
          GROUP BY s.id_student, s.username, s.global_points
          ORDER BY s.global_points DESC, quizzes_completed DESC, s.username ASC
          LIMIT $1`,
        [limit]
    );
    return result.rows;
};

export const getQuizSubjects = async () => {
    const result = await db.query(
        `SELECT DISTINCT subject FROM quizzes ORDER BY subject`
    );
    return result.rows.map((row) => row.subject);
};

export const getLeaderboardBySubject = async (subject, limit = 10) => {
    const result = await db.query(
        `SELECT s.id_student, s.username,
                COALESCE(SUM(pq.total_points), 0) AS subject_points,
                COUNT(DISTINCT pq.id_quiz) AS quizzes_completed
           FROM students s
           LEFT JOIN played_quizzes pq ON pq.id_student = s.id_student
           LEFT JOIN quizzes q ON q.id_quiz = pq.id_quiz AND q.subject = $1
          GROUP BY s.id_student, s.username
          ORDER BY subject_points DESC, quizzes_completed DESC, s.username ASC
          LIMIT $2`,
        [subject, limit]
    );
    return result.rows;
};

export const getLeaderboardQuizzesCompleted = async (limit = 10) => {
    const result = await db.query(
        `SELECT s.id_student, s.username,
                COUNT(DISTINCT pq.id_quiz) AS quizzes_completed,
                COALESCE(SUM(pq.total_points), 0) AS total_points
           FROM students s
           LEFT JOIN played_quizzes pq ON pq.id_student = s.id_student
          GROUP BY s.id_student, s.username
          ORDER BY quizzes_completed DESC, total_points DESC, s.username ASC
          LIMIT $1`,
        [limit]
    );
    return result.rows;
};

// Student "Do after" quizzes management
export const insertDoAfterQuizForStudent = async (studentId, quizId) => {
    const result = await db.query(
        "INSERT INTO do_after (id_student, id_quiz) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *",
        [studentId, quizId]
    );
    return result.rowCount ? result.rows[0] : null;
}

export const getDoAfterQuizzesByStudentId = async (studentId) => {
    const result = await db.query(
        `SELECT id_quiz 
           FROM do_after
           WHERE id_student = $1`,
        [studentId]
    );
    return result.rows;
};

export const deleteDoAfterQuizForStudent = async (studentId, quizId) => {
    const result = await db.query(
        "DELETE FROM do_after WHERE id_student = $1 AND id_quiz = $2 RETURNING *",
        [studentId, quizId]
    );
    
    return result.rowCount ? result.rows[0] : null;
};