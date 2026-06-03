# Logo — Go Lev

## O símbolo: a pena

A marca da Go Lev é uma **pena** — desenhada à mão, orgânica, leve. A lâmina sobe na cor primária (denim); a **base recebe o acento pêssego**, o respingo de calor da marca.

> Arquivos: símbolo original em [assets/pena.svg](assets/pena.svg) · variações de cor em [/brand/content/logo/pena-variacoes.html](../content/logo/pena-variacoes.html)

## Por que uma pena

A pena é o símbolo mais fiel ao que a Go Lev é. Em camadas:

1. **Leveza = "Lev".** "Go Lev" carrega a ideia de leve/leveza. A pena é, literalmente, a coisa mais leve que existe — o significado e o nome se encontram no símbolo.
2. **Emagrecer é ficar mais leve.** No setor de emagrecimento, a promessa emocional não é um número na balança: é a sensação de leveza, alívio, tirar um peso. A pena diz isso sem mostrar corpo, balança ou "antes e depois".
3. **Sobe sem cobrar.** A pena flutua e se eleva — ascensão e progresso —, mas com gentileza. É o oposto da seta agressiva ou do "fitness extremo". Combina com "acompanhamos, não cobramos".
4. **Humana, não clínica.** O traço orgânico e manual traz proximidade e calor — o equilíbrio entre seriedade de consultório e o acolhimento de quem cuida de verdade.
5. **Calor no detalhe.** A sobriedade vive na lâmina (denim); o calor vive na base (pêssego). Um símbolo sóbrio com um único respingo quente — a assinatura visual da marca.

## Anatomia (duas partes recoloríveis)

| Parte | Papel | Cor oficial |
|---|---|---|
| **Lâmina** (forma maior) | corpo da pena — sobriedade, confiança | Primária `#3F6076` |
| **Base** (forma menor) | detalhe na parte inferior — o respingo de calor | Acento pêssego `#E59A72` |

> Esta é a variação oficial: **"Acento na base"**. O shape nunca muda; só as cores, conforme o fundo.

## Lockup

- **Wordmark:** "Go Lev" em Hanken Grotesque 700, tracking apertado (-0.03em).
- **Símbolo + wordmark:** pena à esquerda, "Go Lev" à direita, alinhados ao centro vertical, gap ~10–12px.
- A pena funciona **sozinha** (ícone/avatar/favicon) ou **com texto**.
- Proporção do símbolo: **329 × 367** (mais alto que largo). Nunca distorcer para caber em caixa quadrada — preserve o aspect ratio.

## Regras de uso (não pode)

- ❌ Não alterar o shape (os paths originais).
- ❌ Não distorcer / esticar para encaixar (mantenha 329×367).
- ❌ Não inclinar, rotacionar ou espelhar.
- ❌ Não aplicar sombra, glow ou contorno.
- ❌ Não trocar a base para uma cor fora do acento (o calor da base é parte da identidade).
- ❌ Não usar as cores antigas (arco verde / ponto) — aquela marca foi aposentada.

## Aplicação por fundo

| Fundo | Lâmina | Base |
|---|---|---|
| Claro (creme/branco) | Primária `#3F6076` | Pêssego `#E59A72` |
| Escuro (denim `#1F3B4C`) | Creme `#F4EFE8` | Pêssego `#E59A72` |
| Tamanho mínimo / favicon | Monocromática escura `#1F3B4C` | (mesma) |

> Em tamanhos muito pequenos (≤16px), prefira a versão **monocromática** — duas cores próximas tendem a sumir.

## No código

- **Mestre dos paths:** `packages/shared/brand/mark.svg` (contrato: base = `var(--gl-accent)`, lâmina = `currentColor`). Quem renderiza mantém os 2 paths idênticos a esse mestre.
- Componente React: `apps/web/src/components/app/logo.tsx` (`<Logo />`) — usado no header, sidebar, avaliação e auth. Recolore pelos tokens; wordmark via classes `.gl-wordmark`.
- Brandbook/carrossel: `<symbol id="golev-mark">` / `#m` inline (paths == mestre).
- (Não há mais `logo.svg` estático — o auth usa `<Logo />`.)

## Respiro mínimo

Área de proteção = **metade da altura da pena** em todos os lados.

Veja também: [cores](02-cores.md) · [tipografia](03-tipografia.md) · [imagem](05-imagem.md)
