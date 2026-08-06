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
    const isSelected = String(selectedValue) === String(alt.id_alternative);
    const label = DOMUtils.createElement('label', { class: `alternative${isSelected ? ' selected' : ''}` });

    const inputAttrs = {
      type: 'radio',
      name: `question-${currentIndex}`,
      value: String(alt.id_alternative),
      'aria-label': alt.label || ''
    };

    if (isSelected) {
      inputAttrs.checked = 'checked';
    }

    const input = DOMUtils.createElement('input', inputAttrs);
    const alternativeText = alt.text || alt.alternative_text || '';
    const badgeText = alt.label ? alt.label : '';
    const badge = DOMUtils.createElement('span', { class: 'alt-badge' }, badgeText);
    const span = DOMUtils.createElement('span', { class: 'alt-text' }, badgeText ? `${alternativeText}` : alternativeText);

    label.appendChild(input);
    label.appendChild(badge);
    label.appendChild(span);
    alternatives.appendChild(label);
  });

  container.appendChild(header);
  container.appendChild(alternatives);
  return container;
}
