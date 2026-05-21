import { DOMUtils } from './utils/dom.js';

export const renderRules = () => {
    const html = `
        <section class="page-card">
            <h2>Regras do Quiz Game</h2>
            <ul>
                <li>Responda cada questão antes que o tempo acabe.</li>
                <li>Cada resposta correta soma pontos ao seu total.</li>
                <li>O ranking é atualizado com base no desempenho de cada quiz.</li>
                <li>Estudantes têm energia limitada; use-a com sabedoria.</li>
            </ul>
            <p>Mantenha um comportamento respeitoso e use a plataforma para estudar e se divertir.</p>
        </section>
    `;

    DOMUtils.setInnerHTML('#rules-content', html);
};
