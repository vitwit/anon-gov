"use client";

import React, { useState, useEffect } from "react";
import { Proposal } from "@/types/governance";
import { useGovernance } from "@/context/GovernanceContext";

interface ProposalCardProps {
  proposal: Proposal;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal }) => {
  const { vote, endVoting, hasVoted, isConnected } = useGovernance();
  const [userHasVoted, setUserHasVoted] = useState<boolean>(false);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const [isEnding, setIsEnding] = useState<boolean>(false);

  const isExpired = Date.now() / 1000 > proposal.expiration;
  const totalVotes = proposal.yesVotes + proposal.noVotes;
  const yesPercentage =
    totalVotes > 0 ? (proposal.yesVotes / totalVotes) * 100 : 0;
  const noPercentage =
    totalVotes > 0 ? (proposal.noVotes / totalVotes) * 100 : 0;

  useEffect(() => {
    const checkVoteStatus = async () => {
      if (isConnected) {
        const voted = await hasVoted(proposal.id);
        setUserHasVoted(voted);
      }
    };
    checkVoteStatus();
  }, [proposal.id, isConnected, hasVoted]);

  const handleVote = async (support: boolean) => {
    if (!isConnected) return;

    setIsVoting(true);
    try {
      await vote(proposal.id, support);
      setUserHasVoted(true);
    } catch (error) {
      console.error("Voting failed:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleEndVoting = async () => {
    setIsEnding(true);
    try {
      await endVoting(proposal.id);
    } catch (error) {
      console.error("Ending voting failed:", error);
    } finally {
      setIsEnding(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {proposal.title}
        </h3>
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              proposal.isActive
                ? isExpired
                  ? "bg-orange-100 text-orange-800"
                  : "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {proposal.isActive ? (isExpired ? "Expired" : "Active") : "Ended"}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Proposer: {proposal.proposer.slice(0, 6)}...
          {proposal.proposer.slice(-4)}
        </p>
        <p className="text-sm text-gray-600 mb-2">
          Expires: {formatDate(proposal.expiration)}
        </p>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Yes: {proposal.yesVotes}</span>
          <span>No: {proposal.noVotes}</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div className="flex h-2 rounded-full overflow-hidden">
            <div
              className="bg-green-500"
              style={{ width: `${yesPercentage}%` }}
            ></div>
            <div
              className="bg-red-500"
              style={{ width: `${noPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>{yesPercentage.toFixed(1)}% Yes</span>
          <span>{noPercentage.toFixed(1)}% No</span>
        </div>
      </div>

      <div className="flex space-x-2">
        {proposal.isActive && !isExpired && isConnected && !userHasVoted && (
          <>
            <button
              onClick={() => handleVote(true)}
              disabled={isVoting}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isVoting ? "Voting..." : "Vote Yes"}
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={isVoting}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isVoting ? "Voting..." : "Vote No"}
            </button>
          </>
        )}

        {proposal.isActive && isExpired && (
          <button
            onClick={handleEndVoting}
            disabled={isEnding}
            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isEnding ? "Ending..." : "End Voting"}
          </button>
        )}

        {userHasVoted && (
          <div className="flex-1 bg-gray-100 text-gray-600 py-2 px-4 rounded-lg text-center">
            Already Voted
          </div>
        )}

        {!isConnected && (
          <div className="flex-1 bg-gray-100 text-gray-600 py-2 px-4 rounded-lg text-center">
            Connect wallet to vote
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalCard;
