# Guia de Teste com Cypress

Este projeto usa **Cypress** para testes end-to-end (E2E).

## Instalação

Para instalar o Cypress, execute:

```bash
npm install --save-dev cypress
```

## Executando os Testes

### Modo Interativo (Interface do Cypress)
```bash
npm run test
```
ou
```bash
npx cypress open
```

### Modo Headless (Linha de Comando)
```bash
npm run test:headless
```
ou
```bash
npx cypress run
```

## Estrutura do Projeto

```
cypress/
├── e2e/              # Testes end-to-end (*.cy.js)
├── fixtures/         # Dados de teste
└── support/          # Comandos customizados e configuração
    ├── commands.js   # Comandos customizados
    └── e2e.js        # Configuração global
```

## Escrevendo Testes

Os testes devem ser criados em `cypress/e2e/*.cy.js`:

```javascript
describe('My Test Suite', () => {
  it('should visit the app', () => {
    cy.visit('/')
    cy.get('h1').should('be.visible')
  })
})
```

## Configuração

O arquivo `cypress.config.js` contém as configurações principais:
- **baseUrl**: URL base da aplicação (padrão: http://localhost:5173)
- Visite [docs do Cypress](https://docs.cypress.io/guides/references/configuration) para mais opções

## Dicas

1. **Inicie seu servidor de desenvolvimento antes de rodar os testes:**
   ```bash
   npm run dev
   ```

2. **Use `cy.visit('/')` para acessar a URL base**

3. **Cypress vem com extensão do Chrome - ative na interface**

4. **Escreva testes que são independentes e não se afetam mutuamente**
