import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact with FHEGovernance Locally (--network localhost)
 * ==============================================================================
 *
 * 1. From a separate terminal window:
 *   npx hardhat node
 *
 * 2. Deploy the FHEGovernance contract:
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the FHEGovernance contract:
 *   npx hardhat --network localhost task:governance-address
 *   npx hardhat --network localhost task:submit-proposal --title "Increase Treasury" --duration 3600
 *   npx hardhat --network localhost task:vote --proposalId 1 --support true
 *   npx hardhat --network localhost task:get-proposal --proposalId 1
 *   npx hardhat --network localhost task:end-voting --proposalId 1
 *   npx hardhat --network localhost task:decrypt-votes --proposalId 1
 *   npx hardhat --network localhost task:decrypt-result --proposalId 1
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * =============================================================
 *
 * 1. Deploy the FHEGovernance contract:
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the FHEGovernance contract:
 *   npx hardhat --network sepolia task:governance-address
 *   npx hardhat --network sepolia task:submit-proposal --title "Increase Treasury" --duration 86400
 *   npx hardhat --network sepolia task:vote --proposalId 1 --support true
 *   npx hardhat --network sepolia task:get-proposal --proposalId 1
 *   npx hardhat --network sepolia task:end-voting --proposalId 1
 *   npx hardhat --network sepolia task:decrypt-votes --proposalId 1
 *   npx hardhat --network sepolia task:decrypt-result --proposalId 1
 */

/**
 * Get FHEGovernance contract address
 * Example: npx hardhat --network localhost task:governance-address
 */
task("task:governance-address", "Prints the FHEGovernance address").setAction(async function (
  _taskArguments: TaskArguments,
  hre,
) {
  const { deployments } = hre;

  const fheGovernance = await deployments.get("FHEGovernance");

  console.log("FHEGovernance address is " + fheGovernance.address);
});

/**
 * Submit a new proposal
 * Example: npx hardhat --network localhost task:submit-proposal --title "Increase Treasury Allocation" --duration 3600
 */
task("task:submit-proposal", "Submit a new proposal")
  .addOptionalParam("address", "Optionally specify the FHEGovernance contract address")
  .addParam("title", "The proposal title")
  .addParam("duration", "Voting duration in seconds")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const duration = parseInt(taskArguments.duration);
    if (!Number.isInteger(duration) || duration <= 0) {
      throw new Error(`Argument --duration must be a positive integer`);
    }

    const FHEGovernanceDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHEGovernance");

    console.log(`FHEGovernance: ${FHEGovernanceDeployment.address}`);

    const signers = await ethers.getSigners();
    const governanceContract = await ethers.getContractAt("FHEGovernance", FHEGovernanceDeployment.address);

    // Get proposal fee
    const proposalFee = await governanceContract.proposalFee();
    console.log(`Proposal fee: ${ethers.formatEther(proposalFee)} ETH`);

    const tx = await governanceContract
      .connect(signers[0])
      .submitProposal(taskArguments.title, duration, { value: proposalFee });

    console.log(`Wait for tx: ${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx: ${tx.hash} status=${receipt?.status}`);

    const proposalCreatedEvent = receipt?.logs.find((log) => {
      try {
        const parsed = governanceContract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        return parsed?.name === "ProposalCreated";
      } catch {
        return false;
      }
    });

    if (proposalCreatedEvent) {
      const parsedEvent = governanceContract.interface.parseLog({
        topics: proposalCreatedEvent.topics as string[],
        data: proposalCreatedEvent.data,
      });
      console.log(`✅ Proposal created with ID: ${parsedEvent?.args[0]}`);
    }

    console.log(`Proposal "${taskArguments.title}" submitted successfully!`);
  });

/**
 * Vote on a proposal
 * Example: npx hardhat --network localhost task:vote --proposalId 1 --support true
 */
task("task:vote", "Vote on a proposal")
  .addOptionalParam("address", "Optionally specify the FHEGovernance contract address")
  .addParam("proposalId", "The proposal ID to vote on")
  .addParam("support", "Vote support (true for yes, false for no)")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const proposalId = parseInt(taskArguments.proposalId);
    const support = taskArguments.support.toLowerCase() === "true";

    if (!Number.isInteger(proposalId) || proposalId <= 0) {
      throw new Error(`Argument --proposalId must be a positive integer`);
    }

    await fhevm.initializeCLIApi();

    const FHEGovernanceDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHEGovernance");

    console.log(`FHEGovernance: ${FHEGovernanceDeployment.address}`);
    console.log(`Voting ${support ? "YES" : "NO"} on proposal ${proposalId}`);

    const signers = await ethers.getSigners();
    const governanceContract = await ethers.getContractAt("FHEGovernance", FHEGovernanceDeployment.address);

    const hasVoted = await governanceContract.hasVoted(signers[0].address, proposalId);
    if (hasVoted) {
      console.log("❌ You have already voted on this proposal!");
      return;
    }

    const encryptedVote = await fhevm
      .createEncryptedInput(FHEGovernanceDeployment.address, signers[0].address)
      .addBool(support)
      .encrypt();

    const tx = await governanceContract
      .connect(signers[0])
      .vote(proposalId, encryptedVote.handles[0], encryptedVote.inputProof);

    console.log(`Wait for tx: ${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx: ${tx.hash} status=${receipt?.status}`);

    console.log(`✅ Vote cast successfully on proposal ${proposalId}!`);
  });

