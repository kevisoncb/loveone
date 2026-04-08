# 💖 Love365 - Prompt Detalhado do Projeto

## 📋 Visão Geral

**Love365** é uma plataforma SaaS (Software as a Service) completa focada em casais que desejam criar páginas de homenagem personalizadas e românticas para celebrar seus relacionamentos. A plataforma oferece dois planos de assinatura com recursos diferenciados e integração com Stripe para pagamentos.

---

## 🎯 Objetivo Principal

Permitir que usuários criem páginas de homenagem interativas e compartilháveis com:
- Contador de tempo de relacionamento em tempo real (anos, meses, dias, horas, minutos, segundos)
- Slideshow de fotos do casal
- Música de fundo do YouTube
- Design responsivo mobile-first com tema romântico
- Geração de link único e QR Code para compartilhamento
- Sistema de planos com recursos diferenciados

---

## 🏗️ Stack Tecnológico

### Frontend
- **React 19** - Framework UI moderno
- **React Router DOM** - Navegação entre páginas
- **Tailwind CSS v4** - Estilização com tema romântico
- **Framer Motion** - Animações suaves (chuva de corações)
- **Lucide React** - Ícones elegantes
- **Date-fns** - Cálculos precisos de datas
- **React-Player v3** - Player de YouTube
- **QRCode.react** - Geração de QR Codes
- **Sonner** - Notificações toast

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **tRPC 11** - RPC type-safe
- **Stripe** - Processamento de pagamentos
- **JWT** - Autenticação segura

### Banco de Dados
- **MySQL** - Armazenamento de dados
- **Drizzle ORM** - Query builder type-safe

### Build & Deploy
- **Vite** - Bundler rápido
- **TypeScript** - Type safety
- **Vitest** - Testes unitários

---

## 📱 Estrutura de Páginas

### 1. Landing Page (Rota: `/`)

#### Hero Section
- Título chamativo: "Celebre seu amor com Love365"
- Subtítulo romântico
- CTA principal: "Criar Minha Homenagem"
- Design mobile-first com gradiente rose/pink

#### Mockup de Celular (Hero)
- Exibe exemplo do produto final
- Mostra foto de casal com slideshow
- Contador de tempo completo funcionando em tempo real
- Mockup responsivo que se adapta ao tamanho da tela
- Implementado com CSS/SVG para qualidade perfeita

#### Seção de Preços
- **Plano Essencial**: R$ 29,90 / 1 ano (365 dias)
  - 3 fotos no slideshow
  - Player de música simples
  - Design clean e elegante
  - Contador de tempo
  - Link único + QR Code
  
- **Plano Premium**: R$ 49,90 / Vitalício (pagamento único)
  - 5 fotos no slideshow
  - Player estilo Spotify com controles avançados
  - Efeito chuva de corações animada
  - Acesso permanente (sem expiração)
  - Link único + QR Code
  - Todos os recursos do Essencial

#### FAQ (Perguntas Frequentes)
- Esclarece diferença entre planos (1 ano vs vitalício)
- Explica geração de link único e QR Code
- Responde dúvidas sobre compartilhamento
- Perguntas sobre segurança e privacidade

#### Footer
- Logo Love365 com ícone de coração
- Ano de copyright dinâmico
- Links: Termos de Uso, Privacidade, Contato
- Design limpo e minimalista

---

### 2. Criador de Página (Rota: `/create`)

#### Layout Split-Screen (Desktop)
- **Esquerda**: Formulário com scroll
- **Direita**: Mockup de celular sticky (fixo) com preview em tempo real

#### Campos do Formulário

**1. Seleção de Plano**
- Cards selecionáveis: Essencial ou Premium
- Exibe preço e duração de cada plano
- Valida limite de fotos (3 vs 5)

**2. Dados do Casal**
- Input: "Nomes do Casal" (ex: "Ana & João")
- Input: "Data de Início" (type="date")
- Formatação automática para DD/MM/YYYY

