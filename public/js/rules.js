import { DOMUtils } from './utils/dom.js';

export const renderRules = () => {
    const html = `
        <section class="page-intro page-card modern-page-card">
            <span class="eyebrow">Regras do Quiz Game</span>
            <h2>Jogue sabendo exatamente como pontuar e avançar.</h2>
            <p>O sistema reúne regras claras para professores e estudantes aproveitarem a plataforma com transparência e ritmo constante.</p>
        </section>

        <section class="rules-grid">
            <div class="rule-card">
                <h3>Formato dos quizzes</h3>
                <p>Cada quiz conta com 10 questões e 5 alternativas por pergunta. A pontuação considera precisão e velocidade.</p>
            </div>
            <div class="rule-card">
                <h3>Uso de energia</h3>
                <p>Estudantes iniciam com 5 pontos de energia. Cada quiz usa 1 ponto e a recuperação acontece em 10 minutos.</p>
            </div>
            <div class="rule-card wide-card">
                <h3>Pontuação e ranking</h3>
                <ul>
                    <li>Apenas a melhor pontuação do quiz é contabilizada.</li>
                    <li>Quanto mais rápido responder corretamente, mais pontos ganha.</li>
                    <li>O ranking é atualizado em tempo real conforme o desempenho.</li>
                </ul>
            </div>
        </section>
    `;

    DOMUtils.setInnerHTML('#rules-content', html);
};
