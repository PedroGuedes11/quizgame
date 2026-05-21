import { DOMUtils } from './utils/dom.js';

export const renderHomepage = () => {
    const content = `
        <section class="homepage-hero">
            <div class="homepage-text">
                <h1>Quiz Game</h1>
                <p>Aprenda, treine e ganhe pontos com quizzes interativos.</p>
                <div class="homepage-actions">
                    <a href="/html/register_login.html" class="btn-primary">Entrar / Registrar</a>
                    <a href="/html/quiz_list.html" class="btn-secondary">Ver quizzes</a>
                </div>
            </div>
            <div class="homepage-stats">
                <div class="stat-card">
                    <h2>+ de 10 temas</h2>
                    <p>Quizzes para todas as disciplinas.</p>
                </div>
                <div class="stat-card">
                    <h2>Desafios diários</h2>
                    <p>Ganhe pontos e energias a cada resposta certa.</p>
                </div>
            </div>
        </section>
    `;

    DOMUtils.setInnerHTML('#homepage-content', content);
};

