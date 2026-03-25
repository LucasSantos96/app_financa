# PRD - App de Gestão Financeira Pessoal (Next.js Fullstack Mobile First)

## 1. Visão Geral
Aplicativo web de gestão financeira pessoal, desenvolvido em Next.js fullstack, com foco em controle de contas, entradas, saídas e visualização de saldo.

O sistema será utilizado por dois usuários (uso doméstico), com interface:
- Mobile first
- Clean
- Minimalista
- Intuitiva

---

## 2. Objetivo
Permitir controle financeiro simples e eficiente:
- Gerenciar contas do mês
- Controlar entradas e saídas
- Acompanhar saldo atual
- Visualizar contas atrasadas e a pagar
- Automatizar contas fixas e parceladas

---

## 3. Funcionalidades

### 3.1 Autenticação
- Login com email e senha
- Rotas protegidas

---

### 3.2 Header com saldo
Exibir no topo:
- Saldo total atual
- Cor:
  - Verde → positivo
  - Vermelho → negativo
- Botão de olho para ocultar/mostrar saldo

Regra:
saldo = entradas - saídas

---

### 3.3 Contas do mês
CRUD de contas

Campos:
- Nome
- Valor
- Data de vencimento
- Status
- Tipo
- Fixa (sim/não)
- Parcelada (sim/não)
- Parcela atual
- Total de parcelas
- Observações

Cores:
- A pagar → amarelo
- Em atraso → vermelho
- Pagas → ocultas da lista principal

---

### 3.4 Contas fixas
- Repetem automaticamente todo mês
- Iniciam como pendentes

---

### 3.5 Contas parceladas
- Controle de parcelas (ex: 3/12)
- Avançam automaticamente no novo mês
- Encerram ao final

---

### 3.6 Entradas
Campos:
- Descrição
- Valor
- Data
- Categoria

---

### 3.7 Saídas
Campos:
- Descrição
- Valor
- Data
- Categoria
- Conta vinculada (opcional)

---

### 3.8 Dashboard
Exibir:
- Total de entradas
- Total de saídas
- Saldo
- Contas pendentes
- Contas atrasadas
- Gastos por categoria

---

## 4. Regras de negócio

- Conta paga sai da listagem principal
- Conta vencida não paga → atraso
- Contas fixas reaparecem mensalmente
- Parcelas avançam automaticamente
- Saldo atualizado em tempo real

---

## 5. UI/UX

- Mobile first
- Navegação simples
- Menu inferior:
  - Home
  - Contas
  - Movimentações
  - Dashboard
  - Perfil

---

## 6. Stack sugerida

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite (inicial)

---

## 7. Estrutura de dados (simplificada)

### Usuário
- id
- email
- senha

### ContaModelo
- id
- nome
- tipo
- valorBase
- recorrente

### ContaMensal
- id
- nome
- valor
- mês
- ano
- status
- parcelaAtual
- totalParcelas

### Entrada
- id
- valor
- data
- categoria

### Saída
- id
- valor
- data
- categoria

---

## 8. MVP

- Login
- CRUD contas
- Marcar como paga
- Entradas e saídas
- Saldo no header
- Dashboard básico
- Contas fixas
- Parcelas

---

## 9. Futuro (melhorias)

- Exportar PDF
- Comparação entre meses
- Metas financeiras
- Backup em nuvem
