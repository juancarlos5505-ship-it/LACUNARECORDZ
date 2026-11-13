(() => {
  'use strict';

  const modal = document.getElementById('registration-modal');
  const dialog = modal?.querySelector('[role="dialog"]');
  const frame = document.getElementById('registration-frame');
  const fallbackLink = document.getElementById('open-form');
  const setupWarning = document.getElementById('setup-warning');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const openers = document.querySelectorAll('[data-open-register]');
  const closers = modal?.querySelectorAll('[data-close-register]') || [];
  let previousFocus = null;
  let savedScrollY = 0;

  const endpoint = String(window.LACUNA_CONFIG?.appScriptUrl || '').trim();
  const endpointValid = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?.*)?$/.test(endpoint);
  if (endpointValid && frame && fallbackLink) {
    const url = new URL(endpoint);
    const search = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach((key) => {
      const value = search.get(key);
      if (value) url.searchParams.set(key, value.slice(0, 100));
    });
    frame.src = url.href;
    fallbackLink.href = url.href;
  } else if (setupWarning) {
    setupWarning.hidden = false;
  }

  // El navegador integrado de Instagram puede impedir que cargue Google Apps Script en un iframe.
  // Solo mostramos instrucciones; no cambiamos el formulario ni el backend de inscripciones.
  const browserHelp = document.getElementById('instagram-browser-help');
  const browserHelpTrigger = document.getElementById('browser-help-trigger');
  const copyBrowserLink = document.getElementById('copy-browser-link');
  const copyBrowserStatus = document.getElementById('browser-copy-status');
  const browserPageUrl = document.getElementById('browser-page-url');
  const isInstagramBrowser = /Instagram|IG_IAB/i.test(navigator.userAgent || '');
  const publicPageUrl = new URL(window.location.href);
  publicPageUrl.hash = '';
  const pageLink = publicPageUrl.href;
  if (browserPageUrl) browserPageUrl.textContent = pageLink;

  function toggleBrowserHelp(show) {
    if (!browserHelp) return;
    modal?.classList.toggle('show-browser-help', show);
    browserHelp.hidden = !show;
    if (frame) frame.hidden = show;
    if (fallbackLink) fallbackLink.hidden = show;
    if (browserHelpTrigger) {
      browserHelpTrigger.setAttribute('aria-expanded', String(show));
      browserHelpTrigger.textContent = show ? 'VOLVER AL FORMULARIO ↗' : '¿NO CARGA DESDE INSTAGRAM? VER INSTRUCCIONES ↗';
      browserHelpTrigger.hidden = isInstagramBrowser && show;
    }
  }
  browserHelpTrigger?.addEventListener('click', () => toggleBrowserHelp(browserHelp?.hidden));
  if (isInstagramBrowser) toggleBrowserHelp(true);

  copyBrowserLink?.addEventListener('click', async () => {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(pageLink);
        copied = true;
      }
    } catch (_) {}
    if (!copied) {
      const field = document.createElement('textarea');
      field.value = pageLink;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.focus();
      field.select();
      try { copied = document.execCommand('copy'); } catch (_) {}
      field.remove();
    }
    if (copyBrowserStatus) {
      copyBrowserStatus.textContent = copied
        ? 'Enlace copiado. Abre Safari o Chrome y pégalo en la barra de direcciones.'
        : 'No se pudo copiar automáticamente. Mantén presionada la dirección de abajo para copiarla.';
    }
  });

  function openRegister() {
    if (!modal) return;
    previousFocus = document.activeElement;
    savedScrollY = window.scrollY;
    modal.hidden = false;
    document.body.classList.add('has-modal');
    if (window.matchMedia('(max-width: 650px)').matches) {
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.width = '100%';
    }
    window.requestAnimationFrame(() => {
      const closeButton = modal.querySelector('.modal-close');
      if (dialog) dialog.scrollTop = 0;
      modal.scrollTop = 0;
      closeButton?.focus({ preventScroll: true });
    });
  }
  function closeRegister() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('has-modal');
    if (document.body.style.position === 'fixed') {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo({ top: savedScrollY, behavior: 'instant' });
    }
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus({ preventScroll: true });
  }

  openers.forEach((button) => button.addEventListener('click', openRegister));
  closers.forEach((button) => button.addEventListener('click', closeRegister));
  window.addEventListener('keydown', (event) => {
    if (!modal || modal.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault(); closeRegister(); return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not([disabled]),a[href],iframe,[tabindex]:not([tabindex="-1"])')]
      .filter((el) => el.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  if (location.hash === '#registro') openRegister();

  // Progreso de lectura, sin scripts ni dependencias de terceros.
  const progress = document.getElementById('top-progress');
  let scheduled = false;
  function paintProgress() {
    scheduled = false;
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${scrollable > 0 ? (scrollY / scrollable) * 100 : 0}%`;
  }
  addEventListener('scroll', () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(paintProgress);
  }, { passive: true });
  addEventListener('resize', paintProgress, { passive: true });
  paintProgress();

  // Animación progresiva solo cuando el contenido entra al viewport.
  const reveals = document.querySelectorAll('.reveal');
  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: '0px 0px 100px 0px' });
    reveals.forEach((element) => observer.observe(element));
  } else reveals.forEach((element) => element.classList.add('is-visible'));

  // Video solo en zona visible; preferencia de movimiento reducido respetada.
  const video = document.getElementById('hero-video');
  if (video) {
    if (reduceMotion.matches) {
      video.pause();
      video.removeAttribute('autoplay');
    } else {
      const tryPlay = () => {
        if (document.hidden) return;
        const promise = video.play();
        if (promise?.catch) promise.catch(() => {});
      };
      if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
          if (entries[0]?.isIntersecting) tryPlay(); else video.pause();
        }, { threshold: .07 }).observe(video);
      } else tryPlay();
      document.addEventListener('visibilitychange', () => document.hidden ? video.pause() : tryPlay());
    }
  }
})();