/**
 * Get proposal details including encrypted vote counts
 * Example: npx hardhat --network localhost task:get-proposal --proposalId 1
 */
task("task:get-proposal", "Get proposal details")
  .addOptionalParam("address", "Optionally specify the FHEGovernance contract address")
  .addParam("proposalId", "The proposal ID to query")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const proposalId = parseInt(taskArguments.proposalId);
    if (!Number.isInteger(proposalId) || proposalId <= 0) {
      throw new Error(`Argument --proposalId must be a positive integer`);
    }

    const FHEGovernanceDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHEGovernance");

    console.log(`FHEGovernance: ${FHEGovernanceDeployment.address}`);

    // const signers = await ethers.getSigners();
    const governanceContract = await ethers.getContractAt("FHEGovernance", FHEGovernanceDeployment.address);

    const rawProposal = await governanceContract.getProposal(proposalId);

    console.log(`📋 Proposal ${proposalId} Details:`);
    console.log(`Title: ${rawProposal[0]}`);
    console.log(`Expiration: ${new Date(Number(rawProposal[1]) * 1000).toLocaleString()}`);
    console.log(`🔒 Encrypted YES votes: ${rawProposal[2]}`);
    console.log(`🔒 Encrypted NO votes: ${rawProposal[3]}`);
    console.log(`🔒 Encrypted result: ${rawProposal[4]}`);
    console.log(`Proposer: ${rawProposal[5]}`);
    console.log(`Is Active: ${rawProposal[6]}`);
    console.log(`Result Computed: ${rawProposal[7]}`);

    const hasEnded = await governanceContract.hasVotingEnded(proposalId);
    console.log(`Voting Ended: ${hasEnded}`);

    // const hasVoted = await governanceContract.hasVoted(signers[0].address, proposalId);
    // console.log(`You have voted: ${hasVoted ? "✅ Yes" : "❌ No"}`);
  });

/**
 * End voting for a proposal
 * Example: npx hardhat --network localhost task:end-voting --proposalId 1
 */
task("task:end-voting", "End voting for a proposal")
  .addOptionalParam("address", "Optionally specify the FHEGovernance contract address")
  .addParam("proposalId", "The proposal ID to end voting for")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const proposalId = parseInt(taskArguments.proposalId);
    if (!Number.isInteger(proposalId) || proposalId <= 0) {
      throw new Error(`Argument --proposalId must be a positive integer`);
    }

    const FHEGovernanceDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHEGovernance");

    console.log(`FHEGovernance: ${FHEGovernanceDeployment.address}`);

    const signers = await ethers.getSigners();
    const governanceContract = await ethers.getContractAt("FHEGovernance", FHEGovernanceDeployment.address);

    const hasEnded = await governanceContract.hasVotingEnded(proposalId);
    if (!hasEnded) {
      console.log("❌ Voting period has not ended yet!");
      return;
    }

    const proposal = await governanceContract.getProposal(proposalId);
    if (!proposal[6]) {
      console.log("❌ Proposal is no longer active!");
      return;
    }

    const tx = await governanceContract.connect(signers[0]).endVoting(proposalId);

    console.log(`Wait for tx: ${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx: ${tx.hash} status=${receipt?.status}`);

    console.log(`✅ Voting ended for proposal ${proposalId}!`);
    console.log(`📊 Encrypted result has been computed and is now available for decryption.`);
  });

/**
 * Decrypt vote results for a proposal
 * Example: npx hardhat --network localhost task:decrypt-votes --proposalId 1
 */
