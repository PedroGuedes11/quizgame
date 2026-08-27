import { apiService } from './services/api.js';
import { DOMUtils } from './utils/dom.js';
import { showFeedbackModal } from './components/Modal.js';

const MAX_QUESTIONS = 10;
const ALTERNATIVE_LABELS = ['A', 'B', 'C', 'D', 'E'];
let currentQuestionIndex = 0;
let quizDraft = createEmptyQuizDraft();

function createEmptyQuizDraft() {
    return Array.from({ length: MAX_QUESTIONS }, (_, questionIndex) => ({
        questionText: '',
        alternatives: ALTERNATIVE_LABELS.map((label) => ({
            label,
            text: '',
            isCorrect: false
        }))
    }));
}

const QUESTION_TEMPLATE = (questionIndex) => `
    <div class="question-card" data-question-index="${questionIndex}">
        <div class="question-header">
            <h3>Questão ${questionIndex}</h3>
        </div>
        <div class="question-field">
            <label for="question-text-${questionIndex}">Texto da questão</label>
            <textarea id="question-text-${questionIndex}" class="question-text" rows="3" placeholder="Digite a pergunta"></textarea>
        </div>
        <div class="alternatives-group">
            ${ALTERNATIVE_LABELS.map((label, altIndex) => `
                <label class="alt-row">
                    <span class="alt-label">${label}</span>
                    <input id="alt-text-${questionIndex}-${altIndex}" type="text" class="alt-text" placeholder="Texto da alternativa ${label}" />
                    <span class="correct-wrapper">
                        <input type="radio" name="correct-answer-${questionIndex}" class="alt-correct" value="${label}" />
                        <span class="correct-label">Correta</span>
                    </span>
                </label>
            `).join('')}
        </div>
    </div>
`;

export const renderTeacherQuizzes = () => {
    quizDraft = createEmptyQuizDraft();
    currentQuestionIndex = 0;

    const questionCards = Array.from({ length: MAX_QUESTIONS }, (_, index) => QUESTION_TEMPLATE(index + 1)).join('');

    const html = `
        <section class="teacher-quizzes-page">
            <div class="quiz-hero compact-hero quiz-creator-hero">
                <div class="quiz-hero-copy">
                    <h1>Crie seu quiz</h1>
                    <p>Professores podem criar quizzes completos em um fluxo visual moderno.</p>
                </div>
            </div>

            <div class="teacher-quizzes-grid quiz-creator-grid">
                    <div class="quiz-creator-card">
                    <h2>Novo quiz</h2>
                    <div id="quiz-instructions" class="info-text">Preencha todas as 10 questões, cada uma com 5 alternativas, e marque uma alternativa correta antes de clicar em "Salvar quiz".</div>
                    <div id="quiz-feedback" class="quiz-feedback" role="status" aria-live="polite"></div>
                    <form id="teacher-quiz-form">
                        <div class="form-row">
                            <label for="subject">Disciplina</label>
                            <select id="subject" name="subject" required>
                                <option value="">-- Selecione --</option>
                                <option value="matematica">Matemática</option>
                                <option value="portugues">Português</option>
                                <option value="historia">História</option>
                                <option value="geografia">Geografia</option>
                                <option value="inglês">Inglês</option>
                                <option value="fisica">Física</option>
                                <option value="quimica">Química</option>
                                <option value="biologia">Biologia</option>
                                <option value="sociologia">Sociologia</option>
                                <option value="filosofia">Filosofia</option>
                                <option value="ensino_religioso">Ensino Religioso</option>
                                <option value="artes">Artes</option>
                                <option value="ed_fisica">Educação Física</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <label for="theme">Tema</label>
                            <input id="theme" type="text" placeholder="Ex: Álgebra" required />
                        </div>

                        <div class="question-stage">
                            <div id="question-tabs" class="question-tabs"></div>
                            <div id="navigation-buttons" class="creator-navigation"></div>
                            <div id="question-container">${questionCards}</div>
                        </div>

                        <div class="quiz-footer quiz-creator-footer">
                            <button type="submit" class="primary-button">Salvar quiz</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    `;

    DOMUtils.setInnerHTML('#dashboard-content', html);
    renderQuestionNavigation();
    renderNavigationButtons();
    bindTeacherQuizEvents();
};

