// ===== USER MODULE =====
// Dùng contract.vote(_pollId, _option) và contract.hasUserVoted()

const User = (() => {

  async function renderVoteHome() {
    const el = document.getElementById('user-vote-list');
    el.innerHTML = '<div class="loading"><i class="ti ti-loader"></i> Đang tải từ blockchain...</div>';
    try {
      const polls  = await Store.fetchAllPolls();
      const active = polls.filter(p => p.status === 'active');
      if (!active.length) {
        el.innerHTML = '<div class="empty-state"><i class="ti ti-circle-check"></i>Không có cuộc bỏ phiếu nào đang diễn ra</div>';
        return;
      }
      const votedFlags = await Promise.all(active.map(p => Store.fetchVoterInfo(p.id)));
      el.innerHTML = active.map((p, i) => buildVoteCard(p, votedFlags[i])).join('');
    } catch (err) {
      el.innerHTML = `<div class="empty-state"><i class="ti ti-alert-triangle"></i>Lỗi: ${err.message}</div>`;
    }
  }

  function buildVoteCard(p, voterInfo) {
    const voted = voterInfo.hasVoted;
    const total = p.total || 1;
    let optHtml;

    if (voted) {
      optHtml = p.options.map((opt, i) => {
        const pct = Math.round(p.counts[i] / total * 100);
        return `<div class="vote-option voted-done">
          <div class="vote-result-bar">
            <div class="vote-result-label"><span>${opt}</span><span>${pct}%</span></div>
            <div class="vote-result-track">
              <div class="vote-result-fill" style="width:${pct}%"></div>
            </div>
          </div>
        </div>`;
      }).join('');
      optHtml += `<div class="voted-confirm">⛓️ Phiếu của bạn đã được ghi lên blockchain!</div>`;
    } else {
      optHtml = p.options.map((opt, i) =>
        `<div class="vote-option" id="opt-${p.id}-${i}" onclick="User.selectOption(${p.id}, ${i})">
          <div class="opt-radio"></div>
          <span>${opt}</span>
        </div>`
      ).join('');
      optHtml += `<div style="text-align:right;margin-top:12px">
        <button class="btn btn-chain" onclick="User.submitVote(${p.id})">
          <span class="metamask-fox-sm">🦊</span> Ký & Bỏ phiếu
        </button>
      </div>`;
    }

    return `<div class="vote-card">
      <div class="card-row">
        <div>
          <div class="card-title">${p.title}</div>
          <div class="card-sub">${p.description}</div>
        </div>
        ${Utils.getCountdownHTML(p.end)}
      </div>
      <div class="tags">
        ${Utils.getCatTag(p.category)}
        <span class="on-chain-badge"><i class="ti ti-brand-ethereum"></i> #${p.id}</span>
      </div>
      <div class="vote-options">${optHtml}</div>
    </div>`;
  }

  function selectOption(pollId, optIdx) {
    Store.setSelected(pollId, optIdx);
    const poll = Store.getCachedPoll(pollId);
    if (!poll) return;
    poll.options.forEach((_, i) => {
      const el = document.getElementById(`opt-${pollId}-${i}`);
      if (el) el.className = 'vote-option' + (i === optIdx ? ' selected' : '');
    });
  }

  async function submitVote(pollId) {
    const sel = Store.getSelected(pollId);
    if (sel === undefined) {
      Utils.showToast('Vui lòng chọn một phương án!', 'error');
      return;
    }
    const poll        = Store.getCachedPoll(pollId);
    const chosenLabel = poll ? poll.options[sel] : `Lựa chọn ${sel}`;

    TxModal.open(
      'Xác nhận bỏ phiếu',
      `<div style="text-align:center;padding:8px 0">
        <div style="font-size:28px;margin-bottom:12px">🗳️</div>
        <div style="font-size:15px;font-weight:700;margin-bottom:6px">${poll?.title || '#' + pollId}</div>
        <div style="font-size:13px;color:var(--muted);margin-bottom:16px">Bạn đang chọn:</div>
        <div style="background:rgba(246,133,27,0.1);border:1.5px solid var(--chain);
             border-radius:10px;padding:12px 20px;font-weight:700;color:var(--chain);
             font-size:15px">${chosenLabel}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:14px">
          ⚠️ Không thể thay đổi sau khi ký
        </div>
      </div>`,
      `<button class="btn btn-outline" onclick="TxModal.close()">Hủy</button>
       <button class="btn btn-chain" onclick="User._executeCastVote(${pollId}, ${sel})">
         <span class="metamask-fox-sm">🦊</span> Ký & Xác nhận
       </button>`
    );
  }

  async function _executeCastVote(pollId, optIdx) {
    TxModal.close();
    TxOverlay.show('Ghi phiếu lên blockchain...', 'Xác nhận trong MetaMask');
    try {
      const contract = Web3Manager.getContract();
      // ✅ Contract thật dùng vote(_pollId, _option)
      const tx = await contract.vote(pollId, optIdx);
      TxOverlay.setHash(tx.hash);
      await tx.wait();
      Store.invalidatePoll(pollId);
      Store.clearSelected(pollId);
      TxOverlay.hide();
      Utils.showToast('✓ Phiếu đã được ghi lên blockchain!', 'success');
      renderVoteHome();
      renderMyVotes();
    } catch (err) {
      TxOverlay.hide();
      if (err.code === 4001)
        Utils.showToast('Bạn đã hủy giao dịch.', 'error');
      else if ((err.reason || err.message || '').includes('Already voted'))
        Utils.showToast('Bạn đã bỏ phiếu rồi!', 'error');
      else
        Utils.showToast('Lỗi: ' + (err.reason || err.message), 'error');
    }
  }

  async function renderMyVotes() {
    const el = document.getElementById('my-votes-list');
    el.innerHTML = '<div class="loading"><i class="ti ti-loader"></i> Đang tải...</div>';
    try {
      const polls   = await Store.fetchAllPolls();
      const myVotes = [];
      for (const p of polls) {
        const info = await Store.fetchVoterInfo(p.id);
        if (info.hasVoted) myVotes.push(p);
      }
      if (!myVotes.length) {
        el.innerHTML = '<div class="empty-state"><i class="ti ti-ballot"></i>Bạn chưa tham gia bỏ phiếu nào</div>';
        return;
      }
      el.innerHTML = myVotes.map(p => `
        <div class="card">
          <div class="card-title">#${p.id} · ${p.title}</div>
          <div style="margin:8px 0;font-size:13px;color:var(--success)">
            ⛓️ Đã bỏ phiếu thành công
          </div>
          <div class="tags">${Utils.getStatusTag(p.status)}</div>
        </div>`).join('');
    } catch (err) {
      el.innerHTML = `<div class="empty-state"><i class="ti ti-alert-triangle"></i>${err.message}</div>`;
    }
  }

  return { renderVoteHome, renderMyVotes, selectOption, submitVote, _executeCastVote };
})();