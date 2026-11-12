/* ============================================================
   JESÚS · PROFESOR DE DIBUJO TÉCNICO — Interactividad
   JavaScript puro: navegación, animaciones, formulario y chat
   ============================================================ */
(() => {
  'use strict';

  /* ---------- Utilidades ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  /* ============================================================
     1. CABECERA: estado al hacer scroll
     ============================================================ */
  const header = $('#site-header');

  const onScrollHeader = () => {
    header.classList.toggle('header--scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ============================================================
     2. MENÚ DE NAVEGACIÓN MÓVIL
     ============================================================ */
  const navToggle = $('.nav-toggle');
  const nav = $('#site-nav');

  const setNavOpen = (open) => {
    nav.classList.toggle('nav--open', open);
    navToggle.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };

  navToggle.addEventListener('click', () => setNavOpen(!nav.classList.contains('nav--open')));

  // Cerrar al pulsar cualquier enlace del menú o la CTA
  $$('.nav a, .header__cta').forEach((link) => {
    link.addEventListener('click', () => setNavOpen(false));
  });

  /* ============================================================
     3. SCROLL-SPY: resaltar el enlace de la sección visible
     ============================================================ */
  const navLinks = $$('.nav__link');
  const spiedSections = navLinks
    .map((link) => $(link.getAttribute('href')))
    .filter(Boolean);

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        navLinks.forEach((link) =>
          link.classList.toggle('is-active', link.getAttribute('href') === id)
        );
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  spiedSections.forEach((section) => spy.observe(section));

  /* ============================================================
     4. ANIMACIONES DE APARICIÓN AL HACER SCROLL
     ============================================================ */
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  $$('.reveal').forEach((el) => revealObserver.observe(el));

  /* ============================================================
     5. CONTADORES ANIMADOS (estadísticas del hero)
     ============================================================ */
  const animateCounter = (el) => {
    const target = parseInt(el.dataset.counter, 10) || 0;
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(easeOutCubic(progress) * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  $$('[data-counter]').forEach((el) => counterObserver.observe(el));

form.addEventListener('submit', (event) => {
    event.preventDefault();

    let firstInvalid = null;
    Object.values(fields).forEach((field) => {
      const result = field.validate(field.el.value);
      if (result !== true) {
        setError(field, result);
        if (!firstInvalid) firstInvalid = field.el;
      } else {
        clearError(field);
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    submitBtn.classList.add('is-loading');

    // Envío real a Netlify Forms mediante AJAX (fetch)
    const formData = new FormData(form);
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString(),
    })
      .then((response) => {
        if (!response.ok) throw new Error('Error en el envío');
        submitBtn.classList.remove('is-loading');

        const firstName = fields.nombre.el.value.trim().split(/\s+/)[0];
        $('#success-name').textContent = firstName;

        form.hidden = true;
        formSuccess.hidden = false;
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        $('.form-success__title', formSuccess).focus?.();
      })
      .catch(() => {
        submitBtn.classList.remove('is-loading');
        alert('Hubo un problema al enviar la consulta. Inténtalo de nuevo.');
      });
  });


  /* ============================================================
     7. WIDGET DE CHAT FLOTANTE (interfaz simulada)
     ============================================================ */
  const chatToggle = $('#chat-toggle');
  const chatWindow = $('#chat-window');
  const chatClose = $('#chat-close');
  const chatMessages = $('#chat-messages');
  const chatForm = $('#chat-form');
  const chatInput = $('#chat-input');
  const chatUnread = $('#chat-unread');
  const welcomeMsg = $('#chat-welcome');

  let welcomePlayed = false;
  let closeTimer = null;

  const scrollChatToBottom = () => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  /* --- Abrir / cerrar --- */
  const openChat = () => {
    clearTimeout(closeTimer);
    if (chatWindow.hidden) {
      chatWindow.hidden = false;
      // Forzar repintado para que la transición de escala funcione
      requestAnimationFrame(() => chatWindow.classList.add('is-open'));
    } else {
      chatWindow.classList.add('is-open');
    }

    chatToggle.classList.add('is-open', 'no-pulse');
    chatToggle.setAttribute('aria-expanded', 'true');
    chatToggle.setAttribute('aria-label', 'Cerrar chat');
    if (chatUnread) chatUnread.hidden = true;

    if (!welcomePlayed) {
      welcomePlayed = true;
      playWelcome();
    }

    setTimeout(() => chatInput.focus(), 300);
  };

  const closeChat = () => {
    chatWindow.classList.remove('is-open');
    chatToggle.classList.remove('is-open');
    chatToggle.setAttribute('aria-expanded', 'false');
    chatToggle.setAttribute('aria-label', 'Abrir chat');
    closeTimer = setTimeout(() => {
      chatWindow.hidden = true;
    }, 320);
  };

  chatToggle.addEventListener('click', () => {
    chatWindow.classList.contains('is-open') ? closeChat() : openChat();
  });

  chatClose.addEventListener('click', closeChat);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && chatWindow.classList.contains('is-open')) {
      closeChat();
      chatToggle.focus();
    }
  });

  /* --- Mensaje de bienvenida con efecto «escribiendo…» --- */
  const playWelcome = () => {
    // Sacar el mensaje estático, simular que el profesor escribe y volver a mostrarlo
    welcomeMsg.remove();
    const typing = addTypingIndicator();

    setTimeout(() => {
      typing.remove();
      chatMessages.appendChild(welcomeMsg);
      scrollChatToBottom();
    }, 1200);
  };

  /* --- Crear burbujas de mensaje --- */
  const timeStamp = () =>
    new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const addUserMessage = (text) => {
    // textContent → evita inyección de HTML en los mensajes del usuario
    const bubble = document.createElement('div');
    bubble.className = 'msg msg--user';

    const p = document.createElement('p');
    p.textContent = text;

    const time = document.createElement('span');
    time.className = 'msg__time';
    time.textContent = timeStamp();

    bubble.append(p, time);
    chatMessages.appendChild(bubble);
    scrollChatToBottom();
  };

  const addBotMessage = (html) => {
    const bubble = document.createElement('div');
    bubble.className = 'msg msg--bot';
    bubble.innerHTML = `<p>${html}</p><span class="msg__time">${timeStamp()}</span>`;
    chatMessages.appendChild(bubble);
    scrollChatToBottom();
  };

  const addTypingIndicator = () => {
    const bubble = document.createElement('div');
    bubble.className = 'msg msg--bot msg--typing';
    bubble.setAttribute('aria-label', 'El profesor está escribiendo');
    bubble.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(bubble);
    scrollChatToBottom();
    return bubble;
  };

  /* --- Respuestas automáticas según palabras clave --- */
  const normalize = (text) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const BOT_RULES = [
    {
      test: /precio|tarifa|coste|costo|cuesta|cuanto|cuota|\b€/,
      reply:
        'Las clases individuales son de <strong>18 €/hora</strong> y los grupos reducidos (máx. 3 alumnos) de <strong>12 €/hora</strong> por persona. La primera clase de prueba es <strong>gratuita</strong>. Si quieres, puedes <a href="#contacto" class="msg__link">dejarme tus datos aquí</a> y te escribo con todos los detalles.',
    },
    {
      test: /horario|horarios|hora|dia|dias|disponib|cuando|cuando/,
      reply:
        'Imparto clases de <strong>lunes a sábado</strong>, en franjas de mañana y tarde. Dime qué días te vienen mejor y buscamos un hueco que te encaje.',
    },
    {
      test: /ebau|evau|selectividad|examen|simulacro/,
      reply:
        'Preparo la parte de <strong>Dibujo Técnico de la EBAU / Selectividad</strong> con repaso de todo el temario, exámenes de convocatorias anteriores y simulacros cronometrados. ¿Cuándo tienes el examen?',
    },
    {
      test: /diedrico|dihedrico|abatimiento|abat/,
      reply:
        '¡El <strong>Sistema Diédrico</strong> es mi especialidad! Puntos, rectas y planos, abatimientos, cambios de plano, verdaderas magnitudes, intersecciones y distancias. Pásame el ejercicio que te trae de cabeza y lo resolvemos paso a paso.',
    },
    {
      test: /autocad|cad|sketchup|freecad|fusion|software|programa/,
      reply:
        'Doy clases de <strong>AutoCAD</strong> (2D y 3D), y también de FreeCAD y SketchUp: desde dibujo básico hasta bloques, capas y layouts de impresión. ¿Qué necesitas aprender exactamente?',
    },
    {
      test: /universidad|grado|ingenier|arquitectur|fp|formacion profesional|ciclo/,
      reply:
        'Sí, también preparo <strong>Geometría Descriptiva</strong> de primeros cursos de Grado (arquitectura e ingeniería) y el Dibujo Técnico de ciclos de FP. Dime qué asignatura llevas y qué temas os están pidiendo.',
    },
    {
      test: /reserv|prueba|primera clase|apuntar|empezar/,
      reply:
        'Genial, la primera clase es <strong>gratuita y sin compromiso</strong>. Rellena el <a href="#contacto" class="msg__link">formulario de contacto</a> con tu nivel y disponibilidad, y te escribo en menos de 24 h para agendarla.',
    },
    {
      test: /gracias/,
      reply:
        '¡De nada! Si te surge cualquier otra duda, aquí estoy. También puedes dejarme tu consulta en el <a href="#contacto" class="msg__link">formulario de contacto</a>.',
    },
    {
      test: /^(hola|buenas|hey|que tal|saludos)/,
      reply:
        '¡Hola! Encantado de saludarte. ¿En qué puedo ayudarte? Pregúntame por precios, horarios o el temario de las clases.',
    },
  ];

  const BOT_DEFAULT =
    'Buena pregunta. Para responderte con detalle, lo mejor es que me escribas por el <a href="#contacto" class="msg__link">formulario de contacto</a> o reserves tu <strong>clase de prueba gratuita</strong>. ¿Algo más en lo que pueda ayudarte?';

  const botReply = (userText) => {
    const text = normalize(userText);
    const rule = BOT_RULES.find((r) => r.test.test(text));
    return rule ? rule.reply : BOT_DEFAULT;
  };

  /* --- Envío de mensajes del usuario --- */
  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const text = chatInput.value.trim();
    if (!text) {
      chatInput.focus();
      return;
    }

    addUserMessage(text);
    chatInput.value = '';
    chatInput.focus();

    const typing = addTypingIndicator();
    const delay = 850 + Math.random() * 750; // «tiempo humano» de respuesta

    setTimeout(() => {
      typing.remove();
      addBotMessage(botReply(text));
    }, delay);
  });

  /* --- Chips de respuestas rápidas --- */
  $$('#chat-chips .chip-btn').forEach((chip) => {
    chip.addEventListener('click', () => {
      chatInput.value = chip.dataset.msg || chip.textContent;
      chatForm.requestSubmit();
    });
  });

  /* --- Enlaces internos dentro del chat: cerrar en móvil para ver el destino --- */
  chatMessages.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (link && window.innerWidth < 700) closeChat();
  });

  /* ============================================================
     8. AÑO ACTUAL DEL PIE DE PÁGINA
     ============================================================ */
  $('#year').textContent = new Date().getFullYear();

})();
