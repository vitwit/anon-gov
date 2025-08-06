import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the EncryptedERC20 contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the EncryptedERC20 contract
 *
 *   npx hardhat --network localhost task:token-info
 *   npx hardhat --network localhost task:mint --amount 1000000
 *   npx hardhat --network localhost task:decrypt-balance --address 0x...
 * 
 *   npx hardhat --network localhost task:add-to-allowlist --address 0x...
 *   npx hardhat --network localhost task:transfer --to 0x... --amount 100000
 * 
 *   npx hardhat --network localhost task:transfer-from --from 0x --to 0x... --amount 100000
 * 
 *   npx hardhat --network localhost task:decrypt-balance --address 0x...
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the EncryptedERC20 contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the EncryptedERC20 contract
 *
 *   npx hardhat --network sepolia task:token-info
 *   npx hardhat --network sepolia task:mint --amount 1000000
 *   npx hardhat --network sepolia task:decrypt-balance --address 0x...
 * 
 *   npx hardhat --network sepolia task:add-to-allowlist --address 0x...
 *  npx hardhat --network sepolia task:decrypt-balance  --address 0x...

 *   npx hardhat --network sepolia task:transfer --to 0x... --amount 100000
 * 
 *   npx hardhat --network sepolia task:transfer-from --from 0x --to 0x... --amount 100000
 * 
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:address
 *   - npx hardhat --network sepolia task:address
 */
