const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const siteHeader = document.querySelector('.site-header');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let activeProjectIframe = null;
let savedScrollY = window.scrollY;
let savedHeaderWasHidden = false;
let returnToTopOnClose = false;
let closeProjectTimer = null;
let navTransitionTimer = null;
let projectEntryFrame = null;
let projectCloseInProgress = false;
let isContactCloseTransition = false;
const rootNavCta = window.parent === window ? document.querySelector('.nav-cta') : null;
const defaultNavMarkup = navMenu?.innerHTML || '';
const projectNavTargets = {
  globo: { overview: 'globo-overview', opportunity: 'globo-opportunity', system: 'globo-system', results: 'globo-results' },
  via: { overview: 'via-overview', opportunity: 'via-opportunity', system: 'via-system', results: 'via-results' },
  organizer: { overview: 'organizer-overview', opportunity: 'organizer-opportunity', system: 'organizer-system', results: 'organizer-results' },
};

function projectKeyFromHref(href) {
  if (href.includes('globo')) return 'globo';
  if (href.includes('via-production')) return 'via';
  return 'organizer';
}

function transitionNavMarkup(markup) {
  if (!navMenu) return;
  if (navTransitionTimer) {
    clearTimeout(navTransitionTimer);
    navTransitionTimer = null;
  }
  if (prefersReducedMotion) {
    navMenu.innerHTML = markup;
    navMenu.classList.remove('is-nav-overlap');
    navMenu.style.removeProperty('height');
    return;
  }
  let outgoingMarkup = navMenu.innerHTML;
  if (navMenu.classList.contains('is-nav-overlap')) {
    outgoingMarkup = navMenu.querySelector('.nav-menu-layer-incoming')?.innerHTML || outgoingMarkup;
    navMenu.classList.remove('is-nav-overlap');
    navMenu.innerHTML = outgoingMarkup;
  }
  const outgoing = document.createElement('div');
  outgoing.className = 'nav-menu-layer nav-menu-layer-outgoing';
  outgoing.setAttribute('aria-hidden', 'true');
  outgoing.inert = true;
  outgoing.innerHTML = outgoingMarkup;
  const incoming = document.createElement('div');
  incoming.className = 'nav-menu-layer nav-menu-layer-incoming';
  incoming.innerHTML = markup;
  const stableHeight = navMenu.offsetHeight;
  if (stableHeight) navMenu.style.height = `${stableHeight}px`;
  navMenu.innerHTML = '';
  navMenu.classList.add('is-nav-overlap');
  navMenu.append(outgoing, incoming);
  navTransitionTimer = setTimeout(() => {
    navMenu.innerHTML = markup;
    navMenu.classList.remove('is-nav-overlap');
    navMenu.style.removeProperty('height');
    navTransitionTimer = null;
  }, 420);
}

function cancelNavTransition() {
  if (navTransitionTimer) {
    clearTimeout(navTransitionTimer);
    navTransitionTimer = null;
  }
  if (navMenu?.classList.contains('is-nav-overlap')) {
    navMenu.classList.remove('is-nav-overlap');
    navMenu.innerHTML = defaultNavMarkup;
  }
  navMenu?.style.removeProperty('height');
}

function setProjectContextLinks(href, revealDelay = 0) {
  const targets = projectNavTargets[projectKeyFromHref(href)];
  transitionNavMarkup(Object.entries(targets).map(([label, id]) => `<a class="nav-link project-context-link" href="#${id}" data-project-target="${id}">${label[0].toUpperCase()}${label.slice(1)}</a>`).join('') + '<a class="nav-cta" href="index.html">Rollback</a>', revealDelay);
}

function setRootProjectNavigation(isProjectOpen) {
  if (!rootNavCta) return;

  if (isProjectOpen) {
    if (!rootNavCta.dataset.defaultMarkup) rootNavCta.dataset.defaultMarkup = rootNavCta.innerHTML;
    rootNavCta.innerHTML = 'Rollback <span aria-hidden="true">↗</span>';
    rootNavCta.setAttribute('aria-label', 'Rollback to the main page');
    return;
  }

  rootNavCta.innerHTML = rootNavCta.dataset.defaultMarkup || 'Bug me <span aria-hidden="true">↗</span>';
  rootNavCta.removeAttribute('aria-label');
  if (navMenu?.innerHTML !== defaultNavMarkup) transitionNavMarkup(defaultNavMarkup);
}

