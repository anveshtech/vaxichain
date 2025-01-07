const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');


const baseDir = path.join(__dirname, '../../blockchain/artifacts/channel/newOrgs');

if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
    console.log(`Created directory: ${baseDir}`);
}

const generateCryptoConfig = async (orgName, domain, peerCount = 1, userCount = 1) => {
    const cryptoConfigTemplate = `
# ---------------------------------------------------------------------------
# "PeerOrgs" - Definition of organizations managing peer nodes
# ---------------------------------------------------------------------------
PeerOrgs:
  # ---------------------------------------------------------------------------
  # ${orgName}
  # ---------------------------------------------------------------------------
  - Name: ${orgName}
    Domain: ${domain}
    EnableNodeOUs: true
    Template:
      Count: ${peerCount}
      SANS:
        - localhost
    Users:
      Count: ${userCount}
`;
    const filePath = path.join(baseDir, `crypto-${orgName}.yaml`);
    fs.writeFileSync(filePath, cryptoConfigTemplate.trim());
    console.log(`crypto-config.yaml generated successfully at ${filePath}`);
}

const generateConfigTx = async(orgName, domain, port) => {
    const mspName = `${orgName}MSP`;
    const newOrgConfig = `
  - &${orgName}
      Name: ${mspName}
      ID: ${mspName}
      MSPDir: ../crypto-config/peerOrganizations/${domain}/msp
      Policies:
          Readers:
              Type: Signature
              Rule: "OR('${mspName}.admin', '${mspName}.peer', '${mspName}.client')"
          Writers:
              Type: Signature
              Rule: "OR('${mspName}.admin', '${mspName}.client')"
          Admins:
              Type: Signature
              Rule: "OR('${mspName}.admin')"
          Endorsement:
              Type: Signature
              Rule: "OR('${mspName}.peer')"
      AnchorPeers:
          - Host: peer0.${domain}
            Port: ${port}
`;

    const appOrgConfig = `                - *${orgName}\n`;
    const filePath = path.join(__dirname, '../../blockchain/artifacts/channel/newOrgs/configtx.yaml');

    try {
        if (fs.existsSync(filePath)) {
            const configContent = fs.readFileSync(filePath, 'utf-8');
            let updatedContent = configContent;

            if (!configContent.includes(`&${orgName}`)) {
                updatedContent = updatedContent.replace(
                    /Organizations:\s*\n/,
                    match => `${match}${newOrgConfig}`
                );
            } else {
                console.log(`Organization ${orgName} already exists in Organizations section of configtx.yaml.`);
            }

            const profilesPattern = /(Profiles:\s*\n(?:.*\n)*?TwoOrgsChannel:\s*\n(?:.*\n)*?Application:\s*\n(?:.*\n)*?Organizations:\s*\n)/;
            const match = configContent.match(profilesPattern);
            if (match && !configContent.includes(`- *${orgName}`)) {
                updatedContent = updatedContent.replace(
                    profilesPattern,
                    match => `${match[0]}${appOrgConfig}`
                );
                console.log(`Added organization ${orgName} to TwoOrgsChannel -> Application -> Organizations.`);
            } else if (!match) {
                console.log(`Failed to locate the TwoOrgsChannel -> Application -> Organizations section.`);
            } else {
                console.log(`Organization ${orgName} already exists in TwoOrgsChannel -> Application -> Organizations.`);
            }

            if (updatedContent !== configContent) {
                fs.writeFileSync(filePath, updatedContent.trim());
                console.log(`Organization ${orgName} added to configtx.yaml.`);
            } else {
                console.log(`No changes made to configtx.yaml.`);
            }
        } else {
            console.error(`configtx.yaml not found at ${filePath}`);
        }
    } catch (error) {
        console.error(`Error updating configtx.yaml: ${error.message}`);
    }
}

