const { exec } = require('child_process');
const path = require('path');

const deployChaincode = async (chaincodes, channelName, ordererCaPath, peerTlsCertPath, peerAddress, orgName, lowOrg) => {
    for (const cc of chaincodes) {
        const { name, path: srcPath, policy, version, sequence } = cc;
        const msp = `${orgName}MSP`;

        console.log(`Deploying chaincode: ${name}`);
        console.log(msp);

        const deployScript = path.join(process.cwd(), '../blockchain/scripts/deploy_chaincode2.sh');
        console.log(deployScript);
        const cmd = `${deployScript} "${name}" "${srcPath}" "${policy}" "${version}" "${sequence}" "${channelName}" "${ordererCaPath}" "${peerAddress}" "${lowOrg}" "${msp}"`;
        await new Promise((resolve, reject) => {
            exec(cmd, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error deploying chaincode ${name}:`, stderr);
                    reject(error);
                } else {
                    console.log(`Output for ${name}:\n`, stdout);
                    resolve();
                }
            });
        });
    }
    console.log('All chaincodes deployed successfully!');
}


exports.deployChaincode = deployChaincode;

