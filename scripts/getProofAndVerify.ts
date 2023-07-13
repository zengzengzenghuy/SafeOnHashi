import "dotenv/config";
import { getRPC, getTxServiceURL } from "../utils/helper";
import { Wallet } from "ethers";
import deployedContract from "../utils/contract.json";
import { ethers } from "hardhat";
import axios from "axios";
import { EthersAdapter } from "@safe-global/protocol-kit";
import SafeApiKit from "@safe-global/api-kit";
import { SafeInfoResponse } from "@safe-global/api-kit";
import { Trie } from "@ethereumjs/trie";
import { toBuffer, bufferToHex } from "ethereumjs-util";


const getBlockHeader = async () => {
  // Get Block Header from ShoyuBashi

  const shoyuBashiFactory = await ethers.getContractFactory("ShoyuBashi");
  const ShoyuBashi = shoyuBashiFactory.attach(deployedContract.ShoyuBashi);

  const gno_rpc = getRPC("100");
  const goerli_rpc = getRPC("5");
  const provider = new ethers.providers.JsonRpcProvider(gno_rpc);

  const signer = new Wallet(process.env.DEPLOYER_OWNER_KEY!, provider);
  const chainId: number = 5; //Goerli
  const blockNumber = 9337186;
  const blockHeader = await ShoyuBashi.connect(signer).getThresholdHash(
    chainId,
    blockNumber
  );
  console.log(blockHeader);

  // Get Block Header from Goerli RPC

  const goerli_provider = new ethers.providers.JsonRpcProvider(goerli_rpc);
  const goerli_signer = new Wallet(
    process.env.DEPLOYER_OWNER_KEY!,
    goerli_provider
  );
  const blockFromGoerli = await goerli_provider.getBlock(blockNumber);
  console.log(blockFromGoerli.hash);
  console.log("Is valid block header: ", blockHeader === blockFromGoerli.hash);

  // Setup Safe Adapter

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: goerli_signer,
  });

  const safeService = new SafeApiKit({
    txServiceUrl: getTxServiceURL("5"),
    ethAdapter,
  });

  const safeAddress = "0xE6377f8A5AEF7f9EA08F466786D6D461a5bf79Cf";
  const Owner_to_proof = "0x41Ff3a5D17798902E2195538d7e9fb42C7D19070";

  const safeInfo: SafeInfoResponse = await safeService.getSafeInfo(safeAddress);
  console.log("Safe Info: ", safeInfo);

  // Get Storage Slot of the owners mapping in Safe contract

  // Index slot
  // TODO: explain why it is 0x2
  const slot = "0x2";
  const paddedAddress = ethers.utils.hexZeroPad(Owner_to_proof, 32);
  const paddedSlot = ethers.utils.hexZeroPad(slot, 32);
  const concatenated = ethers.utils.concat([paddedAddress, paddedSlot]);
  // key/indexof the storage slot
  const hash = ethers.utils.keccak256(concatenated);
  console.log("Hash:", hash);
  const slot_Value = await goerli_provider.getStorageAt(
    safeAddress,
    hash,
    blockNumber
  );
  console.log("slot value: ", slot_Value);

  // get Proof w.r.t the storage slot of the Owner_to_proof
  const { data } = await axios.post(
    goerli_rpc!,
    {
      jsonrpc: "2.0",
      method: "eth_getProof",
      params: [safeAddress, [hash], "0x8E6647"],
      id: 1,
    },
    { headers: { "Content-Type": "application/json" } }
  );
  console.log("Proof from eth_getProof: ", data);

  const storageValue = data.result.storageProof[0].value;
  console.log("Storage value: ", storageValue);
  console.log(
    "Is valid storage value: ",
    storageValue === ethers.utils.hexStripZeros(slot_Value)
  );

  // Set up new Merkle Patricia Tree from proof
  const storageTrie = new Trie({
    root: toBuffer(data.result.storageHash),
    useKeyHashing: true,
  });
  await storageTrie.fromProof(
    data.result.storageProof[0].proof.map((p: string) => toBuffer(p))
  );

  // get the value of 'hash' as key
  const val = await storageTrie.get(toBuffer(hash), true);
  const trieValue = ethers.utils.RLP.decode(bufferToHex(val!));
  console.log(trieValue);

  // create proof from key 'hash'
  const createProof = await storageTrie.createProof(toBuffer(hash));
  const valid = await storageTrie.verifyProof(
    toBuffer(data.result.storageHash),
    toBuffer(hash),
    createProof
  );
  const proofValue = ethers.utils.RLP.decode(bufferToHex(valid!));
  console.log(proofValue);

  console.log("Is valid proof: ", trieValue === proofValue);
};

getBlockHeader().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
