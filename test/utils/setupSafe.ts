
import { ethers } from "hardhat";

const setupSafe = async() =>{


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
    
      
    return{

        safeMasterCopy,
        safeProxy,
        multiSendCallOnly,
        multiSend,
        fallbackHandler,
        signMessageLib,
        createCall,
    }
}

export default setupSafe