**3. Upload de Fotos**
- Input file multiple
- Limite: 3 fotos (Essencial) ou 5 fotos (Premium)
- Conversão para Base64 no frontend
- Exibição como miniaturas com botão de remover
- Validação de tipo MIME (apenas imagens)
- Upload para S3 via tRPC

**4. Trilha Sonora**
- Input: Link do YouTube
- Validação de URL válida
- Suporta links em diferentes formatos (youtube.com, youtu.be, etc)

#### Preview em Tempo Real (Mockup)
- Slideshow das fotos (transição fade a cada 4 segundos)
- Gradiente escuro suave sobre as fotos (bg-black/40)
- Topo: Nomes do casal + data formatada
- Rodapé: Contador de tempo atualizado em tempo real
- Indicador visual "Música tocando..."
- Atualização instantânea conforme usuário preenche o formulário

#### Botão de Submit
- Envia payload JSON para API
- Redireciona para página gerada após sucesso
- Exibe loading state durante envio
- Tratamento de erros com toast

---

### 3. Página de Homenagem Pública (Rota: `/p/:slug`)

#### Design Responsivo (Mobile-First)
- Container com dimensões de celular: `max-w-[400px]`, `h-[850px]`, `max-h-[90vh]`
- Bordas muito arredondadas: `rounded-[2.5rem]`
- Borda grossa simulando carcaça: `border-[8px] border-slate-900`

#### Fundo Desktop
- Foto atual do slideshow com desfoque extremo: `blur-3xl`
- Opacidade reduzida
- Overlay escuro para ambiente imersivo

#### Elementos Visuais

**Slideshow de Fundo**
- Fotos alternam a cada 4 segundos
- Transição fade suave com Framer Motion
- Loop infinito

**Animação de Corações (Premium Only)**
- Componente `FallingHearts` gera corações caindo
- Movimento suave do topo para base
- Loop infinito com aleatoriedade
- Apenas visível no Plano Premium

**Sombreamento**
- Gradientes sutis (bg-black/30 a bg-black/60)
- Apenas nas extremidades superior e inferior
- Garante legibilidade sem escurecer demais as fotos

#### Conteúdo

**Topo**
- Nomes do casal em destaque
- Data de início formatada
- Regra: Data é formatada com `.split('-').reverse().join('/')` para evitar bugs de timezone

**Rodapé (Rolável)**
- Contador de tempo em blocos:
  - **Anos** | **Meses** | **Dias**
  - **Horas** | **Minutos** | **Segundos**
- Atualização em tempo real a cada segundo
- Cálculo preciso com date-fns

#### Trilha Sonora (Autoplay Workaround)

**Tela Inicial**
- Overlay preto translúcido
- Botão de "Play" gigante e centralizado
- Texto: "Uma homenagem para você - Toque para abrir"

**Após Clicar**
- Overlay desaparece
- ReactPlayer inicia reprodução
- Música em loop infinito
- Player oculto na interface

**Controles de Áudio**
- Botão mutar/desmutar abaixo do contador
- Ícone de alto-falante mudo/ligado
- Feedback visual

#### Plano Essencial
- Player simples (apenas play/pause)
- 3 fotos no slideshow
- Sem efeito de chuva de corações

#### Plano Premium
- Player estilo Spotify com controles avançados
- 5 fotos no slideshow
- Efeito de chuva de corações animada
- Sem limite de tempo (vitalício)

---

### 4. QR Code (Rota: `/qr/:slug`)

- Página dedicada para download do QR Code
- QR Code aponta para a URL pública da homenagem
- Opção de download em PNG
- Design limpo e centrado

---

### 5. Página de Edição (Rota: `/edit/:id`)

- Formulário similar ao `/create`
- Pré-preenchido com dados existentes
- Permite editar nomes, data, fotos e música
- Validação de propriedade (apenas o criador pode editar)

---

### 6. Dashboard do Usuário (Rota: `/dashboard`)

- Lista de todas as páginas criadas pelo usuário
- Cards com preview, data de criação e plano
- Botões para: Ver, Editar, Compartilhar, Deletar
- Estatísticas: Total de páginas, planos ativos
- Link para criar nova página

---

### 7. Painel Admin (Rota: `/admin`)

