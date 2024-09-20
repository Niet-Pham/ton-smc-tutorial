import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { CustomContract } from '../wrappers/CustomContract';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('CustomContract', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('CustomContract');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let customContract: SandboxContract<CustomContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        customContract = blockchain.openContract(CustomContract.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await customContract.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: customContract.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and customContract are ready to use
    });
});
