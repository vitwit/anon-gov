# FHE Governance Contract - Anonymous Voting System

A decentralized governance contract built with Fully Homomorphic Encryption (FHE) that enables completely private and
anonymous voting on blockchain proposals. Built on the FHEVM (Fully Homomorphic Encryption Virtual Machine) using Zama's
encryption technology.

## 🔐 Overview

This governance system allows users to:

- Submit proposals with customizable voting durations
- Cast encrypted votes that remain private throughout the process
- Compute results without revealing individual vote choices
- Only decrypt final results after voting ends (by authorized users)

**Key Privacy Features:**

- ✅ Vote choices are encrypted and never revealed publicly
- ✅ Vote counts remain encrypted until authorized decryption
- ✅ Results are computed homomorphically (without decryption)
- ✅ Only contract owner and proposers can decrypt final results

## 🏗️ Architecture

### Smart Contract Components

**Core Structures:**

```solidity
struct Proposal {
  string title; // Proposal description
  uint256 expiration; // Voting deadline timestamp
  euint32 yesVotes; // Encrypted YES vote count
  euint32 noVotes; // Encrypted NO vote count
  ebool result; // Encrypted result (pass/fail)
  address proposer; // Who submitted the proposal
  bool isActive; // Whether voting is ongoing
  bool resultComputed; // Whether final result is calculated
}
```

**Privacy Mechanisms:**

- `euint32`: Encrypted 32-bit integers for vote counts
- `ebool`: Encrypted boolean for vote choices and results
- FHE operations: `FHE.add()`, `FHE.select()`, `FHE.gt()` for encrypted computation

### Workflow

1. **Proposal Submission** → Pay fee, set duration, create encrypted vote containers
2. **Private Voting** → Submit encrypted votes with zero-knowledge proofs
3. **Voting Period** → Votes accumulate in encrypted form
4. **Result Computation** → Calculate winner without decryption
5. **Result Revelation** → Authorized parties decrypt final outcome

## 🚀 Quick Start

### Prerequisites

```bash
# Required dependencies
npm install @fhevm/hardhat-plugin
npm install @fhevm/solidity
```

### Installation & Deployment

1. **Clone and Setup**

```bash
git clone https://github.com/vitwit/anon-gov.git
cd anon-gov
npm install
```

2. **Start Local Network**

```bash
# Terminal 1
npx hardhat node
```

3. **Compile & Deploy Contract**

```bash
# Terminal 2
npx hardhat compile
npx hardhat --network localhost deploy
```

## 📋 Usage Guide

### 1. Check Contract Status

```bash
npx hardhat --network localhost task:governance-status
```

**Output:**

```
📋 Governance Contract Status:
Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Proposal Fee: 0.0 ETH
Next Proposal ID: 1
Contract Balance: 0.0 ETH
Current User: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Is Owner: ✅ Yes
```

### 2. Submit a Proposal

```bash
npx hardhat --network localhost task:submit-proposal \
  --title "Increase Treasury Allocation" \
  --duration 3600
```

**What happens:**

- Proposal fee is charged (if set)
- Voting period starts immediately
- Encrypted vote containers are initialized
- Unique proposal ID is generated

### 3. Cast Anonymous Votes

```bash
# Vote YES
npx hardhat --network localhost task:vote \
  --proposal-id 1 \
  --support true

# Vote NO
npx hardhat --network localhost task:vote \
  --proposal-id 1 \
  --support false
```

**Privacy Protection:**

- Your vote choice is encrypted client-side
- Zero-knowledge proof verifies vote validity
- No one can see how you voted (including contract owner)
- One vote per address per proposal

### 4. Monitor Proposal Status

```bash
npx hardhat --network localhost task:get-proposal --proposal-id 1
```

**Example Output:**

```
📋 Proposal 1 Details:
Title: Increase Treasury Allocation
Expiration: 8/7/2025, 2:30:00 PM
🔒 Encrypted YES votes: 0x91c777716e5e5617f5ea332c18b3630a...
🔒 Encrypted NO votes: 0x91c777716e5e5617f5ea332c18b3630a...
🔒 Encrypted result: 0x6e4f3dc8aeeb0813ed96a226037ceb8d...
Proposer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Is Active: true
Result Computed: false
Voting Ended: false
```

### 5. End Voting Period

```bash
# Wait for expiration or advance time (localhost only)
npx hardhat --network localhost task:advance-time --seconds 3600

# End voting and compute result
npx hardhat --network localhost task:end-voting --proposal-id 1
```

### 6. Decrypt Results (Authorized Users Only)

```bash
# Decrypt vote counts
npx hardhat --network localhost task:decrypt-votes --proposal-id 1
```

**Output:**

```
📊 Vote Results for Proposal 1:
YES votes: 5
NO votes: 2
Total votes: 7
Result: PASSED ✅
```

```bash
# Decrypt final result
npx hardhat --network localhost task:decrypt-result --proposal-id 1
```

**Output:**

```
🏆 Final Result for Proposal 1:
Result: PASSED ✅
```

## 🔒 Privacy & Security Features

### Encryption Technology

- **FHE (Fully Homomorphic Encryption)**: Enables computation on encrypted data
- **Zero-Knowledge Proofs**: Verify vote validity without revealing content
- **Client-Side Encryption**: Votes are encrypted before leaving user's device

### Access Control

| Operation           | Who Can Access             |
| ------------------- | -------------------------- |
| Submit Proposal     | Anyone (with fee)          |
| Cast Vote           | Anyone (once per proposal) |
| View Encrypted Data | Everyone (but unreadable)  |
| Decrypt Vote Counts | Owner + Proposer only      |
| Decrypt Results     | Owner + Proposer only      |
| End Voting          | Anyone (after expiration)  |

### Security Guarantees

- ✅ **Vote Privacy**: Individual votes never revealed
- ✅ **Result Integrity**: Cannot manipulate encrypted computations
- ✅ **Double Voting Prevention**: One vote per address enforcement
- ✅ **Time-Locked Results**: Cannot decrypt until voting ends
- ✅ **Audit Trail**: All actions logged via events

## 🛠️ Advanced Operations

### Administrative Functions

**Set Proposal Fee** (Owner Only)

```bash
npx hardhat --network localhost task:set-proposal-fee --fee 0.01
```

**Withdraw Collected Fees** (Owner Only)

```bash
npx hardhat --network localhost task:withdraw-fees
```

**Check Your Vote Status**

```bash
npx hardhat --network localhost task:check-vote-status --proposal-id 1
```

### Using Custom Contract Address

All tasks support the `--address` parameter:

```bash
npx hardhat --network localhost task:vote \
  --address 0x1234567890123456789012345678901234567890 \
  --proposal-id 1 \
  --support true
```

## 🌐 Network Deployment

### Localhost Development

```bash
# Start local node
npx hardhat node

# Deploy and interact
npx hardhat --network localhost deploy
npx hardhat --network localhost task:submit-proposal --title "Test" --duration 3600
```

### Sepolia Testnet

```bash
# Deploy to Sepolia
npx hardhat --network sepolia deploy

# Use longer durations for testnet
npx hardhat --network sepolia task:submit-proposal \
  --title "Sepolia Test Proposal" \
  --duration 86400  # 24 hours
```

## 📈 Event Tracking

The contract emits events for monitoring:

```solidity
event ProposalCreated(uint256 proposalId, string title, uint256 expiration, address proposer);
event VoteCast(address indexed voter, uint256 proposalId);
event VotingEnded(uint256 proposalId);
event ResultComputed(uint256 proposalId);
```

---