function bindTeacherQuizEvents() {
    DOMUtils.addEventListener('#teacher-quiz-form', 'submit', async (event) => {
        event.preventDefault();
        await handleQuizSubmit();
    });

    document.body.addEventListener('input', (event) => {
        const target = event.target;
        if (!target) return;

        const questionCard = target.closest('.question-card');
        if (!questionCard) return;

        const questionIndex = Number(questionCard.dataset.questionIndex) - 1;
        if (Number.isNaN(questionIndex)) return;

        if (target.matches('.question-text')) {
            quizDraft[questionIndex].questionText = target.value;
            return;
        }

        if (target.matches('.alt-text')) {
            const altIndex = Number(target.id.split('-').pop());
            quizDraft[questionIndex].alternatives[altIndex].text = target.value;
            return;
        }
    });

    document.body.addEventListener('change', (event) => {
        const target = event.target;
        if (!target) return;

        const questionCard = target.closest('.question-card');
        if (!questionCard) return;

        const questionIndex = Number(questionCard.dataset.questionIndex) - 1;
        if (Number.isNaN(questionIndex)) return;

        if (target.matches('.alt-correct')) {
            quizDraft[questionIndex].alternatives.forEach((alt) => {
                alt.isCorrect = alt.label === target.value;
            });
            return;
        }
    });

    document.body.addEventListener('click', (event) => {
        const prevButton = event.target.closest('#prev-btn');
        const nextButton = event.target.closest('#next-btn');
        const tabButton = event.target.closest('.question-step-btn');

        if (prevButton) {
            event.preventDefault();
            previousQuestion();
            return;
        }

        if (nextButton) {
            event.preventDefault();
            nextQuestion();
            return;
        }

        if (tabButton) {
            event.preventDefault();
            const index = Number(tabButton.dataset.questionIndex) - 1;
            if (!Number.isNaN(index)) {
                currentQuestionIndex = index;
                updateQuestionView();
            }
        }
    });
}

function renderQuestionNavigation() {
    const tabsContainer = document.querySelector('#question-tabs');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = Array.from({ length: MAX_QUESTIONS }, (_, index) => {
        const number = index + 1;
        return `<button type="button" class="question-step-btn${index === currentQuestionIndex ? ' active' : ''}" data-question-index="${number}">${number}</button>`;
    }).join('');

    updateQuestionView();
}

function updateQuestionView() {
    const questionCards = Array.from(document.querySelectorAll('.question-card'));
    questionCards.forEach((card, index) => {
        card.classList.toggle('active', index === currentQuestionIndex);
    });

    const progressLabel = document.querySelector('.progress-label');
    const progressCount = document.querySelector('.progress-answer-count');
    if (progressLabel) {
        progressLabel.textContent = `Questão ${currentQuestionIndex + 1} de ${MAX_QUESTIONS}`;
    }
    if (progressCount) {
        progressCount.textContent = `Questões preenchidas: ${quizDraft.filter((q) => q.questionText.trim()).length}/${MAX_QUESTIONS}`;
    }

    const tabButtons = Array.from(document.querySelectorAll('.question-step-btn'));
    tabButtons.forEach((button, index) => button.classList.toggle('active', index === currentQuestionIndex));

    const prevBtn = document.querySelector('#prev-btn');
    const nextBtn = document.querySelector('#next-btn');
    if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
    if (nextBtn) nextBtn.disabled = currentQuestionIndex === MAX_QUESTIONS - 1;
}

function renderNavigationButtons() {
    const navContainer = document.querySelector('#navigation-buttons');
    if (!navContainer) return;

    navContainer.innerHTML = `
        <div class="navigation">
            <button id="prev-btn" class="secondary-button" type="button">Anterior</button>
            <button id="next-btn" class="secondary-button" type="button">Próxima</button>
        </div>
    `;
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex -= 1;
        updateQuestionView();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < MAX_QUESTIONS - 1) {
        currentQuestionIndex += 1;
        updateQuestionView();
    }
}

