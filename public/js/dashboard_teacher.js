
import { DOMUtils } from './utils/dom.js';
import { apiService } from './services/api.js';

async function fetchUser() {
    try {
        return await apiService.get('/api/user/user-info');
    } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        return null;
    }
}

export const renderTeacherDashboard = async () => {
    const user = await fetchUser();
    if (!user) {
        window.location.href = '/html/register_login.html';
        return;
    }

    const photo = user.profile_photo ? `../img/profiles/${user.profile_photo}` : '../img/teacher.png';

    const html = `
        <section id="dashboard-container">
            
            <div id="carrousel-navbar">
                <button class="navbar-btn active">Perfil</button>
                <button class="navbar-btn">Quizzes Criados</button>
            </div>

            <div id="carrousel">
                
                <div id="profile" class="carrousel-item">
                    <div id="img">
                        <img id="teacher-avatar" src="${photo}" alt="Avatar do professor" width="150">
                    </div>
                    <div class="user-data">
                        <div class="data-item">Professor: ${user.username}</div>
                        <div class="data-item">Email: ${user.email}</div>
                        <div class="data-item">Quizzes criados: ${user.quizzes_created}</div>
                    </div>
                    
                    <div id="profile-edit">
                        <h3>Editar perfil</h3>
                        <form id="profile-update-form" enctype="multipart/form-data">
                            <div class="form-group">
                                <label for="username">Nome</label>
                                <input id="username" name="username" type="text" value="${user?.username || ''}" required />
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input id="email" name="email" type="email" value="${user?.email || ''}" required />
                            </div>
                            <div class="form-group">
                                <label for="password">Nova senha</label>
                                <input id="password" name="password" type="password" placeholder="Deixe em branco para manter a senha atual" />
                            </div>
                            <div class="form-group">
                                <label for="profile_photo">Foto de perfil</label>
                                <input id="profile_photo" name="profile_photo" type="file" accept="image/*" />
                            </div>
                            <p id="update-msg" class="info-text"></p>
                            <button type="submit" class="primary-button">Salvar alterações</button>
                        </form>
                    </div>
                
                </div>

                <div id="created-quizzes" class="carrousel-item">
                    <h3>Quizzes criados</h3>
                </div>

            </div>

            <div id="create-quiz">
                <a href="/html/teacher_quizzes.html"><button>Criar quiz</button></a>
            </div>
        
        </section>
    `;

    DOMUtils.setInnerHTML('#dashboard-content', html);
    setupTeacherDashboardTabs();
    await loadTeacherQuizzes();

    const form = document.querySelector('#profile-update-form');
    const msg = document.querySelector('#update-msg');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const usernameInput = document.querySelector('#username');
            const emailInput = document.querySelector('#email');
            const passwordInput = document.querySelector('#password');
            const photoInput = document.querySelector('#profile_photo');

            const formData = new FormData();
            formData.append('username', usernameInput?.value || '');
            formData.append('email', emailInput?.value || '');
            if (passwordInput?.value) {
                formData.append('password', passwordInput.value);
            }
            if (photoInput?.files?.length) {
                formData.append('profile_photo', photoInput.files[0]);
            }

            try {
                const response = await apiService.put('/api/user/update-info', formData);
                if (msg) {
                    msg.textContent = response?.message || 'Perfil atualizado com sucesso.';
                }
                await renderTeacherDashboard();
            } catch (err) {
                console.error('Erro ao atualizar perfil:', err);
                if (msg) {
                    msg.textContent = err.message || 'Erro ao atualizar perfil.';
                }
            }
        });
    }
};

function setupTeacherDashboardTabs() {
    const buttons = document.querySelectorAll('#carrousel-navbar .navbar-btn');
    const items = document.querySelectorAll('.carrousel-item');

    if (!buttons.length || !items.length) {
        return;
    }

    const updateTabs = (index) => {
        buttons.forEach((button, buttonIndex) => {
            if (buttonIndex === index) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        items.forEach((item, itemIndex) => {
            if (itemIndex === index) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    buttons.forEach((button, index) => {
        button.addEventListener('click', () => updateTabs(index));
    });

    updateTabs(0);
}

async function loadTeacherQuizzes() {
    const container = document.querySelector('#created-quizzes');
    if (!container) {
        return;
    }

    container.innerHTML = '<p>Carregando quizzes...</p>';

    try {
        const response = await apiService.get('/api/quiz/teacher-quizzes');
        const quizzes = response.quizzes || [];

        if (quizzes.length === 0) {
            container.innerHTML = '<p>Você ainda não criou quizzes.</p>';
            return;
        }

        container.innerHTML = quizzes.map((quiz) => `
            <div class="teacher-quiz-item" data-quiz-id="${quiz.id_quiz}">
                <div class="quiz-meta">
                    <span>ID: ${quiz.id_quiz}</span>
                    <span>${quiz.subject}</span>
                    <span>${quiz.theme}</span>
                </div>
                <div class="quiz-stats">
                    <span>${quiz.question_count} perguntas</span>
                    <span>${new Date(quiz.created_at).toLocaleString('pt-BR')}</span>
                </div>
                <button class="delete-quiz-btn" data-quiz-id="${quiz.id_quiz}">Remover</button>
            </div>
        `).join('');

        const deleteButtons = container.querySelectorAll('.delete-quiz-btn');
        deleteButtons.forEach((button) => {
            button.addEventListener('click', async () => {
                const quizId = button.dataset.quizId;
                if (!quizId) {
                    console.error('Quiz ID ausente no botão de remoção.');
                    return;
                }

                await deleteQuiz(quizId);
            });
        });
    } catch (error) {
        console.error('Erro ao carregar quizzes do professor:', error);
        container.innerHTML = '<p>Ocorreu um erro ao carregar seus quizzes.</p>';
    }
}

async function deleteQuiz(quizId) {
    try {
        await apiService.delete(`/api/quiz/teacher-quizzes/${quizId}`);
        await loadTeacherQuizzes();
        console.log('Quiz removido com sucesso.');
    } catch (error) {
        console.error('Erro ao remover quiz:', error);
    }
};
