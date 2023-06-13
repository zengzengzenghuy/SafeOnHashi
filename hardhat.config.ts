import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'dotenv/config';
import "./tasks/deploySafe"
const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    goerli:{
      accounts:[process.env.DEPLOYER_OWNER_KEY],
      url: process.env.GOERLI_RPC,
      chainId: 5,
      allowUnlimitedContractSize: true,
    },
    gnosis: {
      accounts:[process.env.DEPLOYER_OWNER_KEY],
      url: "https://rpc.gnosis.gateway.fm",
      chainId: 100,
      allowUnlimitedContractSize: true,
    }
  },
  solidity:{
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },


};

export default config;
