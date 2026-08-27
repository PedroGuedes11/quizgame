import { DOMUtils } from '../utils/dom.js';

export function showFeedbackModal({ title, message, type = 'success', buttonText = 'Continuar', onClose } = {}) {
  const existingModal = document.querySelector('#feedback-modal');
  if (existingModal) existingModal.remove();

  const overlay = DOMUtils.createElement('div', {
    class: `modal-overlay feedback-modal ${type}`,
    id: 'feedback-modal',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'feedback-modal-title'
  });
  const content = DOMUtils.createElement('div', { class: 'modal-content' });
  const heading = DOMUtils.createElement('h2', { id: 'feedback-modal-title' }, title || (type === 'error' ? 'Não foi possível concluir' : 'Operação concluída'));
  const paragraph = DOMUtils.createElement('p', {}, message || '');
  const closeButton = DOMUtils.createElement('button', { class: 'modal-confirm', type: 'button' }, buttonText);

  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', handleKeydown);
    if (typeof onClose === 'function') onClose();
  };
  const handleKeydown = (event) => {
    if (event.key === 'Escape') close();
  };

  closeButton.addEventListener('click', close);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  document.addEventListener('keydown', handleKeydown);

  content.appendChild(heading);
  content.appendChild(paragraph);
  content.appendChild(closeButton);
  overlay.appendChild(content);
  document.body.appendChild(overlay);
  closeButton.focus();
}

export function showConfirmationModal({ title = 'Confirmar envio', message, confirmText = 'Confirmar', cancelText = 'Cancelar' } = {}) {
  return new Promise((resolve) => {
    const existingModal = document.querySelector('#confirmation-modal');
    if (existingModal) existingModal.remove();

    const overlay = DOMUtils.createElement('div', {
      class: 'modal-overlay confirmation-modal',
      id: 'confirmation-modal',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'confirmation-modal-title'
    });
    const content = DOMUtils.createElement('div', { class: 'modal-content' });
    const heading = DOMUtils.createElement('h2', { id: 'confirmation-modal-title' }, title);
    const paragraph = DOMUtils.createElement('p', {}, message || '');
    const actions = DOMUtils.createElement('div', { class: 'modal-actions' });
    const confirmButton = DOMUtils.createElement('button', { class: 'modal-confirm', type: 'button' }, confirmText);
    const cancelButton = DOMUtils.createElement('button', { class: 'modal-cancel', type: 'button' }, cancelText);

    const close = (confirmed) => {
      overlay.remove();
      document.removeEventListener('keydown', handleKeydown);
      resolve(confirmed);
    };
    const handleKeydown = (event) => {
      if (event.key === 'Escape') close(false);
    };

    confirmButton.addEventListener('click', () => close(true));
    cancelButton.addEventListener('click', () => close(false));
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close(false);
    });
    document.addEventListener('keydown', handleKeydown);

    actions.appendChild(cancelButton);
    actions.appendChild(confirmButton);
    content.appendChild(heading);
    content.appendChild(paragraph);
    content.appendChild(actions);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    cancelButton.focus();
  });
}

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