const generateNewProfile = async (orgName) => {
    const newProfileConfig = `
    ${orgName}Channel:
        <<: *ChannelDefaults
        Consortium: SampleConsortium
        Orderer:
            <<: *OrdererDefaults
            OrdererType: etcdraft
            EtcdRaft:
                Consenters:
                - Host: orderer.dataauth.com
                  Port: 7050
                  ClientTLSCert: ../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/server.crt
                  ServerTLSCert: ../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/server.crt
                - Host: orderer2.dataauth.com
                  Port: 7050
                  ClientTLSCert: ../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls/server.crt
                  ServerTLSCert: ../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls/server.crt
                - Host: orderer3.dataauth.com
                  Port: 7050
                  ClientTLSCert: ../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls/server.crt
                  ServerTLSCert: ../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls/server.crt
            Addresses:
                - orderer.dataauth.com:7050
                - orderer2.dataauth.com:7050
                - orderer3.dataauth.com:7050
            Organizations:
                - *OrdererOrg
            Capabilities: *OrdererCapabilities
        Application:
            <<: *ApplicationDefaults
            Organizations:
                - *${orgName}  # Add the new organization dynamically
            Capabilities: *ApplicationCapabilities
`;

    const filePath = path.join(__dirname, '../../blockchain/artifacts/channel/newOrgs/configtx.yaml');

    try {
        if (fs.existsSync(filePath)) {
            const configContent = fs.readFileSync(filePath, 'utf-8');
            let updatedContent = configContent;

            updatedContent = updatedContent.replace(/Profiles:/, `Profiles:\n${newProfileConfig}`);

            if (updatedContent !== configContent) {
                fs.writeFileSync(filePath, updatedContent.trim());
                console.log(`Organization ${orgName} added to configtx.yaml.`);
            } else {
                console.log(`No changes made to configtx.yaml.`);
            }
        } else {
            console.error(`configtx.yaml not found at ${filePath}`);
        }
    } catch (error) {
        console.error(`Error updating configtx.yaml: ${error.message}`);
    }
}

