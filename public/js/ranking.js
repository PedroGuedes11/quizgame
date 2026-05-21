import { DOMUtils } from './utils/dom.js';

export const renderRanking = () => {
    const html = `
        <section class="ranking-container">
            <div class="ranking-header">
                <h2>Ranking Geral</h2>
                <p>Veja os estudantes com melhor desempenho.</p>
            </div>
            <table class="ranking-table">
                <thead>
                    <tr>
                        <th>Posição</th>
                        <th>Aluno</th>
                        <th>Pontos</th>
                        <th>Quizzes</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>1</td><td>João</td><td>2400</td><td>12</td></tr>
                    <tr><td>2</td><td>Mariana</td><td>2180</td><td>11</td></tr>
                    <tr><td>3</td><td>Carlos</td><td>2040</td><td>10</td></tr>
                </tbody>
            </table>
        </section>
    `;

    DOMUtils.setInnerHTML('#ranking-content', html);
};
