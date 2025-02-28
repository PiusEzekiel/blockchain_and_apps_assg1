
import React, { useState } from "react";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";


import SecurityHeaders from "./SecurityHeaders"; // Import the SecurityHeaders component
import { v4 as uuidv4 } from "uuid"; // Install using: npm install uuid
const contractABI = require("./DocumentRegistryABI.json");


const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS; // Contract address from .env




function App() {
  const [account, setAccount] = useState("");
  const [documentHash, setDocumentHash] = useState("");
  const [status, setStatus] = useState("");

  // Connect to MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      setAccount(await signer.getAddress());
    } else {
      alert("MetaMask not detected");
    }
  };


  // 🔹 State variables for registration
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState("");
  const [loadingRegister, setLoadingRegister] = useState(false);

  // 🔹 State variables for verification
  const [hash, setHash] = useState("");
  const [documentInfo, setDocumentInfo] = useState(null);
  const [loadingVerify, setLoadingVerify] = useState(false);

  // 🔹 Handle file selection
  const handleFileChange = (event) => {
      setFile(event.target.files[0]);
  };


  // 🔹 Hash document for registration
  const hashDocument = async () => {
    setStatus("🔄 Preparing to register document...");
    if (!file) {
        toast.error("❌ Please upload a file");
        setStatus("❌ No file selected. Upload a document first.");
        return;
    }

    setStatus("🔄 Generating document hash...");
    const nonce = uuidv4(); // Generate a unique nonce
    const reader = new FileReader();
    
    reader.onload = async (e) => {
        setStatus("🔄 Hashing document...");
        const combinedData = e.target.result + metadata + nonce;
        const wordArray = CryptoJS.lib.WordArray.create(combinedData);
        const hash = CryptoJS.SHA256(wordArray).toString();
        
        setDocumentHash(hash);  // Store hash in state
        setStatus(`✅ Hash generated: ${hash}`);

        await registerDocument(hash); // Proceed to register document
    };

    reader.onerror = (error) => {
        toast.error("❌ Error reading file");
        setStatus("❌ Error reading file. Try again.");
    };

    reader.readAsArrayBuffer(file);
};



// 🔹 Register document on blockchain
const registerDocument = async (hash) => {
  setStatus("🔄 Connecting to MetaMask...");

  if (!window.ethereum) {
      toast.error("❌ MetaMask is not installed");
      setStatus("❌ MetaMask not detected. Please install it.");
      return;
  }

  if (!contractAddress) {
      toast.error("❌ Smart contract address is missing!");
      setStatus("❌ Contract address is undefined. Check your .env file.");
      return;
  }

  try {
      setLoadingRegister(true);
      setStatus("🔄 Connecting to blockchain...");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();
      
      setStatus(`✅ Connected to wallet: ${walletAddress}`);

      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      setStatus("✅ Smart contract loaded. Preparing transaction...");

      setStatus("🔄 Sending transaction...");
      const tx = await contract.registerDocument(hash, metadata);
      setStatus("🔄 Waiting for transaction confirmation...");

      await tx.wait();
      setStatus(`✅ Document registered successfully! Hash: ${hash}`);
      toast.success("✅ Document registered on blockchain!");

  } catch (error) {
      setStatus("❌ Transaction failed. Check MetaMask.");
      toast.error("❌ Transaction failed. See MetaMask for details.");
  } finally {
      setLoadingRegister(false);
  }
};


// 🔹 Verify document on blockchain

const verifyDocument = async () => {
  setStatus("🔄 Connecting to MetaMask...");

  if (!window.ethereum) {
      toast.error("❌ MetaMask is not installed");
      setStatus("❌ MetaMask not detected. Please install it.");
      return;
  }

  try {
      setLoadingVerify(true);
      setStatus("🔄 Connecting to blockchain...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress(); // Get the user's connected wallet
      setStatus(`✅ MetaMask connected: ${userAddress}`);

      if (!contractAddress) {
          setStatus("❌ Smart contract address is missing! Check your .env file.");
          toast.error("❌ Contract address is undefined!");
          return;
      }

      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      setStatus("🔄 Searching for document...");
      const data = await contract.verifyDocument(hash);

      if (!data || data[0] === ethers.ZeroAddress) {
          setStatus("❌ Document not found!");
          toast.error("❌ Document not found or verification failed");
          setDocumentInfo(null);
          return;
      }

      // ✅ Fix: Convert BigInt timestamp to a regular number
      const timestamp = Number(data[1]); // Convert BigInt to number
      const formattedTime = new Date(timestamp * 1000).toLocaleString();

      setDocumentInfo({
          owner: data[0],
          timestamp: formattedTime, // Use converted timestamp
          metadata: data[2],
      });

      setStatus(`✅ Document found! Registered by: ${data[0]}`);
      toast.success("✅ Document verified successfully!");

  } catch (error) {
      setStatus("❌ Verification failed. See console for details.");
      console.error("Verification error:", error);
      toast.error(`❌ Error: ${error.message}`);
      setDocumentInfo(null);
  } finally {
      setLoadingVerify(false);
  }
};


return (
    <div style={{ maxWidth: "600px", margin: "auto", textAlign: "center" }}>
      <SecurityHeaders /> {/* Add the SecurityHeaders component */}
        <h2>📜 Document Security DApp</h2>

        {/* 🔹 Wallet Connection Section */}
        <div style={{ marginBottom: "20px" }}>
        <button onClick={connectWallet}>
  {account ? `Connected: ${account.substring(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}

  {/*Display status message*/}
  <p style={{ marginTop: "10px", fontWeight: "bold" }}>{status}</p>

</button>

        </div>

        {/* 🔹 Document Registration Section */}
        <div style={{ borderBottom: "1px solid #ccc", paddingBottom: "20px" }}>
            <h3>Register Document</h3>
            <input type="file" onChange={handleFileChange} />
            <input
                type="text"
                placeholder="Enter metadata (e.g., document type, issuer ID)"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
            />
            {documentHash && (
  <p><b>Generated Hash:</b> {documentHash}</p>
)}

            <button onClick={hashDocument} disabled={loadingRegister}>
                {loadingRegister ? "Processing..." : "Register Document"}
            </button>
        </div>

        {/* 🔹 Document Verification Section */}
        <div style={{ marginTop: "20px" }}>
            <h3>Verify Document</h3>
            <input
                type="text"
                placeholder="Enter Document Hash"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
            />
            <button onClick={verifyDocument} disabled={loadingVerify}>
                {loadingVerify ? "Checking..." : "Verify Document"}
            </button>

            {documentInfo && (
                <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
                    <h3>✅ Document Found</h3>
                    <p><b>Owner:</b> {documentInfo.owner}</p>
                    <p><b>Registered On:</b> {documentInfo.timestamp}</p>
                    <p><b>Metadata:</b> {documentInfo.metadata}</p>
                </div>
            )}
        </div>
    </div>
);
};
export default App;
