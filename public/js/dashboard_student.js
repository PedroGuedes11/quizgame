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
        return '<p>Nenhum quiz marcado para depois.</p>';
    }
    //itera no array de quizzes mostrando o id_quiz
    return `
        <ul class="do-after-list">
            ${quizzes.map(quiz => `
                <li>${quiz.id_quiz}</li>
                <a href="/html/quiz.html?quizId=${quiz.id_quiz}"><button>Jogar Quiz</button></a>
                <button id="remove-do-after" data-quiz-id="${quiz.id_quiz}">Remover da lista</button>`
            ).join('')}
        </ul>
    `;
}

//adiciona evento de clique no botao de remover da tabela do-after para remover o quiz da lista do aluno
document.addEventListener('click', async (e) => {
    if (e.target && e.target.id === 'remove-do-after') {
        const quizId = e.target.dataset.quizId;
        const user = await fetchUser();
        if (!user) {
            window.location.href = '/html/register_login.html';
            return;
        }
        try {
            await apiService.delete(`/api/quiz/do-after/${ user.id_student }/${ quizId }`);
        } catch (err) {
            console.error('Erro ao remover quiz da lista:', err);
        }
    }
});

function renderPlayedList(played) {
    if (!played || played.length === 0) {
        return '<p>Nenhum quiz realizado ainda.</p>';
    }

    return `
        <ul class="played-list">
            ${played.map(p => {
                const started = new Date(p.started_at).toLocaleString();
                const finished = new Date(p.finished_at).toLocaleString();
                return `<li class="played-item">
                    <div class="played-meta"><strong>${p.subject} - ${p.theme}</strong></div>
                    <div class="played-data">Iniciado: ${started} — Finalizado: ${finished} — Pontos: ${p.total_points ?? 0}</div>
                </li>`;
            }).join('')}
        </ul>
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

    const html = `
        <section id="dashboard-container">
            
            <div id="carrousel-navbar">
                <button class="navbar-btn active">Perfil</button>
                <button class="navbar-btn">Meus Quizzes</button>
                <button class="navbar-btn">Fazer mais tarde</button>
            </div>

            <div id="carrousel">

                <div id="profile-container" class="carrousel-item">
                    
                    <div id="avatar-badge">
                        <div class="img">
                            <img id="user-avatar" src="${photo}" alt="Avatar do usuário" width="150">
                        </div>
                        <div class="badge">
                            <img src="../img/badge.png" alt="badge">
                            <strong>Global points: ${displayPoints}</strong>
                        </div>
                    </div>

                    <div id="user-data">
                        <div class="data-item">Usuário: ${user.username}</div>
                        <div class="data-item">Email: ${user.email}</div>
                        <div class="data-item">Energia disponível: ${energyText}<img src="../img/energy.png" alt="energy" width="50"></div>
                        <div class="data-item" id="energy-timer">${user.energy < MAX_ENERGY ? timerText : 'Energia completa'}</div>
                    </div>

                    <div id="edit-profile">
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
            }
            else {
                const plural = doAfterCount === 1 ? '' : 'zes';
                doAfterContainer.innerHTML += `Você marcou ${doAfterCount} quiz${plural} para fazer mais tarde`;
                if (doAfterContainer){
                    doAfterResp.do_after.forEach(quiz => {
                        doAfterContainer.innerHTML += renderDoAfterList([quiz]);
                    })
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