rootNavCta?.addEventListener('click', (event) => {
  if (!activeProjectIframe) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (projectCloseInProgress) return;
  closeProjectIframe();
});
if (navMenu) navMenu.addEventListener('click', (event) => {
  const rollback = event.target.closest('.nav-cta');
  const isRollback = rollback?.getAttribute('href') === 'index.html' || rollback?.getAttribute('aria-label')?.startsWith('Rollback');
  if (rollback && isRollback && (activeProjectIframe || projectCloseInProgress)) {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (projectCloseInProgress) return;
    closeProjectIframe();
    return;
  }
  const link = event.target.closest('.project-context-link');
  if (link && activeProjectIframe) {
    event.preventDefault();
    siteHeader?.classList.remove('is-hidden');
    activeProjectIframe.contentWindow?.postMessage({ type: 'project-scroll', targetId: link.dataset.projectTarget }, window.location.origin);
    return;
  }
  const hashLink = event.target.closest('a[href^="#"]');
  if (!hashLink || activeProjectIframe) return;
  const hash = hashLink.getAttribute('href');
  const target = hash === '#top' ? document.body : document.querySelector(hash);
  if (target) {
    event.preventDefault();
    scrollToSection(target, hash);
  }
});

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin || event.data?.type !== 'project-scroll') return;
  const target = document.getElementById(event.data.targetId);
  if (target) scrollToSection(target, `#${event.data.targetId}`);
});

let lastScrollY = window.scrollY;
let isScrollTicking = false;
let isProgrammaticScroll = false;
let programmaticScrollTimer = null;
let programmaticScrollEndHandler = null;

function endProgrammaticScroll() {
  isProgrammaticScroll = false;
  if (programmaticScrollTimer) {
    clearTimeout(programmaticScrollTimer);
    programmaticScrollTimer = null;
  }
  if (programmaticScrollEndHandler) {
    window.removeEventListener('scrollend', programmaticScrollEndHandler);
    programmaticScrollEndHandler = null;
  }
}

['wheel', 'touchmove', 'keydown', 'mousedown'].forEach((eventType) => {
  window.addEventListener(eventType, endProgrammaticScroll, { passive: true });
});

function updateHeaderVisibility() {
  const currentScrollY = window.scrollY;
  const delta = currentScrollY - lastScrollY;
  const isNavOpen = navMenu && navMenu.classList.contains('is-open');

  if (isContactCloseTransition) {
    siteHeader?.classList.remove('is-hidden');
    lastScrollY = currentScrollY;
    isScrollTicking = false;
    return;
  }

  if (isProgrammaticScroll) {
    siteHeader?.classList.remove('is-hidden');
  } else if (currentScrollY <= 40 || isNavOpen) {
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

  isProgrammaticScroll = true;
  siteHeader?.classList.remove('is-hidden');

  if (programmaticScrollTimer) {
    clearTimeout(programmaticScrollTimer);
  }

  const onScrollEnd = () => {
    endProgrammaticScroll();
    programmaticScrollEndHandler = null;
  };

  if ('onscrollend' in window) {
    window.addEventListener('scrollend', onScrollEnd, { once: true });
    programmaticScrollEndHandler = onScrollEnd;
  }

  programmaticScrollTimer = setTimeout(() => {
    endProgrammaticScroll();
    if (programmaticScrollEndHandler === onScrollEnd) programmaticScrollEndHandler = null;
  }, 1000);

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
    if (link.classList.contains('brand')) return;

    const hash = link.getAttribute('href');
    if (!hash) return;

    const target = hash === '#top' ? document.body : document.querySelector(hash);
    if (target) {
      event.preventDefault();
      scrollToSection(target, hash);
    }
  });
});

document.querySelectorAll('.project-home-cta').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (window.parent === window) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.parent.postMessage({ type: 'project-contact-home' }, window.location.origin);
  });
});

document.querySelectorAll('.project-home-top').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (window.parent === window) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.parent.postMessage({ type: 'project-brand-home' }, window.location.origin);
  });
});

