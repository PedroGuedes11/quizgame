import db from "./db.js";

export const getTeacherByIdTeacher = async (teacherId) => {
    const result = await db.query(
        "SELECT id_teacher, username, email, profile_photo FROM teachers WHERE id_teacher = $1",
        [teacherId]
    );
    return result.rows[0];
};

export const getStudentByUserId = async (userId) => {
    const result = await db.query(
        "SELECT id_student, username, email, global_points, energy, last_update_energy, profile_photo FROM students WHERE id_student = $1",
            [userId]
        );
    return result.rows[0];
};

export const incrementEnergyById = async (studentId) => {
    const result = await db.query(
        "UPDATE students SET energy = LEAST(energy + 1, 5), last_update_energy = NOW() WHERE id_student = $1 RETURNING energy", 
        [studentId]
    );
    return result.rows[0].energy;
};

export const decrementEnergyById = (studentId) => {
    return async () => {
        const result = await db.query(
            "UPDATE students SET energy = GREATEST(energy - 1, 0), last_update_energy = NOW() WHERE id_student = $1 RETURNING energy",
            [studentId]
        );
        return result.rows[0].energy;
    };
};