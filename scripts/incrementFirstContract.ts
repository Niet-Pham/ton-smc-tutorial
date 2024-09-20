import { Address, toNano } from '@ton/core';
import { FirstContract } from '../wrappers/FirstContract';
import { NetworkProvider, sleep } from '@ton/blueprint';
import { TonClient, WalletContractV4 } from "@ton/ton";
import { mnemonicToWalletKey } from "ton-crypto";
import * as dotenv from "dotenv";
dotenv.config()

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    // const address = Address.parse(args.length > 0 ? args[0] : await ui.input('FirstContract address'));
    const address = Address.parse("EQA7ORAFlINg47HGdW63cKAvpMYq1z3U5YydrVETSiiKs7Ui");
    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const mnemonic = process.env.WALLET_MNEMONIC as string;
    const key = await mnemonicToWalletKey(mnemonic.split(""));
    
    const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
    // if (!await provider.isContractDeployed(wallet.address)) {
    //     return console.log("wallet is not deployed");
    // }

    // open wallet and read the current seqno of the wallet
    const walletContract = provider.open(wallet);
    const walletSender = walletContract.sender(key.secretKey);
    const seqno = await walletContract.getSeqno();

    // console.log({ walletContract });
    // console.log({ walletSender });
    // console.log({ seqno });    

    const firstContract = provider.open(FirstContract.createFromAddress(address));

    const counterBefore = await firstContract.getCounter();
    const id = await firstContract.getID();
    console.log("Contract: ", firstContract);
    console.log("ID: ", id);
    console.log("Current counter: ", counterBefore);
    console.log("Provider sender: ", provider.sender());
    const api = provider.api()
    console.log("Provider ui: ", ui);

    return
    let tx = await firstContract.sendIncrease(provider.sender(), {
        increaseBy: 1,
        value: toNano('0.002'),
    });
    console.log(tx);


    ui.write('Waiting for counter to increase...');

    let counterAfter = await firstContract.getCounter();
    let attempt = 1;
    while (counterAfter === counterBefore) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        counterAfter = await firstContract.getCounter();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('Counter increased successfully!');
}
