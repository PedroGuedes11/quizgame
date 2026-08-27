import { apiService } from './services/api.js';
import { DOMUtils } from './utils/dom.js';
import {
    renderQuestionCard,
    renderNavigationButtons,
    getTimerHtml,
    showFeedbackModal,
    showConfirmationModal
} from './components/index.js';

let quizData = null;
let selectedAlternatives = [];
let timeLeft = 0;
let timer = null;
let startedAt = null;
let currentQuestionIndex = 0;
let eventsInitialized = false;

export const renderQuiz = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId') || urlParams.get('id');

    if (!quizId) {
        console.error('ID do quiz não encontrado na URL');
        window.location.href = '/html/quiz_list.html';
        return;
    }

    try {
        await consumeEnergyOnOpen();
    } catch (error) {
        showFeedbackModal({ title: 'Não foi possível iniciar', message: error.message || 'Verifique sua energia.', type: 'error', onClose: () => {
            window.location.href = '/html/dashboard_student.html';
        }});
        return;
    }

    quizData = await fetchQuizData(quizId);
    console.debug('Quiz data loaded:', quizData);
    if (!quizData || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
        console.error('Quiz inválido ou sem perguntas:', quizData);
        showFeedbackModal({ title: 'Quiz indisponível', message: 'Não foi possível carregar o quiz. Verifique se ele existe.', type: 'error', onClose: () => {
            window.location.href = '/html/quiz_list.html';
        }});
        return;
    }
    selectedAlternatives = new Array(quizData.questions.length).fill(null);
    timeLeft = 3600;
    startedAt = new Date();
    currentQuestionIndex = 0;

    const meta = quizData.metadata || {}; 
    const idDisplay = quizData.quizId || meta.id_quiz || quizData.id || quizData.id_quiz || quizData.idQuiz || '---';
    const themeDisplay = meta.theme || quizData.theme || quizData.title || quizData.name || '';
    const subjectDisplay = meta.subject || quizData.subject || quizData.matter || '';

    const html = `
        <div class="quiz-hero compact-hero">
            <div class="quiz-hero-copy">
                <div class="quiz-meta-line"><strong>ID</strong> ${idDisplay}</div>
                <div class="quiz-meta-line"><strong>Tema</strong> ${themeDisplay}</div>
                <div class="quiz-meta-line"><strong>Matéria</strong> ${subjectDisplay}</div>
            </div>
            <div class="quiz-hero-meta">
                <div class="quiz-timer-box">
                    <span>Tempo restante</span>
                    <div id="timer"></div>
                </div>
            </div>
        </div>
        <div class="quiz-footer">
            <div id="navigation-buttons"></div>
            <button id="submit-quiz-btn" type="button">Terminar quiz</button>
        </div>
        <div id="quiz-container" class="quiz-container"></div>
        <div id="quiz-progress"></div>
    `;

    DOMUtils.setInnerHTML('#quiz-content', html);
    startTimer();
    renderTimer();
    renderQuizContainer();
    renderQuestion(currentQuestionIndex);
    renderNavigation();
    bindEvents();
};


async function consumeEnergyOnOpen() {
    try {
        const response = await apiService.post('/api/user/decrement-energy');
        return response;
    } catch (error) {
        console.error('Failed to consume energy on quiz open:', error);
        if (error.message.includes('400')) {
            throw new Error('Você não tem energia suficiente para iniciar este quiz.');
        }
        throw error;
    }
}

async function fetchQuizData(quizId) {
    try {
        const response = await apiService.get(`/api/quiz/get-quiz-data/${quizId}`);
        return response;
    } catch (error) {
        console.error('Failed to fetch quiz data:', error);
        throw error;
    }
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            submitQuiz();
        }
    }, 1000);
}

function renderTimer() {
    let timerElement = document.querySelector('#timer');
    const parent = document.querySelector('#quiz-content') || document.querySelector('main') || document.body;

    if (!timerElement) {
        timerElement = DOMUtils.createElement('div', { id: 'timer' });
        parent.appendChild(timerElement);
    }

    timerElement.innerHTML = '';
    const timerEl = getTimerHtml();
    DOMUtils.appendChild('#timer', timerEl);
    updateTimerDisplay(); 
}

function updateTimerDisplay() {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60); 
    const seconds = timeLeft % 60;

    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    DOMUtils.setTextContent('#timer', timeString);
}

function renderQuizContainer() {
    let container = document.querySelector('#quiz-container');
    const parent = document.querySelector('#quiz-content') || document.querySelector('main') || document.body;

    if (!container) {
        container = DOMUtils.createElement('div', { id: 'quiz-container', class: 'quiz-container' });
        parent.appendChild(container);
    }
}

function renderQuestion() {
    const question = quizData.questions[currentQuestionIndex];
    if (!question) {
        console.error('Questão não encontrada para índice', currentQuestionIndex, quizData.questions);
        return;
    }

    const questionElement = renderQuestionCard(
        question,
        currentQuestionIndex,
        selectedAlternatives[currentQuestionIndex],
    );

    DOMUtils.setInnerHTML('#quiz-container', '');
    DOMUtils.appendChild('#quiz-container', questionElement);
    renderQuizProgress();
}

