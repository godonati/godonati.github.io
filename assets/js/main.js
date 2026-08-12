const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const siteHeader = document.querySelector('.site-header');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let activeProjectIframe = null;
let lastScrollY = window.scrollY;
let isScrollTicking = false;

function updateHeaderVisibility() {
  const currentScrollY = window.scrollY;
  const delta = currentScrollY - lastScrollY;
  const isNavOpen = navMenu && navMenu.classList.contains('is-open');

  if (currentScrollY <= 40 || isNavOpen) {
    siteHeader?.classList.remove('is-hidden');
  } else if (delta > 18 && currentScrollY > 180) {
    siteHeader?.classList.add('is-hidden');
  } else if (delta < -12) {
    siteHeader?.classList.remove('is-hidden');
  }

  lastScrollY = currentScrollY;
  isScrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (!isScrollTicking) {
    window.requestAnimationFrame(updateHeaderVisibility);
    isScrollTicking = true;
  }
}, { passive: true });

function closeMenu() {
  if (!menuToggle || !navMenu) return;
  navMenu.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.textContent = 'Menu';
}

function scrollToSection(target, hash) {
  closeMenu();
  if (!target) return;

  const header = document.querySelector('.site-header');
  const headerOffset = header ? header.offsetHeight : 0;
  const targetTop = target === document.body || target.id === 'top'
    ? 0
    : Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);

  window.scrollTo({
    top: targetTop,
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  });

  if (hash) {
    window.history.pushState(null, '', hash);
  }
}

if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? 'Close' : 'Menu';
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const hash = link.getAttribute('href');
    if (!hash) return;

    const target = hash === '#top' ? document.body : document.querySelector(hash);
    if (target) {
      event.preventDefault();
      scrollToSection(target, hash);
    }
  });
});

const brandLink = document.querySelector('.brand');
if (brandLink) {
  brandLink.addEventListener('click', (event) => {
    const href = brandLink.getAttribute('href');
    if (href && (href === '#top' || href.startsWith('#'))) {
      event.preventDefault();
      scrollToSection(document.body, '#top');
    }
  });
}

function closeProjectIframe() {
  if (!activeProjectIframe) return;

  const iframe = activeProjectIframe;
  activeProjectIframe = null;

  document.documentElement.style.overflow = '';
  window.scrollTo(0, savedScrollY);

  if (prefersReducedMotion) {
    iframe.remove();
    window.history.pushState(null, '', 'index.html');
    return;
  }

  iframe.classList.remove('is-visible');
  window.history.pushState(null, '', 'index.html');

  setTimeout(() => {
    iframe.remove();
    window.scrollTo(0, savedScrollY);
  }, 600);
}

function slideUpProjectIframe(href) {
  closeMenu();

  savedScrollY = window.scrollY;

  if (activeProjectIframe) {
    activeProjectIframe.remove();
    activeProjectIframe = null;
  }

  document.documentElement.style.overflow = 'hidden';

  const iframe = document.createElement('iframe');
  iframe.className = 'project-slide-iframe';
  iframe.src = href;
  iframe.setAttribute('title', 'Case study page');

  iframe.onload = () => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.querySelectorAll('a').forEach((link) => {
        const linkHref = link.getAttribute('href');
        if (!linkHref) return;

        if (linkHref.includes('index.html') || linkHref.startsWith('#')) {
          link.addEventListener('click', (event) => {
            event.preventDefault();
            closeProjectIframe();
          });
        }
      });
    } catch (e) {
      // Cross-origin fallback
    }
  };

  document.body.appendChild(iframe);
  activeProjectIframe = iframe;

  iframe.offsetHeight; // force reflow
  window.requestAnimationFrame(() => {
    iframe.classList.add('is-visible');
  });

  window.history.pushState({ projectPage: href }, '', href);
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http') || href.startsWith('tel:')) return;

  if (href.endsWith('.html') || href.includes('.html#')) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    slideUpProjectIframe(href);
  }
});

window.addEventListener('popstate', () => {
  if (activeProjectIframe) {
    closeProjectIframe('');
  }
});

const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', () => {
    const status = form.querySelector('.form-status');
    if (status) status.textContent = 'Sending your note…';
  });
}
