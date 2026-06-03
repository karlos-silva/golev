# Go Lev — Oráculo da Marca

> Fonte única da verdade para **marca, conteúdo e marketing** da Go Lev.
> Esta pasta é separada do `.ai/` (engenharia/código). Aqui mora a *voz* da empresa.

A Go Lev é uma plataforma de saúde & emagrecimento. A promessa central:

> **Cuidado que eleva quem decide mudar. Acompanhamos. Não cobramos.**

## Como usar este oráculo

Antes de criar **qualquer** peça (post, campanha, LP, e-mail, anúncio), leia a **foundation**. Toda skill de conteúdo referencia estes arquivos automaticamente.

### 📚 Foundation (a base — leia primeiro)

| Arquivo | O que tem |
|---|---|
| [foundation/00-essencia.md](foundation/00-essencia.md) | Propósito, promessa, posicionamento, linhas vermelhas |
| [foundation/01-tom-de-voz.md](foundation/01-tom-de-voz.md) | Como falamos — do/don't, vocabulário, teste de voz |
| [foundation/02-cores.md](foundation/02-cores.md) | Paletas (⚠️ **decisão pendente** — fonte da verdade) |
| [foundation/03-tipografia.md](foundation/03-tipografia.md) | Hanken Grotesque + Newsreader |
| [foundation/04-logo.md](foundation/04-logo.md) | A marca-pena (leveza/"Lev") + regras de uso |
| [foundation/05-imagem.md](foundation/05-imagem.md) | Direção fotográfica e de ícones |
| [foundation/06-publico.md](foundation/06-publico.md) | Persona / público (⚠️ rascunho a validar) |

### 🛠️ Skills de conteúdo (invocáveis no Claude Code)

Skills vivem em `.claude/skills/`. Cada uma lê a foundation antes de produzir.

| Skill | Para quê |
|---|---|
| `golev-carrossel` | Roteiro + copy de post carrossel para Instagram |

> Próximas (a criar conforme a necessidade): campanha de marketing, landing page, calendário editorial, e-mail, anúncio.

## Pendências da marca (status)

- ✅ **Marca:** decidida — a **pena** ("Acento na base": lâmina `#3F6076`, base `#E59A72`). Aplicada na landing, no app, brandbook e carrossel. Variações em [content/logo/pena-variacoes.html](content/logo/pena-variacoes.html). O arco-com-ponto foi aposentado.
- ✅ **Paleta de cor:** decidida — **Azul & Creme** ([02-cores.md](foundation/02-cores.md)). Brandbook, skill e templates já aplicados.
- ⚠️ **Neutros no app:** `globals.css` usa neutros mais frios que o creme do brandbook. Alinhar (ver [02-cores.md](foundation/02-cores.md), seção "Consistência com o código").
- ⚠️ **Persona:** rascunho inferido, falta validar com dados ([06-publico.md](foundation/06-publico.md)).

## Estrutura

```
packages/shared/brand/     ← 🎯 FONTE ÚNICA do design (consumida no build por qualquer front)
├── tokens.css             ← cores + raios + fontes(vars) + classes .gl-wordmark  → MUDE A COR AQUI
├── fonts.css              ← @import Google Fonts (só p/ HTMLs / fronts sem next/font)
└── mark.svg               ← pena mestre (paths canônicos)

brand/                      ← a "oráculo" (docs + preview + conteúdo) — CONSOME o pacote acima
├── README.md              ← você está aqui (índice/oráculo)
├── foundation/            ← base canônica da marca (texto)
│   ├── 00-essencia.md … 06-publico.md
├── preview/
│   └── brandbook.html     ← brand book visual (consome tokens.css)
└── content/               ← peças produzidas
    ├── _tools/shoot-carrossel.mjs   ← export HTML → PNG (Playwright)
    ├── logo/{pena,wordmark}-variacoes.html
    └── carrosseis/AAAA-MM-[tema]/{roteiro.md, carrossel.html, png/}

.claude/skills/
└── golev-carrossel/       ← skill invocável
```

### Fluxo de um carrossel

1. Skill gera `roteiro.md` + `carrossel.html` (slides nativos 1080×1350) e abre no navegador.
2. **Você valida o design** (texto, ordem, paleta). Ajustes → edita o HTML.
3. Após aprovar → `node brand/content/_tools/shoot-carrossel.mjs <pasta>/carrossel.html` exporta os PNGs prontos pro Instagram.

## Relação com o resto do repo

- **🎯 Fonte única do design:** `packages/shared/brand/` (`@golev/shared/brand`). Mudou cor/fonte/wordmark? Edite **lá** — landing, app, brandbook e carrossel re-coloram juntos. Qualquer front futuro importa no build (`@import "@golev/shared/brand/tokens.css"`).
- **Brand book visual:** `brand/preview/brandbook.html`.
- **App:** `apps/web/src/app/globals.css` só importa o pacote + mapeia p/ Tailwind (`@theme inline`). Logo: `apps/web/src/components/app/logo.tsx`.
- **Regras de engenharia:** `.ai/` (não confundir — aquilo é sobre código).

## Princípio que rege tudo

Toda peça passa por 4 perguntas:

1. **Eleva ou cobra?**
2. **Caminha junto ou aponta o dedo?**
3. **Honesto ou promete milagre?**
4. **Calor com contenção?**

Se falhar em qualquer uma, reescreva.
