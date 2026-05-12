// ===== ADMIN MODULE =====
// Dùng getAllPollIds(), getPoll(), createPoll(), endPoll()

const Admin = (() => {

  async function renderDashboard() {
    try {
      const s = await Store.getStats();
      document.getElementById('s-total').textContent  = s.total;
      document.getElementById('s-active').textContent = s.active;
      document.getElementById('s-votes').textContent  = s.totalVotes;

      const polls = Store.getAllCached();
      const el    = document.getElementById('recent-list');
      if (!polls.length) {
        el.innerHTML = '<div class="empty-state"><i class="ti ti-layout-dashboard"></i>Chưa có cuộc bỏ phiếu nào</div>';
        return;
      }
      el.innerHTML = polls.slice(-3).reverse().map(p => `
        <div class="card">
          <div class="card-row">
            <div>
              <div class="card-title">${p.title}</div>
              <div class="card-sub">#${p.id} · ${p.total} lượt vote</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              ${Utils.getStatusTag(p.status)} ${Utils.getCountdownHTML(p.end)}
            </div>
          </div>
          <div class="tags">
            ${Utils.getCatTag(p.category)}
            <span class="on-chain-badge"><i class="ti ti-brand-ethereum"></i> on-chain</span>
          </div>
          <div class="progress-wrap">
            <div class="progress-label"><span>Tổng phiếu</span><span>${p.total}</span></div>
            <div class="progress-bar">
              <div class="progress-fill pb-chain"
                style="width:${Math.min(100, Math.round(p.total / 10 * 100))}%"></div>
            </div>
          </div>
        </div>`).join('');
    } catch (err) {
      document.getElementById('recent-list').innerHTML =
        `<div class="empty-state"><i class="ti ti-alert-triangle"></i>Lỗi: ${err.message}</div>`;
    }
  }

  async function renderManage() {
    const el = document.getElementById('manage-list');
    el.innerHTML = '<div class="loading"><i class="ti ti-loader"></i> Đang tải...</div>';
    try {
      const polls = await Store.fetchAllPolls();
      if (!polls.length) {
        el.innerHTML = '<div class="empty-state"><i class="ti ti-list-check"></i>Chưa có cuộc bỏ phiếu nào</div>';
        return;
      }
      const account = Web3Manager.getAccount().toLowerCase();
      el.innerHTML = polls.map(p => `
        <div class="card">
          <div class="card-row">
            <div style="flex:1">
              <div class="card-title">#${p.id} · ${p.title}
                <span style="font-size:11px;color:var(--muted);font-weight:400;margin-left:6px">
                  by ${Utils.shortAddr(p.creator)}
                </span>
              </div>
              <div class="card-sub">${Utils.formatDate(p.start)} – ${Utils.formatDate(p.end)}</div>
              <div class="tags">
                ${Utils.getStatusTag(p.status)}
                ${Utils.getCatTag(p.category)}
                ${Utils.getCountdownHTML(p.end)}
              </div>
            </div>
            <div class="actions">
              <button class="btn btn-outline btn-sm" onclick="Admin.showDetail(${p.id})">
                <i class="ti ti-eye"></i>
              </button>
              ${p.active && p.creator.toLowerCase() === account
                ? `<button class="btn btn-danger btn-sm" onclick="Admin.confirmEnd(${p.id})">
                     <i class="ti ti-player-stop"></i>
                   </button>`
                : ''}
            </div>
          </div>
        </div>`).join('');
    } catch (err) {
      el.innerHTML = `<div class="empty-state"><i class="ti ti-alert-triangle"></i>${err.message}</div>`;
    }
  }

  async function renderResults() {
    const el = document.getElementById('results-list');
    el.innerHTML = '<div class="loading"><i class="ti ti-loader"></i> Đang tải...</div>';
    try {
      const polls = await Store.fetchAllPolls();
      if (!polls.length) {
        el.innerHTML = '<div class="empty-state"><i class="ti ti-chart-bar"></i>Chưa có dữ liệu</div>';
        return;
      }
      el.innerHTML = polls.map(p => {
        const total = p.total || 1;
        const bars  = p.options.map((opt, i) => {
          const pct = Math.round(p.counts[i] / total * 100);
          const cls = i === 0 ? 'pb-chain' : i === 1 ? 'pb-blue' : 'pb-green';
          return `<div style="margin-bottom:10px">
            <div class="progress-label">
              <span>${opt}</span>
              <span>${p.counts[i]} phiếu (${pct}%)</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill ${cls}" style="width:${pct}%"></div>
            </div>
          </div>`;
        }).join('');
        return `<div class="card">
          <div class="card-title">#${p.id} · ${p.title}</div>
          <div class="card-sub" style="margin-bottom:12px">
            ${Utils.getStatusTag(p.status)} · ${p.total} tổng lượt vote
          </div>
          ${bars}
        </div>`;
      }).join('');
    } catch (err) {
      el.innerHTML = `<div class="empty-state"><i class="ti ti-alert-triangle"></i>${err.message}</div>`;
    }
  }

  async function showDetail(id) {
    try {
      const p     = await Store.fetchPoll(id);
      const total = p.total || 1;
      const bars  = p.options.map((opt, i) => {
        const pct = Math.round(p.counts[i] / total * 100);
        return `<div style="margin-bottom:10px">
          <div class="progress-label"><span>${opt}</span><span>${p.counts[i]} phiếu (${pct}%)</span></div>
          <div class="progress-bar">
            <div class="progress-fill pb-chain" style="width:${pct}%"></div>
          </div>
        </div>`;
      }).join('');
      TxModal.open(
        `#${p.id} · ${p.title}`,
        `<div style="color:var(--muted);font-size:13px;margin-bottom:12px">${p.description || '—'}</div>
         <div class="tags" style="margin-bottom:12px">
           ${Utils.getStatusTag(p.status)} ${Utils.getCatTag(p.category)}
         </div>
         <div style="font-size:12px;color:var(--muted);margin-bottom:14px">
           ${Utils.formatDate(p.start)} – ${Utils.formatDate(p.end)}
         </div>
         ${bars}
         <div style="font-size:12px;color:var(--muted);margin-top:6px">
           Tổng: ${p.total} lượt vote
         </div>`,
        `<button class="btn btn-outline" onclick="TxModal.close()">Đóng</button>`
      );
    } catch (err) {
      Utils.showToast('Lỗi: ' + err.message, 'error');
    }
  }

  async function confirmEnd(id) {
    TxModal.open(
      'Kết thúc bỏ phiếu sớm',
      `<p>Kết thúc poll #${id}? Hành động này không thể hoàn tác.</p>
       <div class="gas-box" style="margin-top:12px">
         <i class="ti ti-gas-station"></i> Phí gas sẽ được tính
       </div>`,
      `<button class="btn btn-outline" onclick="TxModal.close()">Hủy</button>
       <button class="btn btn-danger" onclick="Admin.endPoll(${id})">
         <span class="metamask-fox-sm">🦊</span> Ký & Kết thúc
       </button>`
    );
  }

  async function endPoll(id) {
    TxModal.close();
    TxOverlay.show('Kết thúc cuộc bỏ phiếu...', 'Xác nhận trong MetaMask');
    try {
      const contract = Web3Manager.getContract();
      const tx = await contract.endPoll(id);
      TxOverlay.setHash(tx.hash);
      await tx.wait();
      Store.invalidatePoll(id);
      TxOverlay.hide();
      Utils.showToast('✓ Đã kết thúc poll #' + id, 'success');
      renderManage();
      renderDashboard();
    } catch (err) {
      TxOverlay.hide();
      Utils.showToast('Lỗi: ' + (err.reason || err.message), 'error');
    }
  }

  return { renderDashboard, renderManage, renderResults, showDetail, confirmEnd, endPoll };
})();

