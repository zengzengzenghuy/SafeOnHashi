import { expect } from "chai";
import { ContractFactory } from "ethers";
import { ethers, network } from "hardhat";
import Safe, { SafeFactory, SafeAccountConfig,  EthersAdapter, ContractNetworksConfig, SafeDeploymentConfig } from '@safe-global/protocol-kit'
import { PredictedSafeProps } from '@safe-global/protocol-kit'
import setupHashi from "./utils/setupHashi";
import setupSafe from "./utils/setupSafe";

const DOMAIN_ID = network.config.chainId
const ID_ZERO = 0 // First messageId
const ID_ONE = 1 // Second messageId
const BYTES32_DOMAIN_ID = "0x0000000000000000000000000000000000000000000000000000000000007A69"   // source chain bytes32 domain ID defined in MOCKAMB.sol


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
            createCall
        } = await setupSafe();
        const {
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
        } = await setupHashi(DOMAIN_ID,BYTES32_DOMAIN_ID);

    const provider = await ethers.getDefaultProvider()


    // setup contract network config when Safe protocol contracts are not deployed on current network
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

    // ethAdapter with signer 1 and signer 2
    const ethAdapterOwner1 = new EthersAdapter({ethers,signerOrProvider: wallet1});
    const ethAdapterOwner2 = new EthersAdapter({ethers,signerOrProvider: wallet2});
    // safeFactory with signer 1 and signer 2
    const safeFactory1 = await SafeFactory.create({ ethAdapter: ethAdapterOwner1,contractNetworks })
    const safeFactory2 = await SafeFactory.create({ ethAdapter: ethAdapterOwner2,contractNetworks })

    // source chain = Safe with owner1
    const source_safeAccountConfig: SafeAccountConfig = {
        owners: [
            wallet1.address,
    
        ],
        threshold: 1,
        }

    // destination chain = Safe with owner2
    const destination_safeAccountConfig: SafeAccountConfig = {
        owners: [
            wallet2.address,
    
        ],
        threshold: 1,
        }


    // For predicted address
    // ============= Testing ============
    const safeDeploymentConfig :SafeDeploymentConfig = {
        saltNonce: '0x1', // Has to be number or hex
        safeVersion: "1.3.0"  // use v1.3.0 for testing (latest v1.4.0 still not supported by Protocol Kit)
    }
    const predictedSafe: PredictedSafeProps = {
        safeAccountConfig: destination_safeAccountConfig,
        safeDeploymentConfig: safeDeploymentConfig
    }
    const safeSdk = await Safe.create({ethAdapter: ethAdapterOwner2,predictedSafe,contractNetworks})
    const predictedAddress = await safeSdk.getAddress()
    console.log("predictedAddress: ",predictedAddress)
    // =======================================
    
    const safeSdk1: Safe = await safeFactory1.deploySafe({safeAccountConfig:source_safeAccountConfig })
   
    const SafeAddress1 = await safeSdk1.getAddress()
    console.log("Deployed Safe1: ",SafeAddress1)

    const safeSdk2: Safe = await safeFactory2.deploySafe({safeAccountConfig:destination_safeAccountConfig,saltNonce: '0x1' })

    const SafeAddress2 = await safeSdk2.getAddress()
    console.log("Deployed Safe2: ",SafeAddress2)

    expect(predictedAddress).to.equal(SafeAddress2)

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
    const pingCount = await pingPong.count()

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
