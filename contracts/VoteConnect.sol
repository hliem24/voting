// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VoteConnect {

    struct Poll {
        uint id;
        string title;
        string description;
        string category;
        string[] options;
        uint[] votes;
        uint startTime;
        uint endTime;
        address creator;
        bool active;
    }

    uint public pollCount;

    mapping(uint => Poll) public polls;
    mapping(uint => mapping(address => bool)) public hasVoted;

    event PollCreated(uint pollId, string title);
    event Voted(uint pollId, address voter, uint option);
    event PollEnded(uint pollId);

    // =========================
    // CREATE POLL
    // =========================
    function createPoll(
        string memory _title,
        string memory _description,
        string memory _category,
        string[] memory _options,
        uint _startTime,
        uint _endTime
    ) public {

        require(_options.length >= 2, "At least 2 options");
        require(_endTime > _startTime, "Invalid time");

        pollCount++;

        Poll storage p = polls[pollCount];

        p.id = pollCount;
        p.title = _title;
        p.description = _description;
        p.category = _category;
        p.startTime = _startTime;
        p.endTime = _endTime;
        p.creator = msg.sender;
        p.active = true;

        for (uint i = 0; i < _options.length; i++) {
            p.options.push(_options[i]);
            p.votes.push(0);
        }

        emit PollCreated(pollCount, _title);
    }

    // =========================
    // VOTE
    // =========================
    function vote(uint _pollId, uint _option) public {

        require(_pollId > 0 && _pollId <= pollCount, "Poll not found");

        Poll storage p = polls[_pollId];

        require(p.active, "Poll inactive");
        require(block.timestamp >= p.startTime, "Poll not started");
        require(block.timestamp <= p.endTime, "Poll ended");

        require(!hasVoted[_pollId][msg.sender], "Already voted");

        require(_option < p.options.length, "Invalid option");

        p.votes[_option]++;

        hasVoted[_pollId][msg.sender] = true;

        emit Voted(_pollId, msg.sender, _option);
    }

    // =========================
    // GET SINGLE POLL
    // =========================
    function getPoll(uint _pollId)
        public
        view
        returns (
            uint,
            string memory,
            string memory,
            string memory,
            string[] memory,
            uint[] memory,
            uint,
            uint,
            address,
            bool
        )
    {
        require(_pollId > 0 && _pollId <= pollCount, "Poll not found");

        Poll storage p = polls[_pollId];

        return (
            p.id,
            p.title,
            p.description,
            p.category,
            p.options,
            p.votes,
            p.startTime,
            p.endTime,
            p.creator,
            p.active
        );
    }

    // =========================
    // GET ALL POLL IDS
    // =========================
    function getAllPollIds()
        public
        view
        returns (uint[] memory)
    {
        uint[] memory ids = new uint[](pollCount);

        for (uint i = 0; i < pollCount; i++) {
            ids[i] = i + 1;
        }

        return ids;
    }

    // =========================
    // CHECK USER VOTED
    // =========================
    function hasUserVoted(
        uint _pollId,
        address _user
    )
        public
        view
        returns (bool)
    {
        return hasVoted[_pollId][_user];
    }

    // =========================
    // END POLL
    // =========================
    function endPoll(uint _pollId) public {

        require(_pollId > 0 && _pollId <= pollCount, "Poll not found");

        Poll storage p = polls[_pollId];

        require(msg.sender == p.creator, "Not poll creator");

        p.active = false;

        emit PollEnded(_pollId);
    }
}