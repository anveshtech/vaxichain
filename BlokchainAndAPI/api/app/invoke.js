const { Gateway, Wallets, DefaultEventHandlerStrategies } = require('fabric-network');
const fs = require('fs');
const path = require("path");
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const util = require('util');
const helper = require('./helper');

const invokeTransaction = async (channelName, chaincodeName, fcn, args, userid, org_name) => {
    try {
        logger.debug(util.format('\n============ invoke transaction on channel %s ============\n', channelName));

        const ccp = await helper.getCCP(org_name);
        
        const walletPath = await helper.getWalletPath(org_name);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        let identity = await wallet.get(userid);
        if (!identity) {
            console.log(`An identity for the user ${userid} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(userid, org_name, true);
            identity = await wallet.get(userid);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        const connectOptions = {
            wallet, 
            identity: userid, 
            discovery: { enabled: true, asLocalhost: true },
            eventHandlerOptions: {
                commitTimeout: 100,
                strategy: DefaultEventHandlerStrategies.NETWORK_SCOPE_ALLFORTX
            }
        };

        // Create a new gateway for connecting to the peer node
        const gateway = new Gateway();

        console.log("**")
        await gateway.connect(ccp, connectOptions);

        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        const transaction = contract.createTransaction(fcn);

        let result;
        let message;
        let txId;
        
        if (fcn === "CreateUser") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Successfully added the User asset with name ${args[0]}`;
        } else if (fcn === "UpdateUser") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Successfully edited the User Asset with ID ${args[0]}`;
        }
         else if (fcn === "GetUsersWithHashes") {
           result = await contract.submitTransaction(fcn, ...args);
           txId = transaction.getTransactionId();
           message = `Successfully made hash of given Users`;
        }
        else if (fcn === "ChangeUserStatus") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Successfully changed the User's Status Asset with ID ${args[0]}`;
        }
        else if (fcn === "AddVaccinationCenter") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Successfully added the Vaccination Center Asset with ID ${args[0]}`;
        }
         else if (fcn === "EditVaccinationCenter") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Successfully edited the Vaccination Center Asset with ID ${args[0]}`;
        }
         else if (fcn === "AssignDataCollector") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Successfully added Data Collector  ID: ${args[1]} the Vaccination Center Asset with ID ${args[0]}`;
        }
        else if (fcn === "AssignDataVerifier") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Successfully added Data Verifier  ID: ${args[1]} the Vaccination Center Asset with ID ${args[0]}`;
        }
        else if (fcn === "GetCentersWithHashes") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Successfully made hash of given Vaccination Centers`;
        }
        else if (fcn === "getListOfAssignedVacCenterCollector") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Vacciantion Centers associated with Data Collecter  ID: ${args[0]}`;
        }
        else if (fcn === "CreateChild") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Successfully created Data Child  ID: ${args[0]}`;
        }
        else if (fcn === "UpdateChild") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Successfully created updated Data Child  ID: ${args[0]}`;
        }
        else if (fcn === "GetChildrenWithHashes") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Successfully made hash of given Children`;
        }
        else if (fcn === "CreateVaccine") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Created Vaccine with Vaccine ID: ${args[0]}`;
        }
        else if (fcn === "GetVaccineWithHashes") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Successfully made hash of given Vaccination`;
        }
        else if (fcn === "CreateAdminUser") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Successfully made hash of given Vaccination`;
        }
        else if (fcn === "AddAdminUser") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Successfully made hash of given Vaccination`;
        }
        else if (fcn === "GetAdminUsersWithHashes") {
            result = await contract.submitTransaction(fcn, ...args);
            txId = transaction.getTransactionId();
            message = `Successfully made hash of given Vaccination`;
        }
         else {
            return `Invocation require${fcn}`
        }

        await gateway.disconnect();
        console.log("Gateway Stopped");

        let response = {
            success: true,
            message: message,
            result,
            transactionId: txId
        };

        // Parse result to JSON if possible
        let parsedResult;
        try {
            parsedResult = JSON.parse(result.toString());
            response.result = parsedResult;
        } catch (error) {
            console.warn('Result is not valid JSON. Keeping raw output.');
            response.result = result.toString();
        }

        return response;

    } catch (error) {
        // Check if the error is related to the DiscoveryService failure
        if (error.message && error.message.includes('DiscoveryService has failed to return results')) {
            console.error('DiscoveryService failure: ' + error.message);
            throw new Error('DiscoveryService has failed to return results');
        }
        console.error(`Error occurred: ${error.message}`);
        throw error;  // Throw any other errors encountered
    }
};

exports.invokeTransaction = invokeTransaction;  