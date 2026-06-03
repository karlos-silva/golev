# Tipografia — Go Lev

## As duas fontes

| Fonte | Papel | Onde usar |
|---|---|---|
| **Hanken Grotesque** | Fonte principal — faz tudo | Títulos, corpo, UI, legendas |
| **Newsreader** | Acento editorial + wordmark | Palavra de ênfase (itálica) · wordmark "go lev" (bold, minúsculo) |

> **Hanken Grotesque** faz o trabalho pesado: títulos em pesos altos com tracking apertado dão autoridade; o corpo respira em regular. **Newsreader** é o toque editorial: entra *itálica* em uma palavra de ênfase por vez (ex.: "eleva") e também compõe o **wordmark**. Nunca em blocos de texto.

## Wordmark "go lev"

O nome ao lado da pena mistura as duas fontes, todo minúsculo e itálico:

- **"go"** — Hanken Grotesque **bold itálico** (cor: tinta `--gl-ink`).
- **"lev"** — Newsreader **médio itálico** (cor: acento `--gl-accent-strong`; sobre escuro, `--gl-accent`).

O contraste sans→serif faz o "lev" saltar e o itálico dá movimento — conversa com a leveza da pena.

- Sempre minúsculo: `go lev` (no código o texto pode ser "Go Lev" com `text-transform:lowercase`, preservando acessibilidade/SEO).
- **Fonte única:** as classes `.gl-wordmark / .gl-wm-go / .gl-wm-lev` vivem em `packages/shared/brand/tokens.css`. App (`logo.tsx`), brandbook e carrossel usam as **mesmas** classes. Sobre fundo escuro, adicione `.gl-wordmark--on-dark`.
- Para ênfase em **conteúdo** (não o wordmark), continua valendo só a Newsreader itálica, uma palavra por vez.

## Pesos disponíveis (Hanken Grotesque)

`300 Light` · `400 Regular` · `500 Medium` · `600 SemiBold` · `700 Bold` · `800 ExtraBold`

## Escala tipográfica

| Nível | Peso | Tracking | Uso |
|---|---|---|---|
| **Display** | 800 ExtraBold | apertado (-0.04em) | Hero, manchete principal |
| **H2** | 700 Bold | -0.03em | Títulos de seção |
| **H3** | 600 SemiBold | -0.02em | Subtítulos |
| **Corpo** | 400 Regular | normal | Texto base, leitura longa |
| **Apoio** | 400 Regular | normal | Legendas, observações |
| **Acento** | Newsreader *itálica* 500 | -0.005em | Palavra de ênfase única |

## Regras de uso

- **Títulos grandes = peso alto + tracking apertado.** É isso que dá a autoridade sóbria da marca.
- **Corpo sempre em 400.** Respiro entre linhas (~1.55 de altura de linha).
- **Newsreader itálica = no máximo uma palavra por peça.** Em conteúdo escrito, marque com *itálico*. Em design, vira a serifa. Exemplos: *eleva*, *leveza*, *junto*.
- **Nunca** usar Newsreader em parágrafos, botões ou listas.
- Em conteúdo para redes (carrossel, stories), respeite a hierarquia: uma manchete forte por slide, corpo curto.

## Fallbacks

- Hanken Grotesque → `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Newsreader → `Georgia, 'Times New Roman', serif`

Veja também: [cores](02-cores.md) · [tom de voz](01-tom-de-voz.md)
