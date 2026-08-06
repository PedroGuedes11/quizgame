import { DOMUtils } from './utils/dom.js';
import { apiService } from './services/api.js';

const MAX_ENERGY = 5;
let energyCountdownInterval = null;

function formatSeconds(seconds) {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}

function clearEnergyCountdown() {
    if (energyCountdownInterval) {
        clearInterval(energyCountdownInterval);
        energyCountdownInterval = null;
    }
}

function updateEnergyTimerText(seconds) {
    const timerElement = document.querySelector('#energy-timer');
    if (!timerElement) return;

    if (seconds <= 0) {
        timerElement.textContent = 'Energia completa';
        return;
    }

    timerElement.textContent = `Próximo ponto em ${formatSeconds(seconds)}`;
}

function startEnergyCountdown(initialSeconds) {
    clearEnergyCountdown();

    let seconds = Number(initialSeconds);
    if (!Number.isFinite(seconds) || seconds <= 0) {
        updateEnergyTimerText(0);
        return;
    }

    updateEnergyTimerText(seconds);
    energyCountdownInterval = setInterval(() => {
        seconds -= 1;
        if (seconds <= 0) {
            clearEnergyCountdown();
            updateEnergyTimerText(0);
            return;
        }
        updateEnergyTimerText(seconds);
    }, 1000);
}

function pointsRequiredForLevel(level) {
    if (level <= 1) {
        return 0;
    }
    const n = level - 1;
    const base = 50000;
    const step = 20000;
    return Math.floor(base * n + (step * n * (n - 1)) / 2);
}

function calculateLevelFromPoints(points) {
    const normalizedPoints = Number.isFinite(points) ? Math.max(0, points) : 0;
    let level = 1;

    for (let candidate = 2; candidate <= 10; candidate += 1) {
        if (normalizedPoints >= pointsRequiredForLevel(candidate)) {
            level = candidate;
        } else {
            break;
        }
    }

    return level;
}

async function fetchUser() {
    try {
        return await apiService.get('/api/user/user-info');
    } catch (err) {
        console.error('Erro ao buscar usuário:', err);
        return null;
    }
}

function renderDoAfterList(quizzes) {
    if (!quizzes || quizzes.length === 0) {
        return '<p class="played-empty">Nenhum quiz marcado para depois.</p>';
    }

    return `
        <div class="do-after-grid">
            ${quizzes.map(quiz => {
                const idQuiz = quiz.id_quiz ?? quiz.quizId ?? '---';
                const subject = quiz.subject ?? 'Matéria não disponível';
                const theme = quiz.theme ?? 'Tema não disponível';
                const createdAt = quiz.created_at ? new Date(quiz.created_at).toLocaleDateString('pt-BR') : 'Data não disponível';
                return `
                    <article class="do-after-card">
                        <div class="do-after-card-header">
                            <div>
                                <div class="do-after-card-title">ID ${idQuiz}</div>
                                <div class="do-after-card-meta">Fazer mais tarde</div>
                            </div>
                        </div>
                        <div class="do-after-card-body">
                            <div class="do-after-card-line"><span>Matéria</span><strong>${subject}</strong></div>
                            <div class="do-after-card-line"><span>Tema</span><strong>${theme}</strong></div>
                            <div class="do-after-card-line"><span>Criado em</span><strong>${createdAt}</strong></div>
                        </div>
                        <div class="do-after-actions do-after-actions-card">
                            <a href="/html/quiz.html?quizId=${idQuiz}"><button class="primary-button">Jogar Quiz</button></a>
                            <button class="secondary-button remove-do-after" data-quiz-id="${idQuiz}">Remover da lista</button>
                        </div>
                    </article>`;
            }).join('')}
        </div>
    `;
}

//adiciona evento de clique no botao de remover da tabela do-after para remover o quiz da lista do aluno
document.addEventListener('click', async (e) => {
    const target = e.target;
    if (!target || !target.classList.contains('remove-do-after')) {
        return;
    }

    const quizId = target.dataset.quizId;
    const user = await fetchUser();
    if (!user) {
        window.location.href = '/html/register_login.html';
        return;
    }
    try {
        await apiService.delete(`/api/quiz/do-after/${user.id_student}/${quizId}`);
        await renderStudentDashboard();
    } catch (err) {
        console.error('Erro ao remover quiz da lista:', err);
    }
});

function renderPlayedList(played) {
    if (!played || played.length === 0) {
        return '<p class="played-empty">Nenhum quiz realizado ainda.</p>';
    }

    return `
        <div class="played-list-grid">
            ${played.map(p => {
                const started = new Date(p.started_at).toLocaleString();
                const finished = new Date(p.finished_at).toLocaleString();
                const points = p.total_points ?? 0;
                return `
                    <article class="played-card">
                        <div class="played-card-header">
                            <div>
                                <div class="played-card-title">ID ${p.id_quiz} - ${p.theme}</div>
                                <div class="played-card-meta">Matéria: ${p.subject}</div>
                            </div>
                            <span class="played-score">${points} pts</span>
                        </div>
                        <div class="played-card-body">
                            <div class="played-card-line"><span>Iniciado</span><strong>${started}</strong></div>
                            <div class="played-card-line"><span>Finalizado</span><strong>${finished}</strong></div>
                        </div>
                    </article>`;
            }).join('')}
        </div>
    `;
}

