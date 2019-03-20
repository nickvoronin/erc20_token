const HelloWorldToken = artifacts.require("HelloWorldToken");

module.exports = function(deployer) {
    deployer.deploy(HelloWorldToken, 1000, "HelloWorld", "HW", 18);
};