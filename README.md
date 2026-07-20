# Fino Acabamento — landing

Boutique de revestimentos em Boa Viagem, Recife. Site estático, sem build.

## Stack

HTML estático puro. Sem npm, sem framework, sem etapa de build. Deploy direto na Vercel.

- `index.html` — página inteira, com o CSS inline no `<head>`
- `assets/js/main.js` — motion, filtros, FAQ e integrações de WhatsApp
- `assets/js/vendor/` — GSAP, ScrollTrigger e Lenis, servidos localmente
- `assets/fonts/` — Archivo e Inter em woff2, `font-display: optional`
- `assets/img/` — 71 referências de catálogo e 8 logos de marca; `assets/bg-arq-*.webp` — fundo fixo da seção de arquitetos
- `COPY-FONTE-DA-VERDADE.md` — copy aprovada e pendências com a cliente

O CSS está inline dentro do `index.html` de propósito: eliminou 540 ms de bloqueio
de renderização e levou o Lighthouse mobile de 87 para 100. Para editar estilo,
mexa no bloco `<style>` do próprio `index.html`.

## Rodar local

```
npx http-server . -p 4837 -c-1
```

## Performance

Lighthouse mobile, throttle real de dispositivo (`--throttling-method=devtools`):

| | Perf | A11y | Práticas | SEO |
|---|---|---|---|---|
| Mobile | 100 | 100 | 100 | 100 |
| Desktop | 93 | 100 | 100 | 100 |

O desktop mede local sem compressão. Em produção a Vercel serve com Brotli, o que
reduz o HTML de 91 KB para algo em torno de 15 KB.

Regras que sustentam o número, não quebre sem medir de novo:
- `font-display: optional` em todos os `@font-face`, que é o que segura o CLS em 0
- `width` e `height` explícitos em toda imagem, ou `aspect-ratio` no CSS
- `loading="lazy"` em tudo abaixo da dobra, nunca no hero
- preload da imagem do hero com `imagesrcset` e das duas fontes críticas
- watchdog de 3 s no `<head>`: se o JS não sinalizar, a classe `.js` cai e todo o
  conteúdo escondido por animação aparece

## Conversão

Não existe backend. Todo caminho termina no WhatsApp `(81) 98361-8877`, com
mensagem pré-montada:

- formulário do hero envia nome, cidade, ambiente e metragem
- cada card da galeria envia o nome da peça e a marca
- botões de seção enviam mensagens de contexto próprio

## Assets

As imagens vieram do site anterior, hospedadas no storage de terceiro
(`storage.lucasmendes.dev`). Foram baixadas, convertidas para WebP e passaram a ser
servidas pelo próprio repositório, então o site não depende mais daquela infra.

Os originais em JPG e os 8 catálogos em PDF ficam em `assets/raw/`, fora do git
(somam 369 MB). Os catálogos não entraram no site: o maior tem 65 MB e o objetivo
da página é capturar o lead, então o pedido de catálogo virou conversa no WhatsApp.

## Pendências

Ver a seção final de `COPY-FONTE-DA-VERDADE.md`. A mais importante: o site publica
o WhatsApp `(81) 98361-8877` e o briefing trouxe `81992998284`. Confirmar qual
número recebe os leads antes de divulgar.
