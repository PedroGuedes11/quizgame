import { DOMUtils } from '../utils/dom.js';
import { apiService } from '../services/api.js';

export function renderQuizCard(quiz, userId) {
  
  const container = DOMUtils.createElement('div', { class: 'quiz-card' });

  const header = DOMUtils.createElement('div', { class: 'quiz-header' });
  const cardTitle = DOMUtils.createElement('h2', { class: 'quiz-title' }, `ID: ${quiz.id_quiz} - ${quiz.theme}`);
  const subjectSpan = DOMUtils.createElement('span', { class: 'quiz-subject' }, quiz.subject);
  const teacherDateSpan = DOMUtils.createElement('span', { class: 'quiz-teacher-date' }, `Professor: ${quiz.teacher_name} - Criado em: ${new Date(quiz.created_at).toLocaleDateString('pt-BR')} `);
  
  header.appendChild(cardTitle);
  header.appendChild(subjectSpan);
  header.appendChild(teacherDateSpan);
  
  //Cria botao para jogar o quiz
  const playButton = DOMUtils.createElement('button', { class: 'play-quiz-btn' }, 'Jogar');
  playButton.addEventListener('click', () => {
    window.location.href = `/html/quiz.html?quizId=${quiz.id_quiz}`;
  });

  //Cria botao para marcar como fazer mais tarde
  const doAfterButton = DOMUtils.createElement('button', { class: 'do-after-quiz-btn' }, 'Fazer mais tarde');
  doAfterButton.addEventListener('click', async () => {
    try {
      await apiService.post('/api/quiz/do-after', { quizId: quiz.id_quiz, userId });
    } catch (error) {
      console.error('Erro ao marcar quiz para fazer depois:', error);
    }
  });

  container.appendChild(header);
  container.appendChild(playButton);
  container.appendChild(doAfterButton);

  return container;
}