// import { ethers } from "hardhat";


// import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/bundle";

// import hre from "hardhat"
// import { FhevmType } from "@fhevm/mock-utils";
// // Replace this with the address of your deployed contract on localnet
// const contractAddress = "0x59f0D3aad473284e11dC9B645d49D9A255Ae4120";

// const abi = [
//     {
//         "inputs": [
//             {
//                 "internalType": "string",
//                 "name": "name_",
//                 "type": "string"
//             },
//             {
//                 "internalType": "string",
//                 "name": "symbol_",
//                 "type": "string"
//             }
//         ],
//         "stateMutability": "nonpayable",
//         "type": "constructor"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "owner",
//                 "type": "address"
//             }
//         ],
//         "name": "OwnableInvalidOwner",
//         "type": "error"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "account",
//                 "type": "address"
//             }
//         ],
//         "name": "OwnableUnauthorizedAccount",
//         "type": "error"
//     },
//     {
//         "anonymous": false,
//         "inputs": [
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "account",
//                 "type": "address"
//             }
//         ],
//         "name": "AddressAllowlisted",
//         "type": "event"
//     },
//     {
//         "anonymous": false,
//         "inputs": [
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "owner",
//                 "type": "address"
//             },
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "spender",
//                 "type": "address"
//             }
//         ],
//         "name": "Approval",
//         "type": "event"
//     },
//     {
//         "anonymous": false,
//         "inputs": [
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "to",
//                 "type": "address"
//             },
//             {
//                 "indexed": false,
//                 "internalType": "uint64",
//                 "name": "amount",
//                 "type": "uint64"
//             }
//         ],
//         "name": "Mint",
//         "type": "event"
//     },
//     {
//         "anonymous": false,
//         "inputs": [
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "previousOwner",
//                 "type": "address"
//             },
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "newOwner",
//                 "type": "address"
//             }
//         ],
//         "name": "OwnershipTransferStarted",
//         "type": "event"
//     },
//     {
//         "anonymous": false,
//         "inputs": [
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "previousOwner",
//                 "type": "address"
//             },
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "newOwner",
//                 "type": "address"
//             }
//         ],
//         "name": "OwnershipTransferred",
//         "type": "event"
//     },
//     {
//         "anonymous": false,
//         "inputs": [
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "from",
//                 "type": "address"
//             },
//             {
//                 "indexed": true,
//                 "internalType": "address",
//                 "name": "to",
//                 "type": "address"
//             }
//         ],
//         "name": "Transfer",
//         "type": "event"
//     },
//     {
//         "inputs": [],
//         "name": "acceptOwnership",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "addr",
//                 "type": "address"
//             }
//         ],
//         "name": "addToAllowlist",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "owner",
//                 "type": "address"
//             },
//             {
//                 "internalType": "address",
//                 "name": "spender",
//                 "type": "address"
//             }
//         ],
//         "name": "allowance",
//         "outputs": [
//             {
//                 "internalType": "euint64",
//                 "name": "",
//                 "type": "bytes32"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "",
//                 "type": "address"
//             }
//         ],
//         "name": "allowlist",
//         "outputs": [
//             {
//                 "internalType": "bool",
//                 "name": "",
//                 "type": "bool"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "uint256",
//                 "name": "",
//                 "type": "uint256"
//             }
//         ],
//         "name": "allowlistAddresses",
//         "outputs": [
//             {
//                 "internalType": "address",
//                 "name": "",
//                 "type": "address"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "spender",
//                 "type": "address"
//             },
//             {
//                 "internalType": "euint64",
//                 "name": "amount",
//                 "type": "bytes32"
//             }
//         ],
//         "name": "approve",
//         "outputs": [
//             {
//                 "internalType": "bool",
//                 "name": "",
//                 "type": "bool"
//             }
//         ],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "spender",
//                 "type": "address"
//             },
//             {
//                 "internalType": "externalEuint64",
//                 "name": "encryptedAmount",
//                 "type": "bytes32"
//             },
//             {
//                 "internalType": "bytes",
//                 "name": "inputProof",
//                 "type": "bytes"
//             }
//         ],
//         "name": "approve",
//         "outputs": [
//             {
//                 "internalType": "bool",
//                 "name": "",
//                 "type": "bool"
//             }
//         ],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "wallet",
//                 "type": "address"
//             }
//         ],
//         "name": "balanceOf",
//         "outputs": [
//             {
//                 "internalType": "euint64",
//                 "name": "",
//                 "type": "bytes32"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [],
//         "name": "decimals",
//         "outputs": [
//             {
//                 "internalType": "uint8",
//                 "name": "",
//                 "type": "uint8"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [],
//         "name": "getAllowlist",
//         "outputs": [
//             {
//                 "internalType": "address[]",
//                 "name": "",
//                 "type": "address[]"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "uint64",
//                 "name": "mintedAmount",
//                 "type": "uint64"
//             }
//         ],
//         "name": "mint",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [],
//         "name": "name",
//         "outputs": [
//             {
//                 "internalType": "string",
//                 "name": "",
//                 "type": "string"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [],
//         "name": "owner",
//         "outputs": [
//             {
//                 "internalType": "address",
//                 "name": "",
//                 "type": "address"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [],
//         "name": "pendingOwner",
//         "outputs": [
//             {
//                 "internalType": "address",
//                 "name": "",
//                 "type": "address"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "addr",
//                 "type": "address"
//             }
//         ],
//         "name": "removeFromAllowlist",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [],
//         "name": "renounceOwnership",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [],
//         "name": "symbol",
//         "outputs": [
//             {
//                 "internalType": "string",
//                 "name": "",
//                 "type": "string"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [],
//         "name": "totalSupply",
//         "outputs": [
//             {
//                 "internalType": "uint64",
//                 "name": "",
//                 "type": "uint64"
//             }
//         ],
//         "stateMutability": "view",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "to",
//                 "type": "address"
//             },
//             {
//                 "internalType": "externalEuint64",
//                 "name": "encryptedAmount",
//                 "type": "bytes32"
//             },
//             {
//                 "internalType": "bytes",
//                 "name": "inputProof",
//                 "type": "bytes"
//             }
//         ],
//         "name": "transfer",
//         "outputs": [
//             {
//                 "internalType": "bool",
//                 "name": "",
//                 "type": "bool"
//             }
//         ],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "to",
//                 "type": "address"
//             },
//             {
//                 "internalType": "euint64",
//                 "name": "amount",
//                 "type": "bytes32"
//             }
//         ],
//         "name": "transfer",
//         "outputs": [
//             {
//                 "internalType": "bool",
//                 "name": "",
//                 "type": "bool"
//             }
//         ],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "from",
//                 "type": "address"
//             },
//             {
//                 "internalType": "address",
//                 "name": "to",
//                 "type": "address"
//             },
//             {
//                 "internalType": "externalEuint64",
//                 "name": "encryptedAmount",
//                 "type": "bytes32"
//             },
//             {
//                 "internalType": "bytes",
//                 "name": "inputProof",
//                 "type": "bytes"
//             }
//         ],
//         "name": "transferFrom",
//         "outputs": [
//             {
//                 "internalType": "bool",
//                 "name": "",
//                 "type": "bool"
//             }
//         ],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "from",
//                 "type": "address"
//             },
//             {
//                 "internalType": "address",
//                 "name": "to",
//                 "type": "address"
//             },
//             {
//                 "internalType": "euint64",
//                 "name": "amount",
//                 "type": "bytes32"
//             }
//         ],
//         "name": "transferFrom",
//         "outputs": [
//             {
//                 "internalType": "bool",
//                 "name": "",
//                 "type": "bool"
//             }
//         ],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     },
//     {
//         "inputs": [
//             {
//                 "internalType": "address",
//                 "name": "newOwner",
//                 "type": "address"
//             }
//         ],
//         "name": "transferOwnership",
//         "outputs": [],
//         "stateMutability": "nonpayable",
//         "type": "function"
//     }
// ]
// async function main() {