export const renderStudentDashboard = async () => {
    const user = await fetchUser();
    if (!user) {
        window.location.href = '/html/register_login.html';
        return;
    }

    const photo = user.profile_photo ? `../img/profiles/${user.profile_photo}` : '../img/nophotouser.png';
    const energyText = `${user.energy}/${MAX_ENERGY}`;
    const cachedPoints = (() => {
        try { return parseInt(localStorage.getItem('global_points'), 10); } catch (e) { return null; }
    })();
    const serverPoints = (typeof user.global_points !== 'undefined' && user.global_points !== null)
        ? Number(user.global_points)
        : null;
    const displayPoints = Number.isFinite(serverPoints)
        ? serverPoints
        : (Number.isFinite(cachedPoints) ? cachedPoints : 0);

    if (Number.isFinite(serverPoints)) {
        try { localStorage.setItem('global_points', String(serverPoints)); } catch (e) { }
    }

    const timerText = user.next_energy_seconds ? `Próximo ponto em ${formatSeconds(user.next_energy_seconds)}` : 'Energia já está no máximo';

    const level = calculateLevelFromPoints(displayPoints);
    const badgeLevel = Math.min(Math.max(level, 1), 10);
    const badgePath = `../img/badges/badge_level${badgeLevel}.png`;

    const html = `
        <section id="dashboard-container">
            
            <div id="carrousel-navbar">
                <button class="navbar-btn active">Perfil</button>
                <button class="navbar-btn not-active">Meus Quizzes</button>
                <button class="navbar-btn not-active">Fazer mais tarde</button>
            </div>

            <div id="carrousel">

                <div id="profile-container" class="carrousel-item profile-panel">
                    <div id="profile-top">
                        <div id="avatar-badge" class="profile-summary">
                            <div class="profile-icon-box">
                                <img id="user-avatar" class="profile-icon" src="${photo}" alt="Avatar do usuário">
                            </div>
                            <div class="badge badge-card">
                                <img class="badge-icon" src="${badgePath}" alt="badge">
                                <div class="badge-text">
                                    <span>Global points</span>
                                    <strong>${displayPoints}</strong>
                                </div>
                            </div>
                        </div>

                        <div id="user-data" class="profile-data-grid">
                            <div class="data-item">Usuário: ${user.username}</div>
                            <div class="data-item">Email: ${user.email}</div>
                            <div class="data-item">Energia disponível: ${energyText}<img src="../img/energy.png" alt="energy" class="energy-icon"></div>
                            <div class="data-item" id="energy-timer">${user.energy < MAX_ENERGY ? timerText : 'Energia completa'}</div>
                        </div>
                    </div>

                    <div id="edit-profile" class="profile-card">
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

                <div id="my-quizzes" class="carrousel-item">
                    <h3>Quizzes realizados</h3>
                    <div id="played-list-container"></div>
                </div>  

                <div id="do-after-quizzes" class="carrousel-item">
                    <h3>Fazer mais tarde</h3>
                </div>
            </div>
            
            <div class="play-quiz">

                <a href="/html/quiz_list.html"><button>Ver lista completa de quizzes</button></a>
            </div>
        
        </section>
    `;

    DOMUtils.setInnerHTML('#dashboard-content', html);
    setupDashboardTabs();
    if (user.energy < MAX_ENERGY && Number.isFinite(user.next_energy_seconds) && user.next_energy_seconds > 0) {
        startEnergyCountdown(user.next_energy_seconds);
    } else {
        clearEnergyCountdown();
    }

    (async () => {
        try {
            const playedResp = await apiService.get(`/api/quiz/played-quizzes/${user.id_student}`);
            const container = document.querySelector('#played-list-container');
            if (container) container.innerHTML = renderPlayedList(playedResp.played);
        } catch (err) {
            console.error('Erro ao buscar quizzes realizados:', err);
            const container = document.querySelector('#my-quizzes');
            if (container) container.innerHTML = '<p>Erro ao carregar histórico.</p>';
        }
    })();

    // fetch do-after quizzes (fazer mais tarde)
    (async () => {
        try {
            const doAfterResp = await apiService.get(`/api/quiz/do-after/${user.id_student}`);
            const doAfterContainer = document.querySelector('#do-after-quizzes');
            const doAfterCount = doAfterResp.do_after.length;
            if (doAfterCount === 0) {
                if (doAfterContainer) doAfterContainer.innerHTML += '<p>Nenhum quiz marcado para depois.</p>';
                return;
            } else {
                const plural = doAfterCount === 1 ? '' : 'zes';
                if (doAfterContainer) {
                    doAfterContainer.innerHTML += `Você marcou ${doAfterCount} quiz${plural} para fazer mais tarde`;
                    doAfterContainer.innerHTML += renderDoAfterList(doAfterResp.do_after);
                }
            }
        } catch (err) {
            console.error('Erro ao buscar quizzes marcados:', err);
            const doAfterContainer = document.querySelector('#do-after-quizzes');
            if (doAfterContainer) doAfterContainer.innerHTML += '<p>Erro ao carregar lista.</p>';
        }
    })();

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
                await renderStudentDashboard();
            } catch (err) {
                console.error('Erro ao atualizar perfil:', err);
                if (msg) {
                    msg.textContent = err.message || 'Erro ao atualizar perfil.';
                }
            }
        });
    }
};

function setupDashboardTabs() {
    const buttons = document.querySelectorAll('#carrousel-navbar .navbar-btn');
    const items = document.querySelectorAll('.carrousel-item');

    if (!buttons.length || !items.length) {
        return;
    }

    const updateTabs = (index) => {
        buttons.forEach((button, buttonIndex) => {
            if (buttonIndex === index) {
                button.classList.add('active');
                button.classList.remove('not-active');
            } else {
                button.classList.remove('active');
                button.classList.add('not-active');
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