const generateNewOrgDefinition = async (orgName, domain) => {
    exec('which configtxgen', (error, stdout, stderr) => {
        if (error) {
            console.error('configtxgen tool not found. Exiting...');
            return;
        }

        console.log(`Generating ${orgName} organization definition`);

        const fabricCfgPath = path.join(process.cwd(), '../blockchain/artifacts/channel/newOrgs');
        const configFilePath = path.join(fabricCfgPath, 'configtx.yaml');

        if (!fs.existsSync(configFilePath)) {
            console.error(`configtx.yaml not found at ${fabricCfgPath}. Ensure the configuration file exists.`);
            return;
        }

        process.env.FABRIC_CFG_PATH = fabricCfgPath;

        const outputPath = path.join(
            __dirname,
            `../../blockchain/artifacts/channel/crypto-config/peerOrganizations/${domain}/${orgName}.json`
        );
        const command = `configtxgen -printOrg ${orgName}MSP > ${outputPath}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Failed to generate organization definition:', stderr);
                return;
            }
            console.log(`Organization definition for ${orgName} generated successfully at ${outputPath}`);
        });
    });
}

const enrollCAAdmin = async(caName, adminName, adminPassword, caURL, caCertPath, orgDomain, orgName) => {
    console.log("Enrolling the CA admin...");
    const orgPath = path.join(__dirname, `../../blockchain/artifacts/channel/crypto-config/peerOrganizations/${orgDomain}`);
    fs.mkdirSync(orgPath, { recursive: true });

    const fabricCAClientHome = path.resolve(orgPath);
    process.env.FABRIC_CA_CLIENT_HOME = fabricCAClientHome;

    console.log(caName);
    execSync(
        `fabric-ca-client enroll -u https://${adminName}:${adminPassword}@${caURL} --caname ${caName} --tls.certfiles ${caCertPath}`,
        { stdio: "inherit" }
    );

    const configYAML = `
NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-${caURL.split(":")[1]}-ca-${orgName}-dataauth-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-${caURL.split(":")[1]}-ca-${orgName}-dataauth-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-${caURL.split(":")[1]}-ca-${orgName}-dataauth-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-${caURL.split(":")[1]}-ca-${orgName}-dataauth-com.pem
    OrganizationalUnitIdentifier: orderer
`;
    fs.writeFileSync(path.join(fabricCAClientHome, "msp/config.yaml"), configYAML.trim());
}

const registerIdentity = async(caName, identityName, identitySecret, identityType, caCertPath) => {
    console.log(`Registering ${identityType}: ${identityName}...`);
    execSync(
        `fabric-ca-client register --caname ${caName} --id.name ${identityName} --id.secret ${identitySecret} --id.type ${identityType} --tls.certfiles ${caCertPath}`,
        { stdio: "inherit" }
    );
}

const generateMSP = async(caName, identityName, identitySecret, caURL, caCertPath, targetPath, domain) => {
    
    execSync(
        `fabric-ca-client enroll -u https://${identityName}:${identitySecret}@${caURL} --caname ${caName} -M ${targetPath} --csr.hosts ${identityName}.${domain} --tls.certfiles ${caCertPath}`,
        { stdio: "inherit" }
    );
}

const generateTLS = async(caName, identityName, identitySecret, caURL, caCertPath, targetPath, domain) => {
    console.log(`Generating MSP for ${identityName}...`);
    execSync(
        `fabric-ca-client enroll -u https://${identityName}:${identitySecret}@${caURL} --caname ${caName} -M ${targetPath} --enrollment.profile tls --csr.hosts ${identityName}.${domain} --csr.hosts localhost --tls.certfiles ${caCertPath}`,
        { stdio: "inherit" }
    );
}

const generateUserMSP = async(caName, identityName, identitySecret, caURL, caCertPath, targetPath) => {
    console.log(`Generating UserMSP for ${identityName}...`);
    
    execSync(
        `fabric-ca-client enroll -u https://${identityName}:${identitySecret}@${caURL} --caname ${caName} -M ${targetPath} --tls.certfiles ${caCertPath}`,
        { stdio: "inherit" }
    );

    // Copy keystore to the correct location
    const keystoreSource = path.join(targetPath, 'keystore');
    const keystoreDest = path.join(targetPath, 'keystore', 'priv_sk');
    
    const keystoreFiles = fs.readdirSync(keystoreSource);
    keystoreFiles.forEach(file => {
        const srcFilePath = path.join(keystoreSource, file);
        if (fs.lstatSync(srcFilePath).isFile()) {
            fs.copyFileSync(srcFilePath, keystoreDest);
        }
    });
}

const copyTLSCertificates = async(basePath, peerPath, domain) => {
    const tlsCACertPath = path.join(peerPath, "tls/tlscacerts");
    const signCertPath = path.join(peerPath, "tls/signcerts");
    const keystorePath = path.join(peerPath, "tls/keystore");
    const caCertPath = path.join(peerPath, "msp/cacerts");
    const caPath = path.join(basePath, "ca");
    const tlscaPath = path.join(basePath, "tlsca");
    const tlsPath = path.join(peerPath, "tls");
    const mspTlsCACertPath = path.join(basePath, "msp/tlscacerts");

    fs.mkdirSync(caPath, { recursive: true });
    fs.mkdirSync(tlscaPath, { recursive: true });
    fs.mkdirSync(tlsPath, { recursive: true });
    fs.mkdirSync(mspTlsCACertPath, { recursive: true });

    // Copy the TLS CA certificate as ca.crt
    const tlsCACerts = fs.readdirSync(tlsCACertPath);
    if (tlsCACerts.length > 0) {
        fs.copyFileSync(
            path.join(tlsCACertPath, tlsCACerts[0]),
            path.join(tlsPath, "ca.crt") // Renaming as ca.crt
        );
    } else {
        throw new Error(`No TLS CA certificates found in ${tlsCACertPath}`);
    }

    // Copy the CA certificate
    const caCerts = fs.readdirSync(caCertPath);
    if (caCerts.length > 0) {
        fs.copyFileSync(
            path.join(caCertPath, caCerts[0]),
            path.join(caPath, `ca.${basePath.split("/").pop()}-cert.pem`)
        );
    } else {
        throw new Error(`No CA certificates found in ${caCertPath}`);
    }

    // Copy the server certificate and key
    const signCerts = fs.readdirSync(signCertPath);
    if (signCerts.length > 0) {
        fs.copyFileSync(
            path.join(signCertPath, signCerts[0]),
            path.join(tlsPath, "server.crt")
        );
    } else {
        throw new Error(`No sign certificates found in ${signCertPath}`);
    }

    const keystores = fs.readdirSync(keystorePath);
    if (keystores.length > 0) {
        fs.copyFileSync(
            path.join(keystorePath, keystores[0]),
            path.join(tlsPath, "server.key")
        );
    } else {
        throw new Error(`No keystore files found in ${keystorePath}`);
    }

    const mspTlsCACerts = fs.readdirSync(tlsCACertPath);
    if (mspTlsCACerts.length > 0) {
        fs.copyFileSync(
            path.join(tlsCACertPath, mspTlsCACerts[0]),
            path.join(mspTlsCACertPath, "ca.crt") 
        );
    } else {
        throw new Error(`No TLS CA certificates found in ${tlsCACertPath}`);
    }

    if (tlsCACerts.length > 0) {
        fs.copyFileSync(
            path.join(tlsCACertPath, tlsCACerts[0]),
            path.join(tlscaPath, `tlsca.${domain}-cert.pem`)
        );
    } else {
        throw new Error(`No TLS CA certificates found in ${tlsCACertPath}`);
    }

}

const generateConfigProfile = async(org, P0PORT, CAPORT) => {
    const peerCertPath = path.join(__dirname, `../../blockchain/artifacts/channel/crypto-config/peerOrganizations/${low_org}.dataauth.com/peers/peer0.${low_org}.dataauth.com/tls/tlscacerts/tls-localhost-${CAPORT}-ca-${low_org}-dataauth-com.pem`);
    const caCertPath = path.join(__dirname, `../../blockchain/artifacts/channel/crypto-config/peerOrganizations/${low_org}.dataauth.com/msp/tlscacerts/ca.crt`);

    const PEERPEM = fs.readFileSync(peerCertPath, 'utf8');
    const CAPEM = fs.readFileSync(caCertPath, 'utf8');

    const low_org = org.toLowerCase();

    const config = {
        "name": `first-network-${low_org}`,
        "version": "1.0.0",
        "client": {
            "organization": org,
            "connection": {
                "timeout": {
                    "peer": {
                        "endorser": "300"
                    }
                }
            }
        },
        "organizations": {
            [org]: {
                "mspid": `${org}MSP`,
                "peers": [
                    `peer0.${low_org}.dataauth.com`
                ],
                "certificateAuthorities": [
                    `ca.${low_org}.dataauth.com`
                ]
            }
        },
        "peers": {
            [`peer0.${low_org}.dataauth.com`]: {
                "url": `grpcs://localhost:${P0PORT}`,
                "tlsCACerts": {
                    "pem": PEERPEM
                },
                "grpcOptions": {
                    "ssl-target-name-override": `peer0.${low_org}.dataauth.com`,
                    "hostnameOverride": `peer0.${low_org}.dataauth.com`
                }
            }
        },
        "certificateAuthorities": {
            [`ca.${low_org}.dataauth.com`]: {
                "url": `https://localhost:${CAPORT}`,
                "caName": `ca.${low_org}.dataauth.com`,
                "tlsCACerts": {
                    "pem": CAPEM
                },
                "httpOptions": {
                    "verify": false
                }
            }
        }
    };

    // Define the file path
    const filePath = path.join(__dirname, `../connection-profile/connection-${low_org}.json`);

    // Write the config to the file
    fs.writeFile(filePath, JSON.stringify(config, null, 2), 'utf8', (err) => {
        if (err) {
            console.error("Error writing to file", err);
        } else {
            console.log(`Connection profile saved to ${filePath}`);
        }
    });
}

const createOrg = async(orgName, caURL, adminName, adminPassword, orgDomain) => {
    const basePath = path.join(__dirname, `../../blockchain/artifacts/channel/crypto-config/peerOrganizations/${orgDomain}`);
    const peer0Path = path.join(basePath, `peers/peer0.${orgDomain}`);
    const userPath = path.join(basePath, `users/User1@${orgDomain}`);
    const adminPath = path.join(basePath, `users/Admin@${orgDomain}`);

    const caCertPath = path.resolve(__dirname, `../../blockchain/artifacts/channel/create-certificates-with-ca/fabric-ca/${orgName.toLowerCase()}/tls-cert.pem`);

    await enrollCAAdmin(`ca.${orgName.toLowerCase()}.dataauth.com`, adminName, adminPassword, caURL, caCertPath, orgDomain, orgName);


    await registerIdentity(`ca.${orgName.toLowerCase()}.dataauth.com`, "peer0", "peer0pw", "peer", caCertPath);
    await registerIdentity(`ca.${orgName.toLowerCase()}.dataauth.com`, "user1", "user1pw", "client", caCertPath);
    await registerIdentity(`ca.${orgName.toLowerCase()}.dataauth.com`, `${orgName.toLowerCase()}admin`, `${orgName.toLowerCase()}adminpw`, "admin", caCertPath);

    fs.mkdirSync(peer0Path, { recursive: true });

    await generateMSP(`ca.${orgName.toLowerCase()}.dataauth.com`, "peer0", "peer0pw", caURL, caCertPath, path.join(peer0Path, "msp"), `${orgName.toLowerCase()}.dataauth.com`);
    await generateTLS(`ca.${orgName.toLowerCase()}.dataauth.com`, "peer0", "peer0pw", caURL, caCertPath, path.join(peer0Path, "tls"), `${orgName.toLowerCase()}.dataauth.com`);

    fs.copyFileSync(path.join(basePath, "msp/config.yaml"), path.join(peer0Path, "msp/config.yaml"));

    fs.mkdirSync(userPath, { recursive: true });
    await generateUserMSP(`ca.${orgName.toLowerCase()}.dataauth.com`, "user1", "user1pw", caURL, caCertPath, path.join(userPath, "msp"));
    fs.copyFileSync(path.join(basePath, "msp/config.yaml"), path.join(userPath, "msp/config.yaml"));

    // Generate Admin MSP
    fs.mkdirSync(adminPath, { recursive: true });
    await generateUserMSP(`ca.${orgName.toLowerCase()}.dataauth.com`, `${orgName.toLowerCase()}admin`, `${orgName.toLowerCase()}adminpw`, caURL, caCertPath, path.join(adminPath, "msp"));
    fs.copyFileSync(path.join(basePath, "msp/config.yaml"), path.join(adminPath, "msp/config.yaml"));

    await copyTLSCertificates(basePath, peer0Path, orgDomain);

    console.log(`${orgName} organization setup completed!`);
}

const createDockerComposeFile = async(orgName, domain, peerPort, couchPort, network) =>{
    const peerContainerName = `peer0.${domain}`;
    const couchContainerName = `${orgName}-couchdb`;

    const newPort = +peerPort + 1; 
    console.log(newPort);

    const dockerComposeContent = `
version: '3.7'
networks:
  ${network}:
    external:
        name: artifacts_network_1
  
    
services:
  ${couchContainerName}:
    container_name: ${couchContainerName}
    image: couchdb:3.1.1
    environment:
      - COUCHDB_USER=admin
      - COUCHDB_PASSWORD=adminpw
    ports:
      - "${couchPort}:5984"
    networks:
      - ${network}


  ${peerContainerName}:
    container_name: ${peerContainerName}
    image: hyperledger/fabric-peer:2.5.0
    labels:
      service: hyperledger-fabric
    environment:
      - CORE_VM_ENDPOINT=unix:///host/var/run/docker.sock
      - FABRIC_LOGGING_SPEC=info
      - ORDERER_GENERAL_LOGLEVEL=info
      - CORE_PEER_LOCALMSPID=${orgName}MSP
      - CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=artifacts_${network}
      - CORE_PEER_ID=${peerContainerName}
      - CORE_PEER_ADDRESS=${peerContainerName}:${peerPort}
      - CORE_PEER_LISTENADDRESS=0.0.0.0:${peerPort}
      - CORE_PEER_CHAINCODEADDRESS=${peerContainerName}:${newPort}
      - CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:${newPort}
      - CORE_PEER_GOSSIP_EXTERNALENDPOINT=${peerContainerName}:${peerPort}
      - CORE_LEDGER_STATE_STATEDATABASE=CouchDB
      - CORE_LEDGER_STATE_COUCHDBCONFIG_COUCHDBADDRESS=${couchContainerName}:5984
      - CORE_LEDGER_STATE_COUCHDBCONFIG_USERNAME=admin
      - CORE_LEDGER_STATE_COUCHDBCONFIG_PASSWORD=adminpw
      - CORE_PEER_TLS_ENABLED=true
      - CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt
      - CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key
      - CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt
      - CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/fabric/msp
    depends_on:
      - ${couchContainerName}
    ports:
      - ${peerPort}:${peerPort}
    volumes:
      - ../crypto-config/peerOrganizations/${domain}/peers/${peerContainerName}:/etc/hyperledger/fabric
      - /var/run/:/host/var/run/
    networks:
      - ${network}


`;

    const filePath = path.join(__dirname, `../../blockchain/artifacts/channel/newOrgs/docker-compose-${orgName}.yml`);
    fs.writeFileSync(filePath, dockerComposeContent.trim());

    try {
        execSync(`docker-compose -f ${filePath} up -d`, { stdio: 'inherit' });
        console.log('Containers started successfully!');
    } catch (error) {
        console.error('Error starting containers:', error.message);
    }

    return filePath;
}

module.exports = {
    generateCryptoConfig: generateCryptoConfig,
    generateConfigTx: generateConfigTx,
    generateNewOrgDefinition: generateNewOrgDefinition, 
    createOrg: createOrg, 
    createDockerComposeFile: createDockerComposeFile, 
    generateNewProfile: generateNewProfile,
    generateConfigProfile: generateConfigProfile
};


