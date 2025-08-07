import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Set the proposal fee (e.g., 0.01 ETH)
  const proposalFee = ethers.parseEther("0"); // 0.01 ETH in wei

  console.log("Deploying FHEGovernance contract...");
  console.log("Deployer address:", deployer);
  console.log("Proposal fee:", ethers.formatEther(proposalFee), "ETH");

  const deployedFHEGovernance = await deploy("FHEGovernance", {
    from: deployer,
    args: [proposalFee], // Constructor argument: proposal fee
    log: true,
    waitConfirmations: 1,
  });

  console.log(`FHEGovernance contract deployed at: ${deployedFHEGovernance.address}`);
  console.log(`Transaction hash: ${deployedFHEGovernance.transactionHash}`);

  // Verify deployment by checking the deployed contract
  if (deployedFHEGovernance.newlyDeployed) {
    console.log("✅ FHEGovernance contract successfully deployed!");

    // Optional: Get contract instance and log some initial state
    const governance = await ethers.getContractAt("FHEGovernance", deployedFHEGovernance.address);
    const owner = await governance.owner();
    const fee = await governance.proposalFee();
    const nextId = await governance.nextProposalId();

    console.log("Contract details:");
    console.log("- Owner:", owner);
    console.log("- Proposal Fee:", ethers.formatEther(fee), "ETH");
    console.log("- Next Proposal ID:", nextId.toString());
  }
};

export default func;
func.id = "deploy_fheGovernance"; // id required to prevent reexecution
func.tags = ["FHEGovernance"];
