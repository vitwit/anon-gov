# 🔐 EncryptedERC20 Token - Hardhat Project

This project demonstrates a Fully Homomorphic Encryption (FHE)-powered ERC20 token using [Zama's FHEVM](https://docs.zama.ai/fhevm/). It enables encrypted balances, private transfers, and allowlist management.

> You can deploy and interact with the contract both **locally** and on **Sepolia** using Hardhat tasks.

For Sepolia
Try to configure the mnemonic in the hardhat config before doing any transaction

---


## ⚙️ Setup

### 1. Install dependencies

```bash
npm install
``` 

### 2. Compile contracts
```bash
npx hardhat compile
```



### 3. 🚀 Deployment
#### Localhost
##### Start a local Hardhat node:

```bash
npx hardhat node --network localhost
```

##### Deploy to local network:
```bash
npx hardhat --network localhost deploy
```

## Run Test

```bash
npx hardhat test --network localhost
```

### 🧪 Tasks (CLI)

#### ✅ Get Contract Address
```bash
npx hardhat --network <network> task:address
```

#### 📊 Token Information
```bash
npx hardhat --network <network> task:token-info
```

#### 🪙 Mint Tokens to Owner
```bash
npx hardhat --network <network> task:mint --amount 1000000
```

#### 🔐 Decrypt Encrypted Balance
```bash
npx hardhat --network <network> task:decrypt-balance --address 0xYourAddress
```


#### 🔁 Transfer Tokens (Owner ➝ Address)
```bash
npx hardhat --network <network> task:transfer --to 0xRecipient --amount 100000
```

#### ➕ Add to Allowlist
```bash
npx hardhat --network <network> task:add-to-allowlist --address 0xAddress
```

#### ➖ Remove from Allowlist
```bash
npx hardhat --network <network> task:remove-from-allowlist --address 0xAddress
```
#### 📋 Get Allowlist
```bash
npx hardhat --network <network> task:get-allowlist
```