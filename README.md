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
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quizgame
UPLOAD_DIR=./public/img/profiles
```

> Em desenvolvimento local, a `DATABASE_URL` é a forma mais simples e previsível de configurar a conexão. Se preferir usar o formato antigo, ainda é aceito via `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`.

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
- `npm run migrate:profile-photos`: migra fotos locais existentes para o S3

## Upload de imagens de perfil

As imagens de perfil são armazenadas em um bucket S3 privado. O banco salva a chave do objeto, e a API retorna uma URL pré-assinada temporária para o frontend.

Configure estas variáveis no ambiente local e no Render:

```env
AWS_REGION=us-east-1
AWS_S3_BUCKET=quizgame-profile-photos-prod
PROFILE_URL_EXPIRES_IN=900
AWS_ACCESS_KEY_ID=chave-do-usuario-iam
AWS_SECRET_ACCESS_KEY=segredo-do-usuario-iam
```

Em produção, prefira uma IAM Role quando a infraestrutura oferecer esse recurso. Nunca versione credenciais ou coloque chaves no código.

## Deploy no Render

Para deploy no Render, configure as variáveis de ambiente utilizando a URL interna do PostgreSQL fornecida pelo serviço de banco:

```env
PORT=10000
FRONTEND_URL=https://seu-frontend.com
SECRET_KEY=sua-chave-secreta
DATABASE_URL=postgres://<usuario>:<senha>@<host-interno>:5432/<database>?sslmode=require
AWS_REGION=us-east-1
AWS_S3_BUCKET=quizgame-profile-photos-prod
PROFILE_URL_EXPIRES_IN=900
AWS_ACCESS_KEY_ID=chave-do-usuario-iam
AWS_SECRET_ACCESS_KEY=segredo-do-usuario-iam
```

> Em Render, prefira usar `DATABASE_URL` em vez de montar a conexão manualmente com `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`. A URL interna do Postgres do Render já inclui as credenciais e o host corretos.
>
> O bucket deve permanecer privado. O usuário IAM precisa ter somente `s3:PutObject`, `s3:GetObject` e `s3:DeleteObject` em `arn:aws:s3:::<bucket>/profiles/*`.

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