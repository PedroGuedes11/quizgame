import { apiService } from '../services/api.js';
import { DOMUtils } from '../utils/dom.js';
import {
    renderQuestionCard,
    renderNavigationButtons,
    getTimerHtml,
} from '../components/index.js';

export class QuizModule {
    constructor(quizId) {
        this.quizId = quizId;
        this.quizData = null;
        this.currentQuestionIndex = 0;
        this.selectedAlternatives = [];
        this.timer = null;
        this.timeLeft = 0;
        this.startedAt = null;
        this._delegationBound = false;
        this.init();
    }

    async init() {
        try {
            const response = await apiService.get(`/api/quiz/${this.quizId}`);
            this.quizData = response;
            this.selectedAlternatives = new Array(10).fill(null); 
            this.timeLeft = 3600;
            this.startedAt = new Date();
            this.startTimer();
            this.render();
        } catch (error) {
            console.error('Failed to load quiz:', error);
            alert('Erro ao carregar o quiz');
        }
    }
    
    render() {
        this.renderQuizContainer();
        this.renderQuestion();
        this.renderNavigation();
        this.renderTimer();
        this.bindEvents();
    }

    renderQuizContainer() {
        let container = document.querySelector('#quiz-container');
        const parent = document.querySelector('#quiz-main') || document.querySelector('main') || document.body;

        if (!container) {
            container = DOMUtils.createElement('div', { id: 'quiz-container', class: 'quiz-container' });
            parent.appendChild(container);
        }
    }

    renderQuestion() {
        const question = this.quizData.questions[this.currentQuestionIndex];
        const questionElement = renderQuestionCard(
            question,
            this.currentQuestionIndex,
            this.selectedAlternatives[this.currentQuestionIndex]
        );

        // clear container and append the constructed element
        DOMUtils.setInnerHTML('#quiz-container', '');
        DOMUtils.appendChild('#quiz-container', questionElement);
    }

    renderNavigation() {
        let navElement = document.querySelector('.quiz-navigation');
        const parent = document.querySelector('#quiz-main') || document.querySelector('main') || document.body;

        if (!navElement) {
            navElement = DOMUtils.createElement('div', { class: 'quiz-navigation' });
            parent.appendChild(navElement);
        }

        // clear and append navigation element
        navElement.innerHTML = '';
        const navButtons = renderNavigationButtons(
            this.currentQuestionIndex > 0,
            this.currentQuestionIndex < this.quizData.questions.length - 1
        );
        DOMUtils.appendChild('.quiz-navigation', navButtons);
    }

    renderTimer() {
        let timerElement = document.querySelector('.quiz-timer');
        const parent = document.querySelector('#quiz-main') || document.querySelector('main') || document.body;

        if (!timerElement) {
            timerElement = DOMUtils.createElement('div', { class: 'quiz-timer' });
            parent.appendChild(timerElement);
        }

        // clear and append timer element
        timerElement.innerHTML = '';
        const timerEl = getTimerHtml();
        DOMUtils.appendChild('.quiz-timer', timerEl);
        this.updateTimerDisplay();
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.submitQuiz();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const hours = Math.floor(this.timeLeft / 3600);
        const minutes = Math.floor((this.timeLeft % 3600) / 60);
        const seconds = this.timeLeft % 60;

        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        DOMUtils.setTextContent('#timer-display', timeString);
    }

    bindEvents() {
        DOMUtils.addEventListener('#prev-btn', 'click', () => this.previousQuestion());
        DOMUtils.addEventListener('#next-btn', 'click', () => this.nextQuestion());

        // Event delegation for radio inputs inside the quiz container
        if (!this._delegationBound) {
            DOMUtils.addEventListener('#quiz-container', 'change', (e) => {
                const target = e.target;
                if (!target || typeof target.matches !== 'function') return;
                if (target.matches('input[type="radio"]')) {
                    // name expected format: question-<index>
                    const name = target.name || '';
                    const match = name.match(/^question-(\d+)$/);
                    const idx = match ? parseInt(match[1], 10) : this.currentQuestionIndex;
                    this.selectedAlternatives[idx] = parseInt(target.value, 10);
                }
            });
            this._delegationBound = true;
        }

        DOMUtils.addEventListener('#submit-quiz-btn', 'click', () => this.submitQuiz());
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.quizData.questions.length - 1) {
            this.currentQuestionIndex++;
            this.renderQuestion();
            this.updateNavigation();
            this.bindEvents();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderQuestion();
            this.updateNavigation();
            this.bindEvents();
        }
    }

    updateNavigation() {
        const prevBtn = document.querySelector('#prev-btn');
        const nextBtn = document.querySelector('#next-btn');

        if (prevBtn) prevBtn.disabled = this.currentQuestionIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentQuestionIndex === this.quizData.questions.length - 1;
    }

    async submitQuiz() {
        const timePoints = this.timeLeft;
        const finishedAt = new Date();
        clearInterval(this.timer);

        const unanswered = this.selectedAlternatives.filter(alt => alt === null).length;
        if (unanswered > 0) {
            if (!confirm(`Você tem ${unanswered} questões não respondidas. Deseja submeter mesmo assim?`)) {
                return;
            }
        }

        try {
            const answers = this.selectedAlternatives.map((altId, index) => ({
                questionId: this.quizData.questions[index].id_question,
                alternativeId: altId
            })).filter(answer => answer.alternativeId !== null);

            const correctCount = answers.reduce((count, answer) => {
                const question = this.quizData.questions.find(q => q.id_question === answer.questionId);
                if (!question) return count;
                const alternative = question.alternatives.find(a => a.id_alternative === answer.alternativeId);
                return count + (alternative && alternative.is_correct ? 1 : 0);
            }, 0);

            const response = await apiService.post('/api/quiz/submit', {
                quizId: this.quizId,
                answers: answers,
                correctCount: correctCount,
                timePoints: timePoints,
                startedAt: this.startedAt,
                finishedAt: finishedAt
            });

            window.location.href = '/html/ranking.html';
        } catch (error) {
            alert('Erro ao submeter o quiz: ' + error.message);
        }
    }
}
