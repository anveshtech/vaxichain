'use strict';

var { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');

const util = require('util');

const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');


const getCCP = async (org) => {
    if (!org || typeof org !== 'string') {
        throw new Error("Invalid or missing organization name.");
    }

    const ccpPath = path.resolve(__dirname, '..', 'connection-profile', `connection-${org.toLowerCase()}.json`);
    
    // Check if the file exists
    if (!fs.existsSync(ccpPath)) {
        throw new Error(`Connection profile for organization '${org}' not found at path: ${ccpPath}`);
    }

    // Read and parse the connection profile
    const ccpJSON = fs.readFileSync(ccpPath, 'utf8')
    const ccp = JSON.parse(ccpJSON);
    return ccp
};


const getCaUrl = async (org, ccp) => {
    if (!org || typeof org !== 'string') {
        throw new Error("Invalid or missing organization name.");
    }

    let caKey = `ca.${org.toLowerCase()}.dataauth.com`;

    console.log(caKey)

    // if (!ccp.certificateAuthorities || !ccp.certificateAuthorities[caKey]) {
    //     throw new Error(`Certificate authority not found for organization '${org}'`);
    // }

    const caURL = ccp.certificateAuthorities[`${caKey}`].url;

    return caURL
};

const getWalletPath = async (org) => {
    if (!org || typeof org !== 'string') {
        throw new Error("Invalid or missing organization name.");
    }

    // Dynamically construct the wallet path using the organization name
    const walletPath = path.join(process.cwd(), `${org}-wallet`);

    return walletPath;
};


const getAffiliation = async (org) => {
    return org == `${org}` ? 'org1.department1' : 'org2.department1'
}


const getRegisteredUser = async (userid, userOrg, userComp, isJson) => {
    let ccp = await getCCP(userOrg)
    console.log('Company: ', userComp)

    const caURL = await getCaUrl(userOrg, ccp)
    const ca = new FabricCAServices(caURL);

    const walletPath = await getWalletPath(userOrg)
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userIdentity = await wallet.get(userid);
    if (userIdentity) {
        console.log(`An identity for the user ${userid} already exists in the wallet`);
        var response = {
            success: true,
            message: 'User with ID: ' + userid + ' enrolled Successfully',
            company: userComp,
        };
        return response
    }

    // Check to see if we've already enrolled the admin user.
    let adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
        console.log('An identity for the admin user "admin" does not exist in the wallet');
        await enrollAdmin(userOrg, ccp);
        adminIdentity = await wallet.get('admin');
        console.log("Admin Enrolled Successfully")
    }

    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');
    let secret;
    try {
        // Register the user, enroll the user, and import the new identity into the wallet.
        secret = await ca.register({ affiliation: await getAffiliation(userOrg), enrollmentID: userid, companyName:userComp, role: 'client' }, adminUser);
        // const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: userid, role: 'client', attrs: [{ name: 'role', value: 'approver', ecert: true }] }, adminUser);

    } catch (error) {
        return error.message
    }

    const enrollment = await ca.enroll({ enrollmentID: userid, companyName: userComp, enrollmentSecret: secret });
    // const enrollment = await ca.enroll({ enrollmentID: userid, enrollmentSecret: secret, attr_reqs: [{ name: 'role', optional: false }] });

    const mspId = `${userOrg}MSP`;
    const x509Identity = {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: mspId,
        type: 'X.509',
    };

    await wallet.put(userid, x509Identity);
    console.log(`Successfully registered and enrolled admin user ${userid} and imported it into the wallet`);

    var response = {
        success: true,
        message: 'User with ID: '+ userid + ' enrolled Successfully',
    };
    return response
}

// ? User is registered 

const isUserRegistered = async (userid, userOrg) => {
    const walletPath = await getWalletPath(userOrg)
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userIdentity = await wallet.get(userid);
    if (userIdentity) {
        console.log(`An identity for the user ${userid} exists in the wallet`);
        return true
    }
    return false
}


const getCaInfo = async (org, ccp) => {
    if (!org || typeof org !== 'string') {
        throw new Error("Invalid or missing organization name.");
    }

    const caKey = `ca.${org.toLowerCase()}.dataauth.com`;

    if (!ccp.certificateAuthorities || !ccp.certificateAuthorities[caKey]) {
        throw new Error(`Certificate authority information not found for organization '${org}'`);
    }

    const cainfo = ccp.certificateAuthorities[`${caKey}`];

    return cainfo
};