//     if (hre.fhevm) {
//         await hre.fhevm.initializeCLIApi();
//         console.log("✅ FHEVM initialized via hre");
//     }
//     const instance = await createInstance(SepoliaConfig)



//     const [signer, _, bob] = await ethers.getSigners(); // Gets default localnet signer (unlocked)

//     const contract = new ethers.Contract(contractAddress, abi, signer)


//     const supplyAfter = await contract.totalSupply();
//     console.log("Total Supply After:", supplyAfter.toString());



//     // const allowList = await contract.getAllowlist();
//     // console.log("allowlist is==============", allowList)

//     // // Step 1: Add address to allowlist
//     // const allowedAddress = alice.address // <-- replace this
//     // console.log("allowedAddress=========", allowedAddress)
//     // const tx1 = await contract.addToAllowlist(allowedAddress);
//     // await tx1.wait();
//     // console.log(`✅ Added to allowlist: ${allowedAddress}`);


//     // // Step 2: Mint some tokens
//     // const mintAmount = ethers.parseUnits("100", 18); // Assuming 18 decimals
//     // const mintTx = await contract.mint(mintAmount);
//     // await mintTx.wait();
//     // console.log(`✅ Minted ${mintAmount.toString()} tokens`);

//     // // Step 3: Transfer tokens to allowed address
//     // const buffer = instance.createEncryptedInput(contractAddress, signer.address)
//     // buffer.add64(1000)
//     // const ciphertexts = await buffer.encrypt()

