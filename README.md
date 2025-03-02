📜 Blockchain Digital Asset Protection
Ethereum-based Digital Asset Protection using Smart Contracts

🚀 Overview
This project enables users to register, verify, and transfer ownership of digital assets on the Ethereum blockchain. By leveraging smart contracts, we ensure immutability, security, and transparency for digital asset ownership.

📌 Features
✅ Register Digital Assets – Securely store asset metadata on-chain
✅ Verify Authenticity – Check if an asset is valid using cryptographic hashes
✅ Transfer Ownership – Allow users to transfer ownership securely
✅ Audit and Monitor – View past transactions and asset history
✅ User-Friendly UI – Web application for easy interaction

🛠️ Tech Stack
Component	Technology
Blockchain	Ethereum Mainnet
Smart Contracts	Solidity
Development Framework	Hardhat
Frontend	React.js
Blockchain Interaction	Ethers.js
Hosting (optional)	Vercel / Netlify
RPC Provider	Infura / Alchemy
📌 Live Deployment
Smart Contract Address: 0xff64838b280D7Aec98C2B8dcf59767Ee00789D6F
Frontend Hosted (Optional): [Add your deployment link]
📌 Prerequisites
Node.js & npm – Install from nodejs.org
MetaMask Wallet – Install from metamask.io
Infura or Alchemy API Key – Create an account at:
Infura OR
Alchemy
📌 Setup Instructions
1️⃣ Clone the Repository
bash
Copy
Edit
git clone https://github.com/PiusEzekiel/blockchain_and_apps_assg1.git
cd blockchain_and_apps_assg1
2️⃣ Install Dependencies
bash
Copy
Edit
npm install
3️⃣ Create and Configure .env File
bash
Copy
Edit
touch .env
Inside .env, add:

ini
Copy
Edit
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY
PRIVATE_KEY=YOUR_METAMASK_PRIVATE_KEY
REACT_APP_CONTRACT_ADDRESS=0xff64838b280D7Aec98C2B8dcf59767Ee00789D6F
⚠️ WARNING: Never share your PRIVATE_KEY. Keep it secure.

📌 Deploying Smart Contract
1️⃣ Compile the Contract
bash
Copy
Edit
npx hardhat compile
2️⃣ Deploy to Ethereum Mainnet
bash
Copy
Edit
npx hardhat run scripts/deploy.js --network mainnet
If successful, it will return:

css
Copy
Edit
Deploying contract...
Contract deployed to: 0xff64838b280D7Aec98C2B8dcf59767Ee00789D6F
Note: Replace the old REACT_APP_CONTRACT_ADDRESS in .env with the new contract address.

📌 Running the Frontend
1️⃣ Start Development Server
bash
Copy
Edit
npm start
This will launch the React UI at:

arduino
Copy
Edit
http://localhost:3000
2️⃣ Build for Production
To generate an optimized build:

bash
Copy
Edit
npm run build
📌 Using the DApp
1️⃣ Register a Document
Upload a file → The system generates a hash of the file.
Enter metadata (e.g., document type, issuer ID).
Click "Register Document" → The document is recorded on Ethereum.
2️⃣ Verify a Document
Enter the document hash in the verification box.
Click "Verify Document" → If found, ownership details will be displayed.
3️⃣ Transfer Ownership
Enter the document hash.
Provide the new owner's Ethereum address.
Click "Transfer Ownership" → The contract will process the transfer.
4️⃣ View Registered Documents
Check all registered digital assets and their details.
📌 Smart Contract Overview
🔹 Functions
Function	Description
registerDocument(hash, metadata)	Registers a digital asset on-chain
verifyDocument(hash)	Returns the owner & metadata if the document is found
transferOwnership(hash, newOwner)	Transfers document ownership