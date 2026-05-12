// ===== WEB3 MANAGER =====
// Quản lý kết nối MetaMask + ethers.js
// ✅ Fix: tự động chuyển sang Hardhat Local để tránh cảnh báo Blockaid

const Web3Manager = (() => {
  let provider = null;
  let signer   = null;
  let contract = null;
  let account  = null;
  let chainId  = null;

  // --- Thêm mạng Hardhat Local vào MetaMask ---
  async function addHardhatNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId:           '0x7A69',        // 31337 hex
          chainName:         'Hardhat Local',
          nativeCurrency:    { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls:           ['http://127.0.0.1:8545'],
          blockExplorerUrls: []
        }]
      });
    } catch (e) {
      console.warn('[Web3] addHardhatNetwork:', e.message);
    }
  }

  // --- Chuyển MetaMask sang Hardhat Local (chainId 31337) ---
  async function switchToHardhat() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }]
      });
    } catch (err) {
      if (err.code === 4902) {
        // Mạng chưa có → thêm vào MetaMask trước
        await addHardhatNetwork();
      } else {
        throw err;
      }
    }
  }

  // --- Kết nối MetaMask ---
  async function connect() {
    const statusEl = document.getElementById('connect-status');

    if (typeof window.ethereum === 'undefined') {
      statusEl.className = 'connect-status error';
      statusEl.innerHTML = '❌ MetaMask chưa cài. <a href="https://metamask.io" target="_blank" style="color:#F6851B">Tải tại đây ↗</a>';
      return;
    }

    try {
      statusEl.className = 'connect-status';
      statusEl.textContent = '🔄 Đang kết nối...';

      // Yêu cầu quyền truy cập tài khoản
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Kiểm tra mạng hiện tại
      provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      chainId = network.chainId;

      // ✅ KEY FIX: Nếu đang ở Mainnet (chainId=1) → chuyển sang Hardhat Local
      // Đây là nguyên nhân gây ra cảnh báo "deceptive request" của Blockaid
      if (chainId === 1) {
        statusEl.textContent = '🔄 Đang chuyển sang mạng Hardhat Local...';
        await switchToHardhat();
        // Reload provider sau khi đổi mạng
        provider = new ethers.providers.Web3Provider(window.ethereum);
        const newNet = await provider.getNetwork();
        chainId = newNet.chainId;
      }

      signer  = provider.getSigner();
      account = await signer.getAddress();

      // Khởi tạo contract instance
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Lắng nghe sự kiện thay đổi account / mạng
      window.ethereum.on('accountsChanged', handleAccountChange);
      window.ethereum.on('chainChanged', handleChainChange);

      // Hiển thị màn hình app
      document.getElementById('screen-connect').style.display    = 'none';
      document.getElementById('screen-app').style.display        = 'flex';
      document.getElementById('screen-app').style.flexDirection  = 'column';

      await updateWalletUI();
      App.init();

    } catch (err) {
      statusEl.className = 'connect-status error';
      if (err.code === 4001) {
        statusEl.textContent = '⚠️ Bạn đã từ chối kết nối.';
      } else {
        statusEl.textContent = '❌ Lỗi: ' + (err.message || err);
      }
    }
  }

  // --- Ngắt kết nối ---
  function disconnect() {
    provider = signer = contract = account = chainId = null;
    document.getElementById('screen-app').style.display     = 'none';
    document.getElementById('screen-connect').style.display = 'flex';
    document.getElementById('connect-status').textContent   = 'Đã ngắt kết nối.';
    Utils.showToast('Đã ngắt kết nối ví', 'info');
  }

  // --- Cập nhật UI wallet info ---
  async function updateWalletUI() {
    if (!account) return;

    const shortAddr = account.slice(0, 6) + '...' + account.slice(-4);
    document.getElementById('wallet-addr').textContent       = shortAddr;
    document.getElementById('wb-addr-display').textContent   = account;

    const balance = await provider.getBalance(account);
    const ethBal  = parseFloat(ethers.utils.formatEther(balance)).toFixed(4);
    document.getElementById('wallet-balance').textContent      = ethBal + ' ETH';
    document.getElementById('wb-balance-display').textContent  = ethBal + ' ETH';

    const netName = NETWORK_NAMES[chainId] || `Chain ${chainId}`;
    document.getElementById('network-badge').textContent = netName;
    document.getElementById('network-label').textContent  = netName;

    document.getElementById('cb-network').textContent  = netName;
    document.getElementById('cb-contract').textContent =
      CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000'
        ? 'Chưa deploy'
        : CONTRACT_ADDRESS.slice(0, 6) + '...' + CONTRACT_ADDRESS.slice(-4);

    const block = await provider.getBlockNumber();
    document.getElementById('cb-block').textContent = '#' + block.toLocaleString();
  }

  // --- Xử lý đổi tài khoản ---
  async function handleAccountChange(accounts) {
    if (accounts.length === 0) { disconnect(); return; }
    account  = accounts[0];
    signer   = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    await updateWalletUI();
    App.refresh();
    Utils.showToast('Đã chuyển tài khoản: ' + account.slice(0, 6) + '...', 'info');
  }

  // --- Xử lý đổi mạng ---
  function handleChainChange() {
    window.location.reload();
  }

  // --- Getters ---
  const getProvider = () => provider;
  const getSigner   = () => signer;
  const getContract = () => contract;
  const getAccount  = () => account;
  const getChainId  = () => chainId;

  function getExplorerUrl(type, hash) {
    const base = EXPLORERS[chainId];
    if (!base) return null;
    return `${base}/${type}/${hash}`;
  }

  return {
    connect, disconnect, updateWalletUI,
    getProvider, getSigner, getContract, getAccount, getChainId, getExplorerUrl
  };
})();