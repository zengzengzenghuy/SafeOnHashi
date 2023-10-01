
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { ethers } from "hardhat"
import 'dotenv/config';
import contractAddress from '../utils/contract.json'
import { BigNumber, Bytes } from "ethers";

const main = async () =>{

    // const RPC = network.config.url
    // // const ChainID = network.config.chainId
    

    // //GC
    // const yaru = contractAddress.Yaru

    // // GC
    // const pingpongAddr = contractAddress.GCPingPong
    // const AMBAdapterAddr = contractAddress.GCAMBAdapter

    // const pingpong = await ethers.getContractAt("PingPong",pingpongAddr)
    // const calldata = await pingpong.interface.encodeFunctionData("ping")
    // // const HashiModule = await ethers.getContractFactory("HashiModule")
    // // const tx = await hashiModule.interface.encodeFunctionData("executeTransaction", [pingPong.address, 0, calldata, 0])
    // const message = {
    //   to: pingpongAddr,
    //   toChainId: 5,
    //   data: calldata,
    // }
    // // event emit MessageDispatched(bytes32(id), msg.sender, messages[i].toChainId, messages[i].to, messages[i].data)
    // // await yaru.executeMessages([message], [message ID for the message], [msg.sender that called Yaho], [ambAdapter.address])
    
    // console.log("Calling Yaru...")
    // const Yaru = await ethers.getContractAt("Yaru",contractAddress.Yaru)
    // const tx = await Yaru.executeMessages([message], ["0x0000000000000000000000000000000000000000000000000000000000000005"],["0x41Ff3a5D17798902E2195538d7e9fb42C7D19070"], [AMBAdapterAddr], {gasLimit: 800000})
    // console.log(`TX response: ${tx.wait()}`)

    // // const txdata = await Yaru.interface.encodeFunctionData("executeMessages",[[message], ["0x0000000000000000000000000000000000000000000000000000000000000003"],["0x41Ff3a5D17798902E2195538d7e9fb42C7D19070"], [AMBAdapterAddr]])
    // // console.log(txdata)
    
    const ShoyuBashi = await ethers.getContractAt("ShoyuBashi","0x01268DB05965CeAc2a89566c42CD550ED7eE5ECD")
    // const calldata = await ShoyuBashi.interface.encodeFunctionData("getThresholdHash",[5,9522347])
    // const RPC = "https://rpc.gnosis.gateway.fm"
    // const provider = new ethers.providers.JsonRpcProvider(RPC)
    // const wallet = new ethers.Wallet("3a9258392938e8409e021bb479774e7613aea814cf7bde029d3140c5cb5c23a0",provider)

    console.log("Sending ...")
    // const tx = await wallet.sendTransaction({
    //   to:"0x31a8E89D6f98454D38C03eCA3DC543F6581d607C",
    //   data: calldata
    // })
    // console.log("Sent")
    // await tx.wait()
    // console.log(tx)
    const AMBAdapter = await ethers.getContractAt("AMBAdapter","0x02EF808c1235EC235BdfEf9b5768527D86093711")
    const hash = await AMBAdapter.getHashFromOracle(5,9522516)
    console.log(hash)
    // try{
    //   const hash = await ShoyuBashi.getThresholdHash(5,9522516)
    //   console.log(hash)
    // }catch(err){
    //   console.log("err:" ,err)
    // }

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  