// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * VoteConnect Smart Contract
 * Deploy lên Ethereum Testnet (Sepolia) hoặc local Hardhat/Ganache
 *
 * Compile & Deploy:
 *   npx hardhat compile
 *   npx hardhat run scripts/deploy.js --network sepolia
 *
 * Sau khi deploy: copy địa chỉ contract vào js/web3.js → CONTRACT_ADDRESS
 */
contract VoteConnect {

    struct Poll {
        uint256 id;
        string  title;
        string  description;
        string  category;
        uint256 startTime;
        uint256 endTime;
        bool    active;
        address creator;
        string[] options;
        mapping(uint256 => uint256) voteCounts;   // optionIndex => count
        mapping(address => bool)    hasVoted;      // voter => voted?
        mapping(address => uint256) voterChoice;   // voter => optionIndex
    }

    uint256 public pollCount;
    mapping(uint256 => Poll) private polls;

    // ---- Events ----
    event PollCreated(uint256 indexed pollId, string title, address creator, uint256 endTime);
    event Voted(uint256 indexed pollId, address indexed voter, uint256 optionIndex);
    event PollEnded(uint256 indexed pollId);

    // ---- Modifiers ----
    modifier onlyCreator(uint256 pollId) {
        require(polls[pollId].creator == msg.sender, "Not poll creator");
        _;
    }

    modifier pollExists(uint256 pollId) {
        require(pollId > 0 && pollId <= pollCount, "Poll does not exist");
        _;
    }

    modifier pollActive(uint256 pollId) {
        require(polls[pollId].active, "Poll is not active");
        require(block.timestamp >= polls[pollId].startTime, "Poll not started yet");
        require(block.timestamp <= polls[pollId].endTime, "Poll has ended");
        _;
    }

    // ---- Admin: Tạo bỏ phiếu ----
    function createPoll(
        string memory _title,
        string memory _description,
        string memory _category,
        string[] memory _options,
        uint256 _startTime,
        uint256 _endTime
    ) external returns (uint256) {
        require(_options.length >= 2, "Need at least 2 options");
        require(_endTime > _startTime, "End must be after start");
        require(_endTime > block.timestamp, "End time must be in future");

        pollCount++;
        Poll storage p = polls[pollCount];
        p.id          = pollCount;
        p.title       = _title;
        p.description = _description;
        p.category    = _category;
        p.startTime   = _startTime;
        p.endTime     = _endTime;
        p.active      = true;
        p.creator     = msg.sender;

        for (uint256 i = 0; i < _options.length; i++) {
            p.options.push(_options[i]);
        }

        emit PollCreated(pollCount, _title, msg.sender, _endTime);
        return pollCount;
    }

    // ---- User: Bỏ phiếu ----
    function castVote(uint256 pollId, uint256 optionIndex)
        external
        pollExists(pollId)
        pollActive(pollId)
    {
        Poll storage p = polls[pollId];
        require(!p.hasVoted[msg.sender], "Already voted");
        require(optionIndex < p.options.length, "Invalid option");

        p.hasVoted[msg.sender]   = true;
        p.voterChoice[msg.sender] = optionIndex;
        p.voteCounts[optionIndex]++;

        emit Voted(pollId, msg.sender, optionIndex);
    }

    // ---- Admin: Kết thúc sớm ----
    function endPoll(uint256 pollId)
        external
        pollExists(pollId)
        onlyCreator(pollId)
    {
        polls[pollId].active = false;
        emit PollEnded(pollId);
    }

    // ---- View: Lấy thông tin poll ----
    function getPoll(uint256 pollId)
        external view
        pollExists(pollId)
        returns (
            uint256 id,
            string memory title,
            string memory description,
            string memory category,
            uint256 startTime,
            uint256 endTime,
            bool active,
            address creator,
            string[] memory options,
            uint256[] memory voteCounts
        )
    {
        Poll storage p = polls[pollId];
        uint256[] memory counts = new uint256[](p.options.length);
        for (uint256 i = 0; i < p.options.length; i++) {
            counts[i] = p.voteCounts[i];
        }
        return (p.id, p.title, p.description, p.category,
                p.startTime, p.endTime, p.active, p.creator,
                p.options, counts);
    }

    // ---- View: Kiểm tra đã vote chưa ----
    function getVoterInfo(uint256 pollId, address voter)
        external view
        pollExists(pollId)
        returns (bool hasVoted, uint256 choice)
    {
        Poll storage p = polls[pollId];
        return (p.hasVoted[voter], p.voterChoice[voter]);
    }

    // ---- View: Lấy danh sách tất cả poll IDs ----
    function getAllPollIds() external view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](pollCount);
        for (uint256 i = 0; i < pollCount; i++) {
            ids[i] = i + 1;
        }
        return ids;
    }
}
