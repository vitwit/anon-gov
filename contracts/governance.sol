// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract Governance {

    struct Proposal {
        string title;
        uint256 expiration;
        uint256 yesVotes;
        uint256 noVotes;
        address proposer;
        bool isActive;
    }

    address public owner;
    uint256 public proposalFee;  // Fee to submit a proposal
    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) public hasVoted;  // Track user votes by proposal ID
    uint256 public nextProposalId;

    // Event for proposal creation
    event ProposalCreated(uint256 proposalId, string title, uint256 expiration, address proposer);
    
    // Event for voting
    event Voted(address indexed voter, uint256 proposalId, bool support);

    constructor(uint256 _proposalFee) {
        owner = msg.sender;
        proposalFee = _proposalFee;
        nextProposalId = 1;
    }

    // Modifier to ensure only the owner can perform certain actions (like setting the proposal fee)
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // Submit a new proposal
    function submitProposal(string calldata title, uint256 duration) external payable {
        require(msg.value == proposalFee, "Incorrect proposal fee");
        uint256 proposalId = nextProposalId++;
        
        // Create a new proposal
        proposals[proposalId] = Proposal({
            title: title,
            expiration: block.timestamp + duration,
            yesVotes: 0,
            noVotes: 0,
            proposer: msg.sender,
            isActive: true
        });

        // Emit the event for the new proposal
        emit ProposalCreated(proposalId, title, block.timestamp + duration, msg.sender);
    }

    // Vote on a proposal
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        
        // Check if the proposal is active and the expiration has not passed
        require(proposal.isActive, "Proposal is not active");
        require(block.timestamp < proposal.expiration, "Voting period has ended");
        require(!hasVoted[msg.sender][proposalId], "You have already voted on this proposal");

        // Record the vote
        if (support) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }

        hasVoted[msg.sender][proposalId] = true;

        // Emit the vote event
        emit Voted(msg.sender, proposalId, support);
    }

    // End the voting and declare the result
    function endVoting(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        
        // Ensure the proposal exists and voting is finished
        require(proposal.isActive, "Proposal is not active");
        require(block.timestamp >= proposal.expiration, "Voting period has not ended yet");

        // Mark the proposal as inactive
        proposal.isActive = false;

        // Declare the result
        string memory result = proposal.yesVotes > proposal.noVotes
            ? "Proposal Passed"
            : "Proposal Rejected";

        // Optionally, we can log the result or perform actions based on the result
        emit ProposalCreated(proposalId, result, 0, address(0));  // Log result

        // You can also implement other logic here based on the result
    }

    // Allow owner to withdraw collected proposal fees
    function withdrawFees() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}