(() => {
  if (window.parent !== window || !document.documentElement) return;

  const state = window.history.state;
  if (!state?.projectPage) return;

  const currentPage = window.location.pathname.split('/').pop();
  const projectPage = String(state.projectPage).split('#')[0].split('?')[0];
  if (currentPage !== projectPage) return;

  window.sessionStorage.setItem('portfolio-project-refresh', JSON.stringify({
    projectPage: state.projectPage,
    mainScrollY: Number(state.mainScrollY) || 0,
    projectScrollY: Number(state.projectScrollY) || 0,
  }));
  window.location.replace('index.html?restore-project=1');
})();
