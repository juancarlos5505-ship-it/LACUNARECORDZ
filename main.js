(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const iframe = document.getElementById('registration-frame');
  const warning = document.getElementById('setup-warning');
  const openForm = document.getElementById('open-form');
  const configured = String(window.LACUNA_CONFIG?.appScriptUrl || '').trim();
  const valid = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec(?:\?.*)?$/.test(configured);

  if (valid && iframe && openForm) {
    const endpoint = new URL(configured);
    const query = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach((key) => {
      const value = query.get(key);
      if (value) endpoint.searchParams.set(key, value.slice(0, 100));
    });
    iframe.src = endpoint.href;
    openForm.href = endpoint.href;
  } else if (warning) {
    warning.hidden = false;
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const ref = link.getAttribute('href');
      if (!ref || ref === '#') return;
      const destination = document.getElementById(ref.slice(1));
      if (!destination) return;
      event.preventDefault();
      destination.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'start' });
      history.replaceState(null, '', ref);
    });
  });

  const progress = document.getElementById('scroll-progress');
  let pending = false;
  const measureProgress = () => {
    pending = false;
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    progress.style.width = `${(ratio * 100).toFixed(2)}%`;
  };
  window.addEventListener('scroll', () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(measureProgress);
  }, { passive: true });
  window.addEventListener('resize', measureProgress, { passive: true });
  measureProgress();

  const toReveal = [...document.querySelectorAll('.reveal-item')];
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.11, rootMargin: '0px 0px 45px 0px' });
    toReveal.forEach((element) => { element.classList.add('will-reveal'); observer.observe(element); });
  }

  const video = document.getElementById('scene-video');
  if (video) {
    if (reduceMotion.matches) {
      video.pause();
      video.removeAttribute('autoplay');
    } else {
      video.muted = true;
      const tryPlay = () => { const promise = video.play(); if (promise?.catch) promise.catch(() => {}); };
      if ('IntersectionObserver' in window) {
        const visibility = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !document.hidden) tryPlay();
            else video.pause();
          });
        }, { threshold: 0.08 });
        visibility.observe(video);
      } else tryPlay();
      document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); else tryPlay(); });
    }
    video.addEventListener('error', () => video.setAttribute('aria-label', 'Imagen de la entrada de La Casa Abandonada'));
  }
})();
