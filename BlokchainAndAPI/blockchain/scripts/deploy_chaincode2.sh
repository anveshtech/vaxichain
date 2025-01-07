#!/bin/bash
cd /home/bishesh/DA/blockchain/scripts

set -e

# Parameters from deployChaincode.js
CC_NAME="$1"
CC_SRC_PATH="$2"
CC_POLICY="$3"
VERSION="$4"
SEQUENCE="$5"
CHANNEL_NAME="$6"
ORDERER_CA="$7"
PEER_ADDRESS="$8"
orgNAME="$9"
mspName=${10}

export CORE_PEER_TLS_ENABLED=true

export FABRIC_CFG_PATH=${PWD}/../artifacts/channel/config
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/${orgNAME}.dataauth.com/peers/peer0.${orgNAME}.dataauth.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/${orgNAME}.dataauth.com/users/Admin@${orgNAME}.dataauth.com/msp/
export CORE_PEER_ADDRESS=${PEER_ADDRESS}

export ORDERER_CA=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/msp/tlscacerts/tlsca.dataauth.com-cert.pem

install() {
    echo "Installing chaincode $CHAINCODE_NAME..."
    peer lifecycle chaincode install ${CC_NAME}.tar.gz 
}

queryInstalled() {
    echo "Querying installed chaincodes..."
    peer lifecycle chaincode queryinstalled >&log.txt
    cat log.txt
    PACKAGE_ID=$(sed -n "/${CC_NAME}_${VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    echo "Package ID: $PACKAGE_ID"
}

approve() {
    export CORE_PEER_TLS_ENABLED=true
    export FABRIC_CFG_PATH=${PWD}/../artifacts/channel/config
    export CORE_PEER_LOCALMSPID="Org3MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/${orgNAME}.dataauth.com/peers/peer0.${orgNAME}.dataauth.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/${orgNAME}.dataauth.com/users/Admin@${orgNAME}.dataauth.com/msp/
    export CORE_PEER_ADDRESS=${PEER_ADDRESS}

    export ORDERER_CA=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/msp/tlscacerts/tlsca.dataauth.com-cert.pem

    echo "Approving chaincode $CC_NAME for organization..."

    # Ensure all required environment variables are set
    if [ -z "$CC_NAME" ] || [ -z "$VERSION" ] || [ -z "$PACKAGE_ID" ] || [ -z "$SEQUENCE" ] || [ -z "$CC_POLICY" ] || [ -z "$ORDERER_CA" ] || [ -z "$CHANNEL_NAME" ]; then
        echo "Error: Missing required environment variables."
        exit 1
    fi

    peer lifecycle chaincode approveformyorg \
        -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls \
        --cafile $ORDERER_CA \
        --channelID $CHANNEL_NAME \
        --name $CC_NAME \
        --version $VERSION \
        --package-id $PACKAGE_ID \
        --sequence $SEQUENCE \
        --signature-policy $CC_POLICY \
        --waitForEvent
}

checkCommitReadyness() {
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses $PEER_ADDRESS --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE \
        --signature-policy ${CC_POLICY} \
        --name ${CC_NAME} --version ${VERSION} --sequence ${SEQUENCE} --output json 
}

commit() {
    echo "Committing chaincode $CC_NAME..."
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --signature-policy ${CC_POLICY} \
        --peerAddresses ${PEER_ADDRESS} --tlsRootCertFiles $CORE_PEER_TLS_ROOTCERT_FILE \
        --version ${VERSION} --sequence ${SEQUENCE}
}

queryCommitted() {
    peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME
    echo "===================== Query committed chaincodes ===================== "
}

install
queryInstalled
echo "PACKAGE: ${PACKAGE_ID}"
approve
checkCommitReadyness
commit
queryCommitted



echo "Chaincode $CC_NAME deployed successfully!"
