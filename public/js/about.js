import { DOMUtils } from './utils/dom.js';

export const renderAbout = () => {
    const html = `
        <section class="page-intro page-card modern-page-card">
            <span class="eyebrow">Sobre o Quiz Game</span>
            <h2>Aprenda, crie quizzes e engaje sua turma com uma interface leve.</h2>
            <p>O Quiz Game conecta professores universitários e estudantes em uma experiência gamificada, voltado para reforçar conteúdos do ensino médio.</p>
        </section>

        <section class="about-grid">
            <div class="feature-card">
                <h3>Professores</h3>
                <p>Monte quizzes completos, defina temas, acompanhe resultados e ajuste o ritmo das suas turmas.</p>
            </div>
            <div class="feature-card">
                <h3>Estudantes</h3>
                <p>Pratique conteúdos, responda desafios em sequência e veja seu progresso no ranking.</p>
            </div>
            <div class="feature-card wide-card">
                <h3>Como funciona</h3>
                <ul>
                    <li>Cada quiz tem 10 questões com 4 alternativas.</li>
                    <li>Responda as perguntas com rapidez para ganhar mais pontos.</li>
                    <li>As pontuações são atualizadas automaticamente no ranking.</li>
                </ul>
            </div>
        </section>
    `;

    DOMUtils.setInnerHTML('#about-content', html);
};
