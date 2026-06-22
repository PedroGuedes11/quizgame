import { DOMUtils } from './utils/dom.js';
import { apiService } from './services/api.js';

const createTable = (columns, rows) => {
    if (!rows || rows.length === 0) {
        return '<p class="ranking-empty">Nenhum resultado disponível.</p>';
    }

    const head = columns.map((col) => `<th>${col.label}</th>`).join('');
    const body = rows.map((row, index) => {
        const cells = columns.map((col) => `<td>${col.render ? col.render(row, index) : row[col.key]}</td>`).join('');
        return `<tr>${cells}</tr>`;
    }).join('');

    return `
        <table class="ranking-table">
            <thead><tr>${head}</tr></thead>
            <tbody>${body}</tbody>
        </table>
    `;
};

const renderLoading = () => `
    <div class="ranking-loading">
        <p>Carregando dados do ranking...</p>
    </div>
`;

const renderError = (message) => `
    <div class="ranking-error">
        <p>${message}</p>
    </div>
`;

const loadGeneralRanking = async () => {
    const content = document.querySelector('#ranking-view');
    if (!content) return;
    content.innerHTML = renderLoading();

    try {
        const data = await apiService.get('/api/user/leaderboard/general');
        content.innerHTML = createTable(
            [
                { label: 'Posição', key: 'position', render: (_, index) => index + 1 },
                { label: 'Aluno', key: 'username' },
                { label: 'Pontos gerais', key: 'global_points' },
                { label: 'Quizzes completos', key: 'quizzes_completed' }
            ],
            data
        );
    } catch (error) {
        console.error('Erro ao carregar ranking geral:', error);
        content.innerHTML = renderError('Não foi possível carregar o ranking geral.');
    }
};

const loadSubjectsList = async () => {
    try {
        const subjects = await apiService.get('/api/user/leaderboard/subjects');
        const select = document.querySelector('#subject-select');
        if (!select) return subjects;

        select.innerHTML = subjects.length
            ? subjects.map((subject) => `<option value="${subject}">${subject}</option>`).join('')
            : '<option value="">Nenhuma matéria encontrada</option>';

        return subjects;
    } catch (error) {
        console.error('Erro ao carregar assuntos do ranking:', error);
        const content = document.querySelector('#ranking-view');
        if (content) content.innerHTML = renderError('Não foi possível carregar as matérias.');
        return [];
    }
};

const loadSubjectRanking = async (subject) => {
    const content = document.querySelector('#ranking-view');
    if (!content) return;
    content.innerHTML = renderLoading();

    try {
        const data = await apiService.get(`/api/user/leaderboard/subject?subject=${encodeURIComponent(subject)}`);
        content.innerHTML = `
            <div class="ranking-section-title">
                <h3>Ranking por matéria: ${subject}</h3>
            </div>
            ${createTable(
                [
                    { label: 'Posição', key: 'position', render: (_, index) => index + 1 },
                    { label: 'Aluno', key: 'username' },
                    { label: 'Pontos na matéria', key: 'subject_points' },
                    { label: 'Quizzes completos', key: 'quizzes_completed' }
                ],
                data
            )}
        `;
    } catch (error) {
        console.error('Erro ao carregar ranking por matéria:', error);
        content.innerHTML = renderError('Não foi possível carregar o ranking por matéria.');
    }
};

const loadCompletedRanking = async () => {
    const content = document.querySelector('#ranking-view');
    if (!content) return;
    content.innerHTML = renderLoading();

    try {
        const data = await apiService.get('/api/user/leaderboard/completed');
        content.innerHTML = createTable(
            [
                { label: 'Posição', key: 'position', render: (_, index) => index + 1 },
                { label: 'Aluno', key: 'username' },
                { label: 'Quizzes concluídos', key: 'quizzes_completed' },
                { label: 'Pontos totais', key: 'total_points' }
            ],
            data
        );
    } catch (error) {
        console.error('Erro ao carregar ranking de quizzes completos:', error);
        content.innerHTML = renderError('Não foi possível carregar o ranking de quizzes concluídos.');
    }
};

const setActiveTab = (tab) => {
    const buttons = document.querySelectorAll('.ranking-tab');
    buttons.forEach((button) => {
        if (button.dataset.tab === tab) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
};

const bindRankingEvents = () => {
    const tabs = document.querySelectorAll('.ranking-tab');
    tabs.forEach((tab) => {
        tab.addEventListener('click', async () => {
            const selectedTab = tab.dataset.tab;
            setActiveTab(selectedTab);

            const subjectFilter = document.querySelector('#subject-filter');
            if (subjectFilter) {
                subjectFilter.style.display = selectedTab === 'subject' ? 'flex' : 'none';
            }

            if (selectedTab === 'general') {
                await loadGeneralRanking();
            } else if (selectedTab === 'subject') {
                const select = document.querySelector('#subject-select');
                const subject = select?.value || '';
                if (subject) {
                    await loadSubjectRanking(subject);
                } else {
                    const content = document.querySelector('#ranking-view');
                    if (content) content.innerHTML = renderError('Selecione uma matéria para ver o ranking.');
                }
            } else if (selectedTab === 'completed') {
                await loadCompletedRanking();
            }
        });
    });

    const subjectSelect = document.querySelector('#subject-select');
    if (subjectSelect) {
        subjectSelect.addEventListener('change', async () => {
            const subject = subjectSelect.value;
            if (subject) {
                await loadSubjectRanking(subject);
            }
        });
    }
};

export const renderRanking = async () => {
    const html = `
        <section class="ranking-container">
            <div class="ranking-header">
                <h2>Ranking</h2>
                <p>Compare desempenho geral, por matéria e por quizzes concluídos.</p>
            </div>
            <div class="ranking-tabs">
                <button class="ranking-tab active" data-tab="general">Geral</button>
                <button class="ranking-tab" data-tab="subject">Por matéria</button>
                <button class="ranking-tab" data-tab="completed">Quizzes completados</button>
            </div>
            <div id="subject-filter" class="ranking-subject-filter" style="display: none; margin-bottom: 16px;">
                <label for="subject-select">Matéria:</label>
                <select id="subject-select"></select>
            </div>
            <div id="ranking-view"></div>
        </section>
    `;

    DOMUtils.setInnerHTML('#ranking-content', html);
    bindRankingEvents();

    await loadSubjectsList();
    await loadGeneralRanking();
};
