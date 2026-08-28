import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === 'production';

// Prefer standard DATABASE_URL, accept some common alternate names
const databaseUrl = process.env.DATABASE_URL || process.env.RENDER_DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRESQL_URL || '';

if (isProduction && !databaseUrl) {
    console.error('\nFATAL: running in production but no DATABASE_URL found.\nPlease set the `DATABASE_URL` environment variable to your Postgres connection string (Render provides this for managed databases).\nExample: DATABASE_URL=postgres://user:pass@host:5432/dbname\n');
    process.exit(1);
}

const isLocalhostUrl = databaseUrl ? /localhost|127\.0\.0\.1/.test(databaseUrl) : false;
const shouldUseSsl = (isProduction || (databaseUrl && databaseUrl.includes('render.com'))) && !isLocalhostUrl;

const db = new Pool({
    connectionString: databaseUrl || undefined,
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : false
});

export const createTables = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS students (
            id_student          BIGSERIAL PRIMARY KEY,
            username            VARCHAR(100) NOT NULL,
            email               VARCHAR(100) NOT NULL UNIQUE,
            password            VARCHAR(100) NOT NULL,
            global_points       INTEGER NOT NULL DEFAULT 0,
            energy              INTEGER NOT NULL DEFAULT 5 CHECK (energy BETWEEN 0 AND 5),
            last_update_energy  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS teachers (
            id_teacher  BIGSERIAL PRIMARY KEY,
            username    VARCHAR(100) NOT NULL,
            email       VARCHAR(100) NOT NULL UNIQUE,
            password    VARCHAR(100) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS quizzes (
            id_quiz      BIGSERIAL PRIMARY KEY,
            teacher_id   BIGINT NOT NULL,
            subject      VARCHAR(100) NOT NULL,
            theme        VARCHAR(100) NOT NULL,
            created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

            CONSTRAINT fk_quiz_teacher
                FOREIGN KEY (teacher_id)
                REFERENCES teachers(id_teacher)
                ON UPDATE CASCADE ON DELETE RESTRICT
        );

        CREATE TABLE IF NOT EXISTS questions (
            id_question  BIGSERIAL PRIMARY KEY,
            id_quiz      BIGINT NOT NULL,
            question_text VARCHAR(500) NOT NULL,
            question_order INTEGER NOT NULL,

            CONSTRAINT fk_question_quiz
                FOREIGN KEY (id_quiz)
                REFERENCES quizzes(id_quiz)
                ON UPDATE CASCADE ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS alternatives (
            id_alternative BIGSERIAL PRIMARY KEY,
            id_question    BIGINT NOT NULL,
            label          CHAR(1) NOT NULL,  -- A, B, C, D...
            text           VARCHAR(300) NOT NULL,
            is_correct     BOOLEAN NOT NULL DEFAULT FALSE,

            CONSTRAINT fk_alt_question
                FOREIGN KEY (id_question)
                REFERENCES questions(id_question)
                ON UPDATE CASCADE ON DELETE CASCADE,

            CONSTRAINT uq_alt_label UNIQUE (id_question, label)
        );

        CREATE TABLE IF NOT EXISTS played_quizzes (
            id_played     BIGSERIAL PRIMARY KEY,
            id_student    BIGINT NOT NULL,
            id_quiz       BIGINT NOT NULL,
            correct_answers INTEGER NOT NULL DEFAULT 0,
            time_seconds INTEGER NOT NULL DEFAULT 0,
            started_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            finished_at   TIMESTAMP WITH TIME ZONE,
            total_points  INTEGER DEFAULT 0,
            points        INTEGER DEFAULT 0,

            CONSTRAINT fk_played_student
                FOREIGN KEY (id_student)
                REFERENCES students(id_student)
                ON UPDATE CASCADE ON DELETE CASCADE,

            CONSTRAINT fk_played_quiz
                FOREIGN KEY (id_quiz)
                REFERENCES quizzes(id_quiz)
                ON UPDATE CASCADE ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS played_answers (
            id_played_answer BIGSERIAL PRIMARY KEY,
            id_played        BIGINT NOT NULL,
            id_question      BIGINT NOT NULL,
            id_alternative   BIGINT NOT NULL,
            is_correct       BOOLEAN NOT NULL,

            CONSTRAINT fk_pa_played
                FOREIGN KEY (id_played)
                REFERENCES played_quizzes(id_played)
                ON UPDATE CASCADE ON DELETE CASCADE,

            CONSTRAINT fk_pa_question
                FOREIGN KEY (id_question)
                REFERENCES questions(id_question)
                ON UPDATE CASCADE ON DELETE CASCADE,

            CONSTRAINT fk_pa_alternative
                FOREIGN KEY (id_alternative)
                REFERENCES alternatives(id_alternative)
                ON UPDATE CASCADE ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS do_after (
            id_student  BIGINT NOT NULL,
            id_quiz     BIGINT NOT NULL,

            CONSTRAINT pk_do_after PRIMARY KEY (id_student, id_quiz),

            CONSTRAINT fk_do_after_student
                FOREIGN KEY (id_student)
                REFERENCES students (id_student)
                ON UPDATE CASCADE ON DELETE CASCADE,

            CONSTRAINT fk_do_after_quiz
                FOREIGN KEY (id_quiz)
                REFERENCES quizzes (id_quiz)
                ON UPDATE CASCADE ON DELETE CASCADE
        );`
    );

    await db.query(`
        ALTER TABLE played_quizzes ADD COLUMN IF NOT EXISTS correct_answers INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE played_quizzes ADD COLUMN IF NOT EXISTS time_seconds INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE played_quizzes ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;
    `);

    await db.query(`
        CREATE OR REPLACE FUNCTION public.calc_points()
         RETURNS trigger
         LANGUAGE plpgsql
        AS $function$
        BEGIN
            IF NEW.correct_answers IS NULL OR NEW.time_seconds IS NULL OR NEW.time_seconds = 0 THEN
                NEW.points := COALESCE(NEW.total_points, 0);
            ELSE
                NEW.points := (NEW.correct_answers * 100) / NEW.time_seconds;
            END IF;
            RETURN NEW;
        END;
        $function$;
    `);

    // Ensure profile_photo column exists for students and teachers (default neutral image)
    await db.query(`
        ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500);
        ALTER TABLE teachers ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500);
        ALTER TABLE students ALTER COLUMN profile_photo TYPE VARCHAR(500);
        ALTER TABLE teachers ALTER COLUMN profile_photo TYPE VARCHAR(500);
        ALTER TABLE students ALTER COLUMN profile_photo DROP DEFAULT;
        ALTER TABLE teachers ALTER COLUMN profile_photo DROP DEFAULT;
    `);
};

export default db;
