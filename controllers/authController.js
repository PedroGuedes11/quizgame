import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../model/db.js";

const SECRET_KEY = process.env.SECRET_KEY;

export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await db.query(
            "SELECT * FROM students WHERE username = $1 OR email = $1",
            [username]
        );
        let userType = "student";

        if (user.rows.length === 0) {
            user = await db.query(
                "SELECT * FROM teachers WHERE username = $1 OR email = $1",
                [username]
            );
            userType = "teacher";
        }

        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Credenciais inválidas. Verifique nome de usuário/email e senha." });
        }

        const userData = user.rows[0];
        const isValidPassword = await bcrypt.compare(password, userData.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: "Senha incorreta." });
        }

        const token = jwt.sign(
            { id: userData.id_student || userData.id_teacher, type: userType },
            SECRET_KEY,
            { expiresIn: "24h" }
        );

        res.json({ token, userType });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
};

export const register = async (req, res) => {
    const { username, email, password, userType } = req.body;
    const profilePhoto = req.file ? req.file.filename : 'default.svg';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        if (userType === "student") {
            await db.query(
                "INSERT INTO students (username, email, password, profile_photo) VALUES ($1, $2, $3, $4)",
                [username, email, hashedPassword, profilePhoto]
            );
        } else if (userType === "teacher") {
            await db.query(
                "INSERT INTO teachers (username, email, password, profile_photo) VALUES ($1, $2, $3, $4)",
                [username, email, hashedPassword, profilePhoto]
            );
        } else {
            return res.status(400).json({ error: "Tipo de usuário inválido." });
        }

        res.status(201).json({ message: "Usuário registrado com sucesso." });
    } catch (error) {
        console.error("Registration error:", error);
        if (error.code === "23505") { // Unique violation
            res.status(409).json({ error: "Usuário ou email já existe." });
        } else {
            res.status(500).json({ error: "Erro interno do servidor." });
        }
    }
};