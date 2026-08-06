import { DOMUtils } from './utils/dom.js';

export const renderRegisterLogin = () => {
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

    DOMUtils.setInnerHTML('#register-login-content', html);
};
