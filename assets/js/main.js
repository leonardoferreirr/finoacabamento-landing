/* Fino Acabamento — landing de campanha de porcelanato
   Sem dependência externa. Tudo degrada para uma página estática funcional. */
(function () {
  'use strict';

  var WA = '5581983618877';
  var PAGE = 8; // quantos modelos aparecem antes do "ver mais"

  /* ---------------------------------------------------------------
     1. Watchdog de motion. Se algo quebrar antes do IntersectionObserver
        rodar, o conteúdo aparece do mesmo jeito.
     --------------------------------------------------------------- */
  var watchdog = setTimeout(function () {
    document.documentElement.classList.add('no-motion');
  }, 3000);

  /* ---------------------------------------------------------------
     2. Header com sombra ao rolar
     --------------------------------------------------------------- */
  var header = document.getElementById('header');
  if (header) {
    var stuck = false;
    var onScroll = function () {
      var should = window.scrollY > 8;
      if (should !== stuck) {
        stuck = should;
        header.classList.toggle('is-stuck', should);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------------
     3. Scroll reveal
     --------------------------------------------------------------- */
  function reveal(scope) {
    var items = (scope || document).querySelectorAll('.rv:not(.is-in)');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-in');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  }

  /* ---------------------------------------------------------------
     4. Vitrine de porcelanatos
     --------------------------------------------------------------- */
  var ESTILOS = [
    { id: 'todos', label: 'Todos' },
    { id: 'marmorizado', label: 'Marmorizados' },
    { id: 'cimenticio', label: 'Cimentícios' },
    { id: 'amadeirado', label: 'Amadeirados' },
    { id: 'grande-formato', label: 'Grandes formatos' },
    { id: 'tons-neutros', label: 'Tons neutros' },
    { id: 'area-externa', label: 'Áreas externas' }
  ];

  /* Os dados vêm de porcelanatos.json, injetados em assets/js/produtos.js */
  var PRODUTOS = window.__PORCELANATOS__ || [];

  var elGrid = document.getElementById('grid-prod');
  var elFiltros = document.getElementById('filtros');
  var elVazio = document.getElementById('vitrine-empty');
  var elMais = document.getElementById('ver-mais');

  var filtroAtivo = 'todos';
  var expandido = false;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function waLink(p) {
    var msg = 'Olá! Vi o porcelanato ' + p.nome + ' (' + p.marca + ', ' + p.formato +
      ') no site e queria consultar disponibilidade e prazo.';
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }

  function cardHTML(p) {
    var meta = [p.formato + ' cm', p.acabamento].filter(Boolean).join(' · ');
    return '<article class="prod">' +
      '<div class="prod__img"><img src="assets/porc/' + esc(p.file) + '" alt="Porcelanato ' +
        esc(p.nome) + ', ' + esc(p.marca) + ', formato ' + esc(p.formato) + ' centímetros" ' +
        'width="600" height="600" loading="lazy" decoding="async" fetchpriority="low"></div>' +
      '<div class="prod__body">' +
        '<h3 class="prod__name">' + esc(p.nome) + '</h3>' +
        '<p class="prod__meta"><b>' + esc(p.marca) + '</b> · ' + esc(meta) + '</p>' +
        '<a class="prod__cta" href="' + esc(waLink(p)) + '" target="_blank" rel="noopener">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.1 0 1.3.9 2.5 1 2.6.2.2 1.8 2.8 4.4 3.9 1.6.6 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.4-.3Z"/></svg>' +
          'Consultar disponibilidade</a>' +
      '</div></article>';
  }

  function filtrados() {
    if (filtroAtivo === 'todos') return PRODUTOS;
    return PRODUTOS.filter(function (p) {
      return (p.estilos || []).indexOf(filtroAtivo) !== -1;
    });
  }

  function renderGrid() {
    if (!elGrid) return;
    var lista = filtrados();
    var visiveis = expandido ? lista : lista.slice(0, PAGE);

    elGrid.innerHTML = visiveis.map(cardHTML).join('');
    if (elVazio) elVazio.hidden = lista.length > 0;

    if (elMais) {
      if (lista.length > PAGE) {
        elMais.hidden = false;
        elMais.textContent = expandido
          ? 'Ver menos'
          : 'Ver mais ' + (lista.length - PAGE) + ' modelos';
      } else {
        elMais.hidden = true;
      }
    }
  }

  function renderFiltros() {
    if (!elFiltros) return;
    // só mostra o filtro que tem produto
    var usados = ESTILOS.filter(function (e) {
      if (e.id === 'todos') return true;
      return PRODUTOS.some(function (p) { return (p.estilos || []).indexOf(e.id) !== -1; });
    });
    if (usados.length < 3) { elFiltros.hidden = true; return; }

    elFiltros.innerHTML = usados.map(function (e) {
      return '<button class="chip" type="button" data-estilo="' + e.id + '" aria-pressed="' +
        (e.id === filtroAtivo) + '">' + e.label + '</button>';
    }).join('');

    elFiltros.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-estilo]');
      if (!btn) return;
      filtroAtivo = btn.getAttribute('data-estilo');
      expandido = false;
      var chips = elFiltros.querySelectorAll('.chip');
      for (var i = 0; i < chips.length; i++) {
        chips[i].setAttribute('aria-pressed', chips[i] === btn ? 'true' : 'false');
      }
      renderGrid();
    });
  }

  if (elMais) {
    elMais.addEventListener('click', function () {
      expandido = !expandido;
      renderGrid();
      if (!expandido) {
        var top = document.getElementById('vitrine');
        if (top) top.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  renderFiltros();
  renderGrid();

  /* ---------------------------------------------------------------
     5. Formulário: monta a mensagem e abre o WhatsApp
     --------------------------------------------------------------- */
  var form = document.getElementById('lead-form');
  if (form) {
    var marcaErro = function (input, invalido) {
      var wrap = input.closest('.field');
      if (wrap) wrap.classList.toggle('is-invalid', invalido);
      return !invalido;
    };

    var soDigitos = function (s) { return (s || '').replace(/\D/g, ''); };

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      var nome = form.nome, zap = form.zap, cidade = form.cidade;
      var okNome = marcaErro(nome, nome.value.trim().length < 2);
      var okZap = marcaErro(zap, soDigitos(zap.value).length < 10);
      var okCidade = marcaErro(cidade, cidade.value.trim().length < 2);
      if (!(okNome && okZap && okCidade)) {
        var falho = form.querySelector('.is-invalid input');
        if (falho) falho.focus();
        return;
      }

      var linhas = [
        'Olá! Quero receber opções de porcelanato para a minha obra.',
        '',
        'Nome: ' + nome.value.trim(),
        'WhatsApp: ' + zap.value.trim(),
        'Cidade da obra: ' + cidade.value.trim()
      ];
      if (form.ambiente && form.ambiente.value) linhas.push('Ambiente: ' + form.ambiente.value);
      if (form.metragem && form.metragem.value.trim()) linhas.push('Metragem: ' + form.metragem.value.trim());

      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');
    });

    // limpa o erro assim que a pessoa começa a corrigir
    form.addEventListener('input', function (ev) {
      var wrap = ev.target.closest('.field');
      if (wrap) wrap.classList.remove('is-invalid');
    });
  }

  /* ---------------------------------------------------------------
     5b. Parallax de foto fixa
     A background-image só entra quando a seção se aproxima. Se entrasse no CSS
     puro, as duas fotos cairiam no caminho crítico e derrubariam o LCP.
     --------------------------------------------------------------- */
  var secs = Array.prototype.slice.call(document.querySelectorAll('.parallax'));
  if (secs.length) {
    if (!('IntersectionObserver' in window)) {
      secs.forEach(function (s) { s.classList.add('bg-on'); });
    } else {
      var ioBg = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('bg-on'); obs.unobserve(en.target); }
        });
      }, { rootMargin: '600px 0px' });
      secs.forEach(function (s) { ioBg.observe(s); });
    }

    /* iOS Safari ignora background-attachment:fixed. Nele a foto vira um filho
       position:fixed, ligado só enquanto a seção está no viewport. */
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) {
      document.documentElement.classList.add('is-ios');
      var tick = function () {
        secs.forEach(function (s) {
          var bg = s.querySelector('.parallax-bg');
          if (!bg) return;
          var r = s.getBoundingClientRect();
          bg.classList.toggle('is-on', r.bottom > 0 && r.top < window.innerHeight);
        });
      };
      window.addEventListener('scroll', tick, { passive: true });
      window.addEventListener('resize', tick);
      tick();
    }
  }

  /* ---------------------------------------------------------------
     6. Ano do rodapé
     --------------------------------------------------------------- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------------
     7. Liga o motion por último
     --------------------------------------------------------------- */
  clearTimeout(watchdog);
  reveal();
})();
