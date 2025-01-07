const fs = require('fs');
const path = require('path');

const { exec, execSync } = require('child_process');

const createChannelBlock = async (channelName, profile) => {
    if (!channelName) {
        throw new Error('Channel name is required');
    }

    try {
        const configPath = path.join(__dirname, '../../blockchain/artifacts/channel/newOrgs');
        const resolvedPath = path.resolve(configPath);

        if (!fs.existsSync(path.join(resolvedPath, 'configtx.yaml'))) {
            throw new Error(`configtx.yaml not found at ${resolvedPath}`);
        }

        process.env.FABRIC_CFG_PATH = resolvedPath;

        console.log(`Generating channel block for channel: ${channelName}`);
        console.log(`Using FABRIC_CFG_PATH: ${process.env.FABRIC_CFG_PATH}`);

        execSync(
            `configtxgen -profile ${profile}Channel -outputBlock ${configPath}/channel-artifacts/${channelName}.block -channelID ${channelName}`,
            { stdio: 'inherit' }
        );

        console.log(`Channel block for ${channelName} generated successfully.`);
        return { success: true, message: `Channel block for ${channelName} generated successfully.` };
    } catch (error) {
        console.error(`Failed to generate channel block: ${error.message}`);
        throw error;
    }
};

const createChannel = async (channelName) => {
    if (!channelName) {
        throw new Error('Channel name is required');
    }

    const envVars = {
        CORE_PEER_TLS_ENABLED: true,
        CHANNEL_NAME: channelName,
        ORDERER_CA: path.resolve(
            process.cwd(),
            '../blockchain/artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/msp/tlscacerts/tlsca.dataauth.com-cert.pem'
        ),
        ORDERER_ADMIN_TLS_SIGN_CERT: path.resolve(
            process.cwd(),
            '../blockchain/artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/server.crt'
        ),
        ORDERER_ADMIN_TLS_PRIVATE_KEY: path.resolve(
            process.cwd(),
            '../blockchain/artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/server.key'
        ),
        ORDERER2_CA: path.resolve(
            process.cwd(),
            '../blockchain/artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/msp/tlscacerts/tlsca.dataauth.com-cert.pem'
        ),
        ORDERER2_ADMIN_TLS_SIGN_CERT: path.resolve(
            process.cwd(),
            '../blockchain/artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls/server.crt'
        ),
        ORDERER2_ADMIN_TLS_PRIVATE_KEY: path.resolve(
            process.cwd(),
            '../blockchain/artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls/server.key'
        ),
        ORDERER3_CA: path.resolve(
            process.cwd(),
            '../blockchain/artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/msp/tlscacerts/tlsca.dataauth.com-cert.pem'
        ),
        ORDERER3_ADMIN_TLS_SIGN_CERT: path.resolve(
            process.cwd(),
            '../blockchain/artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls/server.crt'
        ),
        ORDERER3_ADMIN_TLS_PRIVATE_KEY: path.resolve(
            process.cwd(),
            '../blockchain/artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls/server.key'
        ),
        CONFIG_BLOCK_PATH: path.resolve(
            process.cwd(),
            '../blockchain/artifacts/channel/newOrgs'
        ),
    };

    return new Promise((resolve, reject) => {

        const osnadminCommand1 = `
            osnadmin channel join --channelID ${channelName} \
            --config-block ${envVars.CONFIG_BLOCK_PATH}/channel-artifacts/${channelName}.block -o localhost:7053 \
            --ca-file ${envVars.ORDERER_CA} \
            --client-cert ${envVars.ORDERER_ADMIN_TLS_SIGN_CERT} \
            --client-key ${envVars.ORDERER_ADMIN_TLS_PRIVATE_KEY}
        `;

        const osnadminCommand2 = `
            osnadmin channel join --channelID ${channelName} \
            --config-block ${envVars.CONFIG_BLOCK_PATH}/channel-artifacts/${channelName}.block -o localhost:8053 \
            --ca-file ${envVars.ORDERER2_CA} \
            --client-cert ${envVars.ORDERER2_ADMIN_TLS_SIGN_CERT} \
            --client-key ${envVars.ORDERER2_ADMIN_TLS_PRIVATE_KEY}
        `;

        const osnadminCommand3 = `
            osnadmin channel join --channelID ${channelName} \
            --config-block ${envVars.CONFIG_BLOCK_PATH}/channel-artifacts/${channelName}.block -o localhost:9053 \
            --ca-file ${envVars.ORDERER3_CA} \
            --client-cert ${envVars.ORDERER3_ADMIN_TLS_SIGN_CERT} \
            --client-key ${envVars.ORDERER3_ADMIN_TLS_PRIVATE_KEY}
        `;

        // const fullCommand = `${osnadminCommand1} && ${osnadminCommand2}`;

        exec(osnadminCommand1, { env: { ...process.env, ...envVars } }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error creating channel: ${stderr || error.message}`));
            } else {
                console.log(`Channel ${channelName} created successfully: ${stdout}`);
                resolve(`Channel ${channelName} created successfully: ${stdout}`);
            }
        });

        exec(osnadminCommand2, { env: { ...process.env, ...envVars } }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error creating channel: ${stderr || error.message}`));
            } else {
                console.log(`Channel ${channelName} created successfully: ${stdout}`);
                resolve(`Channel ${channelName} created successfully: ${stdout}`);
            }
        });

        exec(osnadminCommand3, { env: { ...process.env, ...envVars } }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Error creating channel: ${stderr || error.message}`));
            } else {
                console.log(`Channel ${channelName} created successfully: ${stdout}`);
                resolve(`Channel ${channelName} created successfully: ${stdout}`);
            }
        });
    });
};

const joinChannel = async (channelName, orgName, orgPort) => {
    if (!channelName || !orgName || !orgPort) {
        throw new Error("Channel name, organization name, and organization port are required.");
    }

    const envVars = {
        CORE_PEER_TLS_ENABLED: true,
        FABRIC_CFG_PATH: path.resolve(process.cwd(), '../blockchain/artifacts/channel/config/'),
        CORE_PEER_ADDRESS: `localhost:${orgPort}`,
        CORE_PEER_LOCALMSPID: `${orgName}MSP`,
        CORE_PEER_MSPCONFIGPATH: path.resolve(
            process.cwd(),
            `../blockchain/artifacts/channel/crypto-config/peerOrganizations/${orgName.toLowerCase()}.dataauth.com/users/Admin@${orgName.toLowerCase()}.dataauth.com/msp/`
        ),
        CORE_PEER_TLS_ROOTCERT_FILE: path.resolve(
            process.cwd(),
            `../blockchain/artifacts/channel/crypto-config/peerOrganizations/${orgName.toLowerCase()}.dataauth.com/peers/peer0.${orgName.toLowerCase()}.dataauth.com/tls/ca.crt`
        ),
    };

    console.log("Resolved Environment Variables:", envVars);


    return new Promise((resolve, reject) => {
        const joinCommand = `
            peer channel join -b ${envVars.FABRIC_CFG_PATH}/../newOrgs/channel-artifacts/${channelName}.block
        `;

        exec(
            joinCommand,
            { env: { ...process.env, ...envVars },  maxBuffer: 1024 * 500 },
            (error, stdout, stderr) => {
                if (error) {
                    console.error("Error joining channel:", stderr || error.message);
                    reject(`Error joining channel: ${stderr || error.message}`);
                } else {
                    console.log(`Organization ${orgName} joined channel ${channelName} successfully`);
                    console.log(`Join Command Result: ${stdout}`);
                    resolve(`Organization ${orgName} joined channel ${channelName} successfully: ${stdout}`);
                }
            }
        );
    });
};

module.exports = {
    createChannel: createChannel,
    joinChannel: joinChannel, 
    createChannelBlock: createChannelBlock
}

