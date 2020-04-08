'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');

async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log("Wallet successfully instantiated.");

        let args = process.argv.slice(2);
        let userRole;
        let result;

        // args[0] is userRole
        switch (args[0]) {
            case 'authority':
                userRole = 'authority';
                break;
            case 'organizer':
                userRole = 'organizer';
                break;
            case 'contractor':
                userRole = 'contractor';
                break;
            default:
                console.error('Please enter a valid user name.');
                process.exit(1);
        }

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(userRole);
        if (!userExists) {
            console.log('An identity for the user role ' + userRole + ' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: userRole, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('cashflow');
        
        // args[1] is functionName
        switch (args[1]) {
            case 'queryAll':
                result = await contract.evaluateTransaction('queryAllAgreements', userRole);
                break;
                
            case 'query':
                // args[2] is agreementNumber
                if (!args[2]) {
                    console.error('Please enter a valid agreement number.');
                    process.exit(1);
                }
                result = await contract.evaluateTransaction('queryAgreement', userRole, args[2]);
                break;

            case 'create':
                let [agreementNumber, cid, camount, cpartner_1, cpartner_2] = args.slice(2)

                if (!agreementNumber || !cid || !camount || !cpartner_1 || !cpartner_2) {
                    console.error('Please enter valid parameters.');
                    process.exit(1);
                }
                result = await contract.submitTransaction('createAgreement', userRole, agreementNumber, cid, camount, cpartner_1, cpartner_2);
                break;

            case 'changeAmount':
                let [agreementNumberRef, newAmount] = args.slice(2,4)

                if (!agreementNumberRef || !newAmount) {
                    console.error('Please enter valid parameters.');
                    process.exit(1);
                }
                result = await contract.submitTransaction('changeAgreementAmount', userRole, agreementNumberRef, newAmount);
                break;

            case 'sign':
                // args[2] is agreementNumber
                if (!args[2]) {
                    console.error('Please enter valid parameters.');
                    process.exit(1);
                }
                result = await contract.submitTransaction('signAgreement', userRole, args[2]);
                break;

            default:
                console.error('Please enter a valid function name.');
                process.exit(1);
        }

        if (result) {
            console.log(`Transaction has been evaluated, result is: \n${result.toString()}`);
        } 

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.log(`Failed to evaluate transaction. Reason: \n${error}`);
        process.exit(1);
    } 
}

main();
