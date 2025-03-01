
import React, { useState } from "react";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";
import SecurityHeaders from "./SecurityHeaders"; // Import the SecurityHeaders component
import { v4 as uuidv4 } from "uuid"; // Install using: npm install uuid
import "./App.css"; // Import the CSS file
import { FaRegCopy } from "react-icons/fa"; // Import the copy icon
const contractABI = require("./DocumentRegistryABI.json");
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS; // Contract address from .env




function App() {
    const [account, setAccount] = useState("");
    const [documentHash, setDocumentHash] = useState("");
    const [status, setStatus] = useState("");
    const [file, setFile] = useState(null);
    const [metadata, setMetadata] = useState("");
    const [loadingRegister, setLoadingRegister] = useState(false);
    const [hash, setHash] = useState("");
    const [documentInfo, setDocumentInfo] = useState(null);
    const [loadingVerify, setLoadingVerify] = useState(false);
    const [registeredDocument, setRegisteredDocument] = useState(null); // ✅ New state for registration success


    

    // Connect to MetaMask
    const connectWallet = async () => {
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            setAccount(await signer.getAddress());
            setStatus("✅ Wallet Connected");
        } else {
            toast.error("❌ MetaMask not detected");
            setStatus("❌ Please install MetaMask.");
        }
    };

    // Handle file selection
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

 // 🔹 Copy Hash to Clipboard
 const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
        .then(() => {
            setStatus("✅ Hash Copied to clipboard!");
            toast.success("📋 Copied to clipboard!");
        })
        .catch((err) => {
            setStatus("❌ Copy failed");
            toast.error("❌ Failed to copy");
            console.error("Copy failed:", err);
        });
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
      const timestamp = new Date().toLocaleString(); // Mock timestamp (blockchain will have actual timestamp)
            setRegisteredDocument({ hash, metadata, timestamp }); // ✅ Store registered document details
      //setStatus(`✅ Document registered successfully! Hash: ${hash}`);
      setStatus(`✅ Document registered successfully!`);
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

      setStatus(`✅ Document found!`);
      //setStatus(`✅ Document found! Registered by: ${data[0]}`);
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
    <div className="app-container">
        <SecurityHeaders />
        <h2>Document Security DApp</h2>

        {/* 🔹 Wallet Connection Section */}
        <div className="wallet-section">
            <button className="connect-button" onClick={connectWallet}>
                {account
                    ? `Connected: ${account.substring(0, 6)}...${account.slice(-4)}`
                    : "Connect Wallet"}
            </button>
            <p className="status-message">{status}</p>
        </div>

        {/* 🔹 Document Registration Section */}
        <div className="card">
            <h3>Register Document</h3>
            <input type="file" onChange={handleFileChange} className="file-input" />
            <input
                type="text"
                placeholder="Enter metadata (e.g., document type, issuer ID)"
                value={metadata}
                onChange={(e) => setMetadata(e.target.value)}
                className="input-field"
            />
            <button className="action-button" onClick={hashDocument}  disabled={loadingRegister}>
                {loadingRegister ? "Processing..." : "Register Document"}
            </button>
            {registeredDocument && (
                <div className="info-box">
                    <h3>✅ Document registered successfully</h3>
                    <p><b>Copy Hash For Verification:</b> {registeredDocument.hash}{" "}
                            <FaRegCopy 
                                className="copy-icon" 
                                onClick={() => copyToClipboard(registeredDocument.hash)}
                                title="Copy Hash"
                            />
                        </p>
                    <p><b>Registered On:</b> {registeredDocument.timestamp}</p>
                    <p><b>Metadata:</b> {registeredDocument.metadata}</p>
                </div>
            )}
        </div>

        {/* 🔹 Document Verification Section */}
        <div className="card">
            <h3>Verify Document</h3>
            <input
                type="text"
                placeholder="Enter Document Hash"
                value={hash}
                onChange={(e) => setHash(e.target.value)}
                className="input-field"
            />
            <button className="action-button" onClick={verifyDocument} disabled={loadingVerify}>
                {loadingVerify ? "Checking..." : "Verify Document"}
            </button>

            {documentInfo && (
                <div className="info-box">
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
