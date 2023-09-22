import Image from 'next/image';
import { Container } from '../components/Container';
import factory_abi from '../utils/factory_abi.json';
import factory_address from '../utils/factory_address';
import { shortenHex } from "../utils/ShortenHex";

import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { Address, useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { Button } from './ui/button';


export function CreateCertificate() {

    const [RecoveryAddress1, setRecoveryAddress1] = useState('');
    const [RecoveryAddress2, setRecoveryAddress2] = useState('');
    const [RecoveryAddress3, setRecoveryAddress3] = useState('');
    const [salt, setsalt] = useState(0);
    const [singleAccount, setSingleAccount] = useState("");
    const [addressCreated, setAddressCreated] = useState<Boolean>(false);
    const [addr, setAddr] = useState("");
    const [hasAccount, sethasAccount] = useState<Boolean>(false);
    const [connectedAddr, setConnectedAddr] = useState("");



    const { address } = useAccount();


    const CreateCert = () => {
        console.log("creating company");
        createCertWrite?.();
    };

    const { config: CreateCertConfig } = usePrepareContractWrite({
        address: factory_address,
        abi: factory_abi,
        functionName: "createAccount",
        args: [salt, [RecoveryAddress1, RecoveryAddress2, RecoveryAddress3]],
    });

    const { data: createCertData, isLoading: createCertIsLoading, isError: createCertIsError, write: createCertWrite } = useContractWrite(CreateCertConfig);

    const waitForTransaction = useWaitForTransaction({
      hash: createCertData?.hash,
      onSuccess(data) {
        setAddressCreated(true);
        console.log('Success', data)
      },
    })


    const { data: certAddr, isLoading: yourCertIsLoading, isError: yourCertIsError } = useContractRead({
        address: factory_address,
        abi: factory_abi,
        watch: true,
        functionName: "getUserAddress",
        args: [connectedAddr ?? "0x00"],
    });

    const { data: _hasAccount, isLoading: hasAccountIsLoading, isError: hasAccountIsError } = useContractRead({
        address: factory_address,
        abi: factory_abi,
        watch:true,
        functionName: "hasAnAccount",
        args: [connectedAddr ?? "0x00"],
    });

    useEffect(() => {

        setConnectedAddr(address as Address);
        console.log(`final child addr:`, certAddr);
        setSingleAccount(certAddr as Address);
        sethasAccount(_hasAccount as boolean);

    }, [address, addressCreated, connectedAddr]);


    return (
        <div>
           {hasAccount || addressCreated ? (<Container className={clsx("pt-20 pb-16 lg:pt-12")}>
            <div className={clsx("flex flex-col gap-8 mt-4 px-8 py-8 m-auto bg-zinc-50 shadow-2xl shadow-zinc-200 rounded-lg ring-1 ring-zinc-200 lg:max-w-2xl text-center")}>
                <p>
                    WALLET CREATED SUCCESFULLY.
                </p>
                <p>
                    YOUR WALLET ADDRESS IS:
                </p>
                <p>
                    {singleAccount}
                </p>
            </div>
        </Container>) 
        : 
        (<Container className={clsx("pt-20 pb-16 lg:pt-12")}>
            <form className={clsx("flex flex-col gap-8 mt-4 px-8 py-8 m-auto bg-zinc-50 shadow-2xl shadow-zinc-200 rounded-lg ring-1 ring-zinc-200 lg:max-w-2xl")}>
                <h2 className="mx-auto max-w-4xl font-display text-4xl font-medium tracking-tight text-slate-900 ">
                    Create Wallet
                </h2>

                <div className='space-y-4'>

                    <div className='flex flex-col gap-2'>
                        <label htmlFor="cert_name">Recovery Address 1</label>
                        <input
                            type="text"
                            name="cert_name"
                            id=""
                            onChange={(e) => { setRecoveryAddress1(e.target.value); }}
                            className='w-full shadow-inner p-2 px-4 ring-1 ring-zinc-200 rounded-md outline-none bg-zinc-50'
                        />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="cert_symbol">Recovery Address 2</label>
                        <input
                            type="text"
                            name="cert_symbol"
                            id=""
                            onChange={(e) => { setRecoveryAddress2(e.target.value); }}
                            className='w-full shadow-inner p-2 px-4 ring-1 ring-zinc-200 rounded-md outline-none bg-zinc-50 '
                        />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="token_address">Recovery Address 3</label>
                        <input
                            type="text"
                            name="token_address"
                            id=""
                            onChange={(e) => { setRecoveryAddress3(e.target.value); }}
                            className='w-full shadow-inner p-2 px-4 ring-1 ring-zinc-200 rounded-md outline-none bg-zinc-50 '
                        />
                    </div>
                    <div className='flex flex-col gap-2'>
                        <label htmlFor="salt">Wallet Passcode</label>
                        <input
                            type="number"
                            name="salt"
                            id=""
                            onChange={(e) => { setsalt(Number(e.target.value)); }}
                            className='w-full shadow-inner p-2 px-4 ring-1 ring-zinc-200 rounded-md outline-none bg-zinc-50 '
                        />
                    </div>
                </div>
                <Button type='button' className='max-w-max ml-auto' onClick={CreateCert}>
                    Create Company</Button>
            </form>
        </Container>
        )}
        
        
        </div>





    );
}
