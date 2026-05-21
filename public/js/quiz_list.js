import { apiService } from './services/api.js';
import { DOMUtils } from './utils/dom.js';

export const renderQuizList = () => {
    const html = `
        <section class="quiz-list-container">
            <div class="section-header">
                <h2>Buscar quizzes</h2>
                <p>Filtre quizzes por matéria, tema, professor ou ID.</p>
            </div>

            <form id="quiz-search-form" class="quiz-search-form">
                <div class="filter-row">
                    <label for="filter-id">ID do Quiz</label>
                    <input id="filter-id" type="text" placeholder="Ex: 5" />
                </div>
                <div class="filter-row">
                    <label for="filter-subject">Matéria</label>
                    <input id="filter-subject" type="text" placeholder="Ex: Matemática" />
                </div>
                <div class="filter-row">
                    <label for="filter-theme">Tema</label>
                    <input id="filter-theme" type="text" placeholder="Ex: Álgebra" />
                </div>
                <div class="filter-row">
                    <label for="filter-teacher">Professor</label>
                    <input id="filter-teacher" type="text" placeholder="Ex: Maria" />
                </div>
                <div class="filter-actions">
                    <button type="submit" class="primary-button">Buscar</button>
                    <button id="reset-filters-btn" type="button" class="secondary-button">Limpar</button>
                </div>
            </form>

            <div id="quiz-list-results" class="quiz-card-grid"></div>
        </section>
    `;

    DOMUtils.setInnerHTML('#quiz-list-content', html);
    bindQuizSearchEvents();
    loadQuizList();
};

function bindQuizSearchEvents() {
    DOMUtils.addEventListener('#quiz-search-form', 'submit', async (event) => {
        event.preventDefault();
        await loadQuizList();
    });

    DOMUtils.addEventListener('#reset-filters-btn', 'click', async () => {
        document.querySelector('#filter-id').value = '';
        document.querySelector('#filter-subject').value = '';
        document.querySelector('#filter-theme').value = '';
        document.querySelector('#filter-teacher').value = '';
        await loadQuizList();
    });
}

async function loadQuizList() {
    const quizId = document.querySelector('#filter-id')?.value.trim();
    const subject = document.querySelector('#filter-subject')?.value.trim();
    const theme = document.querySelector('#filter-theme')?.value.trim();
    const teacher = document.querySelector('#filter-teacher')?.value.trim();
    const resultsContainer = document.querySelector('#quiz-list-results');

    if (!resultsContainer) {
        return;
    }

    resultsContainer.innerHTML = '<p>Carregando quizzes...</p>';

    const params = new URLSearchParams();
    if (quizId) params.set('id', quizId);
    if (subject) params.set('subject', subject);
    if (theme) params.set('theme', theme);
    if (teacher) params.set('teacher', teacher);

    try {
        const queryString = params.toString();
        const response = await apiService.get(`/api/quiz/search${queryString ? `?${queryString}` : ''}`);
        const quizzes = response.quizzes || [];
        renderQuizCards(quizzes);
    } catch (error) {
        console.error('Erro ao buscar quizzes:', error);
        resultsContainer.innerHTML = '<p>Falha ao buscar quizzes. Tente novamente.</p>';
    }
}

async function fetchUser() {
    try {
        return await apiService.get('/api/user/user-info');
    } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        return null;
    }
};

function renderQuizCards(quizzes) {  
    const container = document.querySelector('#quiz-list-results');
    if (!container) {
        return;
    }

    if (!quizzes.length) {
        container.innerHTML = '<p>Nenhum quiz encontrado com esses filtros.</p>';
        return;
    }

    container.innerHTML = quizzes.map((quiz) => `
        <article class="quiz-card">
            <div class="quiz-card-top">
                <span class="quiz-card-id">ID: ${quiz.id_quiz}</span>
                <strong>${quiz.subject}</strong>
            </div>
            <p>${quiz.theme}</p>
            <p class="quiz-meta">Professor: ${quiz.teacher_username || 'Desconhecido'}</p>
            <p class="quiz-meta">Perguntas: ${quiz.question_count}</p>
            <a href="/html/quiz.html?id=${quiz.id_quiz}"><button>Iniciar</button></a>
            <button id="do-after-btn">Fazer mais tarde</button>
        </article>
    `).join('');

    // Bind "Fazer mais tarde" buttons
    const doAfterButtons = container.querySelectorAll('#do-after-btn');
    doAfterButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            const quizId = button.closest('.quiz-card')?.querySelector('.quiz-card-id')?.textContent.replace('ID: ', '').trim();
            if (!quizId) {
                console.error('Quiz ID não encontrado para marcar como "Fazer mais tarde".');
                return;
            };
            const user = await fetchUser();
            await apiService.post('/api/quiz/do-after', { userId: user.id_student, quizId });
        });
    });
}
