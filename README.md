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
- `assets/fonts/` — Manrope e Inter, variáveis e subsetadas, um woff2 por família
- `obrigado.html` — página de conversão, redireciona para o WhatsApp
- `porcelanatos.json` — catálogo da vitrine (fonte da verdade)
- `scripts/build-vitrine.mjs` — valida o catálogo e gera `produtos.js`

## Tipografia

Definida pelo cliente: **Manrope nos títulos, Inter nos textos.**

| Onde | Fonte |
|---|---|
| Headline do hero | Manrope ExtraBold (800) |
| Títulos de seção | Manrope Bold (700) |
| Textos | Inter Regular (400) |
| Botões, nav e chips | Inter SemiBold (600) |

O peso 500 saiu do arquivo, então nav e chips foram para 600.

## Fundos escuros

O hero, a seção "para quem está escolhendo" e o CTA final têm foto de fundo com véu escuro e
texto branco. O véu do hero é 62% no centro e sobe nas pontas. Medido por amostragem de pixel
com o texto oculto: 6,6:1 no subtítulo, no pior ponto.

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

Não existe backend. **Todo clique de WhatsApp passa por `obrigado.html`**, que é a página onde
o pixel de conversão deve ser instalado. Ela monta a mensagem, mostra a marca por um instante e
redireciona para `wa.me` com `location.replace`, para o botão voltar não cair nela de novo.

Nenhum link da página aponta para `wa.me` direto, nem o do rodapé. Se apontasse, o clique
escaparia do disparo de conversão.

Contratos da query string:

| URL | Mensagem |
|---|---|
| Contexto | Seção de origem | Rótulo do botão |
|---|---|---|
| `especialista` | hero, diferenciais | Falar com especialista |
| `consulta` | vitrine, header, botão flutuante, rodapé | Consultar estoque e prazo |
| `estoque` | estoque e prazo | Consultar estoque e prazo |
| `metragem` | como funciona | Enviar metragem no WhatsApp |
| `obra` | para quem está escolhendo | Ver opções para minha obra |
| `showroom` | showroom | Falar no WhatsApp antes de visitar |
| `duvidas` | FAQ | Falar com especialista |
| `final` | CTA final | Consultar porcelanatos no WhatsApp |
| `produto&p=Nome\|Marca\|Formato` | card da vitrine | Consultar disponibilidade |

Toda seção de conteúdo fecha com um botão de WhatsApp. A única sem botão é a barra de
marcas, que é uma faixa de três logos, não uma seção. Os rótulos saem da lista de CTAs
aprovada no briefing da Fish; CTAs genéricos como "falar com o showroom" estão proibidos lá.

Contexto ausente ou desconhecido cai em `consulta`. A página tem botão manual e link de volta,
caso o redirecionamento não role.

**Para instalar o pixel:** coloque a tag no `<head>` de `obrigado.html`. Os 900 ms de espera
antes do redirect existem para o disparo acontecer antes de a página sair.

## Performance

Lighthouse mobile, throttle real de dispositivo (`--throttling-method=devtools`).
Nunca meça com `simulate`: o Lantern infla o LCP e mente cerca de 9 pontos.

Regras que sustentam o número, não quebre sem medir de novo:

- `font-display: optional` em todos os `@font-face`, que é o que segura o CLS em 0
- fontes **variáveis e subsetadas**: um arquivo por família em vez de um por peso. Eram 10
  arquivos e ~230 KB com prioridade `VeryHigh`, competindo com a foto do hero e segurando o
  LCP em 2,6 s. Hoje são 2 arquivos e 33 KB. Se a copy ganhar um caractere fora do conjunto:

  ```
  SUB=' !"#$%&'"'"'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~ºª°ÀÁÂÃÇÉÊÍÓÔÕÚÜàáâãçéêíóôõúüÑñ—–…©·×²³€'
  # limita o eixo de peso e depois subseta
  python3 -m fontTools.varLib.instancer inter-var.woff2 wght=400:600 -o inter-lim.ttf
  pyftsubset inter-lim.ttf --text="$SUB" --layout-features='kern,liga,calt,tnum' \
    --flavor=woff2 --output-file=assets/fonts/inter.woff2 --no-hinting
  ```
- `fetchpriority="low"` nas imagens da vitrine, para não disputar banda com o hero
- `width` e `height` explícitos em toda imagem, ou `aspect-ratio` no CSS
- `loading="lazy"` em tudo abaixo da dobra, nunca no hero
- preload da imagem do hero, com `media` separando mobile e desktop
- watchdog de 3 s no `main.js`: se o JS travar antes do IntersectionObserver, a classe
  `no-motion` entra e todo o conteúdo escondido por animação aparece

Duas seções usam `background-attachment: fixed` (para-quem e CTA final), a pedido do cliente.
A `background-image` só entra com a classe `.bg-on`, ligada por IntersectionObserver: no CSS
puro as duas fotos cairiam no caminho crítico e derrubariam o LCP. O iOS Safari ignora
`background-attachment: fixed`, então nele a classe `.is-ios` troca por um filho
`position: fixed` ligado só enquanto a seção está no viewport.

**Testar no Safari antes de entregar.** Duas seções de foto travada é carga real de GPU, e
saturação de compositing é efeito do conjunto. Se engasgar no iPhone, troque `fixed` por
`position: sticky` numa das duas.

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