task("task:decrypt-votes", "Decrypt vote results for a proposal")
  .addOptionalParam("address", "Optionally specify the FHEGovernance contract address")
  .addParam("proposalId", "The proposal ID to decrypt votes for")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const proposalId = parseInt(taskArguments.proposalId);
    if (!Number.isInteger(proposalId) || proposalId <= 0) {
      throw new Error(`Argument --proposalId must be a positive integer`);
    }

    await fhevm.initializeCLIApi();

    const FHEGovernanceDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHEGovernance");

    console.log(`FHEGovernance: ${FHEGovernanceDeployment.address}`);

    const signers = await ethers.getSigners();
    const governanceContract = await ethers.getContractAt("FHEGovernance", FHEGovernanceDeployment.address);

    const proposal = await governanceContract.getProposal(proposalId);
    if (!proposal[7]) {
      console.log("❌ Voting has not ended yet or result has not been computed!");
      return;
    }

    const [encryptedYesVotes, encryptedNoVotes] = await governanceContract.getVoteCounts(proposalId);

    console.log(`Attempting to decrypt votes for proposal ${proposalId}...`);

    try {
      const clearYesVotes = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedYesVotes,
        FHEGovernanceDeployment.address,
        signers[0],
      );

      const clearNoVotes = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedNoVotes,
        FHEGovernanceDeployment.address,
        signers[0],
      );

      console.log(`\n📊 Vote Results for Proposal ${proposalId}:`);
      console.log(`YES votes: ${clearYesVotes}`);
      console.log(`NO votes: ${clearNoVotes}`);
      console.log(`Total votes: ${clearYesVotes + clearNoVotes}`);

      if (clearYesVotes + clearNoVotes > 0) {
        const result = clearYesVotes > clearNoVotes ? "PASSED" : "REJECTED";
        console.log(`Result: ${result} ${result === "PASSED" ? "✅" : "❌"}`);
      } else {
        console.log(`Result: No votes cast`);
      }
    } catch (error) {
      console.log("❌ Unable to decrypt votes. You may not have permission or be the owner/proposer.", error);
      console.log("Only the contract owner and proposal proposer can decrypt vote counts.");
    }
  });

task("task:advance-time", "Advance Hardhat time")
  .addParam("seconds", "How many seconds to advance")
  .setAction(async ({ seconds }, hre) => {
    await hre.network.provider.send("evm_increaseTime", [parseInt(seconds)]);
    await hre.network.provider.send("evm_mine");
    console.log(`⏩ Advanced time by ${seconds} seconds.`);
  });

/**
 * Decrypt the final result of a proposal
 * Example: npx hardhat --network localhost task:decrypt-result --proposalId 1
 */
task("task:decrypt-result", "Decrypt the final result of a proposal")
  .addOptionalParam("address", "Optionally specify the FHEGovernance contract address")
  .addParam("proposalId", "The proposal ID to decrypt result for")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const proposalId = parseInt(taskArguments.proposalId);
    if (!Number.isInteger(proposalId) || proposalId <= 0) {
      throw new Error(`Argument --proposalId must be a positive integer`);
    }

    await fhevm.initializeCLIApi();

    const FHEGovernanceDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHEGovernance");

    console.log(`FHEGovernance: ${FHEGovernanceDeployment.address}`);

    const signers = await ethers.getSigners();
    const governanceContract = await ethers.getContractAt("FHEGovernance", FHEGovernanceDeployment.address);

    // Check if result has been computed
    const [encryptedResult, resultComputed] = await governanceContract.getProposalResult(proposalId);

    if (!resultComputed) {
      console.log("❌ Voting has not ended yet or result has not been computed!");
      return;
    }

    console.log(`Attempting to decrypt result for proposal ${proposalId}...`);

    try {
      const clearResult = await fhevm.userDecryptEbool(encryptedResult, FHEGovernanceDeployment.address, signers[0]);

      console.log(`\n🏆 Final Result for Proposal ${proposalId}:`);
      console.log(`Result: ${clearResult ? "PASSED ✅" : "REJECTED ❌"}`);
    } catch (error) {
      console.log("❌ Unable to decrypt result. You may not have permission or be the owner/proposer.", error);
      console.log("Only the contract owner and proposal proposer can decrypt the result.");
    }
  });

/**
 * Check if user has voted on a proposal
 * Example: npx hardhat --network localhost task:check-vote-status --proposalId 1
 */
task("task:check-vote-status", "Check if current user has voted on a proposal")
  .addOptionalParam("address", "Optionally specify the FHEGovernance contract address")
  .addParam("proposalId", "The proposal ID to check")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const proposalId = parseInt(taskArguments.proposalId);
    if (!Number.isInteger(proposalId) || proposalId <= 0) {
      throw new Error(`Argument --proposalId must be a positive integer`);
    }

    const FHEGovernanceDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHEGovernance");

    console.log(`FHEGovernance: ${FHEGovernanceDeployment.address}`);

    const signers = await ethers.getSigners();
    const governanceContract = await ethers.getContractAt("FHEGovernance", FHEGovernanceDeployment.address);

    const hasVoted = await governanceContract.hasVoted(signers[0].address, proposalId);
    const voterAddress = signers[0].address;

    console.log(`\n📊 Vote Status for Proposal ${proposalId}:`);
    console.log(`Voter: ${voterAddress}`);
    console.log(`Has Voted: ${hasVoted ? "✅ Yes" : "❌ No"}`);
  });

