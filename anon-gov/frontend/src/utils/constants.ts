export const GOVERNANCE_ABI = [
  "function owner() view returns (address)",
  "function proposalFee() view returns (uint256)",
  "function proposals(uint256) view returns (string title, uint256 expiration, uint256 yesVotes, uint256 noVotes, address proposer, bool isActive)",
  "function hasVoted(address, uint256) view returns (bool)",
  "function nextProposalId() view returns (uint256)",
  "function submitProposal(string calldata title, uint256 duration) payable",
  "function vote(uint256 proposalId, bool support)",
  "function endVoting(uint256 proposalId)",
  "function withdrawFees()",
  "event ProposalCreated(uint256 proposalId, string title, uint256 expiration, address proposer)",
  "event Voted(address indexed voter, uint256 proposalId, bool support)",
];

export const CONTRACT_ADDRESS = "0x8a681f5011a43967d9ee2da98c8c3d2d4c1ec5be";

// Network configuration
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

export const NETWORK_CONFIG = {
  chainId: SEPOLIA_CHAIN_ID_HEX,
  chainName: "Sepolia Test Network",
  nativeCurrency: {
    name: "SepoliaETH",
    symbol: "SEP",
    decimals: 18,
  },
  rpcUrls: [
    "https://sepolia.infura.io/v3/",
    "https://rpc.sepolia.org",
    "https://rpc2.sepolia.org",
  ],
  blockExplorerUrls: ["https://sepolia.etherscan.io/"],
};
