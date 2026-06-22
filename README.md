# Quiz Game

Um jogo de quiz desenvolvido com Node.js, Express, PostgreSQL, bcrypt e JavaScript puro no front-end, seguindo a arquitetura MVC.

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: PostgreSQL
- **Autenticação**: bcrypt para hashing de senhas, JWT para tokens
- **Frontend**: JavaScript puro (sem frameworks)
- **Arquitetura**: MVC (Model-View-Controller)

## Melhorias Implementadas

### Segurança
- Hashing de senhas com bcrypt
- Validação de tokens JWT
- Proteção contra XSS (usando textContent ao invés de innerHTML onde possível)
- Validação de entrada nos endpoints

### Estrutura do Código
- Arquitetura MVC completa
- Tratamento de erros consistente
- Consultas parametrizadas no banco de dados
- Middleware de autenticação

### Funcionalidades
- Registro e login de usuários (estudantes e professores)
- Criação e realização de quizzes
- Sistema de pontuação
- Ranking de usuários
- Gerenciamento de energia dos estudantes

## Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. **Instale o PostgreSQL**:
   - Baixe e instale do site oficial: https://www.postgresql.org/download/windows/
   - Use configurações padrão (porta 5432, senha 'postgres' para o usuário postgres)

4. Configure o arquivo de ambiente a partir de um modelo e atualize os valores de acordo com sua instalação:
   - Crie um arquivo `.env` a partir de `.env.example`
   - Atualize os valores com suas credenciais reais
   ```bash
   copy .env.example .env
   ```

   Exemplo de variáveis de ambiente:
   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/quizgame
   SECRET_KEY=change_this_jwt_secret_in_production
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

   > Importante: o arquivo `.env` contém segredos e não deve ser enviado para o controle de versão. Ele já está listado em `.gitignore`.

5. Crie o banco de dados:
   ```bash
   createdb -U postgres quizgame
   ```

6. Execute o servidor:
   ```bash
   npm start
   ```

   Ou para desenvolvimento com hot-reload:
   ```bash
   npm run dev
   ```

## Arquitetura do Frontend

O frontend foi reorganizado para uma arquitetura modular moderna:

### Estrutura
```
public/js/
├── app.js              # Ponto de entrada principal
├── modules/            # Módulos funcionais
│   ├── auth.js         # Autenticação e autorização
│   └── quiz.js         # Lógica do quiz
├── services/           # Serviços externos
│   └── api.js          # Cliente HTTP para API
├── utils/              # Utilitários
│   └── dom.js          # Manipulação segura do DOM
├── components/         # Componentes reutilizáveis
└── legacy/             # Arquivos antigos (para referência)
```

### Melhorias
- **Modularização**: Código organizado em módulos ES6
- **Segurança**: Validação de entrada e manipulação segura do DOM
- **Manutenibilidade**: Separação clara de responsabilidades
- **Experiência**: Formulários modernos com validação em tempo real

Para mais detalhes, consulte `public/js/README.md`.

## Estrutura do Projeto

```
quizgame/
├── app.js                 # Servidor principal
├── package.json           # Dependências
├── .env                   # Variáveis de ambiente
├── controllers/           # Controladores (lógica de negócio)
│   ├── authController.js
│   ├── quizController.js
│   └── userController.js
├── middlewares/           # Middlewares
│   └── authMiddlewares.js
├── model/                 # Modelos e queries do banco
│   ├── db.js
│   ├── quizQueries.js
│   └── userQueries.js
├── routes/                # Rotas da API
│   ├── authRoutes.js
│   ├── quizRoutes.js
│   └── userRoutes.js
└── public/                # Arquivos estáticos
    ├── html/              # Páginas HTML
    ├── css/               # Estilos
    ├── js/                # JavaScript frontend
    └── img/               # Imagens
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro

### Quizzes
- `GET /api/quiz/get-quiz-data/:quizId` - Obter dados do quiz
- `POST /api/quiz/submit` - Submeter respostas do quiz

### Usuários
- `GET /api/user/user-info` - Informações do usuário
- `PUT /api/user/update-info` - Atualizar perfil
- `GET /api/user/get-energy` - Obter energia
- `POST /api/user/decrement-energy` - Decrementar energia
- `POST /api/user/increment-energy` - Incrementar energia

## Próximos Passos

- Configurar banco de dados PostgreSQL
- Implementar validação de entrada mais robusta
- Adicionar testes automatizados
- Melhorar a interface do usuário
- Implementar cache para melhor performance
- Adicionar logging detalhado

## Contribuição

Para contribuir com o projeto, siga estes passos:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a ISC License.