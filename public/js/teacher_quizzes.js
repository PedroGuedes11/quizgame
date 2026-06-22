import { apiService } from './services/api.js';
import { DOMUtils } from './utils/dom.js';

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
            ${['A', 'B', 'C', 'D', 'E'].map((label, altIndex) => `
                <div class="alt-row">
                    <span class="alt-label">${label}</span>
                    <input type="text" class="alt-text" placeholder="Texto da alternativa ${label}" />
                    <label class="alt-correct-label">
                        <input type="radio" name="correct-answer-${questionIndex}" class="alt-correct" value="${label}" /> Correta
                    </label>
                </div>
            `).join('')}
        </div>
    </div>
`;

export const renderTeacherQuizzes = () => {
    const html = `
        <section class="teacher-quizzes-page">
            <div class="page-header">
                <h1>Crie seu quiz</h1>
                <p>Professores podem criar quizzes completos</p>
            </div>

            <div class="teacher-quizzes-grid">
                <div class="quiz-creator-card">
                    <h2>Novo quiz</h2>
                    <div id="quiz-feedback" class="quiz-feedback"></div>
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
                        <div id="question-container">
                            ${QUESTION_TEMPLATE(1)}
                        </div>
                        <div class="toolbar-actions">
                            <button id="add-question-btn" class="secondary-button">Adicionar questão</button>
                            <button type="submit" class="primary-button">Salvar quiz</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    `;

    DOMUtils.setInnerHTML('#dashboard-content', html);
    bindTeacherQuizEvents();
};

function bindTeacherQuizEvents() {
    DOMUtils.addEventListener('#teacher-quiz-form', 'submit', async (event) => {
        event.preventDefault();
        await handleQuizSubmit();
    });

    DOMUtils.addEventListener('#add-question-btn', 'click', (event) => {
        event.preventDefault();
        addQuestionCard();
    });

    const quizListContainer = document.querySelector('#quiz-list-container');
    if (quizListContainer) {
        quizListContainer.addEventListener('click', async (event) => {
            const removeButton = event.target.closest('.delete-quiz-btn');
            if (!removeButton) {
                return;
            }

            const quizId = removeButton.dataset.quizId;
            if (!quizId) {
                return;
            }

            if (!confirm('Tem certeza que deseja remover esse quiz?')) {
                return;
            }

            await deleteQuiz(quizId);
        });
    }
}

function addQuestionCard() {
    const container = document.querySelector('#question-container');
    if (!container) {
        return;
    }

    const currentCount = container.querySelectorAll('.question-card').length;
    if (currentCount >= 10) {
        showFeedback('O quiz só pode conter exatamente 10 questões.', true);
        return;
    }

    const nextIndex = currentCount + 1;
    container.insertAdjacentHTML('beforeend', QUESTION_TEMPLATE(nextIndex));
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

    if (!subject || !theme || questionCards.length === 0) {
        showFeedback('Preencha o assunto, tema e pelo menos uma questão.', true);
        return;
    }

    const questions = [];

    for (let index = 0; index < questionCards.length; index++) {
        const card = questionCards[index];
        const questionText = card.querySelector('.question-text')?.value.trim() || '';
        const alternatives = Array.from(card.querySelectorAll('.alt-row')).map((altRow) => {
            return {
                label: altRow.querySelector('.alt-label')?.textContent.trim(),
                text: altRow.querySelector('.alt-text')?.value.trim() || '',
                isCorrect: altRow.querySelector('.alt-correct')?.checked || false
            };
        });

        if (!questionText) {
            showFeedback(`Digite o texto da questão ${index + 1}.`, true);
            return;
        }

        if (alternatives.length !== 5) {
            showFeedback(`Cada questão deve ter exatamente 5 alternativas.`, true);
            return;
        }

        if (alternatives.some((alt) => !alt.text)) {
            showFeedback(`Preencha todas as alternativas da questão ${index + 1}.`, true);
            return;
        }

        if (!alternatives.some((alt) => alt.isCorrect)) {
            showFeedback(`Marque uma alternativa correta para a questão ${index + 1}.`, true);
            return;
        }

        questions.push({
            questionText,
            questionOrder: index + 1,
            alternatives
        });
    }

    if (questions.length === 10) {
        try {
            await apiService.post('/api/quiz/teacher-quizzes', { subject, theme, questions });
            showFeedback('Quiz criado com sucesso!', false);
            resetQuizForm();
        } catch (error) {
            console.error('Erro ao criar quiz:', error);
            showFeedback('Não foi possível criar o quiz. Verifique os dados e tente novamente.', true);
        }
    } else {
        showFeedback('O quiz deve conter exatamente 10 questões.', true);
    }
}

function showFeedback(message, isError = false) {
    const feedback = document.querySelector('#quiz-feedback');
    if (!feedback) {
        return;
    }

    feedback.textContent = message;
    feedback.className = isError ? 'quiz-feedback error' : 'quiz-feedback success';
}

function resetQuizForm() {
    document.querySelector('#subject').value = '';
    document.querySelector('#theme').value = '';
    const container = document.querySelector('#question-container');

    if (container) {
        container.innerHTML = QUESTION_TEMPLATE(1);
    }
};