// ===== FORM MODULE =====
const Form = (() => {

  async function estimateGas() {
    const title = document.getElementById('cv-title').value.trim();
    const opts  = [...document.querySelectorAll('#options-list .opt-row input')]
                    .map(i => i.value.trim()).filter(Boolean);
    if (!title || opts.length < 2) {
      Utils.showToast('Điền thông tin để ước tính gas', 'error'); return;
    }
    try {
      const contract = Web3Manager.getContract();
      const now = Math.floor(Date.now() / 1000);
      const gas = await contract.estimateGas.createPoll(
        title, '', 'general', opts, now, now + 86400
      );
      const gasPrice = await Web3Manager.getProvider().getGasPrice();
      const costEth  = parseFloat(ethers.utils.formatEther(gas.mul(gasPrice))).toFixed(6);
      document.getElementById('gas-estimate').textContent = `~${costEth} ETH`;
      document.getElementById('gas-box').style.display = 'flex';
      Utils.showToast(`Phí gas ước tính: ${costEth} ETH`);
    } catch (err) {
      Utils.showToast('Không thể ước tính: ' + err.message, 'error');
    }
  }

  async function createPoll() {
    const title  = document.getElementById('cv-title').value.trim();
    const desc   = document.getElementById('cv-desc').value.trim();
    const cat    = document.getElementById('cv-cat').value;
    const startV = document.getElementById('cv-start').value;
    const endV   = document.getElementById('cv-end').value;

    if (!title)           return Utils.showToast('Vui lòng nhập chủ đề!', 'error');
    if (!startV || !endV) return Utils.showToast('Vui lòng chọn thời gian!', 'error');

    const startTs = Math.floor(new Date(startV).getTime() / 1000);
    const endTs   = Math.floor(new Date(endV).getTime()   / 1000);
    if (endTs <= startTs) return Utils.showToast('Thời gian kết thúc phải sau bắt đầu!', 'error');

    const opts = [...document.querySelectorAll('#options-list .opt-row input')]
                   .map(i => i.value.trim()).filter(Boolean);
    if (opts.length < 2) return Utils.showToast('Cần ít nhất 2 lựa chọn!', 'error');

    TxOverlay.show('Tạo cuộc bỏ phiếu on-chain...', 'Xác nhận trong MetaMask');
    try {
      const contract = Web3Manager.getContract();
      const tx = await contract.createPoll(title, desc, cat, opts, startTs, endTs);
      TxOverlay.setHash(tx.hash);
      await tx.wait();
      Store.invalidateAll();
      clear();
      TxOverlay.hide();
      Utils.showToast('✓ Tạo cuộc bỏ phiếu thành công!', 'success');
      Admin.renderDashboard();
    } catch (err) {
      TxOverlay.hide();
      if (err.code === 4001) Utils.showToast('Bạn đã hủy giao dịch.', 'error');
      else Utils.showToast('Lỗi: ' + (err.reason || err.message), 'error');
    }
  }

  function addOpt() {
    const list = document.getElementById('options-list');
    const n    = list.children.length + 1;
    const row  = document.createElement('div');
    row.className = 'opt-row';
    row.innerHTML = `<input class="form-input" placeholder="Lựa chọn ${n}">
      <button class="btn-icon" onclick="Form.removeOpt(this)"><i class="ti ti-x"></i></button>`;
    list.appendChild(row);
  }

  function removeOpt(btn) {
    if (document.querySelectorAll('#options-list .opt-row').length <= 2) {
      Utils.showToast('Cần ít nhất 2 lựa chọn'); return;
    }
    btn.closest('.opt-row').remove();
  }

  function clear() {
    ['cv-title', 'cv-desc'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('gas-box').style.display = 'none';
    Utils.setDefaultTimes();
    document.getElementById('options-list').innerHTML = `
      <div class="opt-row">
        <input class="form-input" placeholder="Lựa chọn 1">
        <button class="btn-icon" onclick="Form.removeOpt(this)"><i class="ti ti-x"></i></button>
      </div>
      <div class="opt-row">
        <input class="form-input" placeholder="Lựa chọn 2">
        <button class="btn-icon" onclick="Form.removeOpt(this)"><i class="ti ti-x"></i></button>
      </div>`;
  }

  return { estimateGas, createPoll, addOpt, removeOpt, clear };
})();