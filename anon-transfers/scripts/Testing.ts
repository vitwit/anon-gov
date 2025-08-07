import { ethers } from "ethers";
import { MockFhevmInstance, } from "@fhevm/mock-utils";

(async () => {
    const localProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");


    const config = {
        verifyingContractAddressDecryption: "0x0000000000000000000000000000000000000077",
        verifyingContractAddressInputVerification: "0x0000000000000000000000000000000000000078",
        kmsContractAddress: "0x0000000000000000000000000000000000000079",
        inputVerifierContractAddress: "0x0000000000000000000000000000000000000080",
        aclContractAddress: "0x0000000000000000000000000000000000000081",
        chainId: 31337,            // Default for Hardhat local network
        gatewayChainId: 31337      // Same as chainId in local dev
    };


    const instance = await MockFhevmInstance.create(
        localProvider,
        localProvider,
        config
    );

    console.log("MockFhevmInstance created", instance);

})();
