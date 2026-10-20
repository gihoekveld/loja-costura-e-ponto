Crie um projeto web completo e simples para uma disciplina acadêmica de Segurança da Informação.

## Objetivo

Desenvolver uma pequena loja virtual propositalmente simples, que será publicada na Cloudflare e utilizada para estudar e testar boas práticas de segurança em aplicações web.

O projeto deve ser funcional, mas não precisa ter aparência de um e-commerce profissional. Priorize código organizado, arquitetura simples, segurança e facilidade para realizar testes.

## Stack obrigatória

* Next.js
* TypeScript
* App Router
* Server-Side Rendering / Server Components sempre que fizer sentido
* Cloudflare Workers para hospedagem
* Cloudflare D1 como banco de dados
* Tailwind CSS
* Sem backend separado
* Sem Docker
* Sem serviços externos obrigatórios
* Evitar bibliotecas desnecessárias

A aplicação deve ser compatível com deploy na Cloudflare.

## Funcionalidades

### 1. Loja

Criar uma loja fictícia de produtos de tecnologia.

Cada produto deve possuir:

* id
* nome
* descrição
* preço
* estoque
* imagem ou placeholder
* categoria

Criar aproximadamente 10 produtos fictícios.

Páginas:

* `/`
* `/products`
* `/products/[id]`
* `/cart`
* `/checkout`
* `/login`
* `/register`
* `/account`
* `/orders`

### 2. Cadastro

Permitir criação de conta com:

* nome
* e-mail
* senha

Requisitos:

* validar os dados no servidor
* não armazenar senha em texto puro
* utilizar um algoritmo apropriado de hash de senha
* impedir e-mails duplicados
* mensagens de erro não devem revelar informações desnecessárias

### 3. Login

Implementar autenticação baseada em sessão.

Requisitos:

* autenticação processada no servidor
* senha armazenada somente como hash
* sessão armazenada de forma segura
* cookie `HttpOnly`
* cookie `Secure` em produção
* proteção adequada contra CSRF quando aplicável
* expiração da sessão
* logout
* proteção das páginas autenticadas no servidor

Não armazenar token de autenticação em `localStorage`.

### 4. Conta

Usuário autenticado deve conseguir visualizar:

* nome
* e-mail
* pedidos realizados

Não permitir que um usuário consulte pedidos pertencentes a outro usuário.

### 5. Carrinho

Implementar um carrinho simples.

Permitir:

* adicionar produto
* remover produto
* alterar quantidade
* visualizar subtotal
* visualizar total

O servidor deve validar novamente:

* existência do produto
* preço
* estoque
* quantidade

Nunca confiar no preço enviado pelo navegador.

### 6. Checkout

Criar um checkout fictício.

Campos:

* nome
* CPF fictício ou identificador de teste
* endereço
* número
* cidade
* estado
* CEP

Pagamento:

* cartão de crédito
* Pix

IMPORTANTE:

Não integrar nenhuma operadora de pagamento real.

O cartão deve ser utilizado apenas como dado fictício para fins acadêmicos.

Nunca armazenar:

* número real de cartão
* CVV
* senha
* dados bancários reais

Criar um mecanismo de pagamento simulado, por exemplo:

* cartão aprovado
* cartão recusado
* Pix aguardando pagamento

Os dados utilizados devem ser claramente fictícios.

### 7. Pedidos

Após um pagamento fictício aprovado, criar um pedido no D1 contendo:

* id
* usuário
* itens
* quantidade
* preço registrado no momento da compra
* valor total
* status
* data

Possíveis status:

* `pending`
* `paid`
* `cancelled`

O preço registrado no pedido deve vir do banco de dados, e não do cliente.

## Banco de dados

Criar migrations para Cloudflare D1.

Tabelas mínimas:

### users

* id
* name
* email
* password_hash
* created_at

### sessions

* id
* user_id
* expires_at
* created_at

### products

* id
* name
* description
* price
* stock
* category
* created_at

### orders

* id
* user_id
* total
* status
* created_at

### order_items

* id
* order_id
* product_id
* quantity
* unit_price

## Segurança

Como este projeto será utilizado em uma disciplina de Segurança da Informação, implemente boas práticas de segurança desde o início.

Considere pelo menos:

### Autenticação

* hash seguro de senha
* sessões seguras
* cookies `HttpOnly`
* `Secure`
* `SameSite`
* expiração de sessão
* logout
* proteção contra enumeração de usuários

### Autorização

Implementar autorização no servidor.

Exemplo:

Um usuário autenticado não pode simplesmente alterar um ID na URL para acessar o pedido de outro usuário.

Nunca confiar somente em verificações realizadas no frontend.

### Validação

Validar todos os dados recebidos pelo servidor.

Utilizar validação de schema quando apropriado.

Validar:

* e-mail
* senha
* quantidade
* IDs
* endereço
* dados do checkout

### SQL Injection

Utilizar queries parametrizadas/prepared statements.

Nunca concatenar diretamente valores fornecidos pelo usuário em SQL.

### XSS

Tratar corretamente conteúdo fornecido pelo usuário.

Não utilizar HTML arbitrário fornecido pelo usuário sem sanitização.

### CSRF

Avaliar e implementar proteção CSRF nas operações sensíveis quando necessária, considerando a estratégia de autenticação utilizada.

### Rate limiting

Criar uma estrutura simples para permitir posteriormente testes de rate limiting, principalmente em:

* login
* cadastro
* checkout

Se o rate limiting completo depender de serviços específicos da Cloudflare, deixar a aplicação preparada para isso e documentar a configuração recomendada.

### Headers de segurança

Configurar headers de segurança apropriados, como:

* Content-Security-Policy
* X-Content-Type-Options
* Referrer-Policy
* Permissions-Policy
* Strict-Transport-Security em produção

Não adicionar headers incompatíveis com o funcionamento da aplicação.

### Erros

Não expor:

* stack traces
* credenciais
* queries SQL
* informações internas
* secrets

Criar mensagens de erro amigáveis para o usuário e logs apropriados no servidor.

### Secrets

Não colocar secrets no código.

Utilizar variáveis de ambiente / secrets da Cloudflare.

Nunca criar `.env` contendo credenciais reais no repositório.

## Segurança do checkout

O frontend pode enviar somente informações mínimas.

O servidor deve:

1. receber os produtos/quantidades;
2. consultar os produtos no D1;
3. verificar estoque;
4. obter os preços diretamente do banco;
5. calcular novamente o total;
6. criar o pedido;
7. processar o pagamento fictício;
8. atualizar o status.

Nunca confiar em:

* preço enviado pelo navegador;
* total enviado pelo navegador;
* estoque informado pelo cliente;
* usuário informado pelo cliente.

O usuário responsável pelo pedido deve ser obtido da sessão autenticada.

## Interface

Criar uma interface simples e limpa.

Não gastar muito tempo com design.

Utilizar:

* navbar
* lista de produtos
* cards
* carrinho
* formulário de login
* formulário de cadastro
* checkout
* página de pedidos

O objetivo principal é segurança e arquitetura, não estética.

## Dados de teste

Criar seed com aproximadamente:

* 10 produtos
* 2 usuários de teste

Não utilizar senhas ou dados pessoais reais.

## Estrutura

Organizar o projeto de maneira clara.

Separar:

* componentes
* funções de acesso ao banco
* autenticação
* validação
* autorização
* regras de negócio
* rotas/server actions
* tipos

Evitar colocar toda a lógica em componentes React.

## Testes

Criar testes básicos para as regras mais importantes.

Testar principalmente:

* cadastro
* login
* senha inválida
* sessão expirada
* acesso não autorizado a pedido
* produto inexistente
* quantidade inválida
* estoque insuficiente
* alteração de preço no cliente
* total manipulado pelo cliente
* checkout sem autenticação

## Página de documentação

Criar uma página `/security` contendo uma documentação simples para a disciplina.

Ela deve explicar:

* arquitetura da aplicação
* autenticação
* autorização
* sessão
* armazenamento de senha
* proteção contra SQL Injection
* proteção contra XSS
* proteção contra CSRF
* validação de entrada
* segurança do checkout
* headers de segurança
* gerenciamento de secrets
* limitações da implementação

Também criar um `SECURITY.md` no projeto.

## Preparação para testes de segurança

Adicionar uma seção na documentação chamada:

"Testes de Segurança"

Explicar como testar de forma controlada:

* SQL Injection
* XSS
* CSRF
* Broken Access Control / IDOR
* autenticação
* brute force/rate limiting
* manipulação de parâmetros
* manipulação de preço
* manipulação de quantidade
* sessão
* headers HTTP

O projeto será executado somente em ambiente controlado da disciplina.

## Ferramentas de teste

Documentar ferramentas gratuitas que podem ser utilizadas para análise da aplicação, como:

* OWASP ZAP
* Burp Suite Community
* DevTools do navegador
* ferramentas de análise de headers
* scanners de dependências

Não executar ataques contra terceiros.

## Importante sobre vulnerabilidades

O objetivo principal é implementar uma aplicação segura.

Porém, organize o código de forma que seja possível demonstrar academicamente algumas vulnerabilidades em ambiente controlado.

Não introduza vulnerabilidades deliberadamente no código principal.

Se for útil para a disciplina, criar uma área ou documentação separada explicando como uma versão insegura poderia apresentar:

* SQL Injection
* XSS
* IDOR
* ausência de validação de preço
* ausência de autorização

Não criar mecanismos que possam ser utilizados para atacar sistemas externos.

## Cloudflare

Preparar o projeto para deploy utilizando:

* Cloudflare Workers
* Cloudflare D1

Criar:

* configuração necessária
* migrations
* seed
* instruções de desenvolvimento local
* instruções de deploy

Documentar os comandos necessários para:

1. instalar dependências;
2. criar banco D1;
3. executar migrations;
4. popular dados;
5. executar localmente;
6. fazer deploy.

## Entrega

Ao finalizar:

1. Gere todo o código necessário.
2. Verifique se o TypeScript compila.
3. Verifique se o projeto pode ser executado localmente.
4. Verifique as migrations do D1.
5. Revise possíveis problemas de segurança.
6. Crie um README.md completo.
7. Crie `SECURITY.md`.
8. Liste as principais decisões de segurança tomadas.
9. Liste limitações conhecidas.
10. Não adicione funcionalidades desnecessárias.

Prioridade:

1. Segurança
2. Funcionamento
3. Simplicidade
4. Facilidade para testes
5. Interface
