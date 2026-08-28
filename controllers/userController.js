import bcrypt from "bcrypt";
import db from "../model/db.js";
import { 
    getStudentByUserId, 
    getTeacherByIdTeacher,
    incrementEnergyById,
    decrementEnergyById
 } from "../model/userQueries.js";
import {
    getLeaderboardGeneral as getLeaderboardGeneralQuery,
    getQuizSubjects,
    getLeaderboardBySubject as getLeaderboardBySubjectQuery,
    getLeaderboardQuizzesCompleted as getLeaderboardQuizzesCompletedQuery
} from "../model/quizQueries.js";
import {
    deleteProfilePhoto,
    getProfilePhotoUrl,
    uploadProfilePhoto
} from "../services/s3Service.js";

const MAX_ENERGY = 5;
const ENERGY_REGEN_SECONDS = 10 * 60; // 10 minutes per energy point

const addProfilePhotoUrls = async (users) => {
    await Promise.all(users.map(async (user) => {
        user.profile_photo_url = await getProfilePhotoUrl(user.profile_photo);
    }));
};

export const getProfile = async (req, res) => {
    try {
        const userType = req.user.type;
        let user;

        if (userType === "student") {
            const userId = req.user.id_student;
            const student = await getStudentByUserId(userId);
            let { energy, last_update_energy: lastUpdateEnergy } = student;
            const now = new Date();
            const lastUpdate = new Date(lastUpdateEnergy);
            const elapsedSeconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
            const pointsRecovered = Math.floor(elapsedSeconds / ENERGY_REGEN_SECONDS);

            if (energy < MAX_ENERGY && pointsRecovered > 0) {
                const newEnergy = Math.min(MAX_ENERGY, energy + pointsRecovered);
                const adjustedLastUpdate = new Date(lastUpdate.getTime() + pointsRecovered * ENERGY_REGEN_SECONDS * 1000);
                await db.query(
                    "UPDATE students SET energy = $1, last_update_energy = $2 WHERE id_student = $3",
                    [newEnergy, adjustedLastUpdate.toISOString(), userId]
                );
                energy = newEnergy;
                lastUpdateEnergy = adjustedLastUpdate.toISOString();
            }

            const nextEnergyAt = energy < MAX_ENERGY
                ? new Date(new Date(lastUpdateEnergy).getTime() + ENERGY_REGEN_SECONDS * 1000)
                : null;
            const nextEnergySeconds = nextEnergyAt ? Math.max(0, Math.ceil((nextEnergyAt.getTime() - Date.now()) / 1000)) : null;

            user = {
                id_student: student.id_student,
                username: student.username,
                email: student.email,
                global_points: student.global_points,
                energy,
                last_update_energy: lastUpdateEnergy,
                profile_photo: student.profile_photo,
                next_energy_seconds: nextEnergySeconds,
            };
        } else {
            const userId = req.user.id_teacher;
            const teacher = await getTeacherByIdTeacher(userId);
            if (!teacher) {
                return res.status(404).json({ error: "Usuário não encontrado." });
            }

            const quizzesCreatedResult = await db.query(
                "SELECT COUNT(*) FROM quizzes WHERE teacher_id = $1",
                [userId]
            );

            user = {
                id_teacher: teacher.id_teacher,
                username: teacher.username,
                email: teacher.email,
                profile_photo: teacher.profile_photo,
                quizzes_created: Number(quizzesCreatedResult.rows[0].count)
            };
        }

        user.profile_photo_url = await getProfilePhotoUrl(user.profile_photo);
        res.json(user);
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

export const updateProfile = async (req, res) => {
    const { username, email, password } = req.body;
    const userType = req.user.type;
    const userId = userType === "student" ? req.user.id_student : req.user.id_teacher;
    const oldPhotoKey = req.user.profile_photo;
    let newPhotoKey;

    try {
        const updates = {
            username: username || req.user.username,
            email: email || req.user.email,
        };

        if (password && password.trim().length > 0) {
            updates.password = await bcrypt.hash(password, 10);
        }

        if (req.file) {
            newPhotoKey = await uploadProfilePhoto(req.file, userType, userId);
            updates.profile_photo = newPhotoKey;
        }

        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

        if (userType === "student") {
            values.push(userId);
            await db.query(
                `UPDATE students SET ${setClause} WHERE id_student = $${values.length}`,
                values
            );
        } else {
            values.push(userId);
            await db.query(
                `UPDATE teachers SET ${setClause} WHERE id_teacher = $${values.length}`,
                values
            );
        }

        const updatedProfile = await (userType === "student"
            ? db.query("SELECT id_student, username, email, global_points, energy, profile_photo FROM students WHERE id_student = $1", [userId])
            : db.query("SELECT id_teacher, username, email, profile_photo FROM teachers WHERE id_teacher = $1", [userId])
        );

        if (newPhotoKey && oldPhotoKey) {
            await deleteProfilePhoto(oldPhotoKey);
        }

        const updatedUser = updatedProfile.rows[0];
        updatedUser.profile_photo_url = await getProfilePhotoUrl(updatedUser.profile_photo);

        res.json({
            message: "Perfil atualizado com sucesso.",
            user: updatedUser
        });
    } catch (error) {
        if (newPhotoKey) {
            await deleteProfilePhoto(newPhotoKey).catch((cleanupError) => {
                console.error("Cleanup new profile photo error:", cleanupError);
            });
        }
        console.error("Update profile error:", error);
        if (error.code === "23505") {
            res.status(409).json({ error: "Username ou email já existe." });
        } else {
            res.status(500).json({ error: "Erro interno do servidor." });
        }
    }
};

export const decrementEnergy = async (req, res) => {
    try {
        const userId = req.user.id_student;
        const result = await db.query(
            "SELECT energy FROM students WHERE id_student = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        const currentEnergy = result.rows[0].energy;
        if (currentEnergy <= 0) {
            return res.status(400).json({ error: "Energia insuficiente para iniciar o quiz." });
        }

        const updateResult = await db.query(
            "UPDATE students SET energy = GREATEST(energy - 1, 0), last_update_energy = NOW() WHERE id_student = $1 RETURNING energy",
            [userId]
        );

        if (updateResult.rows.length === 0) {
            return res.status(500).json({ error: "Falha ao atualizar energia." });
        }

        res.json({ energy: updateResult.rows[0].energy });
    } catch (error) {
        console.error("Error decrementing energy:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

export const incrementEnergy = async (req, res) => {
    try {
        const userId = req.user.id_student;
        await incrementEnergyById(userId);
        
        res.json({ message: "Energy incremented" });
    } catch (error) {
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

export const getLeaderboardGeneral = async (req, res) => {
    try {
        const leaderboard = await getLeaderboardGeneralQuery(20);
        await addProfilePhotoUrls(leaderboard);
        res.json(leaderboard);
    } catch (error) {
        console.error("Get leaderboard general error:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

export const getLeaderboardSubjects = async (req, res) => {
    try {
        const subjects = await getQuizSubjects();
        res.json(subjects);
    } catch (error) {
        console.error("Get leaderboard subjects error:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

export const getLeaderboardBySubject = async (req, res) => {
    try {
        const subject = req.query.subject;
        if (!subject) {
            return res.status(400).json({ error: "O parâmetro subject é obrigatório." });
        }

        const leaderboard = await getLeaderboardBySubjectQuery(subject, 20);
        await addProfilePhotoUrls(leaderboard);
        res.json(leaderboard);
    } catch (error) {
        console.error("Get leaderboard by subject error:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

export const getLeaderboardQuizzesCompleted = async (req, res) => {
    try {
        const leaderboard = await getLeaderboardQuizzesCompletedQuery(20);
        await addProfilePhotoUrls(leaderboard);
        res.json(leaderboard);
    } catch (error) {
        console.error("Get leaderboard quizzes completed error:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};