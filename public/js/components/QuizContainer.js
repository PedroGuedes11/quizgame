import { DOMUtils } from '../utils/dom.js';

export function getQuizContainerHtml() {
  return DOMUtils.createElement('section', { id: 'quiz-container', class: 'quiz-container' });
}
