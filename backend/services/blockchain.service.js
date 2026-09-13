import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  createPublicClient,
  createWalletClient,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifactPath = path.join(
  __dirname,
  "../../blockchain/artifacts/contracts/EvidenceRegistry.sol/EvidenceRegistry.json"
);

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
const contractAddress = process.env.BLOCKCHAIN_CONTRACT_ADDRESS;

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(rpcUrl),
});

const account = privateKeyToAccount(
  process.env.BLOCKCHAIN_PRIVATE_KEY
);

const walletClient = createWalletClient({
  account,
  chain: hardhat,
  transport: http(rpcUrl),
});

async function registerEvidence(documentId, documentHash, version) {
  const transactionHash = await walletClient.writeContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "registerEvidence",
    args: [documentId, documentHash, BigInt(version)],
  });

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: transactionHash,
  });

  return {
    transactionHash,
    blockNumber: receipt.blockNumber,
  };
}

async function verifyEvidence(documentId, documentHash) {
  return publicClient.readContract({
    address: contractAddress,
    abi: artifact.abi,
    functionName: "verifyEvidence",
    args: [documentId, documentHash],
  });
}

export { registerEvidence, verifyEvidence };