---
name: golev-carrossel
description: Cria roteiros de post carrossel para Instagram da Go Lev (saúde & emagrecimento), slide a slide, com copy no tom da marca, legenda, hashtags e CTA. Use quando o usuário pedir um carrossel, post de carrossel, post para Instagram, conteúdo para o feed da Go Lev, ou variações de um carrossel existente.
---

# Skill: Carrossel Instagram — Go Lev

Gera o roteiro completo de um post carrossel no tom e na identidade da Go Lev.

## Passo 0 — SEMPRE carregar a marca primeiro

Antes de escrever qualquer coisa, leia (se ainda não leu nesta conversa):

1. `brand/foundation/00-essencia.md` — o que a marca é e não é
2. `brand/foundation/01-tom-de-voz.md` — como falar (do/don't, vocabulário)
3. `brand/foundation/06-publico.md` — para quem (persona "Ana")
4. `brand/foundation/02-cores.md` — HEX da **paleta oficial: Azul & Creme** (`azul`)

Nunca produza copy que viole as linhas vermelhas da essência ou o tom de voz.

## Passo 1 — Coletar/inferir o briefing

Pergunte (ou infira do pedido) e confirme em 1 linha:

- **Tema/assunto** do carrossel
- **Objetivo:** educar · acolher · engajar · converter (leve)
- **Formato:** dica/educativo · mito vs. verdade · história/depoimento · bastidor/método · lista
- **CTA desejado** (ex.: salvar, comentar, perfil/bio)
- **Nº de slides** (padrão: 6–8)

Se o usuário não especificar, escolha defaults sensatos e siga — não trave o trabalho.

## Passo 2 — Regras de conteúdo (Go Lev)

- **Slide 1 = gancho.** Uma manchete forte, curta, que para o scroll. Sem clickbait que promete milagre.
- **Caminhar junto:** "a gente", "com você", "no seu ritmo". Nunca cobrar, culpar ou pressionar.
- **Sem promessa de número** ("perca X kg"). Sem "antes e depois". Sem urgência fabricada.
- **Educação sem jargão:** se usar termo técnico, explique em linguagem simples.
- **Reconhecer o processo**, não só o resultado.
- **Uma palavra de ênfase** pode ir em *itálico* (vira Newsreader no design): ex. *eleva*, *junto*, *leveza*.
- **Calor com contenção:** no máximo 1 emoji discreto por slide (ou nenhum). Ícone de linha > emoji.
- **Último slide = CTA gentil** + reforço de acolhimento.

## Passo 3 — Formato de saída

Entregue exatamente nesta estrutura:

```
# Carrossel: [título interno]
Objetivo: [...] · Formato: [...] · Slides: [N]

## Slides
### Slide 1 — Capa / Gancho
Título: [manchete curta]
Apoio: [subtítulo opcional, 1 linha]
Nota visual: [o que aparece — foto/ícone, conforme brand/foundation/05-imagem.md]

### Slide 2 — [papel do slide]
Título: [...]
Corpo: [1–3 linhas curtas]
Nota visual: [...]

... (repetir até o slide N)

### Slide N — CTA
Título: [chamada gentil]
Corpo: [reforço de acolhimento]
CTA: [ação clara — salvar / comentar / link na bio]

## Legenda do post
[2–5 linhas no tom da marca, abrindo com gancho e fechando com CTA + pergunta de engajamento]

## Hashtags
[8–15 hashtags relevantes de saúde/emagrecimento/acolhimento — sem spam, sem #fitnessextremo]

## Sugestão de áudio/trend (opcional)
[se fizer sentido]
```

## Passo 4 — SEMPRE salvar e renderizar (não entregar só no chat)

Não basta mostrar o texto na conversa. Toda execução cria uma pasta dedicada:

```
brand/content/carrosseis/AAAA-MM-[slug-do-tema]/
├── roteiro.md      ← roteiro completo (slides + legenda + hashtags)
├── carrossel.html  ← os slides em HTML, formato NATIVO 1080×1350
└── png/            ← (gerado só no Passo 7, após validação)
    └── slide-01.png ... slide-NN.png
```

- Use a data do briefing/sistema para `AAAA-MM` e um slug curto do tema.
- **Template:** copie um carrossel existente em `brand/content/carrosseis/` como base — não reinvente o CSS.
- **Formato nativo 1080×1350 (regra crítica):** cada `.slide` é construído em tamanho real (1080×1350) e apenas *reduzido no preview* via `transform:scale(var(--SCALE))`. Isso garante WYSIWYG: o PNG sai idêntico ao que foi validado. Fontes em `px` (dimensionadas para o canvas de 1080), não `rem`.
- **Cores/fontes/wordmark vêm da fonte única.** No `<head>` linke (caminho relativo, p/ funcionar em file:// e http):
  `<link rel="stylesheet" href="../../../../packages/shared/brand/tokens.css">` e `.../fonts.css`. NÃO declare `:root{}` de cor nem `body[data-pal]` — use `var(--forest)`, `var(--coral)`, `var(--font)` etc. (aliases já existem em tokens.css). Sem seletor de paletas.
- Pena: `<symbol>` inline com paths == `packages/shared/brand/mark.svg` (base `var(--coral)`, lâmina `currentColor`). Wordmark: classes `.gl-wordmark`/`.gl-wm-go`/`.gl-wm-lev` (e `.gl-wordmark--on-dark` em slide escuro).
- **Abra o HTML** (`open <caminho>`) e informe os caminhos ao usuário.

## Passo 5 — Checagem de voz (antes de mostrar)

Rode o teste de voz de `01-tom-de-voz.md`:

- [ ] Eleva ou cobra? (não pode cobrar)
- [ ] Alguma promessa que não dá pra cumprir? (remover)
- [ ] Soa como pressão/culpa? (reescrever)
- [ ] A pessoa se sentiria acolhida, não julgada?
- [ ] Tem jargão sem explicação?
- [ ] Máx. 1 palavra em *itálico* por slide? Emoji contido?

## Passo 6 — GATE de validação do design (PARE aqui)

**Não exporte PNG automaticamente.** Apresente o HTML e **espere o usuário validar** o design (texto, ordem, paleta). Pergunte explicitamente: *"Pode validar o design? Quer ajustar algo antes de eu gerar os PNGs?"*

- Se pedir ajustes → edite o `carrossel.html`, reabra, volte a este gate.
- Só avance para o Passo 7 quando o usuário **aprovar** ("pode gerar", "ok", "tá bom").

## Passo 7 — Export PNG em alta qualidade (só após aprovação)

Rode o script reutilizável:

```bash
node brand/content/_tools/shoot-carrossel.mjs <pasta>/carrossel.html [--pal e1] [--scale 2]
```

- Gera `png/slide-01.png … slide-NN.png` na própria pasta do post.
- Default: `--scale 2` → 2160×2700 (alta qualidade). Use `--scale 1` para exatos 1080×1350.
- `--pal` aplica a paleta no export (default = a do HTML, que é `azul`). Normalmente não precisa passar.
- **Pré-requisito:** Chromium do Playwright. Se faltar: `npx playwright install chromium`.
- Ao terminar, confirme a quantidade de PNGs e o caminho. Confira 1–2 slides (capa, CTA e algum com diagrama) lendo o PNG, pra garantir que não cortou texto.

## Notas sobre cor/visual

**Paleta oficial: Azul & Creme** (decidida — ver `02-cores.md`). Use os HEX de lá:

- Primária `#3F6076` / escura `#1F3B4C` / hover `#4E7188`
- Acento (pêssego) `#E59A72` / forte `#BC6B43` · texto sobre acento `#3A1E10`
- Fundo creme `#F4EFE8` · superfície `#FBF7F1` · texto `#232826`

Regras:

- Acento entra **pontualmente** (calor com contenção) — nunca cobre tudo.
- Use os tokens via `<link>` ao `packages/shared/brand/tokens.css`; não cole HEX solto, deixe o CSS resolver.
- Siga `05-imagem.md` para foto/ícone (luz natural, pessoas reais, monoline, nunca emoji em arte).
