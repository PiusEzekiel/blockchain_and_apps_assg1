const hre = require("hardhat");

async function main() {
  const DocumentRegistry = await hre.ethers.getContractFactory("DocumentRegistry"); // Make sure the contract name matches your Solidity file

  console.log("Deploying contract...");

  const documentRegistry = await DocumentRegistry.deploy(); // Deploy the contract
  await documentRegistry.waitForDeployment(); // Instead of .deployed()

  console.log(`Contract deployed to: ${await documentRegistry.getAddress()}`); // Get contract address
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