const brandLink = document.querySelector('.brand');
if (brandLink) {
  brandLink.addEventListener('click', (event) => {
    const href = brandLink.getAttribute('href');
    if (href && (href === '#top' || href.startsWith('#'))) {
      event.preventDefault();
      if (activeProjectIframe) {
        savedScrollY = 0;
        returnToTopOnClose = true;
        closeProjectIframe();
        return;
      }
      window.history.replaceState(null, '', 'index.html');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

function closeProjectIframe(destinationHash = '') {
  if (projectCloseInProgress || !activeProjectIframe) return;
  projectCloseInProgress = true;

  if (closeProjectTimer) {
    clearTimeout(closeProjectTimer);
    closeProjectTimer = null;
  }
  endProgrammaticScroll();

  const iframe = activeProjectIframe;
  if (projectEntryFrame) {
    window.cancelAnimationFrame(projectEntryFrame);
    projectEntryFrame = null;
  }
  iframe.dataset.closeRequested = 'true';
  const closeDestinationY = returnToTopOnClose ? 0 : savedScrollY;
  const restoreHeaderHidden = returnToTopOnClose ? false : savedHeaderWasHidden;
  if (returnToTopOnClose) window.scrollTo({ top: 0, behavior: 'auto' });
  returnToTopOnClose = false;
  activeProjectIframe = null;
  setRootProjectNavigation(false);

  if (prefersReducedMotion) {
    iframe.remove();
    siteHeader?.classList.remove('is-project-open');
    window.history.pushState(null, '', destinationHash ? `index.html${destinationHash}` : 'index.html');
    window.scrollTo(0, closeDestinationY);
    if (siteHeader) siteHeader.classList.toggle('is-hidden', restoreHeaderHidden);
    savedScrollY = closeDestinationY;
    savedHeaderWasHidden = false;
    document.documentElement.style.overflow = '';
    isContactCloseTransition = false;
    projectCloseInProgress = false;
    return;
  }

  iframe.classList.add('is-closing');
  iframe.classList.remove('is-visible');
  window.history.pushState(null, '', destinationHash ? `index.html${destinationHash}` : 'index.html');

  closeProjectTimer = setTimeout(() => {
    window.scrollTo(0, closeDestinationY);
    if (siteHeader) siteHeader.classList.toggle('is-hidden', restoreHeaderHidden);
    savedScrollY = closeDestinationY;
    savedHeaderWasHidden = false;
    iframe.remove();
    siteHeader?.classList.remove('is-project-open');
    document.documentElement.style.overflow = '';
    isContactCloseTransition = false;
    closeProjectTimer = null;
    projectCloseInProgress = false;
  }, 750);
}

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin || event.data?.type !== 'project-brand-home') return;

  savedScrollY = 0;
  returnToTopOnClose = true;
  window.scrollTo({ top: 0, behavior: 'auto' });
  closeProjectIframe();
});

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin || event.data?.type !== 'project-contact-home' || !activeProjectIframe || event.source !== activeProjectIframe.contentWindow) return;

  const target = document.getElementById('contact');
  const headerOffset = siteHeader?.offsetHeight || 0;
  const targetTop = target
    ? Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset)
    : savedScrollY;

  savedScrollY = targetTop;
  savedHeaderWasHidden = false;
  isContactCloseTransition = true;
  siteHeader?.classList.remove('is-hidden');
  window.scrollTo({ top: targetTop, behavior: 'auto' });
  closeProjectIframe('#contact');
});

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin || event.data?.type !== 'project-rollback' || !activeProjectIframe || event.source !== activeProjectIframe.contentWindow) return;
  closeProjectIframe();
});

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin || event.data?.type !== 'project-scroll') return;
  if (!activeProjectIframe || typeof event.data.targetId !== 'string') return;
  activeProjectIframe.contentWindow?.postMessage(event.data, window.location.origin);
});

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin || event.data?.type !== 'project-navigate') return;
  if (!activeProjectIframe || typeof event.data.href !== 'string' || activeProjectIframe.dataset.isSwapping === 'true') return;

  const iframe = activeProjectIframe;
  const previousHref = iframe.src;
  iframe.dataset.isSwapping = 'true';
  iframe.classList.add('is-closing');
  iframe.classList.remove('is-visible');

  window.setTimeout(() => {
    if (activeProjectIframe !== iframe) return;
    iframe.addEventListener('load', () => {
      try {
        (iframe.contentDocument || iframe.contentWindow.document).documentElement.classList.add('is-project-overlay');
      } catch (e) {
        // Same-origin styling fallback is optional.
      }
      iframe.classList.remove('is-closing');
      iframe.offsetHeight;
      window.requestAnimationFrame(() => {
        iframe.classList.add('is-visible');
        iframe.dataset.isSwapping = 'false';
      });
    }, { once: true });
    iframe.addEventListener('error', () => {
      iframe.src = previousHref;
      iframe.dataset.isSwapping = 'false';
    }, { once: true });
    iframe.src = event.data.href;
    setProjectContextLinks(event.data.href);
    window.history.pushState({ projectPage: event.data.href }, '', event.data.href);
  }, prefersReducedMotion ? 0 : 750);
});

