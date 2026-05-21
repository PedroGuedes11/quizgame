import { DOMUtils } from '../utils/dom.js';

export function getConfirmationModalHtml(message, confirmId = 'modal-confirm', cancelId = 'modal-cancel') {
  const overlay = DOMUtils.createElement('div', { class: 'modal-overlay', id: 'confirmation-modal' });
  const content = DOMUtils.createElement('div', { class: 'modal-content' });
  const p = DOMUtils.createElement('p', {}, message);
  const actions = DOMUtils.createElement('div', { class: 'modal-actions' });

  const confirmBtn = DOMUtils.createElement('button', { id: confirmId, class: 'modal-confirm' }, 'Confirmar');
  const cancelBtn = DOMUtils.createElement('button', { id: cancelId, class: 'modal-cancel' }, 'Cancelar');

  actions.appendChild(confirmBtn);
  actions.appendChild(cancelBtn);
  content.appendChild(p);
  content.appendChild(actions);
  overlay.appendChild(content);

  return overlay;
}
