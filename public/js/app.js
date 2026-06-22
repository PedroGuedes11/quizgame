// Main application entry point - Frontend orchestrator
import { AuthModule } from './modules/auth.js';
import { renderHomepage } from './homepage.js';
import { renderAbout } from './about.js';
import { renderRules } from './rules.js';
import { renderStudentDashboard } from './dashboard_student.js';
import { renderTeacherDashboard } from './dashboard_teacher.js';
import { renderTeacherQuizzes } from './teacher_quizzes.js';
import { renderRegisterLogin } from './register_login.js';
import { renderQuizList } from './quiz_list.js';
import { renderQuiz } from './quiz.js';
import { renderRanking } from './ranking.js';
import { renderMenu } from './components/Menu.js';
import { DOMUtils } from './utils/dom.js';
import { ValidationUtils } from "./utils/validation.js";


/**
 * AppOrchestrator - Gerencia a inicialização de módulos baseado na página atual
 */
class AppOrchestrator {
    constructor() {
        this.currentModule = null;
        this.currentPage = this.detectCurrentPage();
        this.restrictedPages = [
            'quiz.html',
            'dashboard_student.html',
            'dashboard_teacher.html',
            'teacher_quizzes.html',
            'quiz_list.html',
            'ranking.html',
        ];
        this.pageRenderers = {
            'homepage.html': renderHomepage,
            'index.html': renderHomepage,
            'about.html': renderAbout,
            'rules.html': renderRules,
            'dashboard_student.html': renderStudentDashboard,
            'dashboard_teacher.html': renderTeacherDashboard,
            'register_login.html': renderRegisterLogin,
            'teacher_quizzes.html': renderTeacherQuizzes,
            'quiz.html': renderQuiz,
            'quiz_list.html': renderQuizList,
            'ranking.html': renderRanking
        };
        this.init();
    }

    /**
     * Detecta a página atual a partir da URL
     */
    getPageFromPath(path) {
        const [pathname] = path.split('?');
        const filename = pathname.split('/').pop() || 'index.html';
        return filename;
    }

    detectCurrentPage() {
        const pathname = window.location.pathname;
        const filename = pathname.split('/').pop() || 'index.html';
        
        return filename;
    }

    /**
     * Inicializa a aplicação
     */
    init() {
        console.log(`[App] Iniciando em: ${this.currentPage}`);
        this.setupNavigation();
        this.renderMenu();
        this.setupPopStateListener();
        this.handleRoute(window.location.pathname + window.location.search, false);
        this.setupGlobalErrorHandling();
    }