const getOrgMSP = (org) => {
    if (!org || typeof org !== 'string') {
        throw new Error("Invalid or missing organization name.");
    }

    const orgMSP = `${org}MSP`;

    return orgMSP;
};

const enrollAdmin = async (org, ccp) => {

    console.log('calling enroll Admin method')

    try {

        const caInfo = await getCaInfo(org, ccp) 
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = await getWalletPath(org) //path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get('admin');
        if (identity) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const mspId = `${org}MSP`;
        let x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: mspId,
            type: 'X.509',
        };

        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');
        return
    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
    }
}

const registerAndGerSecret = async (userid, userOrg) => {
    let ccp = await getCCP(userOrg);
    const caURL = await getCaUrl(userOrg, ccp);
    const ca = new FabricCAServices(caURL);
    const walletPath = await getWalletPath(userOrg);
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Log current identities in the wallet
    const identities = await wallet.list();
    console.log('Current identities in wallet:', identities);

    const userIdentity = await wallet.get(userid);
    if (userIdentity) {
        console.log(`An identity for the user ${userid} already exists in the wallet`);
        return {
            success: true,
            message: 'User with ID: ' + userid + ' enrolled Successfully',
        };
    }

    // Check admin identity
    let adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
        console.log('An identity for the admin user "admin" does not exist in the wallet');
        await enrollAdmin(userOrg, ccp);
        adminIdentity = await wallet.get('admin');
        console.log("Admin Enrolled Successfully");
    }

    // Register user
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');
    let secret;
    try {
        // Register the user, enroll the user, and import the new identity into the wallet.
        secret = await ca.register({ affiliation: await getAffiliation(userOrg), enrollmentID: userid, role: 'client' }, adminUser);
        // const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: userid, role: 'client', attrs: [{ name: 'role', value: 'approver', ecert: true }] }, adminUser);
        const enrollment = await ca.enroll({
            enrollmentID: userid,
            enrollmentSecret: secret
        });
        let orgMSPId = getOrgMSP(userOrg)
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: orgMSPId,
            type: 'X.509',
        };
        await wallet.put(userid, x509Identity);
    } catch (error) {
        return error.message
    }

    var response = {
        success: true,
        message: 'User with ID: '+ userid + ' enrolled Successfully',
        secret: secret
    };
    return response

}

// * Queries the identity from the fabric-ca-server.db (Found inside fabric-ca)
const queryIdentity = async (userid, userOrg) => {
    try {
        let ccp = await getCCP(userOrg);
        const caInfo = await getCaInfo(userOrg, ccp);
        const caName = caInfo.caName; // Fetch the CA name
        const caURL = caInfo.url;
        const caTLSCACerts = caInfo.tlsCACerts.pem;

        const ca = new FabricCAServices(caURL, { trustedRoots: caTLSCACerts, verify: false }, caName);

        const walletPath = await getWalletPath(userOrg);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check admin identity
        let adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            await enrollAdmin(userOrg, ccp);
            adminIdentity = await wallet.get('admin');
            console.log("Admin Enrolled Successfully");
        }

        // Get admin user context
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Query the CA for the identity
        const identityService = ca.newIdentityService();
        const identity = await identityService.getOne(userid, adminUser);

        console.log(`Identity details for ${userid}:`, identity);
        return {
            success: true,
            message: `Identity found for user: ${userid}`,
            identity: identity
        };
    } catch (error) {
        console.error(`Failed to query identity ${userid}: ${error}`);
        return {
            success: false,
            message: `Failed to query identity ${userid}: ${error.message}`
        };
    }
};


exports.getRegisteredUser = getRegisteredUser

module.exports = {
    getCCP: getCCP,
    getOrgMSP: getOrgMSP,
    getWalletPath: getWalletPath,
    getRegisteredUser: getRegisteredUser,
    isUserRegistered: isUserRegistered,
    registerAndGerSecret: registerAndGerSecret,
    queryIdentity: queryIdentity,
}
