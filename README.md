# App Finanças - Gestão Financeira Pessoal

Aplicação web para controle financeiro pessoal, desenvolvida com Next.js, TypeScript, Tailwind CSS e Prisma.

## 🚀 Funcionalidades

- **Autenticação**: Login seguro com email e senha
- **Dashboard**: Visão geral da saúde financeira com filtros por período (7, 15, 30 dias ou personalizado)
- **Contas**: CRUD completo de contas mensais com status (pendente, pago, atrasado)
- **Contas Fixas**: Repetem automaticamente todo mês
- **Contas Parceladas**: Controle de parcelas com avanço automático
- **Movimentações**: Registro de entradas e saídas por categoria
- **Reserva de Emergência**: Depósito e saque, com saque convertendo para saldo
- **Indicadores**: Taxa de poupança, gráficos por categoria

## 🛠️ Tecnologias

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + shadcn/ui
- **Ícones**: Lucide React
- **Banco de Dados**: MongoDB (Prisma ORM)
- **Autenticação**: NextAuth.js
- **Gráficos**: Recharts

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd app_financa
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
DATABASE_URL="mongodb+srv://usuario:senha@cluster.mongodb.net/app_financa"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

4. Gere o client do Prisma e execute o seed do banco de dados:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

6. Acesse `http://localhost:3000`

### Credenciais de teste (somente desenvolvimento)
- **Email**: `teste@email.com`
- **Senha**: `123456`
- **Importante**: use apenas para ambiente local e altere o usuário/senha antes de publicar ou compartilhar o projeto.

## 📱 Estrutura do Projeto

```
src/
├── app/
│   ├── (dashboard)/     # Páginas autenticadas
│   │   ├── page.tsx     # Dashboard
│   │   ├── contas/     # Módulo de contas
│   │   ├── movimentacoes/ # Movimentações
│   │   ├── reserva/     # Reserva de emergência
│   │   └── perfil/     # Perfil do usuário
│   ├── api/            # API routes
│   │   ├── auth/       # NextAuth
│   │   ├── contas/     # CRUD de contas
│   │   ├── movimentacoes/ # Entradas e saídas
│   │   └── reserva/    # Reserva de emergência
│   ├── login/          # Página de login
│   └── layout.tsx      # Layout raiz
├── components/
│   ├── layout/         # Header e BottomNav
│   └── ui/             # Componentes shadcn
└── lib/
    ├── auth.ts         # Configuração NextAuth
    ├── prisma.ts       # Cliente Prisma
    └── types/          # Tipos TypeScript
```

## 📖 Documentação da API

Acesse a documentação Swagger em: `http://localhost:3000/api-docs`

### Endpoints principais:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/[...nextauth]` | Autenticação |
| GET/POST | `/api/contas` | Listar/Criar contas |
| PATCH/DELETE | `/api/contas/{id}` | Atualizar/Excluir conta |
| POST | `/api/movimentacoes/entrada` | Criar entrada |
| POST | `/api/movimentacoes/saida` | Criar saída |
| DELETE | `/api/movimentacoes/{tipo}/{id}` | Excluir movimentação |
| POST | `/api/reserva` | Depositar/Sacar da reserva |

## 🔨 Build para Produção

```bash
npm run build
npm start
```

## 📝 Licença

MIT