/**
 * Get contract status and info
 * Example: npx hardhat --network localhost task:governance-status
 */
task("task:governance-status", "Get governance contract status")
  .addOptionalParam("address", "Optionally specify the FHEGovernance contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const FHEGovernanceDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHEGovernance");

    console.log(`FHEGovernance: ${FHEGovernanceDeployment.address}`);

    const signers = await ethers.getSigners();
    const governanceContract = await ethers.getContractAt("FHEGovernance", FHEGovernanceDeployment.address);

    const owner = await governanceContract.owner();
    const proposalFee = await governanceContract.proposalFee();
    const nextProposalId = await governanceContract.nextProposalId();
    const contractBalance = await ethers.provider.getBalance(FHEGovernanceDeployment.address);

    console.log(`\n📋 Governance Contract Status:`);
    console.log(`Owner: ${owner}`);
    console.log(`Proposal Fee: ${ethers.formatEther(proposalFee)} ETH`);
    console.log(`Next Proposal ID: ${nextProposalId}`);
    console.log(`Contract Balance: ${ethers.formatEther(contractBalance)} ETH`);
    console.log(`Total Proposals: ${Number(nextProposalId) - 1}`);
    console.log(`Current User: ${signers[0].address}`);
    console.log(`Is Owner: ${owner.toLowerCase() === signers[0].address.toLowerCase() ? "✅ Yes" : "❌ No"}`);
  });

/**
 * Set proposal fee (owner only)
 * Example: npx hardhat --network localhost task:set-proposal-fee --fee 0.01
 */
task("task:set-proposal-fee", "Set the proposal fee (owner only)")
  .addOptionalParam("address", "Optionally specify the FHEGovernance contract address")
  .addParam("fee", "The new proposal fee in ETH")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const fee = parseFloat(taskArguments.fee);
    if (!Number.isFinite(fee) || fee < 0) {
      throw new Error(`Argument --fee must be a non-negative number`);
    }

    const FHEGovernanceDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHEGovernance");

    console.log(`FHEGovernance: ${FHEGovernanceDeployment.address}`);

    const signers = await ethers.getSigners();
    const governanceContract = await ethers.getContractAt("FHEGovernance", FHEGovernanceDeployment.address);

    const owner = await governanceContract.owner();
    if (owner.toLowerCase() !== signers[0].address.toLowerCase()) {
      console.log("❌ Only the contract owner can set the proposal fee!");
      return;
    }

    const feeWei = ethers.parseEther(fee.toString());
    const tx = await governanceContract.connect(signers[0]).setProposalFee(feeWei);

    console.log(`Wait for tx: ${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx: ${tx.hash} status=${receipt?.status}`);

    console.log(`✅ Proposal fee updated to ${fee} ETH`);
  });

/**
 * Withdraw collected fees (owner only)
 * Example: npx hardhat --network localhost task:withdraw-fees
 */
task("task:withdraw-fees", "Withdraw collected proposal fees (owner only)")
  .addOptionalParam("address", "Optionally specify the FHEGovernance contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const FHEGovernanceDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("FHEGovernance");

    console.log(`FHEGovernance: ${FHEGovernanceDeployment.address}`);

    const signers = await ethers.getSigners();
    const governanceContract = await ethers.getContractAt("FHEGovernance", FHEGovernanceDeployment.address);

    const owner = await governanceContract.owner();
    if (owner.toLowerCase() !== signers[0].address.toLowerCase()) {
      console.log("❌ Only the contract owner can withdraw fees!");
      return;
    }

    const contractBalance = await ethers.provider.getBalance(FHEGovernanceDeployment.address);
    if (contractBalance === 0n) {
      console.log("❌ No fees to withdraw!");
      return;
    }

    console.log(`Withdrawing ${ethers.formatEther(contractBalance)} ETH...`);

    const tx = await governanceContract.connect(signers[0]).withdrawFees();

    console.log(`Wait for tx: ${tx.hash}...`);
    const receipt = await tx.wait();
    console.log(`tx: ${tx.hash} status=${receipt?.status}`);

    console.log(`✅ Fees withdrawn successfully!`);
  });
