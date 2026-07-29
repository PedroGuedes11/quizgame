import { DOMUtils } from '../utils/dom.js';

export function renderMenu(items = []) {
    const nav = DOMUtils.createElement('nav', { class: 'menu' });
    
    // Botão hamburguer
    const menuToggle = DOMUtils.createElement('button', { 
        class: 'menu-toggle',
        id: 'menu-toggle',
        type: 'button',
        'aria-label': 'Alternar menu'
    });
    menuToggle.innerHTML = '<span></span><span></span><span></span>';
    
    const ul = DOMUtils.createElement('ul', { class: 'menu-list' });

    const menuItems = Array.isArray(items) && items.length ? items : [
        { label: 'Home', href: '/html/homepage.html' },
        { label: 'Sobre', href: '/html/about.html' },
        { label: 'Regras', href: '/html/rules.html' },
        { label: 'Quizzes', href: '/html/quiz_list.html' }
    ];

    menuItems.forEach((item) => {
        const li = DOMUtils.createElement('li');
        const attrs = {};

        if (item.href) attrs.href = item.href;
        if (item.id) attrs.id = item.id;
        if (item.className) attrs.class = item.className;

        const anchor = DOMUtils.createElement('a', attrs, item.label);
        li.appendChild(anchor);
        ul.appendChild(li);
    });

    nav.appendChild(menuToggle);
    nav.appendChild(ul);

    // Event listener para abrir/fechar menu
    menuToggle.addEventListener('click', () => {
        ul.classList.toggle('open');
        menuToggle.classList.toggle('open');
    });

    // Fechar menu ao clicar em um link
    ul.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            ul.classList.remove('open');
            menuToggle.classList.remove('open');
        });
    });

    return nav;
}
