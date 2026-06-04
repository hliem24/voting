
#   Hệ thống bỏ phiếu phi tập trung · MetaMask + Ethereum Blockchain

<h2 align="center">
    <a href="https://dainam.edu.vn/vi/khoa-cong-nghe-thong-tin">
    🎓 Faculty of Information Technology (DaiNam University)
    </a>
</h2>

<h2 align="center">
   Decentralized Voting System · MetaMask + Ethereum Blockchain
</h2>

<div align="center">
    <p align="center">
        <img src="docs/aiotlab_logo.png" width="170"/>
        <img src="docs/fitdnu_logo.png" width="180"/>
        <img src="docs/dnu_logo.png" width="200"/>
    </p>

[![AIoTLab](https://img.shields.io/badge/AIoTLab-green?style=for-the-badge)](https://www.facebook.com/DNUAIoTLab)
[![Faculty of Information Technology](https://img.shields.io/badge/Faculty%20of%20Information%20Technology-blue?style=for-the-badge)](https://dainam.edu.vn/vi/khoa-cong-nghe-thong-tin)
[![DaiNam University](https://img.shields.io/badge/DaiNam%20University-orange?style=for-the-badge)](https://dainam.edu.vn)

</div>

---
# VoteConnect Web3 ⛓️
Hệ thống bỏ phiếu phi tập trung · MetaMask + Ethereum Blockchain

---
## 🚀  Hình ảnh các chức năng

<p align="center">
  <img src="docs/project photo/1.png" alt="Ảnh 1" width="800"/>
</p>

<p align="center">
  <em>GIAO DIỆN  APP  </em>
</p>

<p align="center">
  <img src="docs/project photo/2.png" alt="Ảnh 2" width="700"/>
</p>
<p align="center">
  <em>TRANG CHỦ CỦA APP    </em>
</p>
<p align="center">
  <img src="docs/project photo/3.png" alt="Ảnh 2" width="700"/>
</p>
<p align="center">
  <em>TẠO PHIẾU BÌNH CHỌN    </em>
</p>
<p align="center">
  <img src="docs/project photo/4.png" alt="Ảnh 2" width="700"/>
</p>
<p align="center">
  <em>QUẢN LÝ PHIẾU   </em>
</p>
<p align="center">
  <img src="docs/project photo/5.png" alt="Ảnh 2" width="700"/>
</p>
<p align="center">
  <em>LỊCH SỬ CÁC PHIẾU ĐÃ BÌNH CHỌN    </em>
</p>
<p align="center">
  <img src="docs/project photo/6.png" alt="Ảnh 2" width="700"/>
</p>
<p align="center">
  <em>GIAO DIỆN NGƯỜI DÙNG   </em>
</p>
<p align="center">
  <img src="docs/project photo/7.png" alt="Ảnh 2" width="700"/>
</p>
<p align="center">
  <em>KHI BÌNH CHỌN GIAO DIỆN APP VÀ METAMARK   </em>
</p>
<p align="center">
  <img src="docs/project photo/8.png" alt="Ảnh 2" width="700"/>
</p>
<p align="center">
  <em>CÁC PHIẾU ĐÃ BÌNH CHỌN    </em>
</p>

---
## 📁 Cấu trúc dự án

```
voteconnect-web3/
│
├── index.html              # Frontend entry point
├── css/
│   └── style.css           # Giao diện dark theme
│
├── js/
│   ├── contract.js         # ABI + địa chỉ contract + config mạng
│   ├── web3.js             # Quản lý kết nối MetaMask (ethers.js)
│   ├── store.js            # Cache dữ liệu từ blockchain
│   ├── utils.js            # Helper, Toast, Modal, TxOverlay
│   ├── admin.js            # Module Admin + Form tạo phiếu
│   ├── user.js             # Module User (xem & bỏ phiếu)
│   └── app.js              # Controller chính
│
├── VoteConnect.sol         # Smart contract (Solidity 0.8.20)
├── hardhat.config.js       # Config deploy Hardhat
├── scripts/
│   └── deploy.js           # Script deploy + tạo data mẫu
└── README.md
```

---

## 🚀 Cách chạy — 3 bước

### Bước 1: Cài MetaMask
Tải extension tại https://metamask.io  
Tạo ví → lưu seed phrase an toàn.

---

### Bước 2: Deploy Smart Contract

**Option A — Hardhat local (không cần ETH thật, nhanh nhất)**
```bash
# Cài Node.js 18+ nếu chưa có
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Khởi tạo Hardhat (chọn "Create a JavaScript project")
npx hardhat init

# Copy VoteConnect.sol vào thư mục contracts/

# Chạy local node
npx hardhat node

# Deploy (terminal khác)
npx hardhat run scripts/deploy.js --network hardhat
```

**Option B — Sepolia Testnet (giống mainnet, ETH miễn phí)**
```bash
# 1. Lấy Sepolia ETH miễn phí tại:
#    https://sepoliafaucet.com  hoặc      

# 2. Lấy Infura API Key tại https://infura.io

# 3. Tạo file .env
echo "PRIVATE_KEY=<private_key_metamask>" > .env
echo "INFURA_KEY=<infura_project_id>"    >> .env

# 4. Deploy
npx hardhat run scripts/deploy.js --network sepolia
```

**Sau khi deploy** → copy địa chỉ contract vào `js/contract.js`:
```javascript
const CONTRACT_ADDRESS = "0xABC...123"; // dán vào đây
```

---

### Bước 3: Chạy Frontend
```bash
# Cài Python 3 (thường đã có sẵn) rồi chạy:
python -m http.server 8080

# Hoặc Node.js:
npx serve .

# Hoặc VS Code: cài Live Server → click "Open with Live Server"
```
Mở trình duyệt: **http://localhost:8080**

---

## 👤 Phân quyền

| Tính năng | Admin | User |
|---|---|---|
| Tạo cuộc bỏ phiếu (on-chain) | ✅ | ❌ |
| Ước tính gas trước khi tạo | ✅ | ❌ |
| Kết thúc poll sớm | ✅ (chỉ creator) | ❌ |
| Xem kết quả on-chain | ✅ | ❌ |
| Dashboard tổng quan | ✅ | ❌ |
| Xem & bỏ phiếu | ✅ | ✅ |
| Ký giao dịch qua MetaMask | ✅ | ✅ |
| Xem lịch sử phiếu của mình | ✅ | ✅ |

Chuyển role bằng nút **Admin / User** trên topbar.

---

## 🦊 Luồng bỏ phiếu

```
User chọn lựa chọn
       ↓
Nhấn "Ký & Bỏ phiếu"
       ↓
Xác nhận popup MetaMask
       ↓
Transaction gửi lên Ethereum
       ↓
Chờ block xác nhận (~12 giây Sepolia)
       ↓
Kết quả cập nhật on-chain ✓
```

---

## 🔧 Cấu hình mạng trong MetaMask

### Hardhat Local
- Network Name: Hardhat Local
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency: ETH

### Sepolia Testnet
Thường đã có sẵn trong MetaMask, hoặc thêm:
- Network Name: Sepolia
- RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
- Chain ID: 11155111
- Explorer: https://sepolia.etherscan.io

---

## 📦 Dependencies

| Thư viện | Phiên bản | Dùng cho |
|---|---|---|
| ethers.js | 5.7.2 | Giao tiếp với Ethereum |
| Tabler Icons | 3.0.0 | Icons |
| Hardhat | latest | Compile + Deploy contract |
| Solidity | 0.8.20 | Smart contract |

---

## ⚠️ Lưu ý bảo mật

- **KHÔNG** commit file `.env` lên Git
- **KHÔNG** dùng private key ví chính → tạo ví riêng để dev
- Smart contract đã deployed là **bất biến**, không sửa được
- Kiểm tra kỹ contract trước khi deploy lên mainnet
## POSTER

<p align="center">
  <img src="docs/project photo/9.png.png" alt="Ảnh " width="700"/>
</p>
<p align="center">
  <em>POSTER</em>
</p>

## 👜Thông tin cá nhân
**Họ tên**: Nguyễn Hoàng Liêm.  
**Lớp**: CNTT 16-03.  
**Email**: liemnguyenhoang22@gmail.com.

© 2026 AIoTLab, Faculty of Information Technology, DaiNam University. All rights reserved.

---
