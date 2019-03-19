const { shouldRevert } = require('./helpers');

const HelloWorldToken = artifacts.require('HelloWorldToken');

const initialSupply = 1000;
let HWT;
contract('HelloWorldToken', ([initialHolder, recipient, trustedAccount]) => {
    beforeEach(async () => {
        HWT = await HelloWorldToken.new(initialSupply, 'HWToken', 'HWT', 5 );
    });
    describe('init:', async () => {
        it('should set token name', async () => {
            const name = await HWT.name.call();
            assert.equal(name, 'HWToken', 'Token should have correct name');
        });
        it('should set token symbol', async () => {
            const name = await HWT.symbol.call();
            assert.equal(name, 'HWT', 'Token should have correct symbol');
        });
        it('should set token decimals', async () => {
            const decimals = await HWT.decimals.call();
            assert.equal(decimals, 5, 'Token should have 5 decimals');
        });
        it('sets total minted coins', async () => {
            const totalSupply = await HWT.totalSupply.call();
            assert.equal(totalSupply, initialSupply, 'Should put all money on first account balance');
        });
        it('puts minted coins to initiator balance', async () => {
            const balance = await HWT.balanceOf.call(initialHolder);
            assert.equal(balance, initialSupply, 'Should put all money on first account balance');
        });
    });
    describe('transfers:', async () => {
        it('should transfer money', async () => {
            const balanceBefore = await HWT.balanceOf.call(recipient);
            assert.equal(balanceBefore.toNumber(), 0, 'Recipient should have zero balance');
            await HWT.transfer(recipient, 10, { from: initialHolder });
            const balanceAfter = await HWT.balanceOf(recipient);
            assert.equal(balanceAfter.toNumber(), 10, 'Recipient should receive transferred money');
        });
        it('should revert transaction on insufficient funds', async () => {
            const balanceBefore = await HWT.balanceOf.call(recipient);
            assert.equal(balanceBefore, 0, 'Recipient should have zero balance');
            await shouldRevert(HWT.transfer(initialHolder, initialSupply + 1));
            const balanceAfter = await HWT.balanceOf.call(recipient);
            assert.equal(balanceAfter, 0, 'Recipient should still have zero balance');
        });
        it('should handle zero transfer', async () => {
            await HWT.transfer(recipient, 0, { from: initialHolder });
            const senderBalance = await HWT.balanceOf.call(initialHolder);
            const recipientBalance = await HWT.balanceOf.call(recipient);
            assert.equal(senderBalance.toNumber(), initialSupply);
            assert.equal(recipientBalance.toNumber(), 0);
        });
        it('should transfer all money', async () => {
            await HWT.transfer(recipient, initialSupply, { from: initialHolder });
            const senderBalance = await HWT.balanceOf.call(initialHolder);
            const recipientBalance = await HWT.balanceOf.call(recipient);
            assert.equal(senderBalance.toNumber(), 0, 'Should have exhausted balance');
            assert.equal(recipientBalance.toNumber(), initialSupply, 'Should receive all money from the first account');
        });
    });
    describe('delegates funds transfer', async () => {
        it('should allow trusted account to spend funds', async () => {
            await HWT.approve(trustedAccount, initialSupply, { from: initialHolder });
            const allowance = await HWT.allowance.call(initialHolder, trustedAccount);
            assert.equal(allowance.toNumber(), initialSupply, 'Trusted account should be allowed to spend initial holder funds');
        });
        it('should not delegate funds exceeding the balance', async () => {
            await HWT.approve(trustedAccount, initialSupply + 1, { from: initialHolder });
            const allowance = await HWT.allowance.call(initialHolder, trustedAccount);
            assert.equal(allowance.toNumber(), initialSupply + 1, 'Trusted account should not be allowed to spend initial holder funds');
        });
    });
    describe('transfers funds from another account:', async () => {
        it('initial holder should approve withdrawal to trusted account', async () => {
            await HWT.approve(trustedAccount, initialSupply, { from: initialHolder });
            await HWT.transferFrom(initialHolder, recipient, 20, { from: trustedAccount });
            const recipientBalance = await HWT.balanceOf.call(recipient);
            assert.equal(recipientBalance.toNumber(), 20);
        });
        it('should approve value exceeding the balance', async () => {
            await HWT.approve(trustedAccount, 100, { from: recipient });
            const delegatedFunds = await HWT.allowance.call(recipient, trustedAccount);
            assert.equal(delegatedFunds, 100)
        });
    });
    describe('events:', async () => {
        it('fires event on transfer', async () => {
            const res = await HWT.transfer(recipient, 10, { from: initialHolder });
            const transferLog = res.logs.find(element => element.event.match('Transfer'));
            assert.equal(transferLog.args.from, initialHolder);
            assert.strictEqual(transferLog.args.to, recipient);
            assert.strictEqual(transferLog.args.value.toString(), '10');
        });
        it('fires event on approval', async () => {
            const res = await HWT.approve(trustedAccount, initialSupply, { from: initialHolder });
            const log = res.logs.find(element => element.event.match('Approve'));
            assert.equal(log.args.owner, initialHolder);
            assert.equal(log.args.spender, trustedAccount);
            assert.equal(log.args.value, initialSupply);
        });
        it('fires event on transferFrom', async () => {
            await HWT.approve(trustedAccount, initialSupply, { from: initialHolder });
            const res = await HWT.transferFrom(initialHolder, recipient, 100, { from: trustedAccount });
            const log = res.logs.find(element => element.event.match('Transfer'));
            assert.equal(log.args.from, initialHolder);
            assert.equal(log.args.to, recipient);
            assert.equal(log.args.value, '100');
        });
    })
});