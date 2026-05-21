import { DOMUtils } from '../utils/dom.js';

export function getTimerHtml() {
  const timer = DOMUtils.createElement('div', { class: 'timer' });
  const span = DOMUtils.createElement('span', { id: 'timer-display' }, '00:00:00');
  timer.appendChild(span);
  return timer;
}
