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
});