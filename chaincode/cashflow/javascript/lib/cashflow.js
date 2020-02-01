/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity; // library for access control

class CashFlow extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const lAgreements = [
            {
                hash: '028A9GB4k7Z',
                amount: '450.000.000',
                cpartner_1: 'Construction Company',
                cpartner_2: 'Architects GmbH',
                signed_1: 'Yes', 
                signed_2: 'Yes',
            },
            {
                hash: '9JDH2JD83K3KN',
                amount: '555.123',
                cpartner_1: 'Construction Company',
                cpartner_2: 'Bricks-Supply AG',
                signed_1: 'Yes', 
                signed_2: 'Yes',
            },
            {
                hash: '030HA63NA9VM',
                amount: '10.300',
                cpartner_1: 'Construction Company',
                cpartner_2: 'Painter',
                signed_1: 'Yes', 
                signed_2: 'Yes',
            },
        ];

        for (let i = 0; i < lAgreements.length; i++) {
            lAgreements[i].docType = 'lAgreement';
            await ctx.stub.putState('LAG' + i, Buffer.from(JSON.stringify(lAgreements[i])));
            console.info('Added <--> ', lAgreements[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    async queryAgreement(ctx, userRole, agreementNumber) {
        // access control
        let clientId = new ClientIdentity(ctx.stub);

        // get agreement with given number
        const agreementAsBytes = await ctx.stub.getState(agreementNumber); 
        if (!agreementAsBytes || agreementAsBytes.length === 0) {
            return('The legal agreement with ID ' + agreementNumber + ' does not yet exist. \n' + 
                'Please create it first. ');
        }

        const lAgreement = JSON.parse(agreementAsBytes.toString());
        let partner_1 = lAgreement.cpartner_1;
        let partner_2 = lAgreement.cpartner_2;

        // only organizer, authority and involved contractor
        if (!(userRole == 'authority' || 
              userRole == 'organizer' || 
              (userRole == 'contractor' && 
                (clientId.assertAttributeValue('Contractor', partner_1) || clientId.assertAttributeValue('Contractor', partner_2))
              ) 
            )) { 
                return('You are not authorized to execute the queryAgreement transaction. \n' + 
                    'Only users with access levels \'authority\' and \'organizer\', ' + 
                    'or \'contractors\' involved in the agreement are authorized. ');
        }

        console.log(agreementAsBytes.toString());
        return '--------------------------\n' + 
               agreementAsBytes.toString().replace(/,/g, '\n').replace(/\{/g, '').replace(/\}/g, '') + 
               '\n--------------------------\n';
    }

    async createAgreement(ctx, userRole, agreementNumber, hash, amount, cpartner_1, cpartner_2) {
        // access control -- only organizer
        if (!(userRole == 'organizer')) { 
            return('You are not authorized to execute the createAgreement transaction. \n' + 
                'Only users with access level \'organizer\' are authorized. ');
        }

        //check if an agreement with this number already exists
        //try{
            const agreementAsBytes = await ctx.stub.getState(agreementNumber); 
        // } catch{
        //     return('A legal agreement with ID ' + agreementNumber + ' already exists. \n' + 
        //             'Please choose a different agreement ID to add a new legal agreement. ');
        // }
        if (agreementAsBytes && agreementAsBytes.length > 0) {
            return('A legal agreement with id ' + agreementNumber + ' already exists. \n' + 
                'Please choose a different agreement id to add a new legal agreement. ');
        }

        const newAgreement = {
            hash,
            docType: 'lAgreement',
            amount,
            cpartner_1,
            cpartner_2,
            signed_1: 'Yes', 
            signed_2: 'No',
        };

        await ctx.stub.putState(agreementNumber, Buffer.from(JSON.stringify(newAgreement)));

        return('You successfully created a new legal agreement with parameters: \n' + 
            'Agreement number: ' + agreementNumber + '\n' + 
            'Agreement hash: ' + hash + '\n' + 
            'Cash involved: ' + amount + ' €\n' + 
            'Partner one: ' + cpartner_1 + '\n' + 
            'Partner two: ' + cpartner_2);
    }

    async queryAllAgreements(ctx, userRole) {
        // access control -- only organizer and authority
        if (!(userRole == 'authority' || 
              userRole == 'organizer' )) { 
                return('You are not authorized to execute the queryAllAgreements transaction. \n' + 
                    'Only users with access levels \'authority\' and \'organizer\' are authorized. ');
        }

        const startKey = 'LAG0';
        const endKey = 'LAG999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                //return JSON.stringify(allResults);
                let binary_counter_first = 0;
                let binary_counter_second = 0;
                let result = '--------------------------\n' +
                        JSON.stringify(allResults).replace(/,/g, '\n')
                        .replace(/\[/g, '').replace(/\]/g, '')
                        .replace(/\{/g, '\n').replace(/\}/g, '\n')
                        .replace(/\n\n\n/g, '\n')
                        .replace(/\"amount\"/g, '\t\"amount\"')
                        .replace(/\"cpartner_1\"/g, '\t\"cpartner_1\"')
                        .replace(/\"cpartner_2\"/g, '\t\"cpartner_2\"')
                        .replace(/\"docType\"/g, '\t\"docType\"')
                        .replace(/\"hash\"/g, '\t\"hash\"')
                        .replace(/\"signed_1\"/g, '\t\"signed_1\"')
                        .replace(/\"signed_2\"/g, '\t\"signed_2\"')
                        + '\n--------------------------\n';
                return result;
            }
        }
    }

    async changeAgreementAmount(ctx, userRole, agreementNumber, newAmount) {
        // access control -- only organizer
        if (!(userRole == 'organizer')) { 
            return('You are not authorized to execute the changeAgreementAmount transaction. \n' + 
                'Only users with access level \'organizer\' are authorized. ');
        }

        // get agreement to given number
        const agreementAsBytes = await ctx.stub.getState(agreementNumber); 
        if (!agreementAsBytes || agreementAsBytes.length === 0) {
            return(`${agreementNumber} does not exist`);
        }
        const lAgreement = JSON.parse(agreementAsBytes.toString());
        let oldAmount = lAgreement.amount;
        lAgreement.amount = newAmount;

        await ctx.stub.putState(agreementNumber, Buffer.from(JSON.stringify(lAgreement)));

        return('You successfully submitted following changes to the legal agreement: ' + 
            agreementNumber + '\n' + 'Cash amount has been changed from ' + oldAmount + ' to ' + newAmount + '. ');
    }

    async signAgreement(ctx, userRole, agreementNumber) {
        // access control -- only organizer and involved contractor
        let clientId = new ClientIdentity(ctx.stub);

        // get agreement with given number
        const agreementAsBytes = await ctx.stub.getState(agreementNumber); 
        if (!agreementAsBytes || agreementAsBytes.length === 0) {
            return(`${agreementNumber} does not exist`);
        }
        const lAgreement = JSON.parse(agreementAsBytes.toString());
        let partner_1 = lAgreement.cpartner_1;
        let partner_2 = lAgreement.cpartner_2;

        let capitalized_role = userRole.charAt(0).toUpperCase() + userRole.slice(1);
        if(clientId.getAttributeValue(capitalized_role) == partner_1){
            lAgreement.signed_1 = 'Yes';
        }
        else if(clientId.getAttributeValue(capitalized_role) == partner_2){
            lAgreement.signed_2 = 'Yes';
        }
        else{
            return('You are not authorized to sign this contract. ');
        }

        await ctx.stub.putState(agreementNumber, Buffer.from(JSON.stringify(lAgreement)));

        return('You have successfully signed the legal agreement with number ' + agreementNumber + '. ');
    }

}

module.exports = CashFlow;
