"use client";

import React, { useEffect } from "react";
import ProposalCard from "@/components/ProposalCard";
import CreateProposal from "@/components/CreateProposal";
import WalletConnection from "@/components/WalletConnection";
import { useGovernance } from "@/context/GovernanceContext";

export default function Home() {
  const { proposals, loadProposals, isConnected } = useGovernance();

  useEffect(() => {
    if (isConnected) {
      loadProposals();
    }
  }, [isConnected, loadProposals]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">
              Governance DApp
            </h1>
            <WalletConnection />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Proposal Section */}
        <div className="mb-8">
          <CreateProposal />
        </div>

        {/* Proposals Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Proposals</h2>
            {isConnected && (
              <button
                onClick={loadProposals}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Refresh
              </button>
            )}
          </div>

          {!isConnected ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-600">
                  Please connect your wallet to view and interact with
                  proposals.
                </p>
              </div>
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                  No Proposals Found
                </h3>
                <p className="text-gray-600">
                  Be the first to create a proposal for the community to vote
                  on!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {proposals.map((proposal) => (
                <ProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>
              &copy; 2025 Governance DApp. Built with Next.js and Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
