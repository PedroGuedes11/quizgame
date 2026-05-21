import { apiService } from '../services/api.js';
import { DOMUtils } from '../utils/dom.js';
import { ValidationUtils } from "../utils/validation.js";

export class AuthModule {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.bindEvents();
        this.bindTabs();
    }

    checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            this.verifyToken();
        }
    }

    async verifyToken() {
        try {
            const response = await apiService.get('/api/user/user-info');
            const storedType = localStorage.getItem('userType');
            this.currentUser = {
                ...response,
                type: storedType || response.type || 'student'
            };
        } catch (error) {
            this.logout(true);
        }
    }

    bindEvents() {
        DOMUtils.addEventListener('#login-form', 'submit', (e) => {
            e.preventDefault();
            this.login();
        });

        DOMUtils.addEventListener('#register-form', 'submit', (e) => {
            e.preventDefault();
            this.register();
        });

        document.body.addEventListener('click', (e) => {
            const logoutAnchor = e.target.closest('#logout-btn');
            if (!logoutAnchor) {
                return;
            }
            e.preventDefault();
            this.logout();
        });
    }

    bindTabs() {
        const loginTab = document.querySelector('#login-tab');
        const registerTab = document.querySelector('#register-tab');

        if (loginTab && registerTab) {
            loginTab.addEventListener('click', () => this.showLoginForm());
            registerTab.addEventListener('click', () => this.showRegisterForm());
        }
    }

    async login() {
        const username = document.querySelector('#username')?.value?.trim() || '';
        const password = document.querySelector('#password')?.value || '';

        try {
            const response = await apiService.post('/api/auth/login', { username, password });
            localStorage.setItem('token', response.token);
            localStorage.setItem('userType', response.userType);
            this.currentUser = { type: response.userType };
            this.onLoginSuccess();
        } catch (error) {
            ValidationUtils.showError('#login-error', error.message || 'Erro no login');
        }
    }

    async register() {
        const username = document.querySelector('#reg-username')?.value?.trim() || '';
        const email = document.querySelector('#reg-email')?.value?.trim() || '';
        const password = document.querySelector('#reg-password')?.value || '';
        const userType = document.querySelector('input[name="user-type"]:checked')?.value;

        if (!ValidationUtils.isValidUsername(username)) {
            ValidationUtils.showError('#register-error', 'Username deve ter 3-100 caracteres');
            return;
        }
        if (!ValidationUtils.isValidEmail(email)) {
            ValidationUtils.showError('#register-error', 'Email inválido');
            return;
        }
        if (!ValidationUtils.isValidPassword(password)) {
            ValidationUtils.showError('#register-error', 'Senha deve ter pelo menos 6 caracteres e incluir número e letra');
            return;
        }
        if (!userType) {
            ValidationUtils.showError('#register-error', 'Selecione o tipo de usuário');
            return;
        }

        ValidationUtils.hideError('#register-error');

        try {
            const fileInput = document.querySelector('#reg-photo');
            let body;
            if (fileInput && fileInput.files && fileInput.files[0]) {
                body = new FormData();
                body.append('username', username);
                body.append('email', email);
                body.append('password', password);
                body.append('userType', userType);
                body.append('profile_photo', fileInput.files[0]);
            } else {
                body = { username, email, password, userType };
            }

            await apiService.post('/api/auth/register', body);
            alert('Registro realizado! Faça login.');
            this.showLoginForm();
        } catch (error) {
            ValidationUtils.showError('#register-error', error.message || 'Erro no registro');
        }
    }

    logout(silent = false) {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        this.currentUser = null;
        if (!silent) {
            this.onLogout();
        }
    }

    onLoginSuccess() {
        if (this.currentUser?.type === 'student') {
            window.location.href = '/html/dashboard_student.html';
        } else {
            window.location.href = '/html/dashboard_teacher.html';
        }
    }

    onLogout() {
        window.location.href = '/html/register_login.html';
    }

    showLoginForm() {
        const loginTab = document.querySelector('#login-tab');
        const registerTab = document.querySelector('#register-tab');
        const loginBox = document.querySelector('#login-form');
        const registerBox = document.querySelector('#register-form');

        if (loginTab && registerTab && loginBox && registerBox) {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginBox.classList.add('active');
            registerBox.classList.remove('active');
        }
    }

    showRegisterForm() {
        const loginTab = document.querySelector('#login-tab');
        const registerTab = document.querySelector('#register-tab');
        const loginBox = document.querySelector('#login-form');
        const registerBox = document.querySelector('#register-form');

        if (loginTab && registerTab && loginBox && registerBox) {
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
            loginBox.classList.remove('active');
            registerBox.classList.add('active');
        }
    }
}