task("task:address", "Prints the EncryptedERC20 contract address").setAction(async function (_taskArguments: TaskArguments, hre) {
    const { deployments } = hre;

    const encryptedERC20 = await deployments.get("EncryptedERC20");

    console.log("EncryptedERC20 address is " + encryptedERC20.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:token-info
 *   - npx hardhat --network sepolia task:token-info
 */
task("task:token-info", "Gets basic token information")
    .addOptionalParam("address", "Optionally specify the EncryptedERC20 contract address")
    .setAction(async function (taskArguments: TaskArguments, hre) {
        const { ethers, deployments } = hre;

        const EncryptedERC20Deployment = taskArguments.address
            ? { address: taskArguments.address }
            : await deployments.get("EncryptedERC20");

        console.log(`EncryptedERC20: ${EncryptedERC20Deployment.address}`);

        const encryptedERC20Contract = await ethers.getContractAt("EncryptedERC20", EncryptedERC20Deployment.address);

        const name = await encryptedERC20Contract.name();
        const symbol = await encryptedERC20Contract.symbol();
        const decimals = await encryptedERC20Contract.decimals();
        const totalSupply = await encryptedERC20Contract.totalSupply();
        const owner = await encryptedERC20Contract.owner();

        console.log(`Token Name    : ${name}`);
        console.log(`Token Symbol  : ${symbol}`);
        console.log(`Decimals      : ${decimals}`);
        console.log(`Total Supply  : ${totalSupply}`);
        console.log(`Owner         : ${owner}`);
    });

/**
 * Example:
 *   - npx hardhat --network localhost task:mint --amount 1000000
 *   - npx hardhat --network sepolia task:mint --amount 1000000
 */
task("task:mint", "Mints tokens to the owner")
    .addOptionalParam("address", "Optionally specify the EncryptedERC20 contract address")
    .addParam("amount", "The amount of tokens to mint")
    .setAction(async function (taskArguments: TaskArguments, hre) {
        const { ethers, deployments } = hre;

        const amount = parseInt(taskArguments.amount);
        if (!Number.isInteger(amount) || amount <= 0) {
            throw new Error(`Argument --amount must be a positive integer`);
        }

        const EncryptedERC20Deployment = taskArguments.address
            ? { address: taskArguments.address }
            : await deployments.get("EncryptedERC20");

        console.log(`EncryptedERC20: ${EncryptedERC20Deployment.address}`);

        const signers = await ethers.getSigners();
        const encryptedERC20Contract = await ethers.getContractAt("EncryptedERC20", EncryptedERC20Deployment.address);

        //signer[0] is the owner of the contract
        const tx = await encryptedERC20Contract.connect(signers[0]).mint(amount);
        console.log(`Wait for tx: ${tx.hash}...`);

        const receipt = await tx.wait();
        console.log(`tx: ${tx.hash} status=${receipt?.status}`);

        const newTotalSupply = await encryptedERC20Contract.totalSupply();
        console.log(`New total supply: ${newTotalSupply}`);

        console.log(`EncryptedERC20 mint(${amount}) succeeded!`);
    });

/**
 * Example:
 *   - npx hardhat --network localhost task:decrypt-balance --address 0x123...
 *   - npx hardhat --network sepolia task:decrypt-balance --address 0x123...
 */
task("task:decrypt-balance", "Decrypts and displays the balance of an address")
    .addOptionalParam("contractaddress", "Optionally specify the EncryptedERC20 contract address")
    .addOptionalParam("address", "The address to check the balance of")
    .setAction(async function (taskArguments: TaskArguments, hre) {
        const { ethers, deployments, fhevm } = hre;

        await fhevm.initializeCLIApi();

        const EncryptedERC20Deployment = taskArguments.contractaddress
            ? { address: taskArguments.contractaddress }
            : await deployments.get("EncryptedERC20");

        console.log(`EncryptedERC20: ${EncryptedERC20Deployment.address}`);

        const encryptedERC20Contract = await ethers.getContractAt("EncryptedERC20", EncryptedERC20Deployment.address);

        const encryptedBalance = await encryptedERC20Contract.balanceOf(taskArguments.address);

        if (encryptedBalance === ethers.ZeroHash) {
            console.log(`Encrypted balance: ${encryptedBalance}`);
            console.log("Clear balance    : 0");
            return;
        }

        try {
            const user = await hre.ethers.getSigner(taskArguments.address);
            const clearBalance = await fhevm.userDecryptEuint(
                FhevmType.euint64,
                encryptedBalance,
                EncryptedERC20Deployment.address,
                user,
            );
            console.log(`Address          : ${taskArguments.address}`);
            console.log(`Encrypted balance: ${encryptedBalance}`);
            console.log(`Clear balance    : ${clearBalance}`);
        } catch (error) {
            console.log(`Address          : ${taskArguments.address}`);
            console.log(`Encrypted balance: ${encryptedBalance}`);
            console.log("Clear balance    : Unable to decrypt (insufficient permissions)");
        }
    });

/**
 * // this transfers the amount from the owner of the contract to the recipient
 * Example:
 *   - npx hardhat --network localhost task:transfer --to 0x123... --amount 100000
 *   - npx hardhat --network sepolia task:transfer --to 0x123... --amount 100000
 */
task("task:transfer", "Transfers tokens to an address")
    .addOptionalParam("contractaddress", "Optionally specify the EncryptedERC20 contract address")
    .addParam("to", "The recipient address")
    .addParam("amount", "The amount of tokens to transfer")
    .setAction(async function (taskArguments: TaskArguments, hre) {
        const { ethers, deployments, fhevm } = hre;

        const amount = parseInt(taskArguments.amount);
        if (!Number.isInteger(amount) || amount <= 0) {
            throw new Error(`Argument --amount must be a positive integer`);
        }

        await fhevm.initializeCLIApi();

        const EncryptedERC20Deployment = taskArguments.contractaddress
            ? { address: taskArguments.contractaddress }
            : await deployments.get("EncryptedERC20");

        console.log(`EncryptedERC20: ${EncryptedERC20Deployment.address}`);

        const signers = await ethers.getSigners();
        const encryptedERC20Contract = await ethers.getContractAt("EncryptedERC20", EncryptedERC20Deployment.address);

        // Encrypt the amount
        const encryptedAmount = await fhevm
            .createEncryptedInput(EncryptedERC20Deployment.address, signers[0].address)
            .add64(amount)
            .encrypt();

        const tx = await encryptedERC20Contract
            .connect(signers[0])["transfer(address,bytes32,bytes)"](taskArguments.to, encryptedAmount.handles[0], encryptedAmount.inputProof);

        console.log(`Wait for tx: ${tx.hash}...`);

        const receipt = await tx.wait();
        console.log(`tx: ${tx.hash} status=${receipt?.status}`);

        console.log(`EncryptedERC20 transfer(${taskArguments.to.toString()}, ${amount}) succeeded!`);
    });

/**
 * Transferes the tokens from one address to another address
 * Example:
 *   - npx hardhat --network localhost task:transfer-from --from 0x123... --to 0x456... --amount 25000
 *   - npx hardhat --network sepolia task:transfer-from --from 0x123... --to 0x456... --amount 25000
 */
task("task:transfer-from", "Transfers tokens from one address to another using allowance")
    .addOptionalParam("contractaddress", "Optionally specify the EncryptedERC20 contract address")
    .addParam("from", "The source address")
    .addParam("to", "The recipient address")
    .addParam("amount", "The amount of tokens to transfer")
    .setAction(async function (taskArguments: TaskArguments, hre) {
        const { ethers, deployments, fhevm } = hre;

        const amount = parseInt(taskArguments.amount);
        if (!Number.isInteger(amount) || amount <= 0) {
            throw new Error(`Argument --amount must be a positive integer`);
        }

        await fhevm.initializeCLIApi();

        const EncryptedERC20Deployment = taskArguments.contractaddress
            ? { address: taskArguments.contractaddress }
            : await deployments.get("EncryptedERC20");

        console.log(`EncryptedERC20: ${EncryptedERC20Deployment.address}`);

        const signers = await ethers.getSigners();
        const encryptedERC20Contract = await ethers.getContractAt("EncryptedERC20", EncryptedERC20Deployment.address);

        // Encrypt the amount
        const encryptedAmount = await fhevm
            .createEncryptedInput(EncryptedERC20Deployment.address, taskArguments.from)
            .add64(amount)
            .encrypt();

        const tx = await encryptedERC20Contract
            .connect(signers[0])["transfer(address,bytes32,bytes)"](taskArguments.to, encryptedAmount.handles[0], encryptedAmount.inputProof);

        console.log(`Wait for tx: ${tx.hash}...`);

        const receipt = await tx.wait();
        console.log(`tx: ${tx.hash} status=${receipt?.status}`);

        console.log(`EncryptedERC20 transferFrom(${taskArguments.from}, ${taskArguments.to}, ${amount}) succeeded!`);
    });

/**
 * Example:
 *   - npx hardhat --network localhost task:add-to-allowlist --address 0x123...
 *   - npx hardhat --network sepolia task:add-to-allowlist --address 0x123...
 */
task("task:add-to-allowlist", "Adds an address to the allowlist")
    .addOptionalParam("contractaddress", "Optionally specify the EncryptedERC20 contract address")
    .addParam("address", "The address to add to the allowlist")
    .setAction(async function (taskArguments: TaskArguments, hre) {
        const { ethers, deployments } = hre;

        const EncryptedERC20Deployment = taskArguments.contractaddress
            ? { address: taskArguments.contractaddress }
            : await deployments.get("EncryptedERC20");

        console.log(`EncryptedERC20: ${EncryptedERC20Deployment.address}`);

        const signers = await ethers.getSigners();
        const encryptedERC20Contract = await ethers.getContractAt("EncryptedERC20", EncryptedERC20Deployment.address);

        const tx = await encryptedERC20Contract.connect(signers[0]).addToAllowlist(taskArguments.address);
        console.log(`Wait for tx: ${tx.hash}...`);

        const receipt = await tx.wait();
        console.log(`tx: ${tx.hash} status=${receipt?.status}`);

        console.log(`Address ${taskArguments.address} added to allowlist successfully!`);
    });

/**
 * Example:
 *   - npx hardhat --network localhost task:remove-from-allowlist --address 0x123...
 *   - npx hardhat --network sepolia task:remove-from-allowlist --address 0x123...
 */
task("task:remove-from-allowlist", "Removes an address from the allowlist")
    .addOptionalParam("contractaddress", "Optionally specify the EncryptedERC20 contract address")
    .addParam("address", "The address to remove from the allowlist")
    .setAction(async function (taskArguments: TaskArguments, hre) {
        const { ethers, deployments } = hre;

        const EncryptedERC20Deployment = taskArguments.contractaddress
            ? { address: taskArguments.contractaddress }
            : await deployments.get("EncryptedERC20");

        console.log(`EncryptedERC20: ${EncryptedERC20Deployment.address}`);

        const signers = await ethers.getSigners();
        const encryptedERC20Contract = await ethers.getContractAt("EncryptedERC20", EncryptedERC20Deployment.address);

        const tx = await encryptedERC20Contract.connect(signers[0]).removeFromAllowlist(taskArguments.address);
        console.log(`Wait for tx: ${tx.hash}...`);

        const receipt = await tx.wait();
        console.log(`tx: ${tx.hash} status=${receipt?.status}`);

        console.log(`Address ${taskArguments.address} removed from allowlist successfully!`);
    });

/**
 * Example:
 *   - npx hardhat --network localhost task:get-allowlist
 *   - npx hardhat --network sepolia task:get-allowlist
 */
task("task:get-allowlist", "Gets all addresses in the allowlist")
    .addOptionalParam("contractaddress", "Optionally specify the EncryptedERC20 contract address")
    .setAction(async function (taskArguments: TaskArguments, hre) {
        const { ethers, deployments } = hre;

        const EncryptedERC20Deployment = taskArguments.contractaddress
            ? { address: taskArguments.contractaddress }
            : await deployments.get("EncryptedERC20");

        console.log(`EncryptedERC20: ${EncryptedERC20Deployment.address}`);

        const encryptedERC20Contract = await ethers.getContractAt("EncryptedERC20", EncryptedERC20Deployment.address);

        const allowlist = await encryptedERC20Contract.getAllowlist();

        if (allowlist.length === 0) {
            console.log("Allowlist is empty");
        } else {
            console.log(`Allowlist (${allowlist.length} addresses):`);
            allowlist.forEach((address, index) => {
                console.log(`  ${index + 1}. ${address}`);
            });
        }
    });