import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers } from "hardhat";
import "dotenv/config";
import contractAddress from "../utils/contract.json";

const main = async () => {
  //GOERLI
  const yaho = contractAddress.Yaho;
  const AMBMessageRelay = contractAddress.GoerAMBMessageRelay;
  // GC
  const pingpongAddr = contractAddress.GCPingPong;
  const AMBAdapterAddr = contractAddress.GCAMBAdapter;

  const pingpong = await ethers.getContractAt("PingPong", pingpongAddr);
  const calldata = pingpong.interface.encodeFunctionData("ping");
  console.log("calldata ", calldata);

  // For Safe's Hashi Module
  // const HashiModule = await ethers.getContractFactory("HashiModule")
  // const tx = await hashiModule.interface.encodeFunctionData("executeTransaction", [pingPong.address, 0, calldata, 0])

  const message = {
    to: pingpongAddr,
    toChainId: 5,
    data: calldata,
  };
  console.log("Calling Yaho...");

  const Yaho = await ethers.getContractAt("Yaho", yaho);
  const txdata = await Yaho.interface.encodeFunctionData(
    "dispatchMessagesToAdapters",
    [[message], [AMBMessageRelay], [AMBAdapterAddr], 800000]
  );
  console.log("Tx data ", txdata);
  const tx = await Yaho.dispatchMessagesToAdapters(
    [message],
    [AMBMessageRelay],
    [AMBAdapterAddr],
    500000,
    { gasLimit: 500001 }
  );

  console.log("Tx receipt: ", tx.wait());
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
