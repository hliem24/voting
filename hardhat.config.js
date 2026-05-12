// ===== HARDHAT CONFIG =====
// File: hardhat.config.js (đặt ở thư mục gốc dự án blockchain)

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
 
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    // ✅ Hardhat in-process (dùng khi chạy test)
    hardhat: {
      chainId: 31337
    },
 
    // ✅ localhost — dùng khi chạy "npx hardhat node" riêng
    // MetaMask kết nối vào mạng này (http://127.0.0.1:8545, chainId 31337)
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
 
    // Ganache local (nếu dùng Ganache Desktop)
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337
    },
 
    // Sepolia testnet
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY || ""}`,
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY.replace(/^0x/, "")}`] : []
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY || ""
  }
};
/*
========================================
HƯỚNG DẪN DEPLOY
========================================

1. Cài đặt dependencies:
   npm init -y
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv

2. Tạo file .env:
   PRIVATE_KEY=<private key MetaMask của bạn>
   INFURA_KEY=<lấy tại infura.io>
   ETHERSCAN_KEY=<lấy tại etherscan.io>

3. Deploy lên Hardhat local (test nhanh):
   npx hardhat node
   npx hardhat run scripts/deploy.js --network hardhat

4. Deploy lên Sepolia testnet:
   npx hardhat run scripts/deploy.js --network sepolia

5. Sau khi deploy, copy địa chỉ contract vào js/contract.js:
   const CONTRACT_ADDRESS = "0xABC...123";
========================================
*/
