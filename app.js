/* ================================================================
   GRUPO TEATRO FAMÍLIA — app.js
   ================================================================
   Todos os recursos interativos do site:
   1.  Ano automático no rodapé
   2.  Topbar com efeito ao rolar
   3.  Menu hambúrguer (mobile)
   4.  Scroll reveal (animação de entrada)
   5.  Link ativo no menu conforme seção visível
   6.  Filtros dos espetáculos
   7.  Popups dos espetáculos (modal) ← bug corrigido
   8.  Galeria — lightbox ← bug corrigido
   9.  Calendário anual 2025 ← novo
   10. Botão copiar Pix
   11. Formulário de contato
   ================================================================ */

(() => {

  /* ── Helpers ────────────────────────────────────────────────── */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));


  /* ================================================================
     1. ANO AUTOMÁTICO NO RODAPÉ
     ================================================================
     Preenche o <span id="year"> com o ano atual.
     Não precisa mexer aqui.
     ================================================================ */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();


  /* ================================================================
     2. TOPBAR — efeito ao rolar a página
     ================================================================
     Adiciona a classe .scrolled no header quando o visitante rola,
     deixando o fundo mais opaco.
     Não precisa mexer aqui.
     ================================================================ */
  const topbar = $('#topbar');
  const handleScroll = () => {
    if (!topbar) return;
    topbar.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();


  /* ================================================================
     3. MENU HAMBÚRGUER (mobile)
     ================================================================
     Controla o botão de 3 linhas que aparece em telas pequenas.
     Fecha automaticamente ao clicar em um link do menu.
     Não precisa mexer aqui.
     ================================================================ */
  const navToggle = $('#nav-toggle');
  const mainNav   = $('#main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      mainNav.toggleAttribute('data-open', !isOpen);
    });

    // Fecha ao clicar em qualquer link do menu
    $$('a', mainNav).forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        mainNav.removeAttribute('data-open');
      });
    });

    // Fecha ao clicar fora do menu
    document.addEventListener('click', e => {
      if (!topbar.contains(e.target)) {
        navToggle.setAttribute('aria-expanded', 'false');
        mainNav.removeAttribute('data-open');
      }
    });
  }


  /* ================================================================
     4. SCROLL REVEAL (animação de entrada)
     ================================================================
     Elementos com data-reveal="" surgem suavemente ao entrar
     na área visível da tela enquanto o visitante rola a página.
     Não precisa mexer aqui.
     ================================================================ */
  const revealEls = $$('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback para navegadores sem IntersectionObserver
    revealEls.forEach(el => el.classList.add('is-visible'));
  }


  /* ================================================================
     5. LINK ATIVO NO MENU (destaque da seção atual)
     ================================================================
     Adiciona a classe .active no link do menu correspondente
     à seção que está visível na tela.
     Não precisa mexer aqui.
     ================================================================ */
  const navLinks = $$('.nav a[href^="#"]');
  const sections = navLinks
    .map(link => document.getElementById(link.getAttribute('href').slice(1)))
    .filter(Boolean);

  if (sections.length) {
    const activeObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(sec => activeObserver.observe(sec));
  }


  /* ================================================================
     6. FILTROS DOS ESPETÁCULOS
     ================================================================
     Controla os botões [Todos] [Drama] [Comédia] [Poesia].

     COMO ADICIONAR NOVA CATEGORIA:
       1. No HTML, adicione: <button class="chip" data-filter="musical">Musical</button>
       2. No HTML, no espetáculo, use: data-tag="musical"
       Funciona automaticamente.
     ================================================================ */
  const filterBtns = $$('[data-filter]');
  const showCards  = $$('[data-tag]', $('[data-portfolio]') || document);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Atualiza o botão ativo
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filter = btn.getAttribute('data-filter');

      // Mostra/esconde os cards
      showCards.forEach(card => {
        const tag       = card.getAttribute('data-tag');
        const isVisible = filter === 'todos' || tag === filter;
        card.style.display = isVisible ? '' : 'none';
        // Animação suave ao revelar
        if (isVisible) {
          card.style.animation = 'none';
          card.offsetHeight; // força reflow
          card.style.animation = 'fadeIn .35s ease forwards';
        }
      });
    });
  });


  /* ================================================================
     7. POPUPS DOS ESPETÁCULOS (modal)
     ================================================================
     ✅ Bug corrigido: o seletor antigo era ambíguo e não conectava
     corretamente cada botão ao seu dialog.

     Como funciona agora:
     — Percorre cada .show individualmente
     — Pega o botão [data-open] e o dialog [data-modal] do MESMO .show
     — Conecta os dois de forma direta e sem ambiguidade
     — Links dentro do popup ([data-modal-link]) fecham o popup e
       depois navegam para a seção correta com scroll suave

     Não precisa mexer aqui.
     ================================================================ */
  $$('.show').forEach(show => {
    const openBtn  = show.querySelector('[data-open]');
    const modal    = show.querySelector('[data-modal]');
    if (!openBtn || !modal) return;

    /* Abre o popup ao clicar no card */
    openBtn.addEventListener('click', () => {
      if (typeof modal.showModal === 'function') {
        modal.showModal();
        document.body.style.paddingRight = getScrollbarWidth() + 'px';
      }
    });

    /* Fecha ao clicar no botão ✕ */
    const closeBtn = modal.querySelector('[data-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(modal));
    }

    /* Tecla Escape (já funciona nativamente no <dialog>, mas garantimos) */
    modal.addEventListener('cancel', () => {
      document.body.style.paddingRight = '';
    });

    /* Fecha ao clicar no fundo escuro (fora do .modal__card) */
    modal.addEventListener('click', e => {
      const card = modal.querySelector('.modal__card');
      if (card && !card.contains(e.target)) closeModal(modal);
    });

    /* Links internos do popup (ex: "Ver agenda", "Apoiar")
       Fecha o popup PRIMEIRO, depois navega para a seção correta */
    modal.querySelectorAll('[data-modal-link]').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const href = link.getAttribute('href');
        closeModal(modal);
        setTimeout(() => {
          const dest = document.querySelector(href);
          if (dest) dest.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150); // espera o popup fechar antes de rolar
      });
    });
  });

  function closeModal(modal) {
    if (modal && modal.open) {
      modal.close();
      document.body.style.paddingRight = '';
    }
  }

  /* Evita que a barra de scroll some ao abrir o dialog (evita pulo de layout) */
  function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }


  /* ================================================================
     8. GALERIA — LIGHTBOX (foto ampliada ao clicar)
     ================================================================
     ✅ Bug corrigido: o código antigo tinha duas linhas conflitantes
     que quebravam todo o JavaScript.

     Como funciona agora:
     — Se o .shot tiver uma <img> real → exibe ela ampliada no lightbox
     — Se não tiver → exibe um gradiente placeholder
     — O lightbox fecha com ✕ ou clicando fora da foto

     Não precisa mexer aqui.
     ================================================================ */
  const lightbox      = $('#lightbox');
  const lightboxMedia = $('#lightbox-media');
  const lightboxClose = $('#lightbox-close');
  const shots         = $$('[data-shot]');

  /* Gradientes placeholder — um para cada foto sem imagem real */
  const placeholderGradients = [
    'linear-gradient(135deg, rgba(99,102,241,.4), rgba(251,191,36,.2))',
    'linear-gradient(135deg, rgba(251,191,36,.3), rgba(99,102,241,.3))',
    'linear-gradient(135deg, rgba(139,92,246,.35), rgba(99,102,241,.3))',
    'linear-gradient(135deg, rgba(99,102,241,.3), rgba(251,191,36,.25))',
    'linear-gradient(135deg, rgba(251,191,36,.35), rgba(139,92,246,.25))',
    'linear-gradient(135deg, rgba(99,102,241,.4), rgba(251,191,36,.2))',
    'linear-gradient(135deg, rgba(251,191,36,.25), rgba(99,102,241,.35))',
    'linear-gradient(135deg, rgba(139,92,246,.25), rgba(251,191,36,.3))',
  ];

  if (lightbox && lightboxMedia) {

    shots.forEach((shot, idx) => {
      shot.addEventListener('click', () => {

        /* Limpa o conteúdo anterior */
        lightboxMedia.innerHTML = '';
        lightboxMedia.style.background = '';

        const img = shot.querySelector('img');

        if (img && img.src) {
          /* Foto real: cria uma <img> no lightbox para exibição correta */
          const enlarged = document.createElement('img');
          enlarged.src = img.src;
          enlarged.alt = img.alt || 'Foto ampliada';
          lightboxMedia.appendChild(enlarged);
        } else {
          /* Sem foto real: exibe gradiente colorido */
          lightboxMedia.style.background = placeholderGradients[idx % placeholderGradients.length];
          lightboxMedia.style.minHeight = '300px';
        }

        if (typeof lightbox.showModal === 'function') lightbox.showModal();
      });
    });

    /* Fecha com o botão ✕ */
    if (lightboxClose) {
      lightboxClose.addEventListener('click', () => lightbox.close());
    }

    /* Fecha ao clicar no fundo escuro */
    lightbox.addEventListener('click', e => {
      const card = lightbox.querySelector('.lightbox__card');
      if (card && !card.contains(e.target)) lightbox.close();
    });
  }


  /* ================================================================
     9. CALENDÁRIO ANUAL 2025
     ================================================================
     COMO ADICIONAR SEUS EVENTOS:
       Edite o array GTF_EVENTS abaixo. Cada evento é um objeto com:
         date  → 'YYYY-MM-DD'  (ano-mês-dia, sempre com zeros)
         title → nome do evento
         local → local do evento

     Exemplo:
       { date: '2025-09-15', title: 'Amor Universal', local: 'Centro Espírita ABC' }

     O calendário marca automaticamente os dias com eventos
     e mostra um tooltip ao passar o mouse.
     ================================================================ */

  // ▼▼▼ ADICIONE SEUS EVENTOS AQUI ▼▼▼
  const GTF_EVENTS = [
    { date: '2025-08-14', title: 'O Som das Velas',          local: 'Teatro Municipal — 19h30' },
    { date: '2025-09-03', title: 'Troca-se uma Esperança',   local: 'Centro Cultural — 20h'    },
    { date: '2025-10-21', title: 'Apresentação GTF',         local: 'A confirmar'               },
    // Adicione mais eventos aqui no mesmo formato:
    // { date: '2025-MM-DD', title: 'Nome do evento', local: 'Local do evento' },
  ];
  // ▲▲▲ FIM DOS EVENTOS ▲▲▲

  const calContainer = $('#calendar-2025');
  if (calContainer) renderAnnualCalendar(2025, calContainer, GTF_EVENTS);

  function renderAnnualCalendar(year, container, events) {
    const monthNames = [
      'Janeiro','Fevereiro','Março','Abril',
      'Maio','Junho','Julho','Agosto',
      'Setembro','Outubro','Novembro','Dezembro'
    ];
    const weekdays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

    /* Monta um mapa de datas com evento para acesso rápido */
    const eventMap = {};
    events.forEach(ev => {
      if (!eventMap[ev.date]) eventMap[ev.date] = [];
      eventMap[ev.date].push(ev);
    });

    const today      = new Date();
    const todayStr   = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    monthNames.forEach((name, monthIdx) => {
      const monthEl = document.createElement('div');
      monthEl.className = 'cal-month';
      monthEl.setAttribute('role', 'group');
      monthEl.setAttribute('aria-label', `${name} ${year}`);

      /* Cabeçalho do mês */
      monthEl.innerHTML = `
        <div class="cal-month__header">
          <div class="cal-month__name">${name}</div>
          <div class="cal-month__year">${year}</div>
        </div>
        <div class="cal-weekdays" aria-hidden="true">
          ${weekdays.map(d => `<div class="cal-weekday">${d}</div>`).join('')}
        </div>
        <div class="cal-days" role="grid" aria-label="Dias de ${name}"></div>
      `;

      const daysGrid  = monthEl.querySelector('.cal-days');
      const firstDay  = new Date(year, monthIdx, 1).getDay(); // 0=Dom
      const totalDays = new Date(year, monthIdx + 1, 0).getDate();

      /* Células vazias antes do dia 1 */
      for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'cal-day cal-day--empty';
        empty.setAttribute('aria-hidden', 'true');
        daysGrid.appendChild(empty);
      }

      /* Células dos dias */
      for (let day = 1; day <= totalDays; day++) {
        const dayEl  = document.createElement('div');
        const mm     = String(monthIdx + 1).padStart(2, '0');
        const dd     = String(day).padStart(2, '0');
        const dateStr = `${year}-${mm}-${dd}`;
        const dow    = new Date(year, monthIdx, day).getDay();

        let classes = 'cal-day';
        if (dow === 0 || dow === 6) classes += ' cal-day--weekend';
        if (dateStr === todayStr)   classes += ' cal-day--today';

        /* Verifica se há evento neste dia */
        if (eventMap[dateStr]) {
          classes += ' cal-day--event';
          const tooltipText = eventMap[dateStr]
            .map(ev => `${ev.title} · ${ev.local}`)
            .join(' / ');
          dayEl.setAttribute('data-tooltip', tooltipText);
          dayEl.setAttribute('role', 'button');
          dayEl.setAttribute('tabindex', '0');
          dayEl.setAttribute('aria-label', `${day} de ${name}: ${tooltipText}`);
        }

        dayEl.className = classes;
        dayEl.textContent = day;
        daysGrid.appendChild(dayEl);
      }

      container.appendChild(monthEl);
    });
  }


  /* ================================================================
     10. PIX — copiar chave
     ================================================================
     CHAVE PIX: edite o valor de GTF_PIX_KEY abaixo,
     ou edite diretamente o texto no HTML (span#pix-key).

     A mensagem de confirmação pode ser editada em pixSuccessMsg.
     ================================================================ */

  // CHAVE PIX — edite aqui se necessário
  const GTF_PIX_KEY      = 'grupoteatrofamilia@gmail.com';
  const pixSuccessMsg    = '✅ Chave copiada! Obrigado por apoiar a arte e a transformação! 🎭';
  const pixErrorMsg      = '❌ Não foi possível copiar automaticamente. Copie manualmente a chave acima.';

  const copyPixBtn   = $('#copy-pix');
  const pixKeyEl     = $('#pix-key');
  const pixStatusEl  = $('#pix-status');

  if (copyPixBtn && pixKeyEl) {
    // Garante que o HTML também mostra a chave correta
    pixKeyEl.textContent = GTF_PIX_KEY;

    copyPixBtn.addEventListener('click', async () => {
      const key = pixKeyEl.textContent.trim();
      try {
        await navigator.clipboard.writeText(key);
        showPixStatus(pixSuccessMsg);
      } catch {
        // Fallback para navegadores sem clipboard API
        try {
          const ta = document.createElement('textarea');
          ta.value = key;
          ta.style.cssText = 'position:fixed;left:-9999px;opacity:0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          showPixStatus(pixSuccessMsg);
        } catch {
          showPixStatus(pixErrorMsg);
        }
      }
    });
  }

  function showPixStatus(msg) {
    if (!pixStatusEl) return;
    pixStatusEl.textContent = msg;
    clearTimeout(pixStatusEl._timer);
    pixStatusEl._timer = setTimeout(() => (pixStatusEl.textContent = ''), 6000);
  }


  /* ================================================================
     11. FORMULÁRIO DE CONTATO
     ================================================================
     Atualmente simula o envio e mostra uma mensagem de sucesso.

     PARA INTEGRAR COM ENVIO REAL (ex: Formspree):
       1. Crie uma conta em formspree.io
       2. Substitua a action do form no HTML:
            <form action="https://formspree.io/f/SEU_ID" method="POST">
       3. Remova o e.preventDefault() abaixo e deixe o form enviar normalmente

     MENSAGENS: edite successMessage e errorMessage abaixo.
     ================================================================ */
  const contactForm  = $('#contact-form');
  const formStatusEl = $('#form-status');

  const successMessage = '✅ Mensagem enviada! Em breve entraremos em contato. Obrigado!';
  const errorMessage   = '❌ Houve um erro. Tente novamente ou entre em contato pelo Instagram.';

  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault(); // Remove esta linha se integrar com Formspree

      // Validação básica
      const nome     = contactForm.querySelector('[name="nome"]');
      const email    = contactForm.querySelector('[name="email"]');
      const mensagem = contactForm.querySelector('[name="mensagem"]');

      if (!nome?.value.trim() || !email?.value.trim() || !mensagem?.value.trim()) {
        showFormStatus(errorMessage, 'error');
        return;
      }

      // Simulação de envio
      const submitBtn = contactForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
      }

      setTimeout(() => {
        showFormStatus(successMessage, 'success');
        contactForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Enviar mensagem';
        }
      }, 800);
    });
  }

  function showFormStatus(msg, type) {
    if (!formStatusEl) return;
    formStatusEl.textContent = msg;
    formStatusEl.className   = `form__status ${type}`;
    clearTimeout(formStatusEl._timer);
    if (type === 'success') {
      formStatusEl._timer = setTimeout(() => {
        formStatusEl.textContent = '';
        formStatusEl.className   = 'form__status';
      }, 8000);
    }
  }


  /* ================================================================
     CSS de animação injetado (fadeIn para os filtros)
     ================================================================ */
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleTag);

})();