const express = require("express");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const { exec, execSync } = require('child_process');

const app = express();

app.use(express.json());

// ! NEED TO FIX THIS

async function generateDockerComposeFile(options) {
    const {
        containerName,
        image = "hyperledger/fabric-ca",
        caName,
        caPort,
        adminUser = "admin",
        adminPassword = "adminpw",
        orgName, 
        network = "network_1"
    } = options;
    
    
    try {
        const hostVolumePath = path.resolve(`../blockchain/artifacts/channel/create-certificates-with-ca/fabric-ca/${orgName.toLowerCase()}`);
        if (!fs.existsSync(hostVolumePath)) {
            fs.mkdirSync(hostVolumePath, { recursive: true });
        }

        const dockerComposeConfig = {
            version: "3.7", 
            networks: {
                [network]: {
                    driver: "bridge"
                }
            },
            services: {
                [containerName]: {
                    image,
                    environment: [
                        `FABRIC_CA_HOME=/etc/hyperledger/fabric-ca-server`,
                        `FABRIC_CA_SERVER_CA_NAME=${caName}`,
                        `FABRIC_CA_SERVER_TLS_ENABLED=true`,
                        `FABRIC_CA_SERVER_PORT=${caPort}`
                    ],
                    ports: [`${caPort}:${caPort}`],  
                    command: `sh -c 'fabric-ca-server start -b ${adminUser}:${adminPassword} -d'`,
                    volumes: [
                        `${hostVolumePath}:/etc/hyperledger/fabric-ca-server`  
                    ],
                    hostname: caName,
                    container_name: caName,
                    networks: [network],
                }
            }
        };

        const newOrgsPath = path.resolve(`../blockchain/artifacts/channel/newOrgs`);
        if (!fs.existsSync(newOrgsPath)) {
            fs.mkdirSync(newOrgsPath, { recursive: true });
        }

        const dockerComposePath = path.join(newOrgsPath, `docker-compose-ca-${orgName.toLowerCase()}.yml`);
        const yamlContent = yaml.dump(dockerComposeConfig, { lineWidth: -1 }); 
        fs.writeFileSync(dockerComposePath, yamlContent);

        console.log(`docker-compose-${orgName.toLowerCase()}.yml generated at ${dockerComposePath}`);

        try {
            execSync(`docker-compose -f ${dockerComposePath} up -d`, { stdio: 'inherit' });
            console.log('Containers started successfully!');
        } catch (error) {
            console.error('Error starting containers:', error.message);
        }
        return {
            message: `docker-compose-${orgName.toLowerCase()}.yml file generated successfully.`,
            path: dockerComposePath
        };
    } catch (error) {
        console.error("Error generating docker-compose file:", error);
        throw error;
    }
}

module.exports = {
    generateDockerComposeFile
};
