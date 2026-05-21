// DOM manipulation utilities with security
export class DOMUtils {
    static setTextContent(selector, text) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = text;
        }
    }

    static setInnerHTML(selector, html) {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = html;
        }
    }

    static addEventListener(selector, event, handler) {
        const element = document.querySelector(selector);
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    static createElement(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);
        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        });
        element.textContent = textContent;
        return element;
    }

    static appendChild(parentSelector, childElement) {
        const parent = document.querySelector(parentSelector);
        if (parent) {
            parent.appendChild(childElement);
        }
    }
}