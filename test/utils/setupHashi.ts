
import { ethers } from "hardhat";

const setupHashi = async(domain_id: any,bytes32_domaind_id: any)=>{

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
    const yaru = await Yaru.deploy(hashi.address, yaho.address, domain_id)
  
    // deploy Oracle Adapter
    const AMBMessageRelay = await ethers.getContractFactory("AMBMessageRelay")
    const ambMessageRelay = await AMBMessageRelay.deploy(amb.address, yaho.address)
    const AMBAdapter = await ethers.getContractFactory("AMBAdapter")
    const ambAdapter = await AMBAdapter.deploy(amb.address, ambMessageRelay.address,bytes32_domaind_id)
  
    // deploy avatar
    const Avatar = await ethers.getContractFactory("TestAvatar")
    const avatar = await Avatar.deploy()
  
    // const deploy PingPong test contract
    const PingPong = await ethers.getContractFactory("PingPong")
    const pingPong = await PingPong.deploy()
  
    return{
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

export default setupHashi