#### Login Admin (`/admin`)
- Autenticação por senha segura
- Comparação com `ADMIN_PASSWORD` (env var)
- Geração de JWT token com expiração de 7 dias
- Armazenamento em localStorage

#### Dashboard Admin (`/admin/dashboard`)
- Estatísticas em tempo real:
  - Total de páginas criadas
  - Páginas com Plano Essencial
  - Páginas com Plano Premium
  - Receita estimada (cálculo: Essencial × 29.90 + Premium × 49.90)

- **Aba Páginas**:
  - Tabela com todas as páginas de todos os usuários
  - Colunas: Casal, Plano, Data de Criação, Ações
  - Botão "Ver" abre a página pública em nova aba

- **Aba Planos**:
  - Exibição dos preços e features
  - Campos desabilitados (bloqueados para integridade)
  - Preços: Essencial R$29,90/ano, Premium R$49,90 vitalício
  - Features: 3 vs 5 fotos, player simples vs Spotify, sem/com chuva de corações

- **Aba Configurações**:
  - Status do Banco de Dados
  - Status da Integração Stripe
  - Status do Sistema de Notificações

- **Logout Seguro**:
  - Remove token do localStorage
  - Redireciona para `/admin`

---

## 🗄️ Banco de Dados

### Tabela: `users` (Pré-existente)
```sql
CREATE TABLE `users` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `openId` varchar(64) UNIQUE NOT NULL,
  `name` text,
  `email` varchar(320),
  `loginMethod` varchar(64),
  `role` enum('user', 'admin') DEFAULT 'user',
  `createdAt` timestamp DEFAULT NOW(),
  `updatedAt` timestamp DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp DEFAULT NOW()
);
```

