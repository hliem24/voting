// ===== CONTRACT CONFIG =====
// Khớp với VoteConnect.sol thật

const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // ← thay sau khi deploy

const CONTRACT_ABI = [
  // ── Events ──────────────────────────────────────────
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" },
      { "indexed": false, "internalType": "string",  "name": "title",  "type": "string"  }
    ],
    "name": "PollCreated", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "pollId",  "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "voter",   "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "option",  "type": "uint256" }
    ],
    "name": "Voted", "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }
    ],
    "name": "PollEnded", "type": "event"
  },

  // ── createPoll ───────────────────────────────────────
  {
    "inputs": [
      { "internalType": "string",   "name": "_title",       "type": "string"   },
      { "internalType": "string",   "name": "_description", "type": "string"   },
      { "internalType": "string",   "name": "_category",    "type": "string"   },
      { "internalType": "string[]", "name": "_options",     "type": "string[]" },
      { "internalType": "uint256",  "name": "_startTime",   "type": "uint256"  },
      { "internalType": "uint256",  "name": "_endTime",     "type": "uint256"  }
    ],
    "name": "createPoll",
    "outputs": [],
    "stateMutability": "nonpayable", "type": "function"
  },

  // ── vote ─────────────────────────────────────────────
  {
    "inputs": [
      { "internalType": "uint256", "name": "_pollId", "type": "uint256" },
      { "internalType": "uint256", "name": "_option", "type": "uint256" }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable", "type": "function"
  },

  // ── endPoll ──────────────────────────────────────────
  {
    "inputs": [
      { "internalType": "uint256", "name": "_pollId", "type": "uint256" }
    ],
    "name": "endPoll",
    "outputs": [],
    "stateMutability": "nonpayable", "type": "function"
  },

  // ── getPoll ──────────────────────────────────────────
  {
    "inputs": [
      { "internalType": "uint256", "name": "_pollId", "type": "uint256" }
    ],
    "name": "getPoll",
    "outputs": [
      { "internalType": "uint256",   "name": "", "type": "uint256"   },
      { "internalType": "string",    "name": "", "type": "string"    },
      { "internalType": "string",    "name": "", "type": "string"    },
      { "internalType": "string",    "name": "", "type": "string"    },
      { "internalType": "string[]",  "name": "", "type": "string[]"  },
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" },
      { "internalType": "uint256",   "name": "", "type": "uint256"   },
      { "internalType": "uint256",   "name": "", "type": "uint256"   },
      { "internalType": "address",   "name": "", "type": "address"   },
      { "internalType": "bool",      "name": "", "type": "bool"      }
    ],
    "stateMutability": "view", "type": "function"
  },

  // ── getAllPollIds ─────────────────────────────────────
  {
    "inputs": [],
    "name": "getAllPollIds",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view", "type": "function"
  },

  // ── hasUserVoted ─────────────────────────────────────
  {
    "inputs": [
      { "internalType": "uint256", "name": "_pollId", "type": "uint256" },
      { "internalType": "address", "name": "_user",   "type": "address" }
    ],
    "name": "hasUserVoted",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view", "type": "function"
  },

  // ── pollCount ────────────────────────────────────────
  {
    "inputs": [],
    "name": "pollCount",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view", "type": "function"
  },

  // ── polls (mapping public) ───────────────────────────
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "polls",
    "outputs": [
      { "internalType": "uint256", "name": "id",          "type": "uint256" },
      { "internalType": "string",  "name": "title",       "type": "string"  },
      { "internalType": "string",  "name": "description", "type": "string"  },
      { "internalType": "string",  "name": "category",    "type": "string"  },
      { "internalType": "uint256", "name": "startTime",   "type": "uint256" },
      { "internalType": "uint256", "name": "endTime",     "type": "uint256" },
      { "internalType": "address", "name": "creator",     "type": "address" },
      { "internalType": "bool",    "name": "active",      "type": "bool"    }
    ],
    "stateMutability": "view", "type": "function"
  },

  // ── hasVoted (mapping public) ────────────────────────
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" },
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "hasVoted",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view", "type": "function"
  }
];

const EXPLORERS = {
  1:        "https://etherscan.io",
  11155111: "https://sepolia.etherscan.io",
  31337:    null,
  1337:     null,
};

const NETWORK_NAMES = {
  1:        "Ethereum Mainnet",
  11155111: "Sepolia Testnet",
  31337:    "Hardhat Local",
  1337:     "Ganache Local",
};