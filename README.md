# Fino Acabamento — landing de campanha de porcelanato

Boutique de revestimentos em Boa Viagem, Recife. Site estático, sem build, sem backend.

**v2 (21/07/2026):** a página deixou de ser institucional de revestimentos e virou landing
de campanha exclusiva de porcelanato, conforme o briefing da Fish. Referência de estrutura:
abcdaconstrucaoserra.com.br. Fundo branco, blocos objetivos, marcas no início, vitrine de
produto e CTA verde recorrente. Toda a copy e as decisões estão em `COPY-FONTE-DA-VERDADE.md`.

## Stack

- `index.html` — página inteira, com o CSS inline no `<head>`
- `assets/js/main.js` — motion, vitrine com filtros, formulário e integrações de WhatsApp
- `assets/js/produtos.js` — **gerado**, não edite à mão
- `assets/fonts/` — Archivo e Inter em woff2, `font-display: optional`
- `porcelanatos.json` — catálogo da vitrine (fonte da verdade)
- `scripts/build-vitrine.mjs` — valida o catálogo e gera `produtos.js`

O CSS está inline dentro do `index.html` de propósito: eliminou 540 ms de bloqueio de
renderização e levou o Lighthouse mobile de 87 para 100. Para editar estilo, mexa no bloco
`<style>` do próprio `index.html`.

## Rodar local

```
npx http-server . -p 4837 -c-1
```

## Atualizar a vitrine de porcelanatos

1. Edite `porcelanatos.json`. Cada item precisa de `nome`, `marca`, `formato`, `acabamento`,
   `estilos` e `file`.
2. Coloque a imagem em `assets/porc/`, WebP quadrado 800x800.
3. Rode `node scripts/build-vitrine.mjs`.

O script recusa gerar se faltar imagem, se sobrar imagem órfã, se houver produto duplicado
ou se alguma tag de estilo estiver fora do conjunto fechado:

```
marmorizado · cimenticio · amadeirado · grande-formato · tons-neutros · area-externa
```

Os filtros da página são montados a partir do que existe no catálogo: estilo sem produto
não vira botão.

## Bloco "Destaques do mês"

Está pronto e comentado dentro do `index.html`, logo depois da vitrine. Ative quando a
cliente definir a circular mensal. Regra do briefing: **sem preço fixo, sem percentual de
desconto, sem tom de liquidação.**

## Conversão

Não existe backend. Todo caminho termina no WhatsApp de campanha `(81) 98361-8877`, com
mensagem pré-montada:

- o formulário do hero monta nome, WhatsApp, cidade, ambiente e metragem e abre a conversa
- cada card da vitrine envia nome do modelo, marca e formato
- os botões de seção enviam mensagens de contexto próprio

O formulário valida nome, WhatsApp (mínimo de 10 dígitos) e cidade. Ambiente e metragem
são opcionais de propósito: cinco campos obrigatórios em tráfego frio derrubam conversão.

## Performance

Lighthouse mobile, throttle real de dispositivo (`--throttling-method=devtools`).
Nunca meça com `simulate`: o Lantern infla o LCP e mente cerca de 9 pontos.

Regras que sustentam o número, não quebre sem medir de novo:

- `font-display: optional` em todos os `@font-face`, que é o que segura o CLS em 0
- `width` e `height` explícitos em toda imagem, ou `aspect-ratio` no CSS
- `loading="lazy"` em tudo abaixo da dobra, nunca no hero
- preload da imagem do hero, com `media` separando mobile e desktop
- watchdog de 3 s no `main.js`: se o JS travar antes do IntersectionObserver, a classe
  `no-motion` entra e todo o conteúdo escondido por animação aparece

A v2 removeu as três seções com `background-attachment: fixed` da versão anterior. Além de
sair do escopo do briefing (que pediu menos fundo escuro), isso eliminou o risco de
saturação de compositing no Safari.

## Assets

As imagens de ambiente e os logos de marca vieram do site anterior, que as hospedava em
storage de terceiro (`storage.lucasmendes.dev`). Foram baixadas, convertidas para WebP e
passaram a ser servidas pelo próprio repositório, então o site não depende mais daquela infra.

As fotos do showroom e da fachada são reais, enviadas pela cliente em 21/07/2026
(`assets/show-*.webp`).

Os originais em JPG e os 8 catálogos em PDF ficam em `assets/raw/`, fora do git (somam
369 MB). Os catálogos não entraram no site: o maior tem 65 MB e o objetivo da página é
capturar o lead, então o pedido de catálogo virou conversa no WhatsApp.

## Pendências

Ver a seção final de `COPY-FONTE-DA-VERDADE.md`. A principal é conseguir fotos de produto
Decortiles: a marca está na barra e é vendida na loja, mas não veio imagem dela no acervo.
