# Quiz Game

Aplicação web de quiz em Node.js + Express + PostgreSQL com frontend em JavaScript puro.

## Visão geral

O projeto permite:

- cadastro de estudantes e professores
- autenticação com JWT
- criação e execução de quizzes
- pontuação e ranking
- gerenciamento de energia por usuário
- upload de foto de perfil

## Stack utilizada

- Backend: Node.js, Express
- Banco de dados: PostgreSQL
- Autenticação: bcrypt + JWT
- Frontend: JavaScript puro
- Upload de arquivos: Multer
- CORS: cors
- Variáveis de ambiente: dotenv

## Funcionalidades principais

- Login e registro com suporte a foto de perfil
- Diferenciação entre estudantes e professores
- Dashboard específico por tipo de usuário
- Ranking geral, por matéria e por quizzes concluidos
- Upload de avatar com fallback para imagem padrão
- Proteção de rotas autenticadas
- Estrutura modular e organizada para deploy

## Estrutura do projeto

```bash
quizgame/
├── app.js                          # servidor principal
├── package.json                    # scripts e dependências
├── .env                            # variáveis locais (não versionado)
├── .gitignore                      # arquivos ignorados pelo Git
├── controllers/
│   ├── authController.js
│   ├── quizController.js
│   └── userController.js
├── middlewares/
│   ├── authMiddlewares.js
│   └── uploadMiddleware.js
├── model/
│   ├── db.js
│   ├── quizQueries.js
│   └── userQueries.js
├── public/
│   ├── css/
│   ├── html/
│   ├── img/
│   └── js/
│       ├── app.js
│       ├── homepage.js
│       ├── ranking.js
│       ├── register_login.js
│       ├── modules/
│       ├── services/
│       ├── utils/
│       └── components/
├── routes/
│   ├── authRoutes.js
│   ├── quizRoutes.js
│   └── userRoutes.js
├── scripts/
│   ├── cleanup_old_quizzes.js
│   ├── normalize_subjects.js
│   └── wipe_all_quiz_data.js
└── README.md
```

## Requisitos

- Node.js 18+
- PostgreSQL
- npm

## Instalação local

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd quizgame
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo `.env` na raiz com as variáveis abaixo:

```env
PORT=3000
FRONTEND_URL=http://localhost:3000
SECRET_KEY=sua-chave-secreta
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=quizgame
UPLOAD_DIR=./public/img/profiles
```

4. Crie o banco PostgreSQL:

```bash
createdb -U postgres quizgame
```

5. Inicie o servidor:

```bash
npm start
```

Ou em modo de desenvolvimento:

```bash
npm run dev
```

## Scripts disponíveis

```bash
npm start
npm run dev
npm test
npm run cleanup:quizzes
npm run cleanup:quizzes:before
npm run normalize:subjects
```

### Descrição dos scripts

- `npm start`: inicia a aplicação em produção
- `npm run dev`: inicia com hot reload em desenvolvimento
- `npm test`: valida a sintaxe do backend principal
- `npm run cleanup:quizzes`: remove todos os quizzes e recalcula pontos globais
- `npm run cleanup:quizzes:before`: remove quizzes criados antes de uma data específica
- `npm run normalize:subjects`: normaliza matérias cadastradas

## Upload de imagens de perfil

As imagens de perfil são salvas em `public/img/profiles` por padrão.

A pasta é ignorada no Git por meio do `.gitignore` para evitar que uploads de usuários entrem no versionamento.

Importante para produção:

- em ambiente local, o diretório pode ficar em `./public/img/profiles`
- em Render, utilize `UPLOAD_DIR` apontando para um diretório persistente ou armazenamento externo
- o app expõe esse diretório em `/img/profiles`

## Deploy no Render

Para deploy no Render, configure as variáveis de ambiente:

```env
PORT=10000
FRONTEND_URL=https://seu-frontend.com
SECRET_KEY=sua-chave-secreta
DB_HOST=host-do-banco
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=sua-senha
DB_NAME=quizgame
UPLOAD_DIR=/var/data/profiles
```

> Observação: em Render, arquivos locais em disco podem não persistir entre deploys ou reinicializações sem volume persistente. Para uso real em produção, o ideal é usar um volume persistente ou um storage externo.

## Endpoints principais

### Autenticação

- `POST /api/auth/register`
- `POST /api/auth/login`

### Usuários

- `GET /api/user/user-info`
- `PUT /api/user/update-info`
- `GET /api/user/get-energy`
- `POST /api/user/decrement-energy`
- `POST /api/user/increment-energy`
- `GET /api/user/leaderboard/general`
- `GET /api/user/leaderboard/subject`
- `GET /api/user/leaderboard/completed`
- `GET /api/user/leaderboard/subjects`

### Quizzes

- `GET /api/quiz/get-quiz-data/:quizId`
- `POST /api/quiz/submit`

## Observações importantes

- O projeto não possui suíte automatizada completa de testes, mas a validação atual do ambiente usa checagem de sintaxe com `node --check`.
- Arquivos enviados pelos usuários não devem ser versionados no Git.
- O fallback de avatar padrão é utilizado quando a imagem do perfil não existe, evitando loops de requisição no ranking.

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua funcionalidade
3. Faça o commit
4. Abra um pull request

## Licença

Este projeto está licenciado sob a ISC License.