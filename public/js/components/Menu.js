import { DOMUtils } from '../utils/dom.js';

export function renderMenu(items = []) {
    const nav = DOMUtils.createElement('nav', { class: 'menu' });
    const ul = DOMUtils.createElement('ul');

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

    nav.appendChild(ul);

    return nav;
}