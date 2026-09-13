import {
  registerEvidence,
  verifyEvidence,
} from "./services/blockchain.service.js";

async function main() {
  try {
    const documentId = "BACKEND-TEST-001";

    const documentHash =
      "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    console.log("Registering evidence on blockchain...");

    const result = await registerEvidence(
      documentId,
      documentHash,
      1
    );

    console.log("Transaction successful!");
    console.log("Transaction hash:", result.transactionHash);
    console.log("Block number:", result.blockNumber.toString());

    const verified = await verifyEvidence(
      documentId,
      documentHash
    );

    console.log("Blockchain verification:", verified);
  } catch (error) {
    console.error("Blockchain test failed:");
    console.error(error);
    process.exitCode = 1;
  }
}

main();
