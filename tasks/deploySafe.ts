import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { task, types } from "hardhat/config"
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types"
import Safe, { SafeFactory, SafeAccountConfig, EthersAdapter, ContractNetworksConfig, SafeDeploymentConfig } from '@safe-global/protocol-kit'
import { PredictedSafeProps } from '@safe-global/protocol-kit'
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
        const _yaru = "0xba73B783Cadec4f250619C2e99A5b1D07FFce760"
        const _controller = taskArguments.controller
        const _chainId = taskArguments.sourcechainid

        console.log(_owner)
        console.log(_avatar)
        console.log(_target)
        console.log(_yaru)
        console.log(_controller)
        console.log(_chainId)

        const hashiModule = await HashiModule.deploy(_owner,_avatar,_target,_yaru,_controller,_chainId)
        
        const ethAdapterOwner1 = new EthersAdapter({ethers,signerOrProvider: signer});
        const safeSDK = await Safe.create({ethAdapter: ethAdapterOwner1,safeAddress:_avatar})
        const safeTransaction = await safeSDK.createEnableModuleTx(hashiModule.address)
        const txHash = await safeSDK.getTransactionHash(safeTransaction)
        // const approveTxResponse = await safeSDK.approveTransactionHash(txHash)
        // console.log(await approveTxResponse.transactionResponse?.wait())
        const txResponse = await safeSDK.executeTransaction(safeTransaction)
        
        console.log("Tx response: ",await txResponse.transactionResponse?.wait())
        
 
     
    })