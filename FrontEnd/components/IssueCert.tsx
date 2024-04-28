import { Container } from '../components/Container';
import child_abi from '../utils/child_abi.json';
import factory_abi from '../utils/factory_abi.json';
import factory_address from '../utils/factory_address';
import { UserOperation, Transaction } from "@biconomy/core-types";


import React, { Provider, useEffect, useState } from 'react';

import { clsx } from 'clsx';
import { Address, useContractReads, useAccount, useContractRead, useContractWrite, useWaitForTransaction, usePrepareContractWrite } from 'wagmi';
import { Button } from './ui/button';

// const { RelayClient } = require('@openzeppelin/defender-sdk-relay-client');
import { RelayClient } from '@openzeppelin/defender-relay-client';
// const { DefenderRelayProvider } = require('@openzeppelin/defender-relay-client/lib/web3');
const Web3 = require('web3');
import Lambda from 'aws-sdk/clients/lambda';

// import { Defender } from '@openzeppelin/defender-sdk-base-client';
// import { sigUtil } from "eth-sigiutil"
import { IBundler, Bundler } from '@biconomy/bundler'
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from "@biconomy/account"
import { ethers  } from 'ethers'
import { ChainId } from "@biconomy/core-types"
import { 
  IPaymaster, 
  BiconomyPaymaster,
  IHybridPaymaster,  
  PaymasterMode,
  SponsorUserOperationDto,
} from '@biconomy/paymaster'
import { ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE } from "@biconomy/modules";

// import { Button } from 'react-day-picker';


export function IssueCertificate() {

    const [balance, setBalance] = useState<number>(0);
    const [nonce, setNonce] = useState<number>(0);
    const [owner, setOwner] = useState('');
    
    const [targetAddress, setTargetAddress] = useState("");
    const [Value, setValue] = useState(0);
    const [calldata, setCalldata] = useState("");
    const [transactionProcessed, setTransactionProcessed] = useState<Boolean>(false);
    
    const [depositValue, setDepositValue] = useState(0);
    const [depositStatus, setDepositStatus] = useState<Boolean>(false);
    
    const [withdrawalAddress, setWithdrawalAddresss] = useState("");
    const [withdrawalAmount, setWithdrawalAmount] = useState(0);
    const [WithdrawalStatus, setWithdrawalStatus] = useState<Boolean>(false);
    const [singleAccount, setSingleAccount] = useState("");
    const [connectedAddr, setConnectedAddr] = useState("");
    const { address } = useAccount();

    // const [address, setAddress] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false);
    const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | null>(null);
    const [provider, setProvider] = useState<ethers.providers.Provider | null>(null)

const bundler: IBundler = new Bundler({
    bundlerUrl: `https://bundler.biconomy.io/api/v2/${ChainId.GOERLI}/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44`, // bundler URL from dashboard use 84531 as chain id if you are following this on base goerli,    
    chainId: ChainId.GOERLI,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  })
  
  const paymaster: IPaymaster = new BiconomyPaymaster({
    paymasterUrl: "https://paymaster.biconomy.io/api/v1/5/peE1TtqEY.5ce39aaf-609a-41db-b29a-e99fc4269131",// paymaster url from dashboard 
  })

  interface Props {
    smartAccount: BiconomySmartAccountV2,
    address: string,
    provider: ethers.providers.Provider,
  }
  

const sendTransction = async(ContractAddress: Address, ContractAbi: any) => {
    // await connect();
    console.log('smartAccount:', smartAccount);
    // Create a provider instance for the Ethereum mainnet
    const provider: ethers.providers.Provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/rcEZZsvGLLljGJU9GAWZGnRMSXQOuGsw');
    // Initialize contract
    let contract = new ethers.Contract(ContractAddress, ContractAbi, provider);
    try{
        const transact = await contract.populateTransaction.withdrawDepositTo(withdrawalAddress, ethers.utils.parseEther(withdrawalAmount.toString()));
        console.log(transact.data);
        const tx = {
            to: ContractAddress,
            data: transact.data,
        };
        console.log("Addr:", ContractAddress);
        console.log("Tx:", tx);

        let userOp = await smartAccount?.buildUserOp([tx]);
        console.log("userOp:", userOp);
        const biconomyPaymaster = smartAccount?.paymaster as IHybridPaymaster<SponsorUserOperationDto>;
        let paymasterServiceData: SponsorUserOperationDto = {
            mode: PaymasterMode.SPONSORED,
            smartAccountInfo: {
            name: 'Smart Wallet',
            version: '1.1.0'
        },
        }
        
        const paymasterAndDataResponse =
        await biconomyPaymaster.getPaymasterAndData(
          userOp as Partial<UserOperation>,
          paymasterServiceData
        );

        userOp ? userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData : null;
        const userOpResponse = await smartAccount?.sendUserOp(userOp as Partial<UserOperation>);
        console.log("userOpHash", userOpResponse);
        const  receipt  = await userOpResponse?.wait(1);
        console.log("txHash", receipt)
    } catch(err: any) {
        console.log(err);
        console.log(err);
    }
}

const zeppelin = async () => {
    // let YOUR_RELAYER_API_KEY = "8Mxv2gVPhn5tNtgyiYsqmhnYLW3VHrM9";
    // let YOUR_RELAYER_API_SECRET = "3fNkhQuUNyLdVPpFSnXH5N7kzxWsHSFR6oJyrErLBnfFtxunecuw5sPjQxj6Mdzt";
    
    // const credentials = { apiKey: YOUR_RELAYER_API_KEY, apiSecret: YOUR_RELAYER_API_SECRET };
    // const relayClient = new RelayClient(credentials);

    // console.log(`creating relayers........`);
    // const requestParameters = {
    //     name: 'MyNewRelayer',
    //     network: 'goerli',
    //     minBalance: BigInt(1e17).toString(),
    //     policies: {
    //       whitelistReceivers: ['0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B'],
    //     },
    //   };
      
    //   await relayClient.create(requestParameters);
      
    // console.log(`checking relayers........`)
    // // const provider = new DefenderRelayProvider(credentials, { speed: 'fast' });
   
   
   
    // const allRelayers = await relayClient.list();
    // console.log(allRelayers)
    
    // const client = new RelayClient(credentials);
    // const client = new DefenderRelayProvider(credentials);
    // console.log(client);
    // const provider = client.relaySigner.getProvider();

    // const web3 = new Web3(provider);

    // const [from] = await web3.eth.getAccounts();
    // console.log(from);
}



// const connect = async () => {

//     const data1 = 'Hello12,';
//     const data2 = 'world2!';
//     // Predefined randomness (not secure - for demonstration only)
//     // Obtained by combining a username and a password through encodeing.
//     const encodedData = ethers.utils.defaultAbiCoder.encode(['string', 'string'], [data1, data2]);
//     // console.log(encodedData);

//     // hashing the encoded data to obtain the data in order to get an entropy from wich to obtain the Mnemonic
//     const hash = ethers.utils.keccak256(encodedData);
//     // console.log(hash);

//     // Generate a mnemonic phrase from the predefined randomness
//     const mnemonic = ethers.utils.entropyToMnemonic(hash);
//     // console.log("Mnemonic:", mnemonic);

//     // Create a wallet from the seed phrase
//     const wallet = ethers.Wallet.fromMnemonic(mnemonic);
//     console.log(wallet);
//     const provider: ethers.providers.Provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/rcEZZsvGLLljGJU9GAWZGnRMSXQOuGsw');

//     // Get a signer from the wallet
//     const signer = wallet.connect(provider);

//     const module1 = await ECDSAOwnershipValidationModule.create({
//         signer: signer,
//         moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
//         });


//         let biconomySmartAccount = await BiconomySmartAccountV2.create({
//             chainId: ChainId.POLYGON_MUMBAI,
//             bundler: bundler, 
//             paymaster: paymaster,
//             entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
//             defaultValidationModule: module,
//             activeValidationModule: module
//           })

//         //   setAddress( await biconomySmartAccount.getAccountAddress())
//           setSmartAccount(biconomySmartAccount);
//           console.log('done here');
// }













const IssueCert = async () => {
    console.log("creating vest");
    issueCertWrite?.();
};
const IssueCert2 = async () => {
    console.log("creating vest");
    issueCertWrite2?.();
};
const IssueCert3 = async () => {
    console.log("creating vest3333");
    // sendTransction(singleAccount as Address, child_abi);
    zeppelin();
    // issueCertWrite3?.();
};


    // EXECUTE TRANSACTION
    const { config: IssueCertConfig } = usePrepareContractWrite({
        address: singleAccount as Address,
        abi: child_abi,
        functionName: "execute",
        args: [targetAddress as Address, Value, calldata],
    });
    const { data: issueCertData, isLoading: issueCertIsLoading, isError: issueCertIsError, write: issueCertWrite, isSuccess: Successfully } = useContractWrite(IssueCertConfig);
    const waitForTransaction = useWaitForTransaction({
        hash: issueCertData?.hash,
        onSuccess(data) {
          setTransactionProcessed(true);
          console.log('Success', data)
        },
      })

    // DEPOSIT INTO WALLET
    const { config: IssueCertConfig2 } = usePrepareContractWrite({
        address: singleAccount as Address,
        abi: child_abi,
        functionName: "addDeposit",
        value: ethers.utils.parseEther(depositValue.toString()) as any,
    });
    const { data: issueCertData2, isLoading: issueCertIsLoading2, isError: issueCertIsError2, write: issueCertWrite2, isSuccess: Successfully2 } = useContractWrite(IssueCertConfig2);
    const waitForTransaction2 = useWaitForTransaction({
        hash: issueCertData2?.hash,
        onSuccess(data) {
          setDepositStatus(true);
          console.log('Success', data)
        },
      })

    // TRANSFER FROM SMART WALLET
    const { config: IssueCertConfig3 } = usePrepareContractWrite({
        address: singleAccount as Address,
        abi: child_abi,
        functionName: "withdrawDepositTo",
        args: [withdrawalAddress, ethers.utils.parseEther(withdrawalAmount.toString())],
    });
    const { data: issueCertData3, isLoading: issueCertIsLoading3, isError: issueCertIsError3, write: issueCertWrite3, isSuccess: Successfully3 } = useContractWrite(IssueCertConfig3);
    const waitForTransaction3 = useWaitForTransaction({
        hash: issueCertData3?.hash,
        onSuccess(data) {
          setWithdrawalStatus(true);
          console.log('Success', data)
        },
      })      


      const { data: certAddr, isLoading: yourCertIsLoading, isError: yourCertIsError } = useContractRead({
        address: factory_address,
        abi: factory_abi,
        functionName: "getUserAddress",
        watch: true,
        args: [connectedAddr ?? "0x00"],
    });

      const { data: certAddr2, isLoading: yourCertIsLoading2, isError: yourCertIsError2 } = useContractRead({
        address: certAddr as Address,
        abi: child_abi,
        functionName: "viewNonce",
        watch: true,
    });
      const { data: certAddr3, isLoading: yourCertIsLoading3, isError: yourCertIsError3 } = useContractRead({
        address: certAddr as Address,
        abi: child_abi,
        functionName: "getDeposit",
        watch: true,
    });
      const { data: certAddr4, isLoading: yourCertIsLoading4, isError: yourCertIsError4 } = useContractRead({
        address: certAddr as Address,
        abi: child_abi,
        functionName: "viewOwner",
        watch: true,
    });
    

    useEffect(() => {

        setConnectedAddr(address as Address);
        console.log(`final child addr:`, certAddr);
        setSingleAccount(certAddr as Address);
        setNonce(certAddr2 as number);
        setBalance(certAddr3 as number);
        setOwner(certAddr4 as Address);
        console.log(`Wallet Ballance:`, certAddr3);

    }, [address, certAddr, connectedAddr, certAddr2]);


    return (
        <div>
        <Container className={clsx("pt-20 pb-7 lg:pt-12 flex flex-row gap-8 justify-center")}>
            <div className={clsx("flex flex-col gap-8 mt-4 px-8 py-8  bg-zinc-50 shadow-2xl shadow-zinc-200 rounded-lg ring-1 ring-zinc-200 lg:max-w-2xl text-center")}>
                <p>
                    WALLET ADDRESS:
                </p>
                <p>
                    {certAddr ? `${certAddr.toString().slice(0,10)}.... ${certAddr.toString().slice(-10)}` : '0x00000'}
                </p>
            </div>
            <div className={clsx("flex flex-col gap-8 mt-4 px-8 py-8  bg-zinc-50 shadow-2xl shadow-zinc-200 rounded-lg ring-1 ring-zinc-200 lg:max-w-2xl text-center")}>
                <p>
                    BALLANCE:
                </p>
                <p>
                    {`${(Number(balance) /10**18)?.toString()} ETH`}
                </p>
            </div>
            <div className={clsx("flex flex-col gap-8 mt-4 px-8 py-8  bg-zinc-50 shadow-2xl shadow-zinc-200 rounded-lg ring-1 ring-zinc-200 lg:max-w-2xl text-center")}>
                <p>
                   NONCE.:
                </p>
                <p>
                    {nonce?.toString()}
                </p>
            </div>
            <div className={clsx("flex flex-col gap-8 mt-4 px-8 py-8  bg-zinc-50 shadow-2xl shadow-zinc-200 rounded-lg ring-1 ring-zinc-200 lg:max-w-2xl text-center")}>
                <p>
                   OWNER:
                </p>
                <p>
                    {owner ? `${owner.slice(0,10)}...${owner.slice(-10)}` : '0X0000' }
                </p>
            </div>
        </Container> 

        <Container className="pt-20 pb-16 lg:pt-10">
            <form className={clsx("flex flex-col gap-8 mt-4 px-8 py-8 m-auto bg-zinc-50 shadow-2xl shadow-zinc-200 rounded-lg ring-1 ring-zinc-200 lg:max-w-2xl")}>
                <h2 className="mx-auto max-w-4xl font-display text-4xl font-medium tracking-tight text-slate-900 ">
                    EXECUTE TRANSACTION
                </h2>
                <div className='flex flex-col gap-2'>
                        <label htmlFor="token_address">Target Address</label>
                        <input
                            type="text"
                            name="token_address"
                            id=""
                            onChange={(e) => { setTargetAddress(e.target.value); }}
                            className='w-full shadow-inner p-2 px-4 ring-1 ring-zinc-200 rounded-md outline-none bg-zinc-50 '
                        />
                    </div>
                <div className='space-y-4'>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="token_amount"> Value</label>
                        <input
                            type="number"
                            name="token_amount"
                            id=""
                            onChange={(e) => { setValue(Number(e.target.value)); }}
                            className='w-full shadow-inner p-2 px-4 ring-1 ring-zinc-200 rounded-md outline-none bg-zinc-50 '
                        />
                    </div>
                </div>
                <div className='flex flex-col gap-2'>
                        <label htmlFor="token_address">Transaction Calldata</label>
                        <input
                            type="text"
                            name="token_address"
                            id=""
                            onChange={(e) => { setCalldata(e.target.value); }}
                            className='w-full shadow-inner p-2 px-4 ring-1 ring-zinc-200 rounded-md outline-none bg-zinc-50 '
                        />
                    </div>
                <div className='flex flex-col gap-3'>
                    <Button type='button' onClick={IssueCert} disabled={false}>Execute</Button>
                </div>
                <p className='green'>
                    {Successfully ? `VESTING SUCCESFUL` : ''}
                </p>

            </form>
        </Container>

        <Container className="pt-20 pb-16 lg:pt-10">
            <form className={clsx("flex flex-col gap-8 mt-4 px-8 py-8 m-auto bg-zinc-50 shadow-2xl shadow-zinc-200 rounded-lg ring-1 ring-zinc-200 lg:max-w-2xl")}>
                <h2 className="mx-auto max-w-4xl font-display text-4xl font-medium tracking-tight text-slate-900 ">
                    DEPOSIT
                </h2>
                <div className='space-y-4'>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="token_amount"> Amount</label>
                        <input
                            type="number"
                            name="token_amount"
                            id=""
                            onChange={(e) => { setDepositValue(Number(e.target.value)); }}
                            className='w-full shadow-inner p-2 px-4 ring-1 ring-zinc-200 rounded-md outline-none bg-zinc-50 '
                        />
                    </div>
                </div>
                <div className='flex flex-col gap-3'>
                    <Button type='button' onClick={IssueCert2} disabled={false}>Deposit</Button>
                </div>
                <p className='green'>
                    {Successfully ? `VESTING SUCCESFUL` : ''}
                </p>

            </form>
        </Container>

        <Container className="pt-20 pb-16 lg:pt-5">
            <form className={clsx("flex flex-col gap-8 mt-4 px-8 py-8 m-auto bg-zinc-50 shadow-2xl shadow-zinc-200 rounded-lg ring-1 ring-zinc-200 lg:max-w-2xl")}>
                <h2 className="mx-auto max-w-4xl font-display text-4xl font-medium tracking-tight text-slate-900 ">
                    TRANSFER
                </h2>
                <div className='flex flex-col gap-2'>
                        <label htmlFor="token_address">Receiver Address</label>
                        <input
                            type="text"
                            name="token_address"
                            id=""
                            onChange={(e) => { setWithdrawalAddresss(e.target.value); }}
                            className='w-full shadow-inner p-2 px-4 ring-1 ring-zinc-200 rounded-md outline-none bg-zinc-50 '
                        />
                    </div>
                <div className='space-y-4'>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="token_amount"> Amount</label>
                        <input
                            type="number"
                            name="token_amount"
                            id=""
                            onChange={(e) => { setWithdrawalAmount(Number(e.target.value)); }}
                            className='w-full shadow-inner p-2 px-4 ring-1 ring-zinc-200 rounded-md outline-none bg-zinc-50 '
                        />
                    </div>
                </div>
                <div className='flex flex-col gap-3'>
                    <Button type='button' onClick={IssueCert3} disabled={false}>Transfer</Button>
                </div>
                <p className='green'>
                    {Successfully ? `VESTING SUCCESFUL` : ''}
                </p>

            </form>
        </Container>

        
        </div>

    );
}
