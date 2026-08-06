import { apiService } from './services/api.js';
import { DOMUtils } from './utils/dom.js';

let availableSubjects = [];

export const renderQuizList = async () => {
    // Carregar matérias disponíveis
    await fetchAvailableSubjects();

    const subjectOptions = availableSubjects.map(subject => 
        `<option value="${subject}">${subject}</option>`
    ).join('');

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
                    <select id="filter-subject">
                        <option value="">Selecione uma matéria</option>
                        ${subjectOptions}
                    </select>
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

async function fetchAvailableSubjects() {
    try {
        const response = await apiService.get('/api/quiz/subjects');
        availableSubjects = response.subjects || [];
    } catch (error) {
        console.error('Erro ao buscar matérias:', error);
        // Matérias padrão caso o endpoint falhe
        availableSubjects = [
            'Matemática',
            'Português',
            'História',
            'Geografia',
            'Ciências',
            'Inglês',
            'Física',
            'Química',
            'Biologia',
            'Educação Física'
        ];
    }
}

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
        container.innerHTML = '<p class="quiz-list-empty">Nenhum quiz encontrado com esses filtros.</p>';
        return;
    }

    container.innerHTML = quizzes.map((quiz) => {
        const subject = quiz.subject || 'Matéria não disponível';
        const theme = quiz.theme || 'Tema não disponível';
        const teacher = quiz.teacher_username || 'Desconhecido';
        const idQuiz = quiz.id_quiz || '---';
        return `
            <article class="quiz-card quiz-card-modern">
                <div class="quiz-card-header">
                    <div>
                        <div class="quiz-card-id">ID ${idQuiz}</div>
                        <div class="quiz-card-title">${theme}</div>
                    </div>
                </div>
                <div class="quiz-card-body">
                    <div class="quiz-card-line"><span>Professor</span><strong>${teacher}</strong></div>
                    <div class="quiz-card-line"><span>Matéria</span><strong>${subject}</strong></div>
                </div>
                <div class="quiz-card-actions">
                    <a href="/html/quiz.html?quizId=${idQuiz}"><button class="primary-button">Iniciar</button></a>
                    <button class="secondary-button do-after-btn" data-quiz-id="${idQuiz}">Fazer mais tarde</button>
                </div>
            </article>`;
    }).join('');

    const doAfterButtons = container.querySelectorAll('.do-after-btn');
    doAfterButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            const quizId = button.dataset.quizId;
            if (!quizId) {
                console.error('Quiz ID não encontrado para marcar como "Fazer mais tarde".');
                return;
            }
            const user = await fetchUser();
            if (!user) {
                window.location.href = '/html/register_login.html';
                return;
            }
            await apiService.post('/api/quiz/do-after', { userId: user.id_student, quizId });
        });
    });
}
