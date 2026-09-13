import {
  registerEvidence,
  getEvidenceHistory,
  getEvidenceVersion,
} from "./services/blockchain.service.js";

async function main() {
  try {
    const documentId = "VERSION-TEST-001";

    console.log("Registering version 1...");

    await registerEvidence(
      documentId,
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      1
    );

    console.log("Registering version 2...");

    await registerEvidence(
      documentId,
      "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      2
    );

    const history = await getEvidenceHistory(documentId);

    console.log("\nTotal versions:", history.length);

    for (const evidence of history) {
      console.log({
        documentId: evidence.documentId,
        hash: evidence.documentHash,
        version: evidence.version.toString(),
        timestamp: evidence.timestamp.toString(),
        uploader: evidence.uploader,
      });
    }

    const version2 = await getEvidenceVersion(
      documentId,
      2
    );

    console.log(
      "\nVersion 2 hash:",
      version2.documentHash
    );
  } catch (error) {
    console.error("Version history test failed:");
    console.error(error);
  }
}

main();