//     // const transferTx = await contract["transfer(address,bytes32,bytes)"](bob.address, ciphertexts.handles[0], ciphertexts.inputProof)
//     // console.log("transferTx=-===============", transferTx)

//     // console.log(`✅ Transferred ${100} tokens to ${bob.address}`);



//     // Step 1: Fetch the encrypted balance
//     const encryptedBalance = await contract.balanceOf(bob.address);
//     // const ciphertextHandle = encryptedBalance; // this is already a bytes32 handle

//     // Step 2: Generate a NaCl keypair for user-side encryption
//     // const keypair = instance.generateKeypair(); // or load from persistent storage

//     // // Step 3: Build handle-contract pair
//     // const handleContractPairs = [
//     //     {
//     //         handle: ciphertextHandle,
//     //         contractAddress: contractAddress,
//     //     },
//     // ];

//     // Step 4: Set up validity duration
//     // const startTimeStamp = Math.floor(Date.now() / 1000).toString();
//     // const durationDays = "10"; // must be string

//     // const contractAddresses = [contractAddress];

//     // Step 5: Create EIP712 signature
//     // const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);

//     // const signature = await signer.signTypedData(
//     //     eip712.domain,
//     //     {
//     //         UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
//     //     },
//     //     eip712.message,
//     // );

//     const bal = await hre.fhevm.userDecryptEuint(FhevmType.euint64, encryptedBalance, contractAddress, bob)
//     // Step 6: Perform user decryption (re-encryption for client use)
//     // const result = await instance.userDecrypt(
//     //     handleContractPairs,
//     //     keypair.privateKey,
//     //     keypair.publicKey,
//     //     signature.replace("0x", ""), // required format
//     //     contractAddresses,
//     //     bob.address, // user address
//     //     startTimeStamp,
//     //     durationDays,
//     // );

//     console.log("balance is -------------", bal)

//     // Step 7: Extract and log the decrypted value
//     // const decryptedValue = result[ciphertextHandle];
//     // console.log("🔓 Decrypted balance of Bob:", decryptedValue);
// }

// main().catch(console.error);

