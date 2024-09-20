import { toNano } from '@ton/core';
import { CustomContract } from '../wrappers/CustomContract';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const customContract = provider.open(CustomContract.createFromConfig({}, await compile('CustomContract')));

    await customContract.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(customContract.address);

    // run methods on `customContract`
}
