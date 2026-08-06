import { DOMUtils } from '../utils/dom.js';

export function renderNavigationButtons(hasPrev, hasNext) {
  const nav = DOMUtils.createElement('div', { class: 'navigation' });

  const prev = DOMUtils.createElement('button', { id: 'prev-btn' }, 'Anterior');
  if (!hasPrev) prev.setAttribute('disabled', 'disabled');

  const next = DOMUtils.createElement('button', { id: 'next-btn' }, 'Próxima');
  if (!hasNext) next.setAttribute('disabled', 'disabled');

  nav.appendChild(prev);
  nav.appendChild(next);

  return nav;
}