var log4js = require('log4js');
var logger = log4js.getLogger('SampleWebApp');
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var util = require('util');
var app = express();
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');
var cors = require('cors');
const { exec, execSync } = require('child_process');
const path = require('path');

const constants = require('./connection-profile/constants.json')

const host = process.env.HOST || constants.host;
const port = process.env.PORT || constants.port;

// const host = process.env.HOST || '0.0.0.0';
// const port = "4000"

var helper = require('./app/helper')
var generate = require('./app/createNewOrgCrypto')
var docker = require('./app/dockerContainer')
var channel = require('./app/createChannel')
var deploy = require('./app/deployChaincode')
var invoke = require('./app/invoke')

app.options('*', cors());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
// set secret variable
app.set('secret', 'thisismysecret');

app.use(expressJWT({
    secret: 'thisismysecret'
}).unless({
    path: ['/users','/users/login', '/register', '/users/token', '/setup-network-datacollector', '/deploy', '/aa']
}));
app.use(bearerToken());

logger.level = 'debug';

app.use((req, res, next) => {
    logger.debug('New req for %s', req.originalUrl);
    if (req.originalUrl.indexOf('/users') >= 0 || req.originalUrl.indexOf('/users/login') >= 0 || req.originalUrl.indexOf('/register') >= 0 || req.originalUrl.indexOf('/setup-network-datacollector') >= 0 || req.originalUrl.indexOf('/deploy') >= 0 || req.originalUrl.indexOf('/aa') >= 0) {
        return next();
    }
    var token = req.token;
    jwt.verify(token, app.get('secret'), (err, decoded) => {
        if (err) {
            console.log(`Error ================:${err}`)
            res.send({
                success: false,
                message: 'Failed to authenticate token. Make sure to include the ' +
                    'token returned from /users call in the authorization header ' +
                    ' as a Bearer token'
            });
            return;
        } else {
            req.userid = decoded.userid;
            req.orgname = decoded.orgName;
            req.companyname = decoded.companyName
            logger.debug(util.format('Decoded from JWT token: userid - %s, orgname - %s, companyname - %s', decoded.userid, decoded.orgName, decoded.companyName));
            return next();
        }
    });
});


var server = http.createServer(app).listen(port, function () { console.log(`Server started on ${port}`) });
logger.info('****************** SERVER STARTED ************************');
logger.info('***************  http://%s:%s  ******************', host, port);
server.timeout = 240000;



function getErrorMessage(field) {
    var response = {
        success: false,
        message: field + ' field is missing or Invalid in the request'
    };
    return response;
}


app.post('/users', async function (req, res) {
    var userid = req.body.userid;
    var orgName = req.body.orgName;
    var companyName =  req.body.companyName
    logger.debug('End point : /users');
    logger.debug('User name : ' + userid);
    logger.debug('Org name  : ' + orgName);
    logger.debug('Company name  : ' + companyName);

    if (!userid) {
        res.json(getErrorMessage('\'userid\''));
        return;
    }
    if (!orgName) {
        res.json(getErrorMessage('\'orgName\''));
        return;
    }
    if (!companyName) {
        res.json(getErrorMessage('\'companyName\''));
        return;
    }

    var token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
        userid: userid,
        orgName: orgName,
        companyName: companyName
    }, app.get('secret'));

    let response = await helper.getRegisteredUser(userid, orgName, companyName, true);

    logger.debug('-- returned from registering the userid %s for organization %s and company %s', userid, orgName, companyName);
    if (response && typeof response !== 'string') {
        logger.debug('Successfully registered the userid %s for organization %s and company %s', userid, orgName, companyName);
        response.token = token;
        res.json(response);
    } else {
        logger.debug('Failed to register the userid %s for organization %s and company %s with::%s', userid, orgName, companyName, response);
        res.json({ success: false, message: response });
    }

});

