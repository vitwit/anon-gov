"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";
import { GovernanceContextType, Proposal } from "@/types/governance";
import {
  CONTRACT_ADDRESS,
  GOVERNANCE_ABI,
  NETWORK_CONFIG,
  SEPOLIA_CHAIN_ID,
  SEPOLIA_CHAIN_ID_HEX,
} from "@/utils/constants";

const GovernanceContext = createContext<GovernanceContextType | undefined>(
  undefined
);

// Contract ABI - Add your deployed contract ABI here

interface GovernanceProviderProps {
  children: ReactNode;
}

export const GovernanceProvider: React.FC<GovernanceProviderProps> = ({
  children,
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalFee, setProposalFee] = useState<string>("0");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const connectWallet = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);

        // Request account access
        await provider.send("eth_requestAccounts", []);

        // Check if we're on Sepolia testnet
        const network = await provider.getNetwork();
        const sepoliaChainId = BigInt(SEPOLIA_CHAIN_ID);

        if (network.chainId !== sepoliaChainId) {
          try {
            // Request network switch to Sepolia
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
            });
          } catch (switchError: any) {
            // If network doesn't exist, add it
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [NETWORK_CONFIG],
                });
              } catch (addError) {
                console.error("Error adding Sepolia network:", addError);
                alert("Please manually switch to Sepolia testnet in MetaMask");
                return;
              }
            } else {
              console.error("Error switching to Sepolia:", switchError);
              alert("Please manually switch to Sepolia testnet in MetaMask");
              return;
            }
          }
        }

        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          GOVERNANCE_ABI,
          signer
        );

        setProvider(provider);
        setAccount(address);
        setContract(contract);
        setIsConnected(true);

        // Load proposal fee
        const fee = await contract.proposalFee();
        setProposalFee(ethers.formatEther(fee));

        // Load proposals
        await loadProposalsWithContract(contract);
      } else {
        alert("Please install MetaMask!");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setContract(null);
    setProvider(null);
    setIsConnected(false);
    setProposals([]);
  };

  const loadProposalsWithContract = async (contractInstance: any) => {
    try {
      const nextId = await contractInstance.nextProposalId();
      const proposalPromises = [];

      for (let i = 1; i < nextId; i++) {
        proposalPromises.push(contractInstance.proposals(i));
      }

      const proposalResults = await Promise.all(proposalPromises);
      const formattedProposals: Proposal[] = proposalResults.map(
        (proposal, index) => ({
          id: index + 1,
          title: proposal.title,
          expiration: Number(proposal.expiration),
          yesVotes: Number(proposal.yesVotes),
          noVotes: Number(proposal.noVotes),
          proposer: proposal.proposer,
          isActive: proposal.isActive,
        })
      );

      setProposals(formattedProposals);
    } catch (error) {
      console.error("Error loading proposals:", error);
    }
  };

  const loadProposals = async () => {
    if (contract) {
      await loadProposalsWithContract(contract);
    }
  };

  const submitProposal = async (title: string, duration: number) => {
    if (!contract) throw new Error("Contract not connected");

    try {
      const fee = await contract.proposalFee();
      const tx = await contract.submitProposal(title, duration, { value: fee });
      await tx.wait();
      await loadProposals();
    } catch (error) {
      console.error("Error submitting proposal:", error);
      throw error;
    }
  };

  const vote = async (proposalId: number, support: boolean) => {
    if (!contract) throw new Error("Contract not connected");

    try {
      const tx = await contract.vote(proposalId, support);
      await tx.wait();
      await loadProposals();
    } catch (error) {
      console.error("Error voting:", error);
      throw error;
    }
  };

  const endVoting = async (proposalId: number) => {
    if (!contract) throw new Error("Contract not connected");

    try {
      const tx = await contract.endVoting(proposalId);
      await tx.wait();
      await loadProposals();
    } catch (error) {
      console.error("Error ending voting:", error);
      throw error;
    }
  };

  const hasVoted = async (proposalId: number): Promise<boolean> => {
    if (!contract || !account) return false;

    try {
      return await contract.hasVoted(account, proposalId);
    } catch (error) {
      console.error("Error checking vote status:", error);
      return false;
    }
  };

  useEffect(() => {
    // Auto-connect if previously connected
    if (
      typeof window !== "undefined" &&
      window.ethereum &&
      window.ethereum.selectedAddress
    ) {
      connectWallet();
    }
  }, []);

  const value: GovernanceContextType = {
    account,
    contract,
    provider,
    proposals,
    proposalFee,
    isConnected,
    connectWallet,
    disconnectWallet,
    submitProposal,
    vote,
    endVoting,
    loadProposals,
    hasVoted,
  };

  return (
    <GovernanceContext.Provider value={value}>
      {children}
    </GovernanceContext.Provider>
  );
};

export const useGovernance = (): GovernanceContextType => {
  const context = useContext(GovernanceContext);
  if (context === undefined) {
    throw new Error("useGovernance must be used within a GovernanceProvider");
  }
  return context;
};
