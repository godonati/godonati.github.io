const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? 'Close' : 'Menu';
  });
  navMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    navMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = 'Menu';
  }));
}

const tabs = document.querySelectorAll('[data-tab]');
const panels = document.querySelectorAll('.tab-panel');
tabs.forEach((tab) => tab.addEventListener('click', () => {
  tabs.forEach((item) => { item.classList.remove('is-active'); item.setAttribute('aria-selected', 'false'); });
  panels.forEach((panel) => { panel.hidden = true; });
  tab.classList.add('is-active');
  tab.setAttribute('aria-selected', 'true');
  const panel = document.getElementById(`tab-${tab.dataset.tab}`);
  if (panel) panel.hidden = false;
}));

const form = document.getElementById('contact-form');
if (form) form.addEventListener('submit', () => {
  const status = form.querySelector('.form-status');
  if (status) status.textContent = 'Sending your note…';
});
