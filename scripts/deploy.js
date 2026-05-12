// scripts/deploy.js
// ✅ ethers v6 + khớp với VoteConnect.sol thật
//    (createPoll không trả về id, dùng vote(), hasVoted(), pollCount())
//
// Terminal 1:  npx hardhat node
// Terminal 2:  npx hardhat run scripts/deploy.js --network localhost

const hre = require("hardhat");

async function main() {
  console.log("🚀 Bắt đầu deploy VoteConnect...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deployer:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH\n");

  // ── Deploy ───────────────────────────────────────────
  const VoteConnect = await hre.ethers.getContractFactory("VoteConnect");
  console.log("⏳ Đang deploy...");
  const contract = await VoteConnect.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ VoteConnect deployed!");
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 TX hash:", contract.deploymentTransaction().hash);

  // ── Tạo poll mẫu ─────────────────────────────────────
  console.log("\n📊 Tạo poll mẫu...");
  const now = Math.floor(Date.now() / 1000);
  const day = 86400;

  // ✅ createPoll của contract thật KHÔNG trả về id → không cần .wait() riêng
  const tx1 = await contract.createPoll(
    "Chọn màu logo mới",
    "Công ty đang đổi nhận diện thương hiệu. Hãy vote cho màu bạn thích!",
    "product",
    ["Xanh dương #1877F2", "Đỏ cam #F6851B", "Xanh lá #42B883"],
    now - 3600,
    now + day * 2
  );
  await tx1.wait();
  console.log("   ✓ Poll #1: Chọn màu logo mới");

  const tx2 = await contract.createPoll(
    "Địa điểm team building Q2",
    "Chọn địa điểm cho chuyến team building quý 2.",
    "event",
    ["Đà Lạt", "Hội An", "Phú Quốc", "Nha Trang"],
    now - 1800,
    now + day * 7
  );
  await tx2.wait();
  console.log("   ✓ Poll #2: Địa điểm team building");

  // ✅ Dùng pollCount() để xác nhận đã tạo thành công
  const count = await contract.pollCount();
  console.log("   pollCount =", count.toString(), "✓");

  // ── In kết quả ───────────────────────────────────────
  console.log("\n🎉 Deploy hoàn tất!");
  console.log("━".repeat(55));
  console.log("👉 Mở js/contract.js → sửa dòng CONTRACT_ADDRESS:\n");
  console.log(`   const CONTRACT_ADDRESS = "${contractAddress}";\n`);
  console.log("━".repeat(55));

  // ── Verify Sepolia (tuỳ chọn) ────────────────────────
  const network = await hre.ethers.provider.getNetwork();
  if (Number(network.chainId) === 11155111) {
    console.log("\n⏳ Đợi 5 blocks để verify trên Etherscan...");
    await contract.deploymentTransaction().wait(5);
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Verify thành công!");
      console.log(`🔗 https://sepolia.etherscan.io/address/${contractAddress}`);
    } catch (e) {
      console.log("⚠️  Verify thất bại:", e.message);
    }
  }
}

main().catch((error) => {
  console.error("❌ Deploy thất bại:", error);
  process.exit(1);
});