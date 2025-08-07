import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    // Deploy with constructor arguments: name and symbol
    const deployedToken = await deploy("EncryptedERC20", {
        from: deployer,
        args: ["MyToken", "MTK"], // ✅ constructor args
        log: true,
    });
    console.log(`EncryptedERC20 contract deployed at:`, deployedToken.address);
};

export default func;
func.id = "deploy_encryptedERC20"; // id to prevent re-execution
func.tags = ["EncryptedERC20"];
