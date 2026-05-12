const fs = require("fs");
const artifact = require("../artifacts/contracts/VoteConnect.sol/VoteConnect.json");

const output = `const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = ${JSON.stringify(artifact.abi, null, 2)};`;

fs.writeFileSync("js/contract-abi.js", output);
console.log("✅ Đã ghi ABI vào js/contract-abi.js");
console.log("👉 Copy nội dung file đó vào js/contract.js");