"use client";

import { useGovernance } from "@/context/GovernanceContext";
import React from "react";

const WalletConnection: React.FC = () => {
  const { account, isConnected, connectWallet, disconnectWallet } =
    useGovernance();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="flex items-center space-x-4">
      {isConnected ? (
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            Connected: {formatAddress(account!)}
          </div>
          <button
            onClick={disconnectWallet}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnection;
