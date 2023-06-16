
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { ethers } from "hardhat"
import 'dotenv/config';
import contractAddress from '../utils/contract.json'
import { BigNumber, Bytes } from "ethers";

const main = async (/*messageId: Bytes[],messageSender: string[]*/ ) =>{

    const RPC = network.config.url
    const ChainID = network.config.chainId
    

    //GOERLI
    const yaru = contractAddress.Yaru

    // GC
    const pingpongAddr = contractAddress.GCPingPong
    const AMBAdapterAddr = contractAddress.GCAMBAdapter

    const pingpong = await ethers.getContractAt("PingPong",pingpongAddr)
    const calldata = await pingpong.interface.encodeFunctionData("ping", [])
    // const HashiModule = await ethers.getContractFactory("HashiModule")
    // const tx = await hashiModule.interface.encodeFunctionData("executeTransaction", [pingPong.address, 0, calldata, 0])
    const message = {
      to: pingpongAddr,
      toChainId: ChainID,
      data: calldata,
    }
    // event emit MessageDispatched(bytes32(id), msg.sender, messages[i].toChainId, messages[i].to, messages[i].data)
    // await yaru.executeMessages([message], [message ID for the message], [msg.sender that called Yaho], [ambAdapter.address])
    
    console.log("Calling Yaru...")
    const tx = await yaru.executeMessages([message], messageId,messageSender, [AMBAdapterAddr])
    console.log(`TX response: ${tx.transactionResponse?.wait()}`)

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  