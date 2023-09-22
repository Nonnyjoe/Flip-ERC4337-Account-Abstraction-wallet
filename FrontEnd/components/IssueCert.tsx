import { Container } from '../components/Container';
import child_abi from '../utils/child_abi.json';
import factory_abi from '../utils/factory_abi.json';
import factory_address from '../utils/factory_address';


import React, { useEffect, useState } from 'react';

import { clsx } from 'clsx';
import { Address, useContractReads, useAccount, useContractRead, useContractWrite, useWaitForTransaction, usePrepareContractWrite } from 'wagmi';
import { Button } from './ui/button';
import { ethers } from 'ethers';
// import { Button } from 'react-day-picker';


export function IssueCertificate() {

    const [contractAddress, setUserName] = useState('');
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
    // const [userAddress, setUserAddress] = useState('');
    // const [duration, setDuration] = useState(0);
    // const [duration, setDuration] = useState(0);
    const [tokenAmount, setTokenAmount] = useState(0);
    const [singleAccount, setSingleAccount] = useState("");
    const [connectedAddr, setConnectedAddr] = useState("");
    const { address } = useAccount();


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
        issueCertWrite3?.();
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
        value: ethers.parseEther(depositValue.toString()),
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
        args: [withdrawalAddress, ethers.parseEther(withdrawalAmount.toString())],
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
