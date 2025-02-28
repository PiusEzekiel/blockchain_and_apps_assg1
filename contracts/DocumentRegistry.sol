// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DocumentRegistry {
    struct Document {
        string hash;
        address owner;
        uint256 timestamp;
        string metadata;
    }

    mapping(string => Document) public documents;

    event DocumentRegistered(string hash, address owner, uint256 timestamp, string metadata);
    event DocumentVerified(string hash, address owner, uint256 timestamp);

    function registerDocument(string memory _hash, string memory _metadata) public {
        require(documents[_hash].owner == address(0), "Document already registered");

        documents[_hash] = Document(_hash, msg.sender, block.timestamp, _metadata);
        emit DocumentRegistered(_hash, msg.sender, block.timestamp, _metadata);
    }

    function verifyDocument(string memory _hash) public view returns (address, uint256, string memory) {
        require(documents[_hash].owner != address(0), "Document not found");

        Document memory doc = documents[_hash];
        // emit DocumentVerified(_hash, doc.owner, doc.timestamp);
        return (doc.owner, doc.timestamp, doc.metadata);
    }
}
