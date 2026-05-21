import { DOMUtils } from '../utils/dom.js';

export function renderQuestionCard(question, currentIndex, selectedValue) {
  const container = DOMUtils.createElement('div', { class: 'question-card' });

  const header = DOMUtils.createElement('div', { class: 'question-header' });
  const h2 = DOMUtils.createElement('h2', {}, `Questão ${currentIndex + 1}`);
  const p = DOMUtils.createElement('p', {}, question.question_text);
  header.appendChild(h2);
  header.appendChild(p);

  const alternatives = DOMUtils.createElement('div', { class: 'alternatives' });

  question.alternatives.forEach((alt) => {
    const label = DOMUtils.createElement('label', { class: 'alternative' });

    const inputAttrs = {
      type: 'radio',
      name: `question-${currentIndex}`,
      value: String(alt.id_alternative),
    };

    if (selectedValue === alt.id_alternative) {
      inputAttrs.checked = 'checked';
    }

    const input = DOMUtils.createElement('input', inputAttrs);
    const span = DOMUtils.createElement('span', {}, `${alt.label}) ${alt.alternative_text}`);

    label.appendChild(input);
    label.appendChild(span);
    alternatives.appendChild(label);
  });

  container.appendChild(header);
  container.appendChild(alternatives);

  return container;
}