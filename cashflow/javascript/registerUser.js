/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', '..', 'first-network', 'connection-org1.json');

/**
 * Capitalizes a provided string
 * @param   {String}  string  Provided string that should be capitalized
 * @return  {String}          Capitalized string
 */
async function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Registers a provided userTuple that consists of a flag and a userName
 * @param   {[String]}          userTuple     userTuple specifying the role and userName
 * @param   {FileSystemWallet}  wallet        Wallet of the system
 * @param   {FabricCAServices}  ca            Certificate authority
 * @param   {ClientData.user}   adminIdentity userIdentity
 */
async function registerUser(userTuple, wallet, ca, adminIdentity) {
    let [flag, userName] = userTuple

    // Used for conversion of the flag into the role
    const getRoleFrom = {
        '-a': 'authority',
        '-o': 'organizer',
        '-c': 'contractor',
    }

    // Check for the appropriate use of the flags
    if (!(flag in getRoleFrom)) {
        console.log(`${flag} is not a valid flag for user ${userName}. The correct format is:`);
        console.log('   node registerUser.js [flag] [userName]');
        console.log('Please enter one of the following flag options:');
        console.log('   -a for Authority');
        console.log('   -o for Organizer');
        console.log('   -c for Contractor');
        process.exit(1);
    }

    // Check if the user already exists
    const userExists = await wallet.exists(getRoleFrom[flag]);
    if (userExists) {
        console.log(`An identity for the ${getRoleFrom[flag]} ${userName} already exists in the wallet`);
        return;
    }
    
    // Get capitalized name for registering user w/ CA
    const capitalizedName = await capitalize(getRoleFrom[flag])

    // Register the provided user, enroll the user, and import the new identity into the wallet.
    const secret_contractor = await ca.register({ 
        affiliation: 'org1.department1', 
        enrollmentID: getRoleFrom[flag], 
        role: 'client', 
        attrs: [{name: capitalizedName, 
                value: userName, 
                ecert: true }]}, 
        adminIdentity);
    const enrollment_contractor = await ca.enroll({ 
        enrollmentID: getRoleFrom[flag], 
        enrollmentSecret: secret_contractor });
    const userIdentity_contractor = X509WalletMixin.createIdentity('Org1MSP', enrollment_contractor.certificate, enrollment_contractor.key.toBytes());
    await wallet.import(getRoleFrom[flag], userIdentity_contractor);
    console.log(`Successfully registered and enrolled user ${getRoleFrom[flag]} and imported it into the wallet`);
}

async function main() {
    try {
        
        // Get arguments from the user to enable dynamic user allocation. 
        let args = process.argv.slice(2);

        // Check for the appropriate amount of arguments
        if (!(args.length % 2 === 0) || args.length === 0) {
            console.error('There seems to be something wrong with the number of arguments.');
            process.exit(1)
        } 

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists('admin');
        if (!adminExists) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Iterate over the input pairs and register all users
        for (let i = 0; i < args.length; i+=2) {
            await registerUser(args.slice(i, i+2), wallet, ca, adminIdentity);
        }  

    } catch (error) {
        console.error(`Failed to register one of the users: ${error}`);
        process.exit(1);
    }
}

main();
