// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EvidenceRegistry {
    struct Evidence {
        string documentId;
        string documentHash;
        uint256 version;
        uint256 timestamp;
        address uploader;
    }

    mapping(string => Evidence[]) private evidenceHistory;

    event EvidenceRegistered(
        string indexed documentId,
        string documentHash,
        uint256 version,
        uint256 timestamp,
        address indexed uploader
    );

    function registerEvidence(
        string memory _documentId,
        string memory _documentHash,
        uint256 _version
    ) public {
        evidenceHistory[_documentId].push(
            Evidence(
                _documentId,
                _documentHash,
                _version,
                block.timestamp,
                msg.sender
            )
        );

        emit EvidenceRegistered(
            _documentId,
            _documentHash,
            _version,
            block.timestamp,
            msg.sender
        );
    }

    function getLatestEvidence(
        string memory _documentId
    ) public view returns (Evidence memory) {
        Evidence[] memory history = evidenceHistory[_documentId];

        require(history.length > 0, "No evidence found");

        return history[history.length - 1];
    }

    function verifyEvidence(
        string memory _documentId,
        string memory _documentHash
    ) public view returns (bool) {
        Evidence[] memory history = evidenceHistory[_documentId];

        for (uint256 i = 0; i < history.length; i++) {
            if (
                keccak256(bytes(history[i].documentHash)) ==
                keccak256(bytes(_documentHash))
            ) {
                return true;
            }
        }

        return false;
    }
}