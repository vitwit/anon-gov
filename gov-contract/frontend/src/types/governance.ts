export interface Proposal {
  id: number;
  title: string;
  expiration: number;
  yesVotes: number;
  noVotes: number;
  proposer: string;
  isActive: boolean;
}

export interface GovernanceContextType {
  account: string | null;
  contract: any;
  provider: any;
  proposals: Proposal[];
  proposalFee: string;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  submitProposal: (title: string, duration: number) => Promise<void>;
  vote: (proposalId: number, support: boolean) => Promise<void>;
  endVoting: (proposalId: number) => Promise<void>;
  loadProposals: () => Promise<void>;
  hasVoted: (proposalId: number) => Promise<boolean>;
}

export interface EthereumProvider {
  isMetaMask?: boolean;
  isConnected(): boolean;
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, handler: (...args: any[]) => void): void;
  removeListener(event: string, handler: (...args: any[]) => void): void;
  selectedAddress: string | null;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
