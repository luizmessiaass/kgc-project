# KGC PROJECT

## What This Is

KGC é um e-commerce de moda streetwear brasileiro. O site exibe catálogo de produtos, páginas de detalhe, lookbook, colabs, contato e checkout via WhatsApp. A migração transforma o site de HTML/CSS/JS estático para Next.js + TypeScript com Supabase como backend, painel admin próprio e design responsivo preservando a identidade visual atual.

## Core Value

Clientes navegam pelo catálogo, adicionam produtos ao carrinho e fecham pedido via WhatsApp — esse fluxo deve funcionar perfeitamente em mobile com design consistente com a marca.

## Requirements

### Validated

- ✓ Catálogo de produtos na loja (`/loja`) — existente
- ✓ Página de detalhe de produto (`/product`) — existente
- ✓ Carrinho de compras com localStorage — existente
- ✓ Checkout via WhatsApp com resumo do pedido — existente
- ✓ Lookbook / página de mídia (`/media`) — existente
- ✓ Página de colabs (`/colab`) — existente
- ✓ Página de contato (`/contato`) — existente
- ✓ Página sobre (`/sobre`) — existente
- ✓ Página de projetos (`/projetos`) — existente
- ✓ Integração BrasilAPI para busca de CEP no checkout — existente

### Active

- [ ] Migração completa para Next.js 14+ (App Router) + TypeScript
- [ ] Schema de produtos no Supabase (PostgreSQL) substituindo products.json
- [ ] Painel admin protegido por email/senha via Supabase Auth
- [ ] CRUD de produtos no painel admin (criar, editar, remover, reordenar)
- [ ] Upload de imagens de produtos para Supabase Storage
- [ ] Design responsivo mobile-first preservando identidade visual KGC
- [ ] Navegação melhorada entre páginas (transições, breadcrumb, active states)
- [ ] Tipagem TypeScript completa para todos os modelos de dados
- [ ] Deploy automático no Vercel com variáveis de ambiente Supabase
- [ ] Formulário de contato funcional (envia dados realmente — hoje só faz alert())
- [ ] Carrinho persistido no Supabase ou localStorage com sync

### Out of Scope

- Gateway de pagamento (PIX, cartão, boleto) — WhatsApp checkout permanece como solução de vendas
- Novas páginas — apenas melhorar as existentes
- Múltiplos usuários admin com níveis de acesso — admin único com login simples
- App mobile nativo — site responsivo resolve
- Sistema de reviews/avaliações — complexidade não justificada agora

## Context

**Codebase atual (brownfield):**
- 9 páginas HTML independentes sem framework
- CSS com duplicação de blocos (hotfixes V2/V3 acumulados no style.css)
- script.js.bak contém painel admin completo mas não está carregado em produção
- Função `updateExploreProgress` copiada em 8 arquivos — vira layout component
- State management exclusivamente em localStorage (cart, products override, explore progress)
- Checkout gera link WhatsApp para número hardcoded `5511945352659`
- Formulário de contato não envia dados (apenas alert + reset)
- Case mismatch em imagens do lookbook quebra em Linux (IMG_ vs img_)
- placeholder.png referenciado no código mas não existe em disco

**Identidade visual:**
- Fontes: Oswald (corpo) + Press Start 2P (display/destaque) via Google Fonts
- Ícones: Font Awesome 6.4.0
- Estilo streetwear urbano — tipografia marcante, paleta escura/contrastante
- Manter exatamente o mesmo look and feel, apenas melhorar consistência e responsividade

**Infraestrutura alvo:**
- Framework: Next.js 14+ (App Router)
- Linguagem: TypeScript (strict mode)
- Banco: Supabase (PostgreSQL + Auth + Storage)
- Deploy: Vercel (integração automática com GitHub)

## Constraints

- **Checkout**: WhatsApp redirect permanece — nenhuma integração de pagamento
- **Visual**: Identidade KGC preservada — mesmas fontes, cores e estética
- **Deploy**: Vercel — tudo que funciona no Next.js/Vercel é válido
- **Auth**: Supabase Auth para admin — não reinventar autenticação
- **Compatibilidade**: Migração 1:1 das URLs existentes (evitar 404 para links já compartilhados)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router (não Pages Router) | Padrão atual do Next.js, melhor suporte a Server Components e layouts | — Pending |
| Supabase como backend | Auth + PostgreSQL + Storage em uma plataforma, tier gratuito generoso, SDK TypeScript nativo | — Pending |
| Vercel como deploy | Integração nativa com Next.js, preview deploys automáticos por PR | — Pending |
| Manter WhatsApp checkout | Fluxo que já funciona para o negócio — gateway de pagamento é complexidade futura | — Pending |
| Carrinho migrado de localStorage para Supabase | Permite persistência cross-device e integração com admin | — Pending |

## Evolution

Este documento evolui a cada transição de fase e milestone.

**Após cada fase** (via `/gsd-transition`):
1. Requirements invalidados? → Mover para Out of Scope com motivo
2. Requirements validados? → Mover para Validated com referência de fase
3. Novos requirements emergiram? → Adicionar em Active
4. Decisões a registrar? → Adicionar em Key Decisions
5. "What This Is" ainda preciso? → Atualizar se divergiu

**Após cada milestone** (via `/gsd-complete-milestone`):
1. Revisão completa de todas as seções
2. Core Value check — ainda a prioridade correta?
3. Audit Out of Scope — razões ainda válidas?
4. Atualizar Context com estado atual

---
*Last updated: 2026-05-07 após inicialização do projeto*