function renderQuizProgress() {
    const totalCount = quizData.questions.length;
    const answeredCount = selectedAlternatives.filter((alt) => alt != null && alt !== '').length;

    const progressHtml = `
        <div class="quiz-progress-card">
            <span class="progress-label">Questão ${currentQuestionIndex + 1} de ${totalCount}</span>
            <span class="progress-answer-count">${answeredCount} respondidas</span>
        </div>
    `;

    DOMUtils.setInnerHTML('#quiz-progress', progressHtml);
}

function renderNavigation() {
    const totalQuestions = quizData.questions.length;
    let navElement = document.querySelector('#navigation-buttons');
    const parent = document.querySelector('#quiz-content') || document.querySelector('main') || document.body;

    if (!navElement) {
        navElement = DOMUtils.createElement('div', { id: 'navigation-buttons' });
        parent.appendChild(navElement);
    }

    navElement.innerHTML = '';
    const navButtons = renderNavigationButtons(
        currentQuestionIndex > 0,
        currentQuestionIndex < totalQuestions - 1
    );
    navElement.appendChild(navButtons);
    updateNavigation();
}

function bindEvents() {
    if (!eventsInitialized) {
        document.body.addEventListener('change', (e) => {
            const input = e.target;
            if (input && input.matches('input[type="radio"][name^="question-"]')) {
                const selectedValue = input.value;
                selectedAlternatives[currentQuestionIndex] = selectedValue ? selectedValue : null;
                renderQuestion();
            }
        });

        document.body.addEventListener('click', (e) => {
            const submitButton = e.target.closest('#submit-quiz-btn');
            if (submitButton) {
                e.preventDefault();
                submitQuiz();
                return;
            }

            const prevButton = e.target.closest('#prev-btn');
            if (prevButton) {
                e.preventDefault();
                previousQuestion();
                return;
            }

            const nextButton = e.target.closest('#next-btn');
            if (nextButton) {
                e.preventDefault();
                nextQuestion();
                return;
            }
        });

        eventsInitialized = true;
    }
}

function nextQuestion() {
    if (currentQuestionIndex < quizData.questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
        renderQuizProgress();
        renderNavigation();
        bindEvents();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
        renderQuizProgress();
        renderNavigation();
        bindEvents();
    }
}

function updateNavigation() {
    const totalQuestions = quizData.questions.length;
    const prevBtn = document.querySelector('#prev-btn');
    const nextBtn = document.querySelector('#next-btn');

    if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
    if (nextBtn) nextBtn.disabled = currentQuestionIndex === totalQuestions - 1;
}

async function submitQuiz() {
    const timePoints = timeLeft;
    const finishedAt = new Date();

    const unanswered = selectedAlternatives.filter((alt) => alt == null).length;
    if (unanswered > 0) {
        const shouldSubmit = await showConfirmationModal({
            title: 'Questões não respondidas',
            message: `Você tem ${unanswered} questões não respondidas. Deseja submeter mesmo assim?`
        });
        if (!shouldSubmit) {
            return;
        }
    }

    clearInterval(timer);

    try {
        const answers = selectedAlternatives
            .map((altId, index) => ({
                questionId: quizData.questions[index]?.id_question ?? null,
                alternativeId: altId
            }))
            .filter((answer) => answer.questionId != null && answer.alternativeId != null && answer.alternativeId !== '');

        const correctCount = answers.reduce((count, answer) => {
            const question = quizData.questions.find(q => q.id_question === answer.questionId);
            if (!question) return count;
            const alternative = question.alternatives.find(a => a.id_alternative === answer.alternativeId);
            return count + (alternative && alternative.is_correct ? 1 : 0);
        }, 0);

        const response = await apiService.post('/api/quiz/submit', {
            quizId: quizData.quizId,
            answers: answers,
            correctCount: correctCount,
            timePoints: timePoints,
            startedAt: startedAt,
            finishedAt: finishedAt
        });

        // If server returned updated global points, store temporarily for immediate dashboard display
        if (response && typeof response.global_points !== 'undefined') {
            try { localStorage.setItem('global_points', String(response.global_points)); } catch(e) { }
        }

        try {
            const profile = await apiService.get('/api/user/user-info');
            if (profile && typeof profile.global_points !== 'undefined') {
                try { localStorage.setItem('global_points', String(profile.global_points)); } catch(e) { }
            }
        } catch (e) {
            console.warn('Falha ao atualizar perfil pós-submit:', e);
        }

        const score = response?.score ?? correctCount;
        showFeedbackModal({
            title: 'Quiz finalizado',
            message: `Você acertou ${correctCount} de ${quizData.questions.length} questões e obteve ${score} pontos.`,
            onClose: () => {
                window.location.href = '/html/dashboard_student.html';
            }
        });
    } catch (error) {
        if (error.message && error.message.includes('401')) {
            return;
        }
        showFeedbackModal({ title: 'Falha ao finalizar quiz', message: error.message || 'Não foi possível registrar suas respostas.', type: 'error' });
    }
}



