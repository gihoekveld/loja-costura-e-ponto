# 🪡 Costura & Ponto — Aviamentos e Acessórios

> **E-commerce moderno de alta performance para ateliês, alfaiatarias e oficinas de costura doméstica, projetado com arquitetura de segurança em profundidade, privacidade por design (LGPD) e execução na borda (Edge Computing).**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare-D1_SQLite-f38020?style=flat&logo=cloudflare)](https://developers.cloudflare.com/d1/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Web Crypto API](https://img.shields.io/badge/Security-PBKDF2_%7C_AES--256--GCM-green?style=flat&logo=shield)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
[![Vitest](https://img.shields.io/badge/Tests-16%2F16_Passed-success?style=flat&logo=vitest)](https://vitest.dev/)

---

## 📌 Sumário
- [Sobre o Projeto](#-sobre-o-projeto)
- [Identidade Visual & Experiência (UI/UX)](#-identidade-visual--experiência-uiux)
- [Arquitetura de Segurança & LGPD](#-arquitetura-de-segurança--lgpd)
- [Banco de Dados & Cloudflare D1](#-banco-de-dados--cloudflare-d1)
- [Credenciais de Demonstração](#-credenciais-de-demonstração)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Como Executar o Projeto](#-como-executar-o-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Testes Automatizados](#-testes-automatizados)
- [Deploy na Cloudflare](#-deploy-na-cloudflare)

---

## 🧵 Sobre o Projeto

A **Costura & Ponto** é uma loja virtual completa especializada no fornecimento de aviamentos, acessórios de costura, fios técnicos, calcadores especiais e aparelhos industriais para oficinas e ateliês de todo o Brasil.

Além de uma experiência de compra fluida e visualmente refinada, o projeto foi desenvolvido com foco rigoroso em **Segurança Ofensiva e Defensiva**, implementando controles avançados contra as principais vulnerabilidades da **OWASP Top 10** e garantindo conformidade com a **Lei Geral de Proteção de Dados (LGPD)**.

---

## 🎨 Identidade Visual & Experiência (UI/UX)

O visual foi desenvolvido com foco em transmitir aconchego, profissionalismo e confiabilidade:
- **Paleta Harmônica**: Fundo off-white e bege suave (`#fcfaf7`), detalhes em tons terracota e vermelho queimado (`#9d3d27`, `#b84a32`) e tipografia moderna (Inter).
- **Header 100% Viewport**:
  - **Barra de Destaque Superior**: Informativo de frete grátis, parcelamento sem juros e envio para todo o Brasil.
  - **Barra Principal**: Logomarca oficial, barra de busca inteligente em tempo real, links rápidos de autenticação, favoritos e modal dinâmico do carrinho.
  - **Barra de Navegação por Categorias**: Menu intuitivo com atalhos para os departamentos da loja.
- **Catálogo Interativo**:
  - Filtros instantâneos por categoria (*Aparelhos & Guias*, *Linhas & Fios*, *Calcadores & Sapatilhas*, *Zíperes*, *Elásticos*, *Acessórios*).
  - Cards de produto com status de estoque, cálculo de parcelas em até 6x sem juros e botões de ação rápida.
- **Carrinho & Favoritos**:
  - Contexto global persistente em `localStorage`.
  - Controle de quantidades, cálculo de subtotal e checkout com validação de dados e alertas visuais (Toast).

---

## 🛡️ Arquitetura de Segurança & LGPD

O sistema segue o princípio de **Privacy by Design** e **Defesa em Profundidade**, com criptografia de ponta implementada através da **Web Crypto API** (compatível com Cloudflare Workers e Node.js):

### 1. Proteção de Credenciais (Autenticação)
- **Hash de Senha com PBKDF2**: Derivação PBKDF2-HMAC-SHA256 com **100.000 iterações** e *salt* criptográfico aleatório único de 16 bytes para cada usuário (`pbkdf2:100000:<salt>:<hash>`).
- **Prevenção de Timing Attacks**: Validação de hashes e tokens executada em tempo constante (`timingSafeEqual`) para impedir ataques de temporização.

### 2. Tratamento de Dados Pessoais Sensíveis (LGPD)
- **Busca Exata sem Exposição (`cpf_hash`)**: O CPF é higienizado e armazenado como um hash unidirecional SHA-256 combinado a um *pepper* secreto da aplicação. Isso permite buscas seguras no banco de dados sem expor o número do documento.
- **Armazenamento Seguro para Nota Fiscal (`cpf_encrypted`)**: Quando necessário para emissão fiscal, o CPF é criptografado com **AES-256-GCM** utilizando chave simétrica de 256 bits e IV aleatório de 12 bytes por registro.
- **Mascaramento em Respostas Públicas**: APIs e telas de perfil exibem o CPF mascarado (`***.456.789-**`). A descriptografia só ocorre mediante acesso restrito e autenticado pelo painel administrativo com trilha de auditoria.

### 3. Proteção contra Vulnerabilidades OWASP
- **Prevenção de IDOR (Insecure Direct Object References)**: Rotas de pedidos (`/api/orders/[id]`) e detalhes da conta exigem validação de sessão e permissão estrita: clientes só acessam seus próprios registros; administradores possuem permissão monitorada.
- **Prevenção de SQL Injection**: Todas as consultas ao banco de dados utilizam *Prepared Statements* parametrizados no Cloudflare D1 (`db.prepare(...).bind(...)`).
- **Prevenção de XSS**: Sanitização de entradas com codificação de entidades HTML e validação estrita de esquemas com Zod.
- **Headers HTTP Seguros**: Configuração de Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), `X-Content-Type-Options: nosniff` e `X-Frame-Options: DENY`.
- **Rate Limiting**: Bloqueio de tentativas abusivas de força bruta em endpoints de autenticação (`/api/auth/login`).
- **Validação de CSRF**: Proteção em requisições de alteração de estado.

---

## 🗄️ Banco de Dados & Cloudflare D1

O projeto utiliza o **Cloudflare D1**, banco de dados SQL relacional distribuído na borda (Edge SQLite), eliminando arquivos JSON frágeis e garantindo persistência robusta:

- **Localmente**: Conexão nativa ao SQLite gerenciado pelo Wrangler em `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/`. Os dados persistem permanentemente entre reinicializações do servidor.
- **Em Produção**: Conexão direta ao banco D1 da Cloudflare via binding `env.DB`.
- **Organização de Scripts**:
  - `database/migrations/`: Migrações versionadas para criação de tabelas e carga inicial essencial.
  - `database/seeds/`: Seeds dinâmicos para testes de carga e segurança (protegidos no `.gitignore`).

---

## 🔑 Credenciais de Demonstração

Para fins de avaliação, auditoria acadêmica e navegação de testes, o banco possui as seguintes contas pré-configuradas:

| Perfil | E-mail | Senha | Finalidade |
| :--- | :--- | :--- | :--- |
| **Cliente de Teste** | `mariana@ateliecostura.com.br` | `Costura2026!` | Navegação, pedidos, carrinho e perfil do cliente |
| **Administrador** | `admin@costuraeponto.com.br` | `AdminCostura2026!` | Painel administrativo (`/admin`), gestão e auditoria |

> 🔒 **Nota sobre Usuários Adicionais de Segurança**:
> Para testes de segurança e auditoria (como injeção de lotes diários de 300 usuários), as senhas são geradas aleatoriamente com alta entropia e descartadas da memória logo após a derivação do hash PBKDF2. Nenhum desenvolvedor ou avaliador tem acesso a elas, garantindo um cenário real de pentest.

---

## 📁 Estrutura de Pastas

```
loja-costura-e-ponto/
├── database/
│   ├── migrations/
│   │   ├── 0001_initial_schema.sql      # Schema SQL (users, sessions, products, orders, items)
│   │   └── 0002_seed_data.sql          # Catálogo inicial e contas principais
│   └── seeds/                          # Lotes diários de segurança (.gitignored)
├── public/
│   ├── images/                         # Banners e fotografias reais do ateliê
│   ├── logo-mark.png                   # Logomarca oficial
│   └── favicon*                        # Ícones e manifestos PWA
├── scripts/
│   └── seed_security_users.mjs         # Gerador de lotes de segurança (.gitignored)
├── src/
│   ├── app/
│   │   ├── (rotas públicas)            # /, /products, /cart, /checkout, /security
│   │   ├── account/                    # Painel do cliente e histórico de pedidos
│   │   ├── admin/                      # Painel administrativo e auditoria de CPF
│   │   └── api/                        # Rotas REST autenticadas e sanitizadas
│   ├── components/                     # Navbar 100vw, Footer, Cards, Catálogo, Modais
│   ├── lib/
│   │   ├── auth/                       # Web Crypto, PBKDF2, AES-256-GCM, Sessões
│   │   ├── db/                         # Interface Cloudflare D1 e Prepared Statements
│   │   ├── security/                   # Rate limit, CSRF, sanitização de inputs
│   │   └── validation/                 # Esquemas Zod para formulários e payloads
│   └── types/                          # Interfaces TypeScript estritas
├── tests/                              # Bateria de testes unitários e de integração
├── wrangler.toml                       # Configuração Cloudflare Pages & D1 binding
├── tailwind.config.js                  # Configurações de design e cores terracota
└── package.json
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js** v18+ (Node.js 20+ ou 24 recomendado)
- **npm** v9+

### 1. Instalar Dependências
```bash
npm install
```

### 2. Inicializar o Banco de Dados Local (Cloudflare D1)
As migrações são aplicadas automaticamente na primeira inicialização, ou você pode executá-las manualmente:
```bash
npm run d1:migrate:local
```

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação no navegador em: **[http://localhost:3000](http://localhost:3000)**.

---

## 🛠️ Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor Next.js em ambiente de desenvolvimento |
| `npm run build` | Compila o projeto otimizado para produção |
| `npm start` | Inicia o servidor com a build de produção local |
| `npm test` | Executa a suíte de testes com Vitest |
| `npm run d1:migrate:local` | Aplica o schema e seeds base no banco D1 local |
| `npm run d1:migrate:remote`| Aplica as migrações no banco D1 de produção na Cloudflare |
| `npm run pages:build` | Prepara os assets para o Cloudflare Pages (`next-on-pages`) |
| `npm run deploy` | Realiza o deploy da aplicação no Cloudflare Pages |

---

## 🧪 Testes Automatizados

O projeto conta com suíte de testes com **Vitest**, validando regras criptográficas, conformidade de schemas e proteção contra vulnerabilidades:

```bash
npm test
```

### Casos de Teste Cobertos:
- ✅ **Hash PBKDF2**: Verificação de senha correta e rejeição de senhas incorretas.
- ✅ **Timing Attacks**: Comparação de tokens em tempo constante (`timingSafeEqual`).
- ✅ **Proteção LGPD**: Validação de hash determinístico e criptografia reversível AES-256-GCM para CPF.
- ✅ **Proteção contra IDOR**: Bloqueio de acesso a pedidos e dados de outros clientes sem autorização.
- ✅ **Validação e Sanitização**: Sanitização contra XSS e validação de formatos com esquemas Zod.

---

## ☁️ Deploy na Cloudflare

Para publicar a aplicação na infraestrutura global da Cloudflare:

1. **Vincular o Cloudflare D1**:
   ```bash
   wrangler d1 create sec-store-db
   ```
2. **Aplicar Migrações Remotas**:
   ```bash
   npm run d1:migrate:remote
   ```
3. **Compilar e Publicar**:
   ```bash
   npm run deploy
   ```

---

## 📄 Licença
Projeto acadêmico e comercial desenvolvido para fins educacionais e de demonstração de práticas avançadas de Segurança da Informação, LGPD e E-commerce Moderno.
