import { apiService } from '../services/api.js';
import { DOMUtils } from '../utils/dom.js';
import { ValidationUtils } from "../utils/validation.js";

export class AuthModule {
    constructor() {
        this.currentUser = null;
        this.containerSelector = '#register-login-content';
        this.init();
    }

    init() {
        this.render();
        this.checkAuthStatus();
        this.bindEvents();
        this.bindTabs();
    }

    render() {
        const container = document.querySelector(this.containerSelector);
        if (!container) return;

        const html = `
            <section class="auth-page">
                <div class="auth-card">
                    <div class="auth-hero">
                        <div class="auth-brand">
                            <h1>Quiz Game</h1>
                            <p>Faça login ou registre-se para jogar quizzes, gerenciar sua conta e acompanhar seu progresso.</p>
                        </div>
                        <div class="auth-info">
                            <h2>Seja bem-vindo!</h2>
                            <p>Entre para começar a jogar, estudar e competir com seus colegas.</p>
                        </div>
                    </div>

                    <div class="auth-panel">
                        <div class="auth-tabs">
                            <button id="login-tab" class="auth-tab active" type="button">Login</button>
                            <button id="register-tab" class="auth-tab" type="button">Registrar</button>
                        </div>

                        <div class="auth-forms">
                            <form id="login-form" class="auth-form active" aria-label="Formulário de login">
                                <div class="form-title">
                                    <h3>Entrar</h3>
                                    <p>Use seu usuário e senha para acessar sua conta.</p>
                                </div>
                                <div class="form-group">
                                    <label for="username">Usuário ou email</label>
                                    <input id="username" name="username" type="text" placeholder="Digite seu usuário ou email" required />
                                </div>
                                <div class="form-group">
                                    <label for="password">Senha</label>
                                    <input id="password" name="password" type="password" placeholder="Digite sua senha" required />
                                </div>
                                <p id="login-error" class="error-text" aria-live="polite"></p>
                                <button type="submit" class="primary-button">Entrar</button>
                            </form>

                            <form id="register-form" class="auth-form" aria-label="Formulário de registro">
                                <div class="form-title">
                                    <h3>Criar conta</h3>
                                    <p>Registre-se como estudante ou professor para começar.</p>
                                </div>
                                <div class="form-group">
                                    <label for="reg-username">Usuário</label>
                                    <input id="reg-username" name="reg-username" type="text" placeholder="Escolha um usuário" required />
                                </div>
                                <div class="form-group">
                                    <label for="reg-email">Email</label>
                                    <input id="reg-email" name="reg-email" type="email" placeholder="Digite seu email" required />
                                </div>
                                <div class="form-group">
                                    <label for="reg-password">Senha</label>
                                    <input id="reg-password" name="reg-password" type="password" placeholder="Digite sua senha" required />
                                </div>
                                <div class="form-group">
                                    <label for="reg-photo">Foto de perfil (opcional)</label>
                                    <input id="reg-photo" name="reg-photo" type="file" accept="image/*" />
                                </div>
                                <fieldset class="form-group user-type-group">
                                    <legend>Tipo de usuário</legend>
                                    <label><input type="radio" name="user-type" value="student" checked /> Estudante</label>
                                    <label><input type="radio" name="user-type" value="teacher" /> Professor</label>
                                </fieldset>
                                <p id="register-error" class="error-text" aria-live="polite"></p>
                                <button type="submit" class="primary-button">Registrar</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        `;

        DOMUtils.setInnerHTML(this.containerSelector, html);
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
            this.handleSuccessfulAuth(response.userType, response.token);
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

    handleSuccessfulAuth(userType, token) {
        const normalizedType = userType || 'student';
        if (token) {
            localStorage.setItem('token', token);
        }
        localStorage.setItem('userType', normalizedType);
        this.currentUser = { type: normalizedType };

        if (normalizedType === 'student') {
            window.location.href = '/html/dashboard_student.html';
            return;
        }

        window.location.href = '/html/dashboard_teacher.html';
    }

    logout(silent = false) {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        this.currentUser = null;
        if (!silent) {
            window.location.href = '/html/register_login.html';
        }
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
