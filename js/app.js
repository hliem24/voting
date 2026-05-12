// ===== APP CONTROLLER =====

const App = (() => {
  let currentRole = 'admin';

  function init() {
    bindNav();
    Utils.startClock();
    Utils.setDefaultTimes();
    showPage('dashboard', document.querySelector('#admin-nav .nav-item'));
  }

  function refresh() {
    Store.invalidateAll();
    const active = document.querySelector('.page.active')?.id?.replace('page-', '');
    if (active) showPage(active, null);
  }

  function bindNav() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', function () {
        const page = this.dataset.page;
        if (page) showPage(page, this);
      });
    });
  }

  function showPage(pageId, navEl) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const page = document.getElementById('page-' + pageId);
    if (page) page.classList.add('active');
    if (navEl) navEl.classList.add('active');
    else {
      const match = document.querySelector(`.nav-item[data-page="${pageId}"]`);
      if (match) match.classList.add('active');
    }

    switch (pageId) {
      case 'dashboard':    Admin.renderDashboard(); break;
      case 'manage-votes': Admin.renderManage();    break;
      case 'results':      Admin.renderResults();   break;
      case 'vote-home':    User.renderVoteHome();   break;
      case 'my-votes':     User.renderMyVotes();    break;
    }
  }

  function setRole(role) {
    currentRole = role;
    document.getElementById('btn-role-admin').classList.toggle('active', role === 'admin');
    document.getElementById('btn-role-user').classList.toggle('active',  role === 'user');
    document.getElementById('admin-nav').style.display = role === 'admin' ? '' : 'none';
    document.getElementById('user-nav').style.display  = role === 'user'  ? '' : 'none';

    const defaultPage = role === 'admin' ? 'dashboard' : 'vote-home';
    const firstNav    = document.querySelector(`#${role}-nav .nav-item`);
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (firstNav) firstNav.classList.add('active');
    showPage(defaultPage, firstNav);
    Utils.showToast(`Chuyển sang chế độ ${role === 'admin' ? 'Admin' : 'User'}`);
  }

  return { init, refresh, showPage, setRole };
})();
