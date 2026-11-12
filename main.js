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

  function openRegister() {
    if (!modal) return;
    previousFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('has-modal');
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
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
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