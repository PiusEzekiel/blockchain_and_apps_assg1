require("dotenv").config();
const hre = require("hardhat");

async function main() {
    const contractAddress = process.env.CONTRACT_ADDRESS; // Read from .env
    if (!contractAddress) {
        throw new Error("⚠️ CONTRACT_ADDRESS is missing in .env");
    }

    const DocumentRegistry = await hre.ethers.getContractAt("DocumentRegistry", contractAddress);
    console.log("Contract loaded at:", contractAddress);

    // Call your contract function (example: registerDocument)
    const tx = await DocumentRegistry.registerDocument("docHash123");
    await tx.wait();
    console.log("Document registered successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });
