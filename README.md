# Safe on Hashi

Integration of [Safe wallet](https://docs.safe.global/) on top of [Hashi](https://github.com/gnosis/hashi)

For UI, please go to [Safe on Hashi App](https://github.com/zengzengzenghuy/SafeOnHashi-UI) and complete the setup.

## Goal

PoC implementation of source Safe controlling destination Safe, without compromising bridge security.

## Dev

Test  
`npx hardhat test test/safe.ts`

## Feature

### Deploy Safe

Deploy Safe using hardhat task  
**Command**: `yarn hardhat deploy:Safe [--option]`  
**Option**:
`--numowners`: Number of owners of this Safe wallet. (Number)
`--address`: Owner addresses, separated by comma. (Hex)
`--threshold`: Threshold of the Safe, need to <= numowners. (Number)

**Example**:

```
npx hardhat deploy:Safe --numowners 3 --address 0xC020D291d8a6158099e89D203d1457a21734f0ba,0x8ea6031Deff7e896468DdcA30F84529968ebE96c,0x85089b0017A3a46f59adcB72FEeed0D48f8C3d7e --threshold 2 --network gnosis
```

**Output**:
`Deployed Safe to Gnosis Chain: <Safe Address>`

### Deploy Hashi Module for Safe

Deploy Hashi [module](https://github.com/gnosis/zodiac#modules) related to Safe.  
**Command**: `yarn hardhat deploy:HashiModule [--option]`  
**Option**:  
`--safe`: Safe address that you want to enable the hashi module to. (Hex)  
`--sourcechainid`: [Source Chain ID](https://chainlist.org/) to listen from, the source chain Safe will initiate transaction that will be executed by destiantion chain Safe. (Number)  
`--controller`: Source chain address (EOA/Safe wallet) that will call Yaho. (Hex)  
`--owner`: Owner of this Hashi Module, default to Safe address. (Hex)  
`--target`: Safe address that this module will execute on behalf of, default to Safe address. (Hex)  
`--privatekey`: Private key of one of the owners of `--safe` wallet, make sure to have enough gas token for deployment. (Hex)

**Example**:

```
npx hardhat deploy:HashiModule --safe 0xe13d03a746E41098458f8e3Cc3fB4069E00f3eBF --sourcechainid 5 --controller 0xE6377f8A5AEF7f9EA08F466786D6D461a5bf79Cf --owner 0xe13d03a746E41098458f8e3Cc3fB4069E00f3eBF --target 0xe13d03a746E41098458f8e3Cc3fB4069E00f3eBF --privatekey 7b29f6f7997c09eff2f1e3ab4c5fb8146d14cdedbca5a53e831070af3fc5c338 --network gnosis

```

**Output**

```
setting up
tx service url: <Tx Service URL>
Propose transaction...
Please login to Safe UI and sign transaction
```

**Action Needed**: Once the transactin is sent to transaction queue, you will need to login to Safe and confirm the transaction.
