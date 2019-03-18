const { shouldRevert } = require('./helpers');

const HelloWorldToken = artifacts.require('HelloWorldToken');

let HWT;
contract('HelloWorldToken', (accounts) => {
    beforeEach(async () => {
        HWT = await HelloWorldToken.new(1000, 'HWToken', 'HWT', 5 );
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
            assert.equal(totalSupply, 1000, 'Should put all money on first account balance');
        });
        it('puts minted coins to initiator balance', async () => {
            const balance = await HWT.balanceOf.call(accounts[0]);
            assert.equal(balance, 1000, 'Should put all money on first account balance');
        });
    });
    describe('transfers:', async () => {
        it('should transfer money', async () => {
            const balanceBefore = await HWT.balanceOf.call(accounts[1]);
            assert.equal(balanceBefore.toNumber(), 0, 'Recipient should have zero balance');
            await HWT.transfer(accounts[1], 10, { from: accounts[0] });
            const balanceAfter = await HWT.balanceOf(accounts[1]);
            assert.equal(balanceAfter.toNumber(), 10, 'Recipient should receive transferred money');
        });
        it('should revert transaction on insufficient funds', async () => {
            const balanceBefore = await HWT.balanceOf.call(accounts[1]);
            assert.equal(balanceBefore, 0, 'Recipient should have zero balance');
            await shouldRevert(HWT.transfer(accounts[0], 1001));
            const balanceAfter = await HWT.balanceOf.call(accounts[1]);
            assert.equal(balanceAfter, 0, 'Recipient should still have zero balance');
        });
        it('should handle zero transfer', async () => {
            await HWT.transfer(accounts[1], 0, { from: accounts[0] });
            const senderBalance = await HWT.balanceOf.call(accounts[0]);
            const recipientBalance = await HWT.balanceOf.call(accounts[1]);
            assert.equal(senderBalance.toNumber(), 1000);
            assert.equal(recipientBalance.toNumber(), 0);
        });
        it('should transfer all money', async () => {
            await HWT.transfer(accounts[1], 1000, { from: accounts[0] });
            const senderBalance = await HWT.balanceOf.call(accounts[0]);
            const recipientBalance = await HWT.balanceOf.call(accounts[1]);
            assert.equal(senderBalance.toNumber(), 0, 'Should have exhausted balance');
            assert.equal(recipientBalance.toNumber(), 1000, 'Should receive all money from the first account');
        });
    });
});