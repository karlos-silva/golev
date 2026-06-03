# Cores — Go Lev

> ✅ **PALETA DECIDIDA: Azul & Creme** (Candidata C).
>
> Os valores canônicos vivem em **`packages/shared/brand/tokens.css`** — a fonte única que app e artefatos de marca consomem. Este documento é a narrativa/racional; se algum HEX divergir, **o `tokens.css` vence**. As demais candidatas ficam abaixo como registro histórico.

## 🎯 PALETA ATIVA — Azul & Creme

> Espelho de `packages/shared/brand/tokens.css`. Para mudar uma cor, edite **lá** (um lugar só) — landing, app, brandbook e carrossel re-coloram juntos.

```
primary #3F6076   primary-strong #1F3B4C   primary-soft #4E7188
support #A6BEC7   support-tint #ECF1F2
accent  #E59A72   accent-strong  #BC6B43   accent-tint #F7E7DB   on-accent #3A1E10
ink #1E2426   ink-2 #525A5C   ink-3 #8A9295
paper #F8F8F5   surface #FFFFFF   line #E7E4DD
```

**Identidade:** denim suave (primária) + creme claro (fundo) + pêssego (acento). Confiança clínica sem o verde-fitness saturado nem o azul-corporativo frio.

**Quem consome a fonte única:**
- App web (e fronts futuros): `@import "@golev/shared/brand/tokens.css"` — bundlado no build.
- Brandbook e conteúdo: `brand/preview/`, `brand/content/` via `<link>` relativo ao mesmo `tokens.css`.
- Nomes legados (`--forest`, `--coral`, `--paper`…) existem como **aliases** em `tokens.css`.

> ✅ Divergência de neutros **resolvida**: tudo usa `paper #F8F8F5 / surface #FFFFFF`. Para deixar mais "creme", basta trocar esses 2 HEX em `tokens.css`.

## Filosofia de cor (vale para qualquer paleta)

Canvas claro e quente, texto espresso. A estrutura é sempre a mesma — só os valores mudam:

- **Primária** ancora a confiança (cor principal da marca, fundos escuros, ações).
- **Acento** entra **pontualmente** para dar calor — nunca cobrindo tudo. É o único "respingo" quente.
- **Apoio (sage)** aparece só em tintas leves, discreto.
- **Neutros quentes** carregam o texto e as superfícies.

Regra de ouro: **acento com contenção**. Se a peça está "colorida demais", está errada.

## Estrutura de tokens (semântica, igual em todas as paletas)

| Token | Papel |
|---|---|
| `forest-900` | Primária escura — fundos escuros, ênfase |
| `forest` | Primária — cor principal da marca |
| `forest-600` | Primária 600 — ações / hover |
| `sage` | Apoio discreto |
| `sage-tint` | Tinta de apoio leve |
| `coral` | Acento — detalhe quente, pontual |
| `coral-700` | Acento forte — acento sobre claro (texto) |
| `coral-tint` | Fundo de acento sutil |
| `on-accent` | Texto sobre acento |
| `ink` | Texto principal |
| `ink-2` | Texto secundário |
| `ink-3` | Texto terciário / legendas |
| `paper` | Fundo principal |
| `surface` | Superfície / cards |
| `line` / `line-2` | Linhas / divisores (hairlines, não sombras) |

## Candidatas

### Candidata A — D5 Calmo (rosé + champanhe) · *padrão atual no brand book*

```
forest-900 #5E2F38   forest #8C4A56   forest-600 #7A3F4A
sage #CFA6A6         sage-tint #F3E7E6
coral #D6A871        coral-700 #A9763F   coral-tint #F6EAD8   on-accent #3A2A12
ink #2E211E   ink-2 #6A5650   ink-3 #9C857E
paper #F6EDE7   surface #FBF4EF   line #ECDCD4   line-2 #F3E8E2
```

### Candidata B — Rosé & Salvia (rosé + verde de apoio)

```
forest-900 #5F343B   forest #9E5F68   forest-600 #8A4F58
sage #CDB1B5         sage-tint #F0E6E7
coral #6E947E        coral-700 #4E7261   coral-tint #E7EEE9   on-accent #11241B
ink #2A2220   ink-2 #6A5A57   ink-3 #9C8A86
paper #F6EFEC   surface #FBF5F3   line #EBDBDC   line-2 #F2E6E6
```

### Candidata C — Azul & Creme (denim suave + creme quente + pêssego) ✅ ESCOLHIDA

```
forest-900 #1F3B4C   forest #3F6076   forest-600 #4E7188
sage #AAC0C8         sage-tint #EAF0F1
coral #E59A72        coral-700 #BC6B43   coral-tint #F8E7DA   on-accent #3A1E10
ink #232826   ink-2 #555C58   ink-3 #8C918C
paper #F4EFE8   surface #FBF7F1   line #E6DDCF   line-2 #EFE8DC
```

### Candidata D — Musgo & Mel (neutro/unissex, quente e aconchegante)

```
forest-900 #2A3026   forest #455239   forest-600 #586A49
sage #AEB59C         sage-tint #EDEEE4
coral #CBA46E        coral-700 #9E7A40   coral-tint #F2E8D6   on-accent #352910
ink #23241D   ink-2 #56584C   ink-3 #8E9082
paper #F1ECE2   surface #FAF6EC   line #E5DDCC   line-2 #EFE9DB
```

## Consistência com o código

✅ **Unificado.** App, brandbook e carrossel consomem o mesmo `packages/shared/brand/tokens.css` — não há mais divergência entre "código" e "marca". O `globals.css` só importa o pacote e mapeia para os tokens do Tailwind (`@theme inline`).

> Quer o fundo mais "creme" (mais quente)? Troque `--gl-paper`/`--gl-surface` em `tokens.css` — muda em tudo de uma vez.
> Visualizar ao vivo: `brand/preview/brandbook.html`.

Veja também: [tipografia](03-tipografia.md) · [logo](04-logo.md)
