import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { FhevmType } from '@fhevm/hardhat-plugin';

import {
    EncryptedERC20,
    EncryptedERC20__factory,
} from "../../types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

type Signers = {
    deployer: HardhatEthersSigner;
    alice: HardhatEthersSigner;
    bob: HardhatEthersSigner;
};

async function deployFixture() {
    const factory = (await ethers.getContractFactory(
        "EncryptedERC20"
    )) as EncryptedERC20__factory;
    const token = (await factory.deploy("Confidential Token", "CTK")) as EncryptedERC20;
    const tokenAddress = await token.getAddress();

    return { token, tokenAddress };
}

describe("EncryptedERC20", function () {

    // @dev The placeholder is type(uint256).max --> 2**256 - 1.
    // const PLACEHOLDER = 2n ** 256n - 1n;

    let signers: Signers;
    let token: EncryptedERC20;
    let contractAddress: string

    before(async function () {
        const ethSigners = await ethers.getSigners();
        signers = {
            deployer: ethSigners[0],
            alice: ethSigners[1],
            bob: ethSigners[2],
        };

    });

    beforeEach(async () => {
        ({ token } = await deployFixture());
        contractAddress = await token.getAddress();
    });

    it("should have correct name and symbol", async () => {
        expect(await token.name()).to.eq("Confidential Token");
        expect(await token.symbol()).to.eq("CTK");
    });

    it("should allow owner to mint", async () => {
        const amount = 1000000;
        const tx = await token.connect(signers.deployer).mint(amount);
        await expect(tx).to.emit(token, "Mint").withArgs(signers.deployer.address, amount);
    });

    it("should reject non-owner minting", async () => {
        await expect(token.connect(signers.alice).mint(1000)).to.be.reverted;
    });

    it("should add and remove from allowlist", async () => {
        // Add Alice
        await token.connect(signers.deployer).addToAllowlist(signers.alice.address);
        let allowlist = await token.getAllowlist();

        expect(allowlist).to.include(signers.alice.address);

        // Remove Alice
        await token.connect(signers.deployer).removeFromAllowlist(signers.alice.address);
        allowlist = await token.getAllowlist();

        expect(allowlist).to.not.include(signers.alice.address);
    });

    it("get the total supply ", async () => {
        const amount = 1000000;
        await token.connect(signers.deployer).mint(amount);

        const totalSupply = await token.totalSupply();

        expect(totalSupply).equals(amount)
    })
    it("should transfer from the minter to alice and bob", async () => {

        const mintAmount = 10_000;
        const transferAmount = 1337;
        const transferAmount2 = 99;


        // adds alice to the AllowedList
        await token.connect(signers.deployer).addToAllowlist(signers.alice.address);

        // Mint tokens to deployer
        const tx1 = await token.connect(signers.deployer).mint(mintAmount);
        await tx1.wait();
        const input1 = fhevm.createEncryptedInput(contractAddress, signers.deployer.address)

        input1.add64(transferAmount);
        const encryptedTransferAmount = await input1.encrypt();
        // transfer amount to the alice from the deployer
        await token.connect(signers.deployer)["transfer(address,bytes32,bytes)"](
            signers.alice.address,
            encryptedTransferAmount.handles[0],
            encryptedTransferAmount.inputProof
        );


        const encryptedBalanceofDeployer = await token.balanceOf(signers.deployer)

        const encryptedBalanceofAlice = await token.balanceOf(signers.alice)



        const DeployerBalance = await fhevm.userDecryptEuint(FhevmType.euint64, encryptedBalanceofDeployer, contractAddress, signers.deployer)
        expect(DeployerBalance).equals(mintAmount - transferAmount)

        const AliceBalane = await fhevm.userDecryptEuint(FhevmType.euint64, encryptedBalanceofAlice, contractAddress, signers.alice)
        expect(AliceBalane).equals(transferAmount)

        const input2 = fhevm.createEncryptedInput(contractAddress, signers.alice.address)

        input2.add64(transferAmount2);
        const encryptedTransferAmount2 = await input2.encrypt();

        // transfer from alice to bob
        await token.connect(signers.alice)["transfer(address,bytes32,bytes)"](
            signers.bob.address,
            encryptedTransferAmount2.handles[0],
            encryptedTransferAmount2.inputProof
        );

        const encryptedBalanceofBob = await token.balanceOf(signers.bob.address);

        // allow alice can decrypt the balance of the bob because alice is in the allowedList
        const decrypted = await fhevm.userDecryptEuint(FhevmType.euint64, encryptedBalanceofBob, contractAddress, signers.alice); //alice signer(alice is in the allowedList)


        expect(decrypted).equals(transferAmount2)
    })

});