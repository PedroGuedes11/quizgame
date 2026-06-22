import db from './model/db.js';

const args = process.argv.slice(2);
const allFlag = args.includes('--all');
const beforeArg = args.find((arg) => arg.startsWith('--before='));

const printUsage = () => {
    console.log('Uso: node cleanup_old_quizzes.js [--all] [--before=YYYY-MM-DD]');
    console.log('  --all               Remove todos os quizzes e históricos de jogo.');
    console.log('  --before=YYYY-MM-DD Remove apenas quizzes criados antes desta data.');
    console.log('Exemplos:');
    console.log('  node cleanup_old_quizzes.js --all');
    console.log('  node cleanup_old_quizzes.js --before=2026-01-01');
};

const parseDate = (dateString) => {
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const cleanup = async () => {
    if (!allFlag && !beforeArg) {
        printUsage();
        process.exit(1);
    }

    try {
        let deletedQuizCount = 0;

        if (allFlag) {
            const countRes = await db.query('SELECT COUNT(*) AS total FROM quizzes');
            deletedQuizCount = Number(countRes.rows[0]?.total || 0);
            await db.query('DELETE FROM quizzes');
            console.log(`Quizzes removidos: ${deletedQuizCount}`);
        } else {
            const beforeDate = beforeArg.split('=')[1];
            const parsedDate = parseDate(beforeDate);
            if (!parsedDate) {
                console.error(`Data inválida em --before: ${beforeDate}`);
                process.exit(1);
            }

            const countRes = await db.query(
                'SELECT COUNT(*) AS total FROM quizzes WHERE created_at < $1',
                [parsedDate]
            );
            deletedQuizCount = Number(countRes.rows[0]?.total || 0);
            await db.query('DELETE FROM quizzes WHERE created_at < $1', [parsedDate]);
            console.log(`Quizzes removidos antes de ${beforeDate}: ${deletedQuizCount}`);
        }

        const resetRes = await db.query(`
            UPDATE students
            SET global_points = COALESCE(
                (SELECT SUM(points) FROM played_quizzes WHERE played_quizzes.id_student = students.id_student),
                0
            )
        `);

        console.log(`Pontuação global recalculada para ${resetRes.rowCount} estudante(s).`);
        console.log('Limpeza concluída com sucesso.');
    } catch (error) {
        console.error('Erro ao executar limpeza de quizzes:', error);
        process.exit(1);
    } finally {
        await db.end();
    }
};

cleanup();
