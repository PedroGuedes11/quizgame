# Frontend - Reorganização

O frontend foi reorganizado para uma arquitetura modular mais mantível e segura.

## Nova Estrutura

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
└── components/         # Componentes reutilizáveis (futuro)
```

## Melhorias Implementadas

### 1. **Arquitetura Modular**
- Código organizado em módulos ES6
- Separação clara de responsabilidades
- Fácil manutenção e teste

### 2. **Segurança Aprimorada**
- Uso de `textContent` ao invés de `innerHTML` onde possível
- Validação de entrada em formulários
- Tratamento adequado de erros
- Headers de autenticação corretos (`Bearer ${token}`)

### 3. **API Melhorada**
- Cliente HTTP centralizado
- Tratamento consistente de erros
- Suporte a diferentes métodos HTTP
- URL relativa para desenvolvimento

### 4. **Validação de Formulários**
- Validação em tempo real
- Mensagens de erro claras
- Prevenção de submissão inválida

### 5. **Experiência do Usuário**
- Formulários modernos e responsivos
- Feedback visual para erros
- Navegação intuitiva

## Como Usar

### Para Páginas Existentes
1. Atualize o HTML para incluir os scripts necessários:
   ```html
   <script type="module" src="../js/app.js"></script>
   <script type="module" src="../js/modules/auth.js"></script>
   ```

2. Remova scripts antigos que não são mais necessários

### Para Novos Componentes
1. Crie módulos na pasta `modules/`
2. Use as classes utilitárias de `utils/dom.js`
3. Importe o `apiService` de `services/api.js`

## Exemplo de Uso

```javascript
import { apiService } from '../services/api.js';
import { DOMUtils, ValidationUtils } from '../utils/dom.js';

// Fazer uma requisição
const data = await apiService.get('/api/user/profile');

// Manipular DOM de forma segura
DOMUtils.setTextContent('#username', data.username);

// Validar entrada
if (!ValidationUtils.isValidEmail(email)) {
    ValidationUtils.showError('#email-error', 'Email inválido');
}
```

## Migração

Os arquivos antigos ainda existem para referência, mas devem ser substituídos gradualmente pelos novos módulos. O foco está em:

- `register_login.js` → `modules/auth.js`
- `quiz.js` → `modules/quiz.js`
- `utils.js` → `services/api.js` + `utils/dom.js`

## Próximos Passos

- Migrar todas as páginas para a nova arquitetura
- Criar componentes reutilizáveis
- Adicionar testes unitários
- Implementar cache local
- Melhorar acessibilidade