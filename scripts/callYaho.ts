
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { ethers } from "hardhat"
import 'dotenv/config';
import contractAddress from '../utils/contract.json'

const main = async () =>{

      //GOERLI
    const yaho = contractAddress.Yaho
    const AMBMessageRelay= contractAddress.GoerAMBMessageRelay
    // GC
    const pingpongAddr = contractAddress.GCPingPong
    const AMBAdapterAddr = contractAddress.GCAMBAdapter

    const pingpong = await ethers.getContractAt("PingPong",pingpongAddr)
    const calldata = await pingpong.interface.encodeFunctionData("ping", [])
    // const HashiModule = await ethers.getContractFactory("HashiModule")
    // const tx = await hashiModule.interface.encodeFunctionData("executeTransaction", [pingPong.address, 0, calldata, 0])
    const message = {
      to: pingpongAddr,
      toChainId: 100,
      data: calldata,
    }
    console.log("Calling Yaho...")
    // const provider = new ethers.providers.JsonRpcProvider(RPC)
  

    const Yaho = await ethers.getContractAt("Yaho",yaho)
    const tx = await Yaho.dispatchMessagesToAdapters([message],[AMBMessageRelay],[AMBAdapterAddr],{gasLimit: 5000000})

    console.log("Tx receipt: ",tx.transactionResponse?.wait())

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  