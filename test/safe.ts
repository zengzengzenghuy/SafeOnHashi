import { expect } from "chai";
import { ContractFactory } from "ethers";
import { ethers, network } from "hardhat";
import Safe, { SafeFactory, SafeAccountConfig,  EthersAdapter, ContractNetworksConfig } from '@safe-global/protocol-kit'
import { any } from "hardhat/internal/core/params/argumentTypes";

const DOMAIN_ID = network.config.chainId
const ID_ZERO = 0
const ID_ONE = 1
const BYTES32_DOMAIN_ID = "0x0000000000000000000000000000000000000000000000000000000000007A69"
const setup = async (DOMAIN_ID:any) =>{
   

    const safeMasterCopyFactory = await ethers.getContractFactory("GnosisSafe_SV1_3_0")
    const safeMasterCopy = await safeMasterCopyFactory.deploy()
 
    const safeProxyFactory = await ethers.getContractFactory("ProxyFactory_SV1_3_0")
    const safeProxy = await safeProxyFactory.deploy()
    
    const multiSendCallOnlyFactory = await ethers.getContractFactory("MultiSendCallOnly_SV1_3_0")
    const multiSendCallOnly = await multiSendCallOnlyFactory.deploy()

    const multiSendFactory = await ethers.getContractFactory("MultiSend_SV1_3_0")
    const multiSend = await multiSendFactory.deploy()

    const fallbackHandlerFactory = await ethers.getContractFactory("CompatibilityFallbackHandler_SV1_3_0")
    const fallbackHandler = await fallbackHandlerFactory.deploy()

    const signMessageLibFactory = await ethers.getContractFactory("SignMessageLib_SV1_3_0")
    const signMessageLib = await signMessageLibFactory.deploy()

    const createCallFactory = await ethers.getContractFactory("CreateCall_SV1_3_0")
    const createCall = await createCallFactory.deploy()
    

    const [wallet1,wallet2] = await ethers.getSigners()
  
    // deploy hashi
    const Hashi = await ethers.getContractFactory("Hashi")
    const hashi = await Hashi.deploy()
  
    // deploy ShoyuBashi
    const ShoyuBashi = await ethers.getContractFactory("ShoyuBashi")
    const shoyuBashi = ShoyuBashi.deploy(wallet1.address, hashi.address)
  
    // deploy Yaho
    const Yaho = await ethers.getContractFactory("Yaho")
    const yaho = await Yaho.deploy()
  
    // deploy AMB
    const AMB = await ethers.getContractFactory("MockAMB")
    const amb = await AMB.deploy()
  
    // deploy and initialize badAMB
    // const Mock = await ethers.getContractFactory("Mock")
    // const badMock = await Mock.deploy()
    // const badAmb = await ethers.getContractAt("IAMB", badMock.address)
    // await badMock.givenMethodReturnUint(badAmb.interface.getSighash("messageSourceChainId"), 2)
    // await badMock.givenMethodReturnAddress(badAmb.interface.getSighash("messageSender"), ADDRESS_ONE)
  
    // deploy Yaru
    const Yaru = await ethers.getContractFactory("Yaru")
    const yaru = await Yaru.deploy(hashi.address, yaho.address, DOMAIN_ID)
  
    // deploy Oracle Adapter
    const AMBMessageRelay = await ethers.getContractFactory("AMBMessageRelay")
    const ambMessageRelay = await AMBMessageRelay.deploy(amb.address, yaho.address)
    const AMBAdapter = await ethers.getContractFactory("AMBAdapter")
    const ambAdapter = await AMBAdapter.deploy(amb.address, ambMessageRelay.address,BYTES32_DOMAIN_ID)
  
    // deploy avatar
    const Avatar = await ethers.getContractFactory("TestAvatar")
    const avatar = await Avatar.deploy()
  
    // const deploy PingPong test contract
    const PingPong = await ethers.getContractFactory("PingPong")
    const pingPong = await PingPong.deploy()
  
    return{

        safeMasterCopy,
        safeProxy,
        multiSendCallOnly,
        multiSend,
        fallbackHandler,
        signMessageLib,
        createCall,
        avatar,
        amb,
        ambMessageRelay,
        ambAdapter,
        wallet1,
        wallet2,
        hashi,
        shoyuBashi,
        yaho,
        yaru,
        pingPong,
    }
}


// const setupProtocolKit = () =>{
//     // ethers v6 switch from ethersproviders.Web3Provider to ethers.BrowserProvider
//     // https://docs.ethers.org/v6/migrating/#migrate-providers
 
              
// }
describe("Safe",()=>{
    it("setup",async()=>{
        const {

            safeMasterCopy,
            safeProxy,
            multiSendCallOnly,
            multiSend,
            fallbackHandler,
            signMessageLib,
            createCall,
            avatar,
            amb,
            ambMessageRelay,
            ambAdapter,
            wallet1,
            wallet2,
            hashi,
            shoyuBashi,
            yaho,
            yaru,
            pingPong,
        } = await setup(DOMAIN_ID);
        console.log( safeMasterCopy.address)
        console.log( safeProxy.address)
        console.log( multiSend.address)
        console.log( multiSendCallOnly.address)
        console.log( fallbackHandler.address)
        console.log( signMessageLib.address)
        console.log( createCall.address)

    const provider = await ethers.getDefaultProvider()


    // const chainId = await ethAdapter.getChainId()
    const contractNetworks: ContractNetworksConfig = {
    [DOMAIN_ID]: {
        safeMasterCopyAddress: safeMasterCopy.address,
        safeProxyFactoryAddress: safeProxy.address,
        multiSendAddress: multiSend.address,
        multiSendCallOnlyAddress: multiSendCallOnly.address,
        fallbackHandlerAddress: fallbackHandler.address,
        signMessageLibAddress: signMessageLib.address,
        createCallAddress:createCall.address,
    }
    }

    //const safeSdk = await Safe.create({ ethAdapter, safeAddress, contractNetworks })

    // const provider = new ethers.providers.Web3Provider(network.provider)
    
    const ethAdapterOwner1 = new EthersAdapter({ethers,signerOrProvider: wallet1});
    const ethAdapterOwner2 = new EthersAdapter({ethers,signerOrProvider: wallet2});
    console.log(typeof(wallet1))
    console.log(wallet1.address)
    console.log(wallet2.address)
    const safeFactory1 = await SafeFactory.create({ ethAdapter: ethAdapterOwner1,contractNetworks })
    const safeFactory2 = await SafeFactory.create({ ethAdapter: ethAdapterOwner2,contractNetworks })

    const source_safeAccountConfig: SafeAccountConfig = {
        owners: [
            wallet1.address,
    
        ],
        threshold: 1,
        }

    const destination_safeAccountConfig: SafeAccountConfig = {
        owners: [
            wallet2.address,
    
        ],
        threshold: 1,
        }
    
    const safeSdk1: Safe = await safeFactory1.deploySafe({safeAccountConfig:source_safeAccountConfig })
   
    const SafeAddress1 = await safeSdk1.getAddress()
    console.log("Deployed Safe1: ",SafeAddress1)

    const safeSdk2: Safe = await safeFactory2.deploySafe({safeAccountConfig:destination_safeAccountConfig })
   
    const SafeAddress2 = await safeSdk2.getAddress()
    console.log("Deployed Safe2: ",SafeAddress2)

    const HashiModule = await ethers.getContractFactory("HashiModule")
    const network = await provider.getNetwork()

    // Hashi Module should work on destination chain

    const hashiModule = await HashiModule.deploy(
        SafeAddress2,
        SafeAddress2,
        SafeAddress2,
        yaru.address,
        wallet1.address, // Address that will call the yaho
        DOMAIN_ID
    )
    // enable Safe module

    const safeTransaction = await safeSdk2.createEnableModuleTx(hashiModule.address)
    // only owner can sign
    const signedSafeTransaction = await safeSdk2.signTransaction(safeTransaction)

    const txResponse = await safeSdk2.executeTransaction(signedSafeTransaction)
    console.log("tx response: ",await txResponse.transactionResponse?.wait())
    console.log("Hashi Module: ",hashiModule.address)

    // Init tx on source 
    // From Safe Address 1
    const calldata = await pingPong.interface.encodeFunctionData("ping", [])
    const tx = await hashiModule.interface.encodeFunctionData("executeTransaction", [pingPong.address, 0, calldata, 0])
    const message = {
      to: hashiModule.address,
      toChainId: DOMAIN_ID,
      data: tx,
    }
    const pingCount = await pingPong.connect(wallet1).count()

    // dispatch message
    await yaho.dispatchMessagesToAdapters([message], [ambMessageRelay.address], [ambAdapter.address])
    await yaho.dispatchMessagesToAdapters([message], [ambMessageRelay.address], [ambAdapter.address])

    // execute messages
    await yaru.executeMessages([message], [ID_ZERO], [wallet1.address], [ambAdapter.address])
    await yaru.executeMessages([message], [ID_ONE], [wallet1.address], [ambAdapter.address])

    expect(await pingPong.count()).to.equal(pingCount + 2)

    console.log(DOMAIN_ID)
    })
})
