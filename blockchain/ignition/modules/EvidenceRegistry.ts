import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EvidenceRegistryModule = buildModule(
  "EvidenceRegistryModule",
  (m) => {
    const evidenceRegistry = m.contract("EvidenceRegistry");

    return { evidenceRegistry };
  }
);

export default EvidenceRegistryModule;