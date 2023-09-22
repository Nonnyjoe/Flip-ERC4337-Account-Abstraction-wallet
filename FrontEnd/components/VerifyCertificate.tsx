import Image from 'next/image';
import { ButtonLink } from '../components/Button';
import { Container } from '../components/Container';
import factory_abi from '../utils/factory_abi.json';
import factory_address from '../utils/factory_address';
import child_abi from '../utils/child_abi.json';
import React, { SetStateAction, useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "./ui/card"
import { clsx } from 'clsx';
import { type  Address, useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { Button } from './ui/button';
import { useDisclosure } from '@chakra-ui/react'
import  {Verified} from './components/Verified';
import ErrorDialog from './components/Error';


export function VerifyCertificate() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [verifiedStatus, setVerifiedStatus] = useState(false);
    const [ErrorStatus, setErrorStatus] = useState(false);

    const [connectedAddr, setConnectedAddr] = useState("");
    const [singleAccount, setSingleAccount] = useState("");
    const [newAddress, setNewAddress] = useState("");
    const [targetAddress, setTargetAddress] = useState("");
    const [requestId, setRequestId] = useState(0);
    const [inputRequestId, setInputRequestId] = useState(0);
    
    const [verifiedCertificateData, setVerifiedCertificateData] = useState<VerifiedCertificateDetails>();
    
      // State to store the selected contract address
    const [selectedContract, setSelectedContract] = useState<string | null>(null);
    const [tokenWithdrawn, settokenWithdrawn] = useState<boolean>(false);
    
    
    const {address} = useAccount();
    
  
    const verifyByHash = () => {
        console.log("Verifying cert by hash")
        // setVerifiedStatus(true)
        // setErrorStatus(true)
        createCertWrite?.()
        
    }    
    const verifyByHash1 = () => {
        console.log("Verifying cert by hash")
        // setVerifiedStatus(true)
        // setErrorStatus(true)
        createCertWrite1?.()
        
    }    
    
        // GET A USERS SMART WALLET ACCOUNT
      const { data: certAddr, isLoading: yourCertIsLoading, isError: yourCertIsError } = useContractRead({
        address: factory_address,
        abi: factory_abi,
        functionName: "getUserAddress",
        args: [connectedAddr ?? "0x00"],
    });

    useEffect(() => {

        setConnectedAddr(address as Address);
        console.log(`final child addr:`, certAddr);
        setSingleAccount(certAddr as Address);


    }, [address, certAddr, connectedAddr]);
    

    // REQUEST RECOVERY
    const { config: CreateCertConfig } = usePrepareContractWrite({
        address: singleAccount as Address,
        abi: child_abi,
        functionName: "requestRecovery",
        args: [requestId, newAddress],
    });
    const { data: createCertData, isLoading: createCertIsLoading, isError: createCertIsError, write: createCertWrite, isSuccess: Successfully } = useContractWrite(CreateCertConfig);
   
    // AUTORIZE RECOVERY
    const { config: CreateCertConfig1 } = usePrepareContractWrite({
        address: targetAddress as Address,
        abi: child_abi,
        functionName: "autorizeRecovery",
        args: [inputRequestId],
    });
    const { data: createCertData1, isLoading: createCertIsLoading1, isError: createCertIsError1, write: createCertWrite1, isSuccess: Successfully1 } = useContractWrite(CreateCertConfig1);



  // Function to handle card click and update selectedContract state
  const handleCardClick = (contractAddress: string) => {
    setSelectedContract(contractAddress);
  };
    
    return (
        <div>
        <Container className={clsx("pt-20 pb-16 lg:pt-12")}>
            {verifiedStatus && verifiedCertificateData && <Verified open={isOpen} close={onClose} data={verifiedCertificateData} />}
            {ErrorStatus && <ErrorDialog open={isOpen} close={onClose} />}
            <form className={clsx("flex flex-col gap-8 mt-4 px-8 py-8 m-auto bg-zinc-50 shadow-2xl shadow-zinc-200 rounded-lg ring-1 ring-zinc-200 lg:max-w-2xl")}>
                <h2 className="mx-auto max-w-4xl font-display text-4xl font-medium tracking-tight text-slate-900 ">
                    REQUEST WALLET RECOVERY
                </h2>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="token_address">New Owner Address</label>
                        <input
                            type="text"
                            name="token_address"
                            id=""
                            onChange={(e) => { setNewAddress(e.target.value); }}
                            className='w-full shadow-inner p-2 px-4 ring-1 ring-zinc-200 rounded-md outline-none bg-zinc-50 '
                        />
                    </div>
                <div className='space-y-4'>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="token_amount"> Request Identifier</label>
                        <input
                            type="number"
                            name="token_amount"
                            id=""
                            onChange={(e) => { setRequestId(Number(e.target.value)); }}
                            className='w-full shadow-inner p-2 px-4 ring-1 ring-zinc-200 rounded-md outline-none bg-zinc-50 '
                        />
                    </div>
                </div>
                <p className='bg-zinc-50'>
                   {tokenWithdrawn ? ` TOKEN WITHDRAWN SUCESSFULLY !!!` : ""}
                </p>
                <Button type="button" disabled ={true ? false : true} onClick={verifyByHash}>Request Recovery</Button>
                <p>
                    {Successfully ? `WITHDRAWAL SUCCESFUL` : ''}
                </p>
                </form> 
        </Container>
        <Container className="pt-20 pb-16 lg:pt-10">
            <form className={clsx("flex flex-col gap-8 mt-4 px-8 py-8 m-auto bg-zinc-50 shadow-2xl shadow-zinc-200 rounded-lg ring-1 ring-zinc-200 lg:max-w-2xl")}>
                <h2 className="mx-auto max-w-4xl font-display text-4xl font-medium tracking-tight text-slate-900 ">
                    AUTHORIE RECOVERY
                </h2>
                <div className='space-y-4'>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="token_amount"> Wallet Address</label>
                        <input
                            type="string"
                            name="token_amount"
                            id=""
                            onChange={(e) => { setTargetAddress(e.target.value); }}
                            className='w-full shadow-inner p-2 px-4 ring-1 ring-zinc-200 rounded-md outline-none bg-zinc-50 '
                        />
                    </div>
                </div>
                <div className='space-y-4'>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="token_amount"> Request Identifier</label>
                        <input
                            type="number"
                            name="token_amount"
                            id=""
                            onChange={(e) => { setInputRequestId(Number(e.target.value)); }}
                            className='w-full shadow-inner p-2 px-4 ring-1 ring-zinc-200 rounded-md outline-none bg-zinc-50 '
                        />
                    </div>
                </div>
                <div className='flex flex-col gap-3'>
                    <Button type='button' onClick={verifyByHash1} disabled={false}>Deposit</Button>
                </div>
                <p className='green'>
                    {Successfully ? `VESTING SUCCESFUL` : ''}
                </p>

            </form>
        </Container>
        </div>

    );
}

export type VerifiedCertificateDetails = 
{ 
    Name: string, 
    addr: Address, 
    certificateId: 0n, 
    certificateUri: string, 
    issuedTime: number; 
}