async function handleQuizSubmit() {
    const feedback = document.querySelector('#quiz-feedback');
    if (feedback) {
        feedback.textContent = '';
        feedback.className = 'quiz-feedback';
    }

    const subject = document.querySelector('#subject')?.value.trim() || '';
    const theme = document.querySelector('#theme')?.value.trim() || '';
    const questionCards = Array.from(document.querySelectorAll('.question-card'));

    if (!subject || !theme) {
        showFeedback('Preencha a disciplina e o tema do quiz.', true);
        return;
    }

    // Quick pre-check: ensure every question has text, all alternatives filled and one marked as correct
    const validQuestionsCount = quizDraft.filter((q) => {
        const hasText = q.questionText.trim();
        const allAltsFilled = q.alternatives.every((a) => a.text.trim());
        const hasOneCorrect = q.alternatives.some((a) => a.isCorrect);
        return hasText && allAltsFilled && hasOneCorrect;
    }).length;

    if (validQuestionsCount !== MAX_QUESTIONS) {
        showFeedback('Por favor, preencha todas as 10 questões com 5 alternativas cada e marque a alternativa correta antes de salvar.', true);
        // Jump to first incomplete question to help the user
        const firstIncomplete = quizDraft.findIndex((q) => !(q.questionText.trim() && q.alternatives.every((a) => a.text.trim()) && q.alternatives.some((a) => a.isCorrect)));
        if (firstIncomplete >= 0) {
            currentQuestionIndex = firstIncomplete;
            updateQuestionView();
        }
        return;
    }

    const questions = [];

    for (let index = 0; index < questionCards.length; index++) {
        const card = questionCards[index];
        const draft = quizDraft[index];
        const questionText = draft.questionText.trim();
        const alternatives = draft.alternatives;

        if (!questionText) {
            showFeedback(`Digite o texto da questão ${index + 1}.`, true);
            currentQuestionIndex = index;
            updateQuestionView();
            return;
        }

        if (alternatives.some((alt) => !alt.text.trim())) {
            showFeedback(`Preencha todas as alternativas da questão ${index + 1}.`, true);
            currentQuestionIndex = index;
            updateQuestionView();
            return;
        }

        if (!alternatives.some((alt) => alt.isCorrect)) {
            showFeedback(`Marque a alternativa correta da questão ${index + 1}.`, true);
            currentQuestionIndex = index;
            updateQuestionView();
            return;
        }

        questions.push({
            questionText,
            questionOrder: index + 1,
            alternatives: alternatives.map((alt) => ({
                label: alt.label,
                text: alt.text.trim(),
                isCorrect: alt.isCorrect
            }))
        });
    }

    try {
        await apiService.post('/api/quiz/teacher-quizzes', { subject, theme, questions });
        showFeedback('Quiz criado com sucesso!', false);
        resetQuizForm();
    } catch (error) {
        console.error('Erro ao criar quiz:', error);
        showFeedback('Não foi possível criar o quiz. Verifique os dados e tente novamente.', true);
    }
}

function showFeedback(message, isError = false) {
    const feedback = document.querySelector('#quiz-feedback');
    if (!feedback) {
        return;
    }
    feedback.textContent = message;
    feedback.className = isError ? 'quiz-feedback error' : 'quiz-feedback success';
    feedback.setAttribute('role', isError ? 'alert' : 'status');
    feedback.setAttribute('aria-live', isError ? 'assertive' : 'polite');
    showFeedbackModal({
        title: isError ? 'Falha ao criar quiz' : 'Quiz criado com sucesso',
        message,
        type: isError ? 'error' : 'success'
    });

    // Auto-hide success messages after 4 seconds
    if (!isError) {
        setTimeout(() => {
            const f = document.querySelector('#quiz-feedback');
            if (f) {
                f.textContent = '';
                f.className = 'quiz-feedback';
            }
        }, 4000);
    }
}

function resetQuizForm() {
    document.querySelector('#subject').value = '';
    document.querySelector('#theme').value = '';
    quizDraft = createEmptyQuizDraft();
    currentQuestionIndex = 0;

    const questionCards = Array.from(document.querySelectorAll('.question-card'));
    questionCards.forEach((card) => {
        const index = Number(card.dataset.questionIndex) - 1;
        const textarea = card.querySelector('.question-text');
        if (textarea) textarea.value = '';
        ALTERNATIVE_LABELS.forEach((label, altIndex) => {
            const input = card.querySelector(`#alt-text-${index + 1}-${altIndex}`);
            if (input) input.value = '';
        });
        const radios = Array.from(card.querySelectorAll('.alt-correct'));
        radios.forEach((radio) => { radio.checked = false; });
    });

    renderQuestionNavigation();
    renderNavigationButtons();
}

