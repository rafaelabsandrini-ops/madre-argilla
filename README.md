# Madre Argilla

Site React simples, em português do Brasil, criado para servir como portfólio e base de estudo para automação com Cypress e Robot Framework.

## Como rodar

Recomendado: Node.js 18+.

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## O que o projeto oferece

- Catálogo com busca, filtro por categoria, ordenação e filtro de estoque
- Cadastro, login e logout com persistência local no navegador
- Carrinho local com adição, remoção e limpeza de itens
- FAQ com expansão controlada
- Formulário de contato com validação client-side e feedback de sucesso/erro
- Layout responsivo com identidade visual terrosa para a marca Madre Argilla

## Por que está amigável para testes

- Textos previsíveis e em português do Brasil
- `id`, `aria-*` e `data-testid` em pontos importantes da interface
- Estados visuais claros para autenticação, itens filtrados, carrinho, FAQ e formulário
- Sem dependência de backend para completar os fluxos principais

## Deploy

O projeto está pronto para plataformas como Vercel, Netlify ou GitHub Pages usando o comando `npm run build`.
