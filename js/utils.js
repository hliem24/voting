// ===== UTILS =====

const Utils = (() => {
  function formatDate(d) {
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  function getCountdownHTML(end) {
    const diff = end - new Date();
    if (diff <= 0) return '<span class="countdown red">Đã kết thúc</span>';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const cls = h < 1 ? 'red' : h < 6 ? 'amber' : 'green';
    return `<span class="countdown ${cls}">${h}g ${m}p còn lại</span>`;
  }

  function getStatusTag(status) {
    const map = {
      active:   '<span class="tag tag-green">Đang diễn ra</span>',
      ended:    '<span class="tag tag-gray">Đã kết thúc</span>',
      upcoming: '<span class="tag tag-amber">Sắp diễn ra</span>',
    };
    return map[status] || '';
  }

  const catLabels = { product: ['tag-blue','Sản phẩm'], event: ['tag-amber','Sự kiện'], hr: ['tag-green','Nhân sự'], general: ['tag-gray','Tổng hợp'] };
  function getCatTag(cat) {
    const [cls, label] = catLabels[cat] || catLabels.general;
    return `<span class="tag ${cls}">${label}</span>`;
  }

  function shortAddr(addr) {
    return addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : '—';
  }

  // Toast
  let toastTimer;
  function showToast(msg, type = 'default') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show' + (type !== 'default' ? ' ' + type : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
  }

  // Clock
  function startClock() {
    const tick = () => {
      const el = document.getElementById('clock');
      if (el) el.textContent = new Date().toLocaleString('vi-VN');
    };
    tick();
    setInterval(tick, 1000);
  }

  // Set default datetime inputs
  function setDefaultTimes() {
    const now = new Date();
    const toLocal = d => new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const s = document.getElementById('cv-start');
    const e = document.getElementById('cv-end');
    if (s) s.value = toLocal(now);
    if (e) e.value = toLocal(new Date(now.getTime() + 86400000));
  }

  return { formatDate, getCountdownHTML, getStatusTag, getCatTag, shortAddr, showToast, startClock, setDefaultTimes };
})();

// ===== MODAL =====
const TxModal = (() => {
  function open(title, body, footer = '') {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML    = body;
    document.getElementById('modal-footer').innerHTML  = footer;
    document.getElementById('modal-bg').classList.add('open');
  }
  function close() { document.getElementById('modal-bg').classList.remove('open'); }
  return { open, close };
})();

// ===== TX OVERLAY =====
const TxOverlay = (() => {
  function show(title = 'Đang gửi giao dịch...', sub = 'Vui lòng xác nhận trong MetaMask') {
    document.getElementById('tx-title').textContent = title;
    document.getElementById('tx-sub').textContent   = sub;
    document.getElementById('tx-hash').style.display = 'none';
    document.getElementById('tx-overlay').style.display = 'flex';
  }

  function setHash(txHash) {
    const el = document.getElementById('tx-hash');
    el.style.display = 'block';
    const url = Web3Manager.getExplorerUrl('tx', txHash);
    el.innerHTML = url
      ? `TX: <a class="tx-link" href="${url}" target="_blank">${txHash.slice(0,18)}...</a>`
      : `TX: ${txHash.slice(0, 18)}...`;
    document.getElementById('tx-title').textContent = 'Giao dịch đang xử lý...';
    document.getElementById('tx-sub').textContent   = 'Chờ blockchain xác nhận...';
  }

  function hide() { document.getElementById('tx-overlay').style.display = 'none'; }

  return { show, setHash, hide };
})();
