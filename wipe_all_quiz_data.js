import db from './model/db.js';

const main = async () => {
    try {
        const playedAnswers = await db.query('DELETE FROM played_answers');
        const doAfter = await db.query('DELETE FROM do_after');
        const playedQuizzes = await db.query('DELETE FROM played_quizzes');
        const alternatives = await db.query('DELETE FROM alternatives');
        const questions = await db.query('DELETE FROM questions');
        const quizzes = await db.query('DELETE FROM quizzes');

        const resetPoints = await db.query('UPDATE students SET global_points = 0');

        console.log('Limpeza completa:');
        console.log(`  alternativas removidas: ${alternatives.rowCount}`);
        console.log(`  questões removidas: ${questions.rowCount}`);
        console.log(`  quizzes removidos: ${quizzes.rowCount}`);
        console.log(`  quizzes jogados removidos: ${playedQuizzes.rowCount}`);
        console.log(`  respostas jogadas removidas: ${playedAnswers.rowCount}`);
        console.log(`  listas de "fazer mais tarde" removidas: ${doAfter.rowCount}`);
        console.log(`  pontuação global resetada para ${resetPoints.rowCount} usuário(s)`);
        console.log('Todos os registros de quizzes, histórico e pontuação foram apagados.');
    } catch (error) {
        console.error('Erro ao limpar dados de quizzes:', error);
        process.exit(1);
    } finally {
        await db.end();
    }
};

main();