function slideUpProjectIframe(href) {
  closeMenu();

  if (closeProjectTimer) {
    clearTimeout(closeProjectTimer);
    closeProjectTimer = null;
  }
  projectCloseInProgress = false;
  endProgrammaticScroll();
  returnToTopOnClose = false;
  if (!activeProjectIframe) {
    savedScrollY = window.scrollY;
    savedHeaderWasHidden = siteHeader?.classList.contains('is-hidden') || false;
  }

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
    if (activeProjectIframe !== iframe || iframe.dataset.closeRequested === 'true') return;
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.documentElement.classList.add('is-project-overlay');
      iframeDoc.querySelectorAll('a').forEach((link) => {
        const linkHref = link.getAttribute('href');
        if (!linkHref) return;

        if (link.classList.contains('project-home-cta') || link.classList.contains('project-home-top')) return;

        if (link.classList.contains('brand')) {
          link.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            window.parent.postMessage({ type: 'project-brand-home' }, window.location.origin);
          });
          return;
        }

        if (linkHref.includes('index.html') || linkHref.startsWith('#')) {
          link.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
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
  setRootProjectNavigation(true);
  setProjectContextLinks(href);
  iframe.offsetHeight; // force reflow
  projectEntryFrame = window.requestAnimationFrame(() => {
    projectEntryFrame = null;
    if (activeProjectIframe !== iframe || iframe.dataset.closeRequested === 'true') return;
    iframe.classList.add('is-visible');
    siteHeader?.classList.remove('is-hidden');
    siteHeader?.classList.add('is-project-open');
  });

  window.history.pushState({ projectPage: href }, '', href);
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href]');
  if (!link) return;
  if (link.classList.contains('nav-cta')) return;

  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http') || href.startsWith('tel:')) return;

  if (href.endsWith('.html') || href.includes('.html#')) {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (window.parent !== window) {
      event.stopPropagation();
      window.top.postMessage(
        { type: href.includes('index.html') && !link.classList.contains('project-home-cta') ? 'project-rollback' : 'project-navigate', href },
        window.location.origin,
      );
      return;
    }
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
  const status = form.querySelector('.form-status');
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (form.dataset.submitting === 'true') return;

    form.dataset.submitting = 'true';
    submitButton?.setAttribute('aria-disabled', 'true');
    if (submitButton) submitButton.disabled = true;
    if (status) {
      status.classList.remove('is-success', 'is-error');
      status.textContent = 'Sending your note…';
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error('Form submission failed');

      form.reset();
      if (status) {
        status.classList.add('is-success');
        status.textContent = 'Thank you—your message was sent successfully. We’ll get back to you as soon as possible.';
      }
    } catch (error) {
      if (status) {
        status.classList.add('is-error');
        status.textContent = 'Something went wrong while sending your message. Please try again.';
      }
    } finally {
      form.dataset.submitting = 'false';
      submitButton?.removeAttribute('aria-disabled');
      if (submitButton) submitButton.disabled = false;
    }
  });
}

const lightboxImages = [...document.querySelectorAll('img')].filter((image) => {
  const source = image.currentSrc || image.src || '';
  const isGif = /\.gif(?:$|[?#])/i.test(source);
  const isLogo = /logo/i.test(image.alt || '') || image.closest('.brand, .brand-orbit-logo');
  const isInteractive = image.closest('a, button, [role="button"]');
  return !isGif && !isLogo && !isInteractive;
});

if (lightboxImages.length) {
  const lightbox = document.createElement('div');
  lightbox.className = 'image-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.setAttribute('aria-label', 'Enlarged image');
  lightbox.innerHTML = '<button class="image-lightbox-close" type="button" aria-label="Close enlarged image">×</button><figure class="image-lightbox-frame"><img class="image-lightbox-image" alt=""><figcaption class="image-lightbox-caption"></figcaption></figure>';
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector('.image-lightbox-image');
  const lightboxCaption = lightbox.querySelector('.image-lightbox-caption');
  const closeButton = lightbox.querySelector('.image-lightbox-close');
  let lastFocusedImage = null;

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-lightbox-open');
    if (lastFocusedImage) lastFocusedImage.focus();
    lastFocusedImage = null;
  };

  const openLightbox = (image) => {
    lastFocusedImage = image;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = image.alt;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-lightbox-open');
    lightbox.classList.add('is-open');
    closeButton.focus();
  };

  lightboxImages.forEach((image) => {
    image.classList.add('lightbox-trigger');
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `Enlarge image: ${image.alt || 'image'}`);
    image.addEventListener('click', () => openLightbox(image));
    image.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(image);
      }
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
    if (event.key === 'Tab' && lightbox.classList.contains('is-open')) {
      event.preventDefault();
      closeButton.focus();
    }
  });
}

document.querySelectorAll('.nav-cta').forEach((button) => {
  if (window.location.pathname.endsWith('/index.html') || window.location.pathname === '/') return;
  button.setAttribute('aria-label', 'Rollback to the main page');
  button.addEventListener('click', (event) => {
    if (window.parent !== window) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.top.postMessage({ type: 'project-rollback' }, window.location.origin);
      return;
    }
    event.preventDefault();
    window.location.assign('index.html');
  });
});