// Register and enroll user
app.post('/register', async function (req, res) {
    var userid = req.body.userid;
    var orgName = req.body.orgName;
    var companyName =  req.body.companyName
    logger.debug('End point : /users');
    logger.debug('User name : ' + userid);
    logger.debug('Org name  : ' + orgName);
    logger.debug('Company name  : ' + companyName);
    if (!userid) {
        res.json(getErrorMessage('\'userid\''));
        return;
    }
    if (!orgName) {
        res.json(getErrorMessage('\'orgName\''));
        return;
    }
    if (!companyName) {
        res.json(getErrorMessage('\'companyName\''));
        return;
    }

    var token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
        userid: userid,
        orgName: orgName,
        companyName: companyName
    }, app.get('secret'));

    console.log(token)

    let response = await helper.registerAndGerSecret(userid, orgName, companyName);

    logger.debug('-- returned from registering the userid %s for organization %s and company %s', userid, orgName, companyName);
    if (response && typeof response !== 'string') {
        logger.debug('Successfully registered the userid %s for organization %s and company %s', userid, orgName, companyName);
        response.token = token;
        res.json(response);
    } else {
        logger.debug('Failed to register the userid %s for organization %s and company %s with::%s', userid, orgName, companyName, response);
        res.json({ success: false, message: response });
    }

}); 

// Login and get jwt
app.post('/users/login', async function (req, res) {
    var userid = req.body.userid;
    var orgName = req.body.orgName;
    var companyName = req.body.companyName;
    logger.debug('End point : /users');
    logger.debug('User name : ' + userid);
    logger.debug('Org name  : ' + orgName);
    logger.debug('Company name  : ' + companyName);
    if (!userid) {
        res.json(getErrorMessage('\'userid\''));
        return;
    }
    if (!orgName) {
        res.json(getErrorMessage('\'orgName\''));
        return;
    }
    if (!companyName) {
        res.json(getErrorMessage('\'companyName\''));
        return;
    }

    var token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
        userid: userid,
        orgName: orgName,
        companyName: companyName
    }, app.get('secret'));

    let isUserRegistered = await helper.isUserRegistered(userid, orgName, companyName);

    if (isUserRegistered) {
        res.json({ success: true, message: { token: token } });

    } else {
        res.json({ success: false, message: `User with userid ${userid} is not registered with ${orgName}, Please register first.` });
    }
});

app.post('/users/token', async function (req, res) {
    var userid = req.body.userid;
    var orgName = req.body.orgName;
    var companyName = req.body.companyName;
    logger.debug('End point : /users');
    logger.debug('User name : ' + userid);
    logger.debug('Org name  : ' + orgName);
    logger.debug('C name  : ' + companyName);
    if (!userid) {
        res.json(getErrorMessage('\'userid\''));
        return;
    }
    if (!orgName) {
        res.json(getErrorMessage('\'orgName\''));
        return;
    }
    if (!companyName) {
        res.json(getErrorMessage('\'companyName\''));
        return;
    }

    var token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
        userid: userid,
        orgName: orgName,
        companyName: companyName
    }, app.get('secret'));

    let isUserRegistered = await helper.isUserRegistered(userid, orgName, companyName);

    if (isUserRegistered) {
        res.json({ success: true, message: { token: token } });

    } else {
        res.json({ success: false, message: `User with userid ${userid} is not registered with ${orgName}, Please register first.` });
    }
});

