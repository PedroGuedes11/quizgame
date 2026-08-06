import { DOMUtils } from './utils/dom.js';

export const renderHomepage = () => {
    const content = `
        <section class="page-intro page-card modern-page-card homepage-intro">
            <span class="eyebrow">Quiz Game</span>
            <h2>Aprenda, pratique e ganhe pontos em quizzes interativos.</h2>
            <p>Monte seu ranking pessoal, desafie seus conhecimentos e acompanhe sua evolução na plataforma.</p>
            <div class="homepage-actions">
                <a href="/html/register_login.html" class="btn-primary">Entrar / Registrar</a>
            </div>
        </section>

        <section class="homepage-grid">
            <div class="homepage-card stat-card">
                <h3>13 disciplinas</h3>
                <p>Reforce conteúdos nas disciplinas presentes na grade do ensino médio brasileiro.</p>
            </div>
            <div class="homepage-card stat-card">
                <h3>10 questões</h3>
                <p>Cada quiz contém 10 perguntas com 4 alternativas a escolher.</p>
            </div>
            <div class="homepage-card stat-card">
                <h3>1 hora</h3>
                <p>Você tem 1 hora para concluir o quiz; rapidez e precisão aumentam sua pontuação.</p>
            </div>
            <div class="homepage-card stat-card">
                <h3>10 minutos</h3>
                <p>O tempo de recuperação de energia entre as jogadas é de 10 minutos por ponto.</p>
            </div>
        </section>
    `;

    DOMUtils.setInnerHTML('#homepage-content', content);
};

