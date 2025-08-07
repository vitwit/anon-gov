"use client";

import React, { useState } from "react";
import { useGovernance } from "@/context/GovernanceContext";

const CreateProposal: React.FC = () => {
  const { submitProposal, proposalFee, isConnected } = useGovernance();
  const [title, setTitle] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !duration) return;

    setIsSubmitting(true);
    try {
      const durationInSeconds = parseInt(duration) * 24 * 60 * 60; // Convert days to seconds
      await submitProposal(title.trim(), durationInSeconds);
      setTitle("");
      setDuration("");
      setShowForm(false);
    } catch (error) {
      console.error("Failed to submit proposal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">Connect your wallet to create proposals</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {!showForm ? (
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Create New Proposal</h3>
          <p className="text-gray-600 mb-4">Proposal fee: {proposalFee} ETH</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Create Proposal
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h3 className="text-xl font-semibold mb-4">Create New Proposal</h3>

          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Proposal Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter proposal title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Voting Duration (days)
            </label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="7"
              min="1"
              max="365"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Submitting this proposal will cost {proposalFee} ETH
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !duration}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Submit Proposal"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setTitle("");
                setDuration("");
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateProposal;