### Tabela: `tribute_pages`
```sql
CREATE TABLE `tribute_pages` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `uniqueSlug` varchar(64) UNIQUE NOT NULL,
  `partner1Name` varchar(255) NOT NULL,
  `partner2Name` varchar(255) NOT NULL,
  `relationshipStartDate` timestamp NOT NULL,
  `photoUrls` text NOT NULL,  -- JSON stringificado
  `musicYoutubeUrl` varchar(500),
  `planType` enum('essential', 'premium') NOT NULL,
  `planExpiresAt` timestamp,  -- NULL para Premium (vitalício)
  `isActive` boolean DEFAULT true,
  `createdAt` timestamp DEFAULT NOW(),
  `updatedAt` timestamp DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

### Tabela: `payments`
```sql
CREATE TABLE `payments` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `tributePageId` int,
  `planType` enum('essential', 'premium') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'BRL',
  `stripePaymentIntentId` varchar(255),
  `stripeCustomerId` varchar(255),
  `status` enum('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  `createdAt` timestamp DEFAULT NOW(),
  `updatedAt` timestamp DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🔐 Autenticação

### Usuários Normais
- Autenticação via **Manus OAuth**
- Login automático ao acessar `/dashboard`
- Sessão mantida em cookie seguro
- Logout via tRPC mutation

### Admin
- Autenticação por **senha** (variável de ambiente `ADMIN_PASSWORD`)
- Geração de **JWT token** com expiração de 7 dias
- Token armazenado em `localStorage`
- Verificação de token em cada acesso a `/admin/dashboard`
- Logout remove token e redireciona para `/admin`

---

## 💳 Pagamentos (Stripe)

### Planos
- **Essencial**: R$ 29,90 (2990 centavos) - Assinatura anual
- **Premium**: R$ 49,90 (4990 centavos) - Pagamento único vitalício

### Fluxo de Checkout
1. Usuário clica em "Escolher Plano"
2. Redireciona para `/create` ou abre modal de checkout
3. tRPC mutation `payment.createCheckout` cria sessão Stripe
4. Usuário é redirecionado para Stripe Checkout
5. Após pagamento bem-sucedido, webhook notifica backend
6. Webhook atualiza status do pagamento em `payments` table
7. Notificação enviada ao proprietário

### Webhook Stripe
- Rota: `POST /api/stripe/webhook`
- Verifica assinatura com `stripe.webhooks.constructEvent()`
- Eventos tratados:
  - `checkout.session.completed` - Pagamento concluído
  - `payment_intent.succeeded` - Confirmação de pagamento
- Atualiza `payments.status` para `completed`
- Notifica proprietário via `notifyOwner()`

### Integração no Banco de Dados
- Armazena apenas: `stripePaymentIntentId`, `stripeCustomerId`, `status`
- Não armazena dados sensíveis (números de cartão, CVV)
- Webhook é fonte de verdade para status de pagamento

---

## 🔔 Notificações

### Sistema de Notificações
- Usa `notifyOwner()` helper do Manus
- Notificações enviadas em eventos importantes:

**Evento 1: Nova Página Criada**
- Título: "Nova página de homenagem criada!"
- Conteúdo: "{Nome1} & {Nome2} criaram uma página (Plano: {tipo})"

**Evento 2: Pagamento Iniciado**
- Título: "Novo pagamento iniciado!"
- Conteúdo: "Usuário {nome} iniciou pagamento do Plano {tipo}"

**Evento 3: Pagamento Concluído** (via webhook)
- Título: "Pagamento concluído!"
- Conteúdo: "Pagamento de {plano} foi processado com sucesso"

---

## 🎨 Design & Tema

### Cores Principais
- **Rose**: `rose-500`, `rose-600` - Ações e destaques
- **Pink**: `pink-50`, `pink-100` - Backgrounds suaves
- **Slate**: `slate-900`, `slate-700`, `slate-600` - Textos e bordas

### Tipografia
- **Font-sans**: Interface geral (Inter)
- **Font-serif**: Textos românticos (Cormorant Garamond)
- **Font-mono**: Números do contador

### Efeitos
- `backdrop-blur-md` - Vidro translúcido sobre fotos
- `rounded-[2.5rem]` - Bordas muito arredondadas (celular)
- `border-[8px]` - Borda grossa simulando carcaça
- Gradientes suaves: `from-rose-50 to-pink-50`

### Responsividade
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Mockup de celular adapta-se ao tamanho da tela
- Layout split-screen desktop, stack mobile

---

## 📁 Estrutura de Arquivos

```
love365/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Landing page
│   │   │   ├── CreatePage.tsx        # Criador de página
│   │   │   ├── EditPage.tsx          # Edição de página
│   │   │   ├── TributePage.tsx       # Página pública
│   │   │   ├── QRCodePage.tsx        # QR Code
│   │   │   ├── Dashboard.tsx         # Dashboard do usuário
│   │   │   ├── AdminLogin.tsx        # Login admin
│   │   │   ├── AdminDashboard.tsx    # Dashboard admin
│   │   │   └── NotFound.tsx          # 404
│   │   ├── components/
│   │   │   ├── FallingHearts.tsx     # Animação de corações
│   │   │   └── DashboardLayout.tsx   # Layout do dashboard
│   │   ├── App.tsx                   # Rotas principais
│   │   ├── index.css                 # Tema romântico
│   │   └── main.tsx                  # Entry point
│   ├── index.html
│   └── public/
├── server/
│   ├── routers.ts                    # tRPC procedures
│   ├── db.ts                         # Query helpers
│   ├── products.ts                   # Definição de planos
│   ├── _core/
│   │   ├── index.ts                  # Express setup
│   │   ├── adminAuth.ts              # JWT para admin
│   │   ├── adminRoutes.ts            # Rotas /api/admin
│   │   ├── stripeWebhook.ts          # Webhook Stripe
│   │   ├── notification.ts           # notifyOwner()
│   │   └── ...
│   └── storage.ts                    # S3 helpers
├── drizzle/
│   ├── schema.ts                     # Definição de tabelas
│   └── migrations/
│       └── 0001_*.sql                # SQL de criação
├── shared/
│   └── const.ts                      # Constantes
├── package.json
├── tsconfig.json
└── todo.md                           # Rastreamento de features
```

---

## 🚀 Fluxo de Uso

### Usuário Novo
1. Acessa landing page (`/`)
2. Clica em "Criar Minha Homenagem"
3. Faz login via Manus OAuth
4. Escolhe plano (Essencial ou Premium)
5. Preenche dados do casal, fotos e música
6. Preview em tempo real no mockup
7. Clica "Criar Página"
8. Redirecionado para página pública (`/p/:slug`)
9. Compartilha link ou QR Code com parceiro

### Usuário Retornando
1. Acessa `/dashboard`
2. Vê todas as suas páginas
3. Pode editar, visualizar ou deletar
4. Pode criar novas páginas

### Admin
1. Acessa `/admin`
2. Faz login com senha
3. Visualiza dashboard com estatísticas
4. Vê todas as páginas criadas
5. Monitora pagamentos e planos
6. Faz logout seguro

---

## ✅ Funcionalidades Implementadas

- ✅ Landing page completa com hero, mockup, pricing, FAQ, footer
- ✅ Autenticação Manus OAuth para usuários
- ✅ Autenticação por senha para admin com JWT
- ✅ Criador de página com split-screen e preview em tempo real
- ✅ Upload de fotos para S3
- ✅ Página pública com contador em tempo real
- ✅ Slideshow de fotos com transições suaves
- ✅ Player YouTube integrado
- ✅ Efeito chuva de corações (Premium)
- ✅ QR Code para compartilhamento
- ✅ Integração Stripe com checkout e webhook
- ✅ Controle de planos (3 vs 5 fotos, expiração)
- ✅ Notificações ao proprietário
- ✅ Painel admin com estatísticas
- ✅ Dashboard do usuário
- ✅ Edição de páginas
- ✅ Design responsivo mobile-first
- ✅ Tema romântico com cores suaves
- ✅ Testes vitest

---

## 🔧 Variáveis de Ambiente Necessárias

```env
# Banco de Dados
DATABASE_URL=mysql://user:password@host:port/database

# Autenticação
JWT_SECRET=seu-secret-aqui
ADMIN_PASSWORD=sua-senha-admin

# OAuth Manus
VITE_APP_ID=seu-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Stripe
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Notificações
VITE_ANALYTICS_ENDPOINT=...
VITE_ANALYTICS_WEBSITE_ID=...

# Outros
OWNER_NAME=Nome do Proprietário
OWNER_OPEN_ID=seu-open-id
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua-chave-api
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua-chave-frontend
```

---

## 📝 Notas Importantes

1. **Timezone**: Datas são armazenadas em UTC no banco. Formatação usa `.split('-').reverse().join('/')` para evitar bugs de timezone.

2. **Fotos**: Armazenadas em S3, não no banco de dados. Apenas URLs são salvas.

3. **Segurança Admin**: Senha do admin é comparada em texto puro (considerar hash em produção).

4. **Expiração de Plano**: Essencial expira em 1 ano. Premium é vitalício (planExpiresAt = null).

5. **Responsividade**: Design mobile-first. Mockup de celular tem dimensões fixas mas adapta-se ao viewport.

6. **Animações**: Framer Motion para transições suaves. Chuva de corações apenas em Premium.

7. **QR Code**: Aponta para URL pública da homenagem. Pode ser baixado como PNG.

8. **Notificações**: Enviadas via `notifyOwner()` helper. Requer configuração de notificações no Manus.

---

## 🎯 Próximos Passos Recomendados

1. **Adicionar sistema de reembolsos** - Integrar ações de reembolso Stripe no painel admin
2. **Implementar relatórios avançados** - Gráficos de receita, taxa de conversão, usuários ativos
3. **Adicionar suporte ao cliente** - Sistema de tickets/mensagens
4. **Implementar autenticação social** - Google, Facebook para aumentar conversão
5. **Adicionar analytics** - Rastrear páginas mais visualizadas
6. **Criar galeria pública** - Mostrar exemplos de páginas (com permissão)
7. **Implementar hash de senha para admin** - Melhorar segurança
8. **Adicionar temas personalizáveis** - Deixar usuários escolher cores/estilos

---

**Desenvolvido com ❤️ usando React, Node.js, Stripe e Manus**