// Invoke transaction on chaincode on target peers
app.post('/channels/:channelName/chaincodes/:chaincodeName', async function (req, res) {
    try {
        logger.debug('==================== INVOKE ON CHAINCODE ==================');
        var chaincodeName = req.params.chaincodeName;
        var channelName = req.params.channelName;
        var fcn = req.body.fcn;
        var args = req.body.args;
        // var transient = req.body.transient;
        // console.log(`Transient data is ;${transient}`)
        logger.debug('channelName  : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('fcn  : ' + fcn);
        logger.debug('args  : ' + args);

        const functionMappings = {
            'CreateDataCollectorUser': { channelName: 'channel1', chaincodeName: 'DataCollector' },
        };

        if (functionMappings[fcn]) {
            channelName = functionMappings[fcn].channelName;
            chaincodeName = functionMappings[fcn].chaincodeName;
        }

        console.log(`Mapped channel name is: ${channelName}`);
        console.log(`Mapped chaincode name is: ${chaincodeName}`);

        logger.debug('Mapped channelName: ' + channelName);
        logger.debug('Mapped chaincodeName: ' + chaincodeName);


        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!fcn) {
            res.json(getErrorMessage('\'fcn\''));
            return;
        }
        if (!args) {
            res.json(getErrorMessage('\'args\''));
            return;
        }

        let message = await invoke.invokeTransaction(channelName, chaincodeName, fcn, args, req.userid, req.orgname, req.companyName);
        console.log(`message result is : ${message}`)

        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }
        res.send(response_payload);

    } catch (error) {
        const response_payload = {
            result: null,
            error: error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});

app.get('/channels/:channelName/chaincodes/:chaincodeName', async function (req, res) {
    try {
        logger.debug('==================== QUERY BY CHAINCODE ==================');

        var channelName = req.params.channelName;
        var chaincodeName = req.params.chaincodeName;
        console.log(`chaincode name is :${chaincodeName}`)
        let args = req.query.args;
        let fcn = req.query.fcn;
        let peer = req.query.peer;

        logger.debug('channelName : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('fcn : ' + fcn);
        logger.debug('args : ' + args);

        const functionMappings = {
            'CreateCompany': { channelName: 'mychannel', chaincodeName: 'Company' },
            'GetCompanyHash': { channelName: 'mychannel', chaincodeName: 'Company' },
            'QueryBatch': { channelName: 'mychannel', chaincodeName: 'Batch' },
            'QueryAllBatches': { channelName: 'mychannel', chaincodeName: 'Batch' },
            'QueryProductItem': { channelName: 'mychannel', chaincodeName: 'Productitem' },
            'QueryCustomer': { channelName: 'mychannel', chaincodeName: 'Customer' },
        };

        if (functionMappings[fcn]) {
            channelName = functionMappings[fcn].channelName;
            chaincodeName = functionMappings[fcn].chaincodeName;
        }

        console.log(`Mapped channel name is: ${channelName}`);
        console.log(`Mapped chaincode name is: ${chaincodeName}`);

        logger.debug('Mapped channelName: ' + channelName);
        logger.debug('Mapped chaincodeName: ' + chaincodeName);

        if (!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if (!channelName) {
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if (!fcn) {
            res.json(getErrorMessage('\'fcn\''));
            return;
        }
        if (!args) {
            res.json(getErrorMessage('\'args\''));
            return;
        }
        console.log('args==========', args);
        args = args.replace(/'/g, '"');
        args = JSON.parse(args);
        logger.debug(args);

        let message = await query.query(channelName, chaincodeName, args, fcn, req.userid, req.orgname, req.companyName);

        const response_payload = {
            result: message,
            error: null,
            errorData: null
        }

        res.send(response_payload);
    } catch (error) {
        const response_payload = {
            result: null,
            error: error.name,
            errorData: error.message
        }
        res.send(response_payload)
    }
});

// app.post('/generate-crypto-config-datacollector', async function (req, res) {
//     const { orgName, domain, peerCount = 1, userCount = 1, port, caPort } = req.body;

//     if (!orgName || !domain) {
//         return res.status(400).json({ error: 'orgName and domain are required fields.' });
//     }

//     try {
//         await generate.generateCryptoConfig(orgName, domain, peerCount, userCount);
//         await generate.generateConfigTx(orgName, domain, port);
//         await generate.createOrg(orgName.toLowerCase(), `localhost:${caPort}`, 'admin', 'adminpw', domain);
//         await generate.generateNewOrgDefinition(orgName, domain);

//         await generate.generateNewProfile(orgName);

//         res.status(200).json({
//             success: true,
//             message: `crypto-config.yaml & configtx.yaml generated successfully, and cryptogen ran! ${orgName} organization definition generated successfully!`,
//             orgName,
//             domain,
//             peerCount,
//             userCount,
//         });
//     } catch (error) {
//         console.error('Error generating crypto-config.yaml:', error);
//         res.status(500).json({ error: 'Failed to generate crypto-config.yaml' });
//     }
// });

// app.post('/generate-crypto-config-dataverifier', async function (req, res) {
//     const { orgName, domain, peerCount = 1, userCount = 1, port, caPort } = req.body;

//     if (!orgName || !domain) {
//         return res.status(400).json({ error: 'orgName and domain are required fields.' });
//     }

//     try {
//         // Await the async functions
//         await generate.generateCryptoConfig(orgName, domain, peerCount, userCount);
//         await generate.generateConfigTx(orgName, domain, port);
//         await generate.createOrg(orgName.toLowerCase(), `localhost:${caPort}`, 'admin', 'adminpw', domain);
//         await generate.generateNewOrgDefinition(orgName, domain);

//         res.status(200).json({
//             success: true,
//             message: 'crypto-config.yaml & configtx.yaml generated successfully, and cryptogen ran! Org3 organization definition generated successfully!',
//             orgName,
//             domain,
//             peerCount,
//             userCount,
//         });
//     } catch (error) {
//         console.error('Error generating crypto-config.yaml:', error);
//         res.status(500).json({ error: 'Failed to generate crypto-config.yaml' });
//     }
// });

// app.post('/generate-org3-definition', async function (req, res)  {
//     const { orgName, domain } = req.body;
//     try {
//         await generate.generateNewOrgDefinition(orgName, domain);
//         res.status(200).json({
//             message: 'Org3 organization definition generated successfully!',
//         });
//     } catch (error) {
//         console.error('Error generating Org3 definition:', error);
//         res.status(500).json({ error: 'Failed to generate Org3 definition' });
//     }
// });

// app.post("/generate-docker-compose", async (req, res) => {
//     const {
//         containerName,
//         caName,
//         caPort,
//         orgName
//     } = req.body;

//     const volumeHostPath = `./fabric-ca/${orgName.toLowerCase()}`;
//     const adminUser ="admin";
//     const adminPassword= "adminpw";
//     const network= "network_1";

//     if (!containerName || !caName || !caPort ) {
//         return res.status(400).json({ error: "Missing required parameters." });
//     }

//     try {
//         const result = await docker.generateDockerComposeFile({
//             containerName,
//             caName,
//             caPort,
//             volumeHostPath,
//             network,
//             adminUser,
//             adminPassword,
//             orgName
//         });
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// app.post('/create-docker-compose', async function (req, res) {
//     const { orgName, domain, peerPort, couchPort, network } = req.body;

//     if (!orgName || !domain || !peerPort || !couchPort) {
//         return res.status(400).json({ error: 'Missing required parameters: orgName, domain, peerPort, couchPort' });
//     }

//     try {
//         const filePath = await generate.createDockerComposeFile(orgName, domain, peerPort, couchPort, network);
//         res.status(200).json({
//             message: 'Docker Compose file created successfully!',
//             filePath,
//         });
//     } catch (error) {
//         console.error('Error creating Docker Compose file:', error);
//         res.status(500).json({ error: 'Failed to create Docker Compose file' });
//     }
// });

// app.post('/create-channel', async function(req, res) {
//     const { channelName, orgName, profile, port } = req.body;
    
//     if (!channelName) {
//         return res.status(400).json({ error: 'Channel name is required' });
//     }

//     try {
//         const createBlockResult = await channel.createChannelBlock(channelName, profile);
//         console.log('Channel block created:', createBlockResult);

//         const createChannelResult = await channel.createChannel(channelName);
//         console.log('Channel created:', createChannelResult);

//         const joinChannelResult = await channel.joinChannel(channelName, orgName, port);
//         console.log('Joined channel:', joinChannelResult);

//         res.status(200).json({
//             message: 'Channel created and joined successfully',
//             createBlockResult,
//             createChannelResult,
//             joinChannelResult
//         });
        
//     } catch (error) {
//         console.error('Error during channel creation or joining:', error);
//         res.status(500).json({ error: error.message || 'An error occurred' });
//     }
// });

// app.post('/join-channel', async function(req, res) {
//     const { channelName, orgName, profile, port } = req.body;
    
//     if (!channelName) {
//         return res.status(400).json({ error: 'Channel name is required' });
//     }

//     try {
//         const joinChannelResult = await channel.joinChannel(channelName, orgName, port);
//         console.log('Joined channel:', joinChannelResult);

//         res.status(200).json({
//             message: 'Channel created and joined successfully',
//             joinChannelResult
//         });
        
//     } catch (error) {
//         console.error('Error during channel creation or joining:', error);
//         res.status(500).json({ error: error.message || 'An error occurred' });
//     }
// });

app.get('/try', async function (req, res) {
    result = "CHECK";
    console.log(result);
    res.status(200).json(result);
});

app.post('/setup-network-datacollector', async (req, res) => {
    const {
        containerName,
        caName,
        caPort,
        orgName,
        domain,
        peerCount = 1,
        userCount = 1,
        peerPort,
        couchPort,
        channelName,
        profile,
        network = "network_1"
    } = req.body;


    // Validate required fields
    if (!containerName || !caName || !caPort || !orgName || !domain || !peerPort || !couchPort || !channelName || !profile) {
        return res.status(400).json({ error: "Missing required parameters." });
    }

    const volumeHostPath = `./fabric-ca/${orgName.toLowerCase()}`;
    const adminUser = "admin";
    const adminPassword = "adminpw";

    try {
        // Step 1: Generate docker-compose file for CA
        const dockerComposeResult = await docker.generateDockerComposeFile({
            containerName,
            caName,
            caPort,
            volumeHostPath,
            network,
            adminUser,
            adminPassword,
            orgName
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 2: Generate crypto-config and configtx
        await generate.generateCryptoConfig(orgName, domain, peerCount, userCount);
        await generate.generateConfigTx(orgName, domain, peerPort);
        await generate.createOrg(orgName.toLowerCase(), `localhost:${caPort}`, adminUser, adminPassword, domain);
        await generate.generateNewOrgDefinition(orgName, domain);
        await generate.generateNewProfile(orgName);

        await generate.generateConfigProfile(orgName, peerPort, caPort);

        // Step 3: Create Docker Compose for peer and CouchDB
        const dockerComposeFilePath = await generate.createDockerComposeFile(orgName, domain, peerPort, couchPort, network);

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 4: Create and join channel
        const createBlockResult = await channel.createChannelBlock(channelName, profile);
        const createChannelResult = await channel.createChannel(channelName);

        await new Promise(resolve => setTimeout(resolve, 2000));
        const joinChannelResult = await channel.joinChannel(channelName, orgName, peerPort);

        // Respond with success message and details
        res.status(200).json({
            success: true,
            message: "Network setup completed successfully!",
            // dockerComposeResult,
            // cryptoConfig: {
            //     orgName,
            //     domain,
            //     peerCount,
            //     userCount
            // },
            // dockerComposeFilePath,
            // channelDetails: {
            //     createBlockResult,
            //     createChannelResult,
            //     joinChannelResult
            // }
        });
    } catch (error) {
        console.error("Error during network setup:", error);
        res.status(500).json({ error: error.message || "An error occurred during network setup." });
    }
});

app.post('/setup-network-dataverifier', async (req, res) => {
    const {
        containerName,
        caName,
        caPort,
        orgName,
        domain,
        peerCount = 1,
        userCount = 1,
        peerPort,
        couchPort,
        channelName,
        profile,
        network = "network_1"
    } = req.body;


    // Validate required fields
    if (!containerName || !caName || !caPort || !orgName || !domain || !peerPort || !couchPort || !channelName || !profile) {
        return res.status(400).json({ error: "Missing required parameters." });
    }

    const volumeHostPath = `./fabric-ca/${orgName.toLowerCase()}`;
    const adminUser = "admin";
    const adminPassword = "adminpw";

    try {
        // Step 1: Generate docker-compose file for CA
        const dockerComposeResult = await docker.generateDockerComposeFile({
            containerName,
            caName,
            caPort,
            volumeHostPath,
            network,
            adminUser,
            adminPassword,
            orgName
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 2: Generate crypto-config and configtx
        await generate.generateCryptoConfig(orgName, domain, peerCount, userCount);
        await generate.generateConfigTx(orgName, domain, port);
        await generate.createOrg(orgName.toLowerCase(), `localhost:${caPort}`, 'admin', 'adminpw', domain);
        await generate.generateNewOrgDefinition(orgName, domain);

        // Step 3: Create Docker Compose for peer and CouchDB
        const dockerComposeFilePath = await generate.createDockerComposeFile(orgName, domain, peerPort, couchPort, network);

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 4: Join channel
        // const createBlockResult = await channel.createChannelBlock(channelName, profile);
        // const createChannelResult = await channel.createChannel(channelName);
        const joinChannelResult = await channel.joinChannel(channelName, orgName, peerPort);

        // Respond with success message and details
        res.status(200).json({
            success: true,
            message: "Network setup completed successfully!",
            dockerComposeResult,
            cryptoConfig: {
                orgName,
                domain,
                peerCount,
                userCount
            },
            dockerComposeFilePath,
            channelDetails: {
                joinChannelResult
            }
        });
    } catch (error) {
        console.error("Error during network setup:", error);
        res.status(500).json({ error: error.message || "An error occurred during network setup." });
    }
});

app.post('/deploy', async (req, res) => {
    try {
        const { channelName, peerPort, orgName } = req.body;

        const lowOrg = orgName.toLowerCase();

        if (!channelName || !peerPort) {
            return res.status(400).send({ error: 'channelName and peerPort are required.' });
        }

        const chaincodes = [
            {
                name: 'DataVerifier',
                path: path.join(process.cwd(), '../blockchain/Chaincodes/DataVerifier/'),
                policy: `OR('${orgName}MSP.peer')`,
                version: '1',
                sequence: 1,
            },
            {
                name: 'DataCollector',
                path: path.join(process.cwd(), '../blockchain/Chaincodes/DataCollector/'),
                policy: `OR('${orgName}MSP.peer')`,
                version: '1',
                sequence: 1,
            },
            {
                name: 'Registration',
                path: path.join(process.cwd(), '../blockchain/Chaincodes/Registration/'),
                policy: `OR('${orgName}MSP.peer')`,
                version: '1',
                sequence: 1,
            },
            {
                name: 'VaccinationOrg',
                path: path.join(process.cwd(), '../blockchain/Chaincodes/VaccinationOrg/'),
                policy: `OR('${orgName}MSP.peer')`,
                version: '1',
                sequence: 1,
            },
            {
                name: 'Children',
                path: path.join(process.cwd(), '../blockchain/Chaincodes/Children/'),
                policy: `OR('${orgName}MSP.peer')`,
                version: '1',
                sequence: 1,
            },
            {
                name: 'Vaccination',
                path: path.join(process.cwd(), '../blockchain/Chaincodes/Vaccination/'),
                policy: `OR('${orgName}MSP.peer')`,
                version: '1',
                sequence: 1,
            },

        ];

        const ordererCaPath = path.join(process.cwd(), '../blockchain/artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/msp/tlscacerts/tlsca.dataauth.com-cert.pem');
        const peerTlsCertPath = path.join(process.cwd(), `../blockchain/artifacts/channel/crypto-config/peerOrganizations/${lowOrg}.dataauth.com/peers/peer0.${lowOrg}.dataauth.com/tls/ca.crt`);
        const peerAddress = `localhost:${peerPort}`;

        await deploy.deployChaincode(chaincodes, channelName, ordererCaPath, peerTlsCertPath, peerAddress, orgName,lowOrg);

        res.send({ message: 'Chaincodes deployed successfully!' });
    } catch (error) {
        console.error('Deployment error:', error);
        res.status(500).send({ error: 'Deployment failed', details: error.message });
    }
});

app.post('/aa', (req, res) => {
    const { org, low_org, P0PORT, CAPORT } = req.body;

    // Validate the request body
    if (!org || !low_org || !P0PORT || !CAPORT) {
        return res.status(400).json({ message: "Missing required parameters" });
    }

    try {
        generate.generateConfigProfile(org, low_org, P0PORT, CAPORT);
        res.status(200).json({ message: `Connection profile for ${low_org} generated successfully.` });
    } catch (error) {
        res.status(500).json({ message: "Error generating connection profile", error: error.message });
    }
});


