import { DOMUtils } from './utils/dom.js';

export const renderAbout = () => {
    const html = `
        <section class="page-card">
            <h2>Sobre o Quiz Game</h2>
            <p>O Quiz Game é uma plataforma interativa para estudantes e professores. Aqui você pode criar quizzes, responder desafios e acompanhar pontuações.</p>
            <p>Nosso objetivo é tornar o aprendizado mais divertido e responsivo, usando quizzes adaptados e ranking para manter a motivação.</p>
            <div class="about-features">
                <div class="feature-item">
                    <h3>Para estudantes</h3>
                    <p>Participe de quizzes, ganhe pontos e monte seu ranking pessoal.</p>
                </div>
                <div class="feature-item">
                    <h3>Para professores</h3>
                    <p>Crie quizzes, acompanhe progresso e ajuste desafios para sua turma.</p>
                </div>
            </div>
        </section>
    `;

    DOMUtils.setInnerHTML('#about-content', html);
};
