// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import { FHE, euint32, externalEuint32, ebool, externalEbool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Governance Contract with Private Voting
/// @notice A governance contract that enables private voting using Fully Homomorphic Encryption
contract FHEGovernance is SepoliaConfig {
    struct Proposal {
        string title;
        uint256 expiration;
        euint32 yesVotes;    
        euint32 noVotes;     
        ebool result;       
        address proposer;
        bool isActive;
        bool resultComputed;
    }

    address public owner;
    uint256 public proposalFee;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    uint256 public nextProposalId;

    event ProposalCreated(uint256 proposalId, string title, uint256 expiration, address proposer);
    event VoteCast(address indexed voter, uint256 proposalId);
    event VotingEnded(uint256 proposalId);
    event ResultComputed(uint256 proposalId);

    constructor(uint256 _proposalFee) {
        owner = msg.sender;
        proposalFee = _proposalFee;
        nextProposalId = 1;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    /// @notice Submit a new proposal
    /// @param title The title of the proposal
    /// @param duration The duration in seconds for voting
    function submitProposal(string calldata title, uint256 duration) external payable {
        require(msg.value == proposalFee, "Incorrect proposal fee");
        
        uint256 proposalId = nextProposalId++;
        
        euint32 initialVotes = FHE.asEuint32(0);
        ebool initialResult = FHE.asEbool(false);
        
        proposals[proposalId] = Proposal({
            title: title,
            expiration: block.timestamp + duration,
            yesVotes: initialVotes,
            noVotes: initialVotes,
            result: initialResult,
            proposer: msg.sender,
            isActive: true,
            resultComputed: false
        });

        FHE.allowThis(proposals[proposalId].yesVotes);
        FHE.allowThis(proposals[proposalId].noVotes);
        FHE.allowThis(proposals[proposalId].result);
        FHE.allow(proposals[proposalId].yesVotes, msg.sender);
        FHE.allow(proposals[proposalId].noVotes, msg.sender);
        FHE.allow(proposals[proposalId].result, msg.sender);

        emit ProposalCreated(proposalId, title, block.timestamp + duration, msg.sender);
    }

    /// @notice Cast an encrypted vote on a proposal
    /// @param proposalId The ID of the proposal to vote on
    /// @param encryptedSupport Encrypted boolean indicating support (true = yes, false = no)
    /// @param inputProof Zero-knowledge proof for the encrypted input
    function vote(
        uint256 proposalId, 
        externalEbool encryptedSupport, 
        bytes calldata inputProof
    ) external {
        Proposal storage proposal = proposals[proposalId];
        
        require(proposal.isActive, "Proposal is not active");
        require(block.timestamp < proposal.expiration, "Voting period has ended");
        require(!hasVoted[msg.sender][proposalId], "You have already voted on this proposal");

        // Convert external encrypted boolean to internal encrypted boolean
        ebool support = FHE.fromExternal(encryptedSupport, inputProof);
        
        euint32 oneVote = FHE.asEuint32(1);
        
        proposal.yesVotes = FHE.add(proposal.yesVotes, FHE.select(support, oneVote, FHE.asEuint32(0)));
        proposal.noVotes = FHE.add(proposal.noVotes, FHE.select(support, FHE.asEuint32(0), oneVote));

        hasVoted[msg.sender][proposalId] = true;

        FHE.allowThis(proposal.yesVotes);
        FHE.allowThis(proposal.noVotes);
        FHE.allow(proposal.yesVotes, owner);
        FHE.allow(proposal.noVotes, owner);

        emit VoteCast(msg.sender, proposalId);
    }

    /// @notice End voting for a proposal and compute encrypted result
    /// @param proposalId The ID of the proposal
    function endVoting(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        
        require(proposal.isActive, "Proposal is not active");
        require(block.timestamp >= proposal.expiration, "Voting period has not ended yet");

        proposal.isActive = false;

        proposal.result = FHE.gt(proposal.yesVotes, proposal.noVotes);
        proposal.resultComputed = true;

        FHE.allowThis(proposal.yesVotes);
        FHE.allowThis(proposal.noVotes);
        FHE.allowThis(proposal.result);
        FHE.allow(proposal.yesVotes, owner);
        FHE.allow(proposal.noVotes, owner);
        FHE.allow(proposal.result, owner);
        FHE.allow(proposal.yesVotes, proposal.proposer);
        FHE.allow(proposal.noVotes, proposal.proposer);
        FHE.allow(proposal.result, proposal.proposer);

        emit VotingEnded(proposalId);
        emit ResultComputed(proposalId);
    }

    /// @notice Get encrypted vote counts and result for a proposal
    /// @param proposalId The ID of the proposal
    /// @return yesVotes Encrypted yes vote count
    /// @return noVotes Encrypted no vote count
    /// @return result Encrypted result (true = passed, false = rejected)
    function getVoteCounts(uint256 proposalId) external view returns (euint32 yesVotes, euint32 noVotes, ebool result) {
        Proposal storage proposal = proposals[proposalId];
        return (proposal.yesVotes, proposal.noVotes, proposal.result);
    }

    /// @notice Get the encrypted result of a proposal
    /// @param proposalId The ID of the proposal
    /// @return result Encrypted result (true = passed, false = rejected)
    /// @return computed Whether the result has been computed
    function getProposalResult(uint256 proposalId) external view returns (ebool result, bool computed) {
        Proposal storage proposal = proposals[proposalId];
        return (proposal.result, proposal.resultComputed);
    }

    /// @notice Check if voting has ended for a proposal
    /// @param proposalId The ID of the proposal
    /// @return ended True if voting has ended
    function hasVotingEnded(uint256 proposalId) external view returns (bool ended) {
        return block.timestamp >= proposals[proposalId].expiration;
    }

    /// @notice Get complete proposal details including encrypted vote counts and result
    /// @param proposalId The ID of the proposal
    /// @return title The proposal title
    /// @return expiration The voting expiration timestamp
    /// @return yesVotes Encrypted yes vote count
    /// @return noVotes Encrypted no vote count
    /// @return result Encrypted result
    /// @return proposer The address that proposed it
    /// @return isActive Whether the proposal is active
    /// @return resultComputed Whether the result has been computed
    function getProposal(uint256 proposalId) external view returns (
        string memory title,
        uint256 expiration,
        euint32 yesVotes,
        euint32 noVotes,
        ebool result,
        address proposer,
        bool isActive,
        bool resultComputed
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.title, 
            proposal.expiration,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.result,
            proposal.proposer, 
            proposal.isActive,
            proposal.resultComputed
        );
    }

    /// @notice Allow owner to withdraw collected proposal fees
    function withdrawFees() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    /// @notice Update proposal fee (only owner)
    /// @param newFee The new proposal fee
    function setProposalFee(uint256 newFee) external onlyOwner {
        proposalFee = newFee;
    }
}