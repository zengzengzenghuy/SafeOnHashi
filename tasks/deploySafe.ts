import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { task, types } from "hardhat/config"
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"
import Safe, { SafeFactory, SafeAccountConfig, EthersAdapter, ContractNetworksConfig, SafeDeploymentConfig } from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'
import contractAddress from '../utils/contract.json'


task("deploy:Safe")
    .addParam("numowners","number of owners of Safe")
    .addParam("address","owners address")
    .addParam("threshold","set threshold")
    .setAction(async function(taskArguments: TaskArguments){
        console.log("Deploying Safe...")
        const signers: SignerWithAddress[] = await ethers.getSigners()

        console.log(`Owners: ${taskArguments.address}`)
        console.log(`threshold: ${taskArguments.threshold}`)
        console.log(`Signer: ${signers[0].address}`)

        const ownersAddr = taskArguments.address.split(',')
        console.log(`Owners: ${ownersAddr}`)
        const ethAdapterOwner1 = new EthersAdapter({ethers,signerOrProvider: signers[0]});
        const safeFactory = await SafeFactory.create({ethAdapter: ethAdapterOwner1})
        const safeAccountConfig:SafeAccountConfig ={
            owners:ownersAddr,
            threshold: taskArguments.threshold
        }
        const safeSDK = await safeFactory.deploySafe({safeAccountConfig}) 
        const safeAddress = await safeSDK.getAddress()
        console.log(`Deployed Safe to ${taskArguments.network} : ${safeAddress}`)
        
    
    
    })

task("deploy:HashiModule")
    .addParam("safe","Safe address")
    .addParam("sourcechainid","source chain ID to listen from")
    .addParam("controller","source chain address that will call yaho")
    .addParam("owner","owner of this Hashi Module")
    .addParam("target","address that this Module will execute on behalf of")
    .addParam("privatekey","Private key of one of the owners of Safe wallet")
    .setAction(async function(taskArguments:TaskArguments){
        // const signers: SignerWithAddress[] = await ethers.getSigners()
      
        const provider = new ethers.providers.JsonRpcProvider(network.config.url)
    
        const signer = new ethers.Wallet(taskArguments.privatekey,provider )
        console.log("Signer address: ",signer.address)
        const HashiModule = await ethers.getContractFactory("HashiModule")
        const _owner = taskArguments.owner
        const _avatar = taskArguments.safe
        const _target = taskArguments.target
        const _yaru = contractAddress.Yaru
        const _controller = taskArguments.controller
        const _chainId = taskArguments.sourcechainid

        console.log(_owner)
        console.log(_avatar)
        console.log(_target)
        console.log(_yaru)
        console.log(_controller)
        console.log(_chainId)

        const hashiModule = await HashiModule.deploy(_owner,_avatar,_target,_yaru,_controller,_chainId)
        console.log("setting up")
        const ethAdapterOwner1 = new EthersAdapter({ethers,signerOrProvider: signer});
        const safeSDK = await Safe.create({ethAdapter: ethAdapterOwner1,safeAddress:_avatar})
        const safeTransaction = await safeSDK.createEnableModuleTx(hashiModule.address)
        const txHash = await safeSDK.getTransactionHash(safeTransaction)
        const senderSignature = await safeSDK.signTransactionHash(txHash)
        const TxServiceUrl:string = getSafeTxService(network.config.chainId)
        console.log("tx service url: ",TxServiceUrl)
        const safeService = new SafeApiKit({txServiceUrl:TxServiceUrl,ethAdapter:ethAdapterOwner1})
        console.log("Propose transaction...")
        await safeService.proposeTransaction({
            safeAddress:_avatar,
            safeTransactionData: safeTransaction.data,
            safeTxHash: txHash,
            senderAddress: signer.address,
            senderSignature: senderSignature.data,
        })
        
        console.log("Please login to Safe UI and sign transaction")
        // const approveTxResponse = await safeSDK.approveTransactionHash(txHash)
        // console.log(await approveTxResponse.transactionResponse?.wait())
        // const txResponse = await safeSDK.executeTransaction(safeTransaction)
        
        // console.log("Tx response: ",await txResponse.transactionResponse?.wait())
        
 
     
    })

const chainIds = {
    1 : "mainnet",
    5 : "goerli",
    100: "gnosis"

    }
      
function getSafeTxService(chainid: keyof typeof chainIds): string{
    let apiURL: string
    switch(chainid){
        case 1: 
            apiURL = "https://safe-transaction-mainnet.safe.global/"
            break
        case 5: 
            apiURL = "https://safe-transaction-goerli.safe.global/"
            break        
        case 100: 
            apiURL = "https://safe-transaction-gnosis-chain.safe.global/"
            break
        default:
            apiURL = "NotAvailable"
            break
    }

    return apiURL
   
}