    renderMenu() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        const menuItems = this.getMenuItemsForCurrentPage();
        const menuEl = renderMenu(menuItems);
        nav.innerHTML = '';
        nav.appendChild(menuEl);
    }

    getMenuItemsForCurrentPage() {
        const token = !!localStorage.getItem('token');
        const page = this.currentPage;
        const pages = {
            'homepage.html': [
                { label: 'Home', href: '/html/homepage.html' },
                { label: 'Sobre', href: '/html/about.html' },
                { label: 'Regras', href: '/html/rules.html' },
                { label: token? 'Meu Perfil': 'Login/Registrar', href: '/html/register_login.html' }
            ],
            'index.html': [
                { label: 'Home', href: '/html/homepage.html' },
                { label: 'Sobre', href: '/html/about.html' },
                { label: 'Regras', href: '/html/rules.html' },
                { label: token ? 'Meu Perfil' : 'Login/Registrar', href: '/html/register_login.html' }
            ],
            'about.html': [
                { label: 'Home', href: '/html/homepage.html' },
                { label: 'Regras', href: '/html/rules.html' },
                { label: token ? 'Meu Perfil' : 'Login/Registrar', href: '/html/register_login.html' }
            ],
            'rules.html': [
                { label: 'Home', href: '/html/homepage.html' },
                { label: 'Sobre', href: '/html/about.html' },
                { label: token ? 'Meu Perfil' : 'Login/Registrar', href: '/html/register_login.html' },
            ],
            'register_login.html': [
                { label: 'Home', href: '/html/homepage.html' },
                { label: 'Sobre', href: '/html/about.html' },
                { label: 'Regras', href: '/html/rules.html' }
            ],
            'quiz_list.html': [
                { label: 'Home', href: '/html/homepage.html' },
                { label: 'Ranking', href: '/html/ranking.html' },
                { label: 'Meu Perfil', href: '/html/register_login.html' },
                { label: 'Sair do perfil', href: '#', id: 'logout-btn'}
            ],
            'quiz.html': [
                { label: 'Home', href: '/html/homepage.html' },
                { label: 'Quizzes', href: '/html/quiz_list.html' },
                { label: 'Ranking', href: '/html/ranking.html' },
                { label: 'Meu Perfil', href: '/html/register_login.html' },
                { label: 'Sair do perfil', href: '#', id: 'logout-btn'}
            ],
            'ranking.html': [
                { label: 'Home', href: '/html/homepage.html' },
                { label: 'Quizzes', href: '/html/quiz_list.html' },
                { label: 'Meu Perfil', href: '/html/register_login.html' },
                { label: 'Sair do perfil', href: '#', id: 'logout-btn'}
            ],
            'dashboard_student.html': [
                { label: 'Home', href: '/html/homepage.html' },
                { label: 'Quizzes', href: '/html/quiz_list.html' },
                { label: 'Ranking', href: '/html/ranking.html' },
                { label: 'Sair do Perfil', href: '#', id: 'logout-btn' }
            ],
            'dashboard_teacher.html': [
                { label: 'Home', href: '/html/homepage.html' },
                { label: 'Quizzes', href: '/html/quiz_list.html' },
                { label: 'Criar quiz', href: '/html/teacher_quizzes.html' },
                { label: 'Ranking', href: '/html/ranking.html' },
                { label: 'Sair do Perfil', href: '#', id: 'logout-btn' }
            ],
            'teacher_quizzes.html': [
                { label: 'Home', href: '/html/homepage.html' },
                { label: 'Quizzes', href: '/html/quiz_list.html' },
                { label: 'Ranking', href: '/html/ranking.html' },
                { label: 'Meu Perfil', href: '/html/dashboard_teacher.html' },
                { label: 'Sair do Perfil', href: '#', id: 'logout-btn' }
            ]
        };

        return pages[page] || [
            { label: 'Home', href: '/html/homepage.html' },
            { label: 'Sobre', href: '/html/about.html' },
            { label: 'Regras', href: '/html/rules.html' },
        ];
    }

    /**
     * Cria roteamento de navegação interna para elementos do menu
     */
    setupNavigation() {
        document.body.addEventListener('click', (event) => {
            const anchor = event.target.closest('a');
            if (!anchor || !anchor.href) {
                return;
            }

            if (anchor.id === 'logout-btn') {
                event.preventDefault();
                this.logout();
                return;
            }

            const targetHref = anchor.getAttribute('href');
            if (!targetHref || targetHref.startsWith('#') || targetHref.startsWith('mailto:')) {
                return;
            }

            const targetUrl = new URL(targetHref, window.location.origin);
            const isInternal = targetUrl.origin === window.location.origin;
            if (!isInternal) {
                return;
            }

            event.preventDefault();
            this.navigateTo(targetUrl.pathname + targetUrl.search + targetUrl.hash);
        });

        DOMUtils.addEventListener('#logout-btn', 'click', (event) => {
            event.preventDefault();
            this.logout();
        });
    }

    /**
     * Observa mudanças de histórico do navegador
     */
    setupPopStateListener() {
        window.addEventListener('popstate', () => {
            this.handleRoute(window.location.pathname + window.location.search, false);
        });
    }

    /**
     * Navega para uma rota interna de forma controlada
     */
    async navigateTo(path) {
        if (!path) {
            return;
        }

        const url = new URL(path, window.location.origin);
        const targetPage = this.getPageFromPath(url.pathname + url.search);

        if (targetPage === this.currentPage && url.search === new URL(window.location.href).search) {
            return;
        }

        window.history.pushState({}, '', url.pathname + url.search + url.hash);
        await this.handleRoute(url.pathname + url.search, true);
    }

    /**
     * Redireciona se o usuário não tiver acesso à página atual
     */
    applyRouteGuards() {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');

        if (!token && this.restrictedPages.includes(this.currentPage)) {
            console.warn('[App] Rota restrita sem autenticação, redirecionando para login.');
            window.location.href = '/html/register_login.html';
            return false;
        }

        if (token && this.currentPage === 'register_login.html') {
            const redirectPage = userType === 'teacher' ? 'dashboard_teacher.html' : 'dashboard_student.html';
            window.location.href = `/html/${redirectPage}`;
            return false;
        }

        if (token && this.currentPage === 'dashboard_teacher.html' && userType === 'student') {
            window.location.href = '/html/dashboard_student.html';
            return false;
        }

        if (token && this.currentPage === 'teacher_quizzes.html' && userType === 'student') {
            window.location.href = '/html/dashboard_student.html';
            return false;
        }

        if (token && this.currentPage === 'dashboard_student.html' && userType === 'teacher') {
            window.location.href = '/html/dashboard_teacher.html';
            return false;
        }
        if (token && this.currentPage === 'quiz.html' && userType === 'teacher') {
            window.location.href = '/html/dashboard_teacher.html';
            return false;
        }

        return true;
    }

    /**
     * Inicializa módulo de autenticação
     */
    initAuth() {
        console.log('[App] Inicializando módulo de autenticação');
        this.currentModule = new AuthModule();
    }

    /**
     * Inicializa página de dashboard
     */
    initDashboard() {
        console.log('[App] Inicializando dashboard');
        if (!this.isUserAuthenticated()) {
            console.warn('[App] Usuário não autenticado. Redirecionando para login.');
            window.location.href = '/html/register_login.html';
            return;
        }

        console.log('[App] Dashboard pronto');
    }

    /**
     * Inicializa página de ranking
     */
    initRanking() {
        console.log('[App] Inicializando página de ranking');
    }

    /**
     * Inicializa página de lista de quizzes
     */
    initQuizList() {
        console.log('[App] Inicializando lista de quizzes');
        if (!this.isUserAuthenticated()) {
            console.warn('[App] Usuário não autenticado. Redirecionando para login.');
            window.location.href = '/html/register_login.html';
            return;
        }
    }

    /**
     * Inicializa páginas estáticas
     */
    initStaticPage() {
        console.log('[App] Carregando página estática');
    }

    /**
     * Inicializa homepage
     */
    initHomepage() {
        console.log('[App] Inicializando homepage');
        const token = localStorage.getItem('token');
        if (token) {
            const userType = localStorage.getItem('userType');
            const redirectPage = userType === 'teacher' ? 'dashboard_teacher.html' : 'dashboard_student.html';
            window.location.href = `/html/${redirectPage}`;
            return;
        }

        renderHomepage();
    }

    /**
     * Verifica se o usuário está autenticado
     */

    async handleRoute(path, isAjax) {
        this.currentPage = this.getPageFromPath(path);

        if (!this.applyRouteGuards()) {
            return;
        }

        if (isAjax) {
            const loaded = await this.loadPageFragment(path);
            if (!loaded) {
                window.location.href = path;
                return;
            }
        }

        await this.initPage();
    }

    /**
     * Inicializa a página atual
     */
    async initPage() {
        this.renderMenu();
        console.log(`[App] Inicializando página: ${this.currentPage}`);

        switch (this.currentPage) {
            case 'register_login.html':
                await this.renderPageContent();
                this.initAuth();
                break;
            case 'quiz.html':
                await this.renderPageContent();
                break;
            case 'dashboard_student.html':
                await this.renderPageContent();
                this.initDashboard();
                break;
            case 'dashboard_teacher.html':
                await this.renderPageContent();
                this.initDashboard();
                break;
            case 'teacher_quizzes.html':
                await this.renderPageContent();
                break;
            case 'quiz_list.html':
                await this.renderPageContent();
                this.initQuizList();
                break
            case 'ranking.html':
            case 'about.html':
            case 'rules.html':
            case 'homepage.html':
            case 'index.html':
                await this.renderPageContent();
                break;
            default:
                this.initHomepage();
        }
    }

    /**
     * Carrega o fragmento HTML da página via AJAX
     */
    async loadPageFragment(path) {
        try {
            const response = await fetch(path, { cache: 'no-store' });
            if (!response.ok) {
                console.error('[App] Falha ao buscar página:', response.status);
                return false;
            }

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const fetchedMainbox = doc.querySelector('main');
            const currentMainbox = document.querySelector('main');

            if (!fetchedMainbox || !currentMainbox) {
                console.error('[App] Estrutura de página inválida para AJAX');
                return false;
            }

            currentMainbox.innerHTML = fetchedMainbox.innerHTML;
            currentMainbox.id = fetchedMainbox.id || currentMainbox.id;
            currentMainbox.className = fetchedMainbox.className || currentMainbox.className;

            const title = doc.querySelector('title')?.textContent;
            if (title) {
                document.title = title;
            }

            return true;
        } catch (error) {
            console.error('[App] Falha ao carregar página via AJAX:', error);
            return false;
        }
    }

    /**
     * Renderiza a página estática ou lista com renderizador definido
     */
    async renderPageContent() {
        const renderer = this.pageRenderers[this.currentPage];
        if (renderer) {
            await renderer();
        }
    }

    /**
     * Verifica se o usuário está autenticado
     */
    isUserAuthenticated() {
        return !!localStorage.getItem('token');
    }

    /**
     * Desloga e volta para a tela de login
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        window.location.href = '/html/register_login.html';
    }

    /**
     * Setup de tratamento global de erros
     */
    setupGlobalErrorHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            console.error('[App] Unhandled Promise Rejection:', event.reason);
            event.preventDefault();
        });

        window.addEventListener('error', (event) => {
            console.error('[App] Global Error:', event.error);
        });
    }

    /**
     * Obtém informações do módulo atual
     */
    getCurrentModule() {
        return this.currentModule;
    }
}

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppOrchestrator();
    console.log('[App] Aplicação iniciada com sucesso');
});
