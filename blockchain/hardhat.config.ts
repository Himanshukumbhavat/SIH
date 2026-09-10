import { defineConfig } from "hardhat/config";
import hardhatIgnition from "@nomicfoundation/hardhat-ignition";
import hardhatViem from "@nomicfoundation/hardhat-viem";

export default defineConfig({
  plugins: [hardhatIgnition, hardhatViem],

  solidity: {
    version: "0.8.34",
  },
});