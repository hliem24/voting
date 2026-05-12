// ===== STORE =====
// Khớp hoàn toàn với VoteConnect.sol thật:
//   getPoll()      → (id, title, desc, category, options[], votes[], startTime, endTime, creator, active)
//   getAllPollIds() → uint[]
//   hasUserVoted() → bool
//   vote()         → bỏ phiếu
//   endPoll()      → kết thúc

const Store = (() => {
  let pollsCache   = {};
  let selectedOpts = {};

  // Parse kết quả getPoll()
  // Thứ tự: id, title, desc, category, options[], votes[], startTime, endTime, creator, active
  function parsePoll(raw) {
    const id          = raw[0].toNumber ? raw[0].toNumber() : Number(raw[0]);
    const title       = raw[1];
    const description = raw[2];
    const category    = raw[3];
    const options     = Array.from(raw[4]);
    const counts      = Array.from(raw[5]).map(c => c.toNumber ? c.toNumber() : Number(c));
    const startTime   = raw[6].toNumber ? raw[6].toNumber() : Number(raw[6]);
    const endTime     = raw[7].toNumber ? raw[7].toNumber() : Number(raw[7]);
    const creator     = raw[8];
    const active      = raw[9];

    const start = new Date(startTime * 1000);
    const end   = new Date(endTime   * 1000);
    const now   = new Date();
    const total = counts.reduce((a, b) => a + b, 0);

    let status;
    if (!active || now > end) status = 'ended';
    else if (now < start)     status = 'upcoming';
    else                      status = 'active';

    return { id, title, description, category, options, counts, startTime, endTime, start, end, creator, active, total, status };
  }

  async function fetchPoll(pollId) {
    const contract = Web3Manager.getContract();
    const raw  = await contract.getPoll(pollId);
    const poll = parsePoll(raw);
    pollsCache[pollId] = poll;
    return poll;
  }

  // Dùng getAllPollIds() — có trong contract thật
  async function fetchAllPolls() {
    const contract = Web3Manager.getContract();
    const ids  = await contract.getAllPollIds();
    if (!ids || ids.length === 0) return [];
    const polls = [];
    for (const idRaw of ids) {
      const id = idRaw.toNumber ? idRaw.toNumber() : Number(idRaw);
      try {
        polls.push(await fetchPoll(id));
      } catch (e) {
        console.warn('fetchPoll #' + id, e.message);
      }
    }
    return polls;
  }

  // Dùng hasUserVoted() — có trong contract thật
  async function fetchVoterInfo(pollId) {
    const contract = Web3Manager.getContract();
    const account  = Web3Manager.getAccount();
    try {
      const voted = await contract.hasUserVoted(pollId, account);
      return { hasVoted: voted, choice: undefined };
    } catch (e) {
      console.warn('hasUserVoted error:', e.message);
      return { hasVoted: false, choice: undefined };
    }
  }

  function invalidatePoll(id)  { delete pollsCache[id]; }
  function invalidateAll()     { pollsCache = {}; }
  const getCachedPoll = (id)   => pollsCache[id];
  const getAllCached  = ()      => Object.values(pollsCache);
  const getSelected  = (id)    => selectedOpts[id];
  const setSelected  = (id, i) => { selectedOpts[id] = i; };
  const clearSelected= (id)    => { delete selectedOpts[id]; };

  async function getStats() {
    const polls  = await fetchAllPolls();
    const active = polls.filter(p => p.status === 'active').length;
    const total  = polls.reduce((s, p) => s + p.total, 0);
    return { total: polls.length, active, totalVotes: total };
  }

  return {
    fetchPoll, fetchAllPolls, fetchVoterInfo,
    invalidatePoll, invalidateAll,
    getCachedPoll, getAllCached,
    getSelected, setSelected, clearSelected,
    getStats
  };
})();