#!/bin/bash

# imports
. enVar.sh
. utils.sh



presetup() {
    echo "Vendoring Go dependencies for chaincodes..."
    
    # DataVerifier Chaincode
    pushd ../Chaincodes/DataVerifier/
    go mod init DataVerifier
    go mod tidy 
    GO111MODULE=on go mod vendor
    popd

    # DataCollector Chaincode
    pushd ../Chaincodes/DataCollector/
    go mod init DataCollector
    go mod tidy 
    GO111MODULE=on go mod vendor
    popd

    # Registration Chaincode
    pushd ../Chaincodes/Registration/
    go mod init Registration
    go mod tidy 
    GO111MODULE=on go mod vendor
    popd

    # VaccinationOrg Chaincode
    pushd ../Chaincodes/VaccinationOrg/
    go mod init VaccinationOrg
    go mod tidy 
    GO111MODULE=on go mod vendor
    popd

    # Children Chaincode
    pushd ../Chaincodes/Children/
    go mod init Children
    go mod tidy 
    GO111MODULE=on go mod vendor
    popd

    # Vaccination Chaincode
    pushd ../Chaincodes/Vaccination/
    go mod init Vaccination
    go mod tidy 
    GO111MODULE=on go mod vendor
    popd


    echo "Finished vendoring Go dependencies for Vaccination, DataVerifier, DataCollector,Children,VaccinationOrg, and Registration chaincodes"
}

# Chaincode variables
CC_NAME_1="DataVerifier"
CC_SRC_PATH_1="../Chaincodes/DataVerifier/"
CC_POLICY_1="OR('dataCollectorMSP.peer','dataVerifierMSP.peer')"
CC_RUNTIME_LANGUAGE_1="golang"
VERSION_1="1"
SEQUENCE_1=1

CC_NAME_2="DataCollector"
CC_SRC_PATH_2="../Chaincodes/DataCollector/"
CC_POLICY_2="OR('dataCollectorMSP.peer','dataVerifierMSP.peer')"
CC_RUNTIME_LANGUAGE_2="golang"
VERSION_2="1"
SEQUENCE_2=1

CC_NAME_3="Registration"
CC_SRC_PATH_3="../Chaincodes/Registration/"
CC_POLICY_3="OR('dataCollectorMSP.peer','dataVerifierMSP.peer')"
CC_RUNTIME_LANGUAGE_3="golang"
VERSION_3="1"
SEQUENCE_3=1

CC_NAME_4="VaccinationOrg"
CC_SRC_PATH_4="../Chaincodes/VaccinationOrg/"
CC_POLICY_4="OR('dataCollectorMSP.peer','dataVerifierMSP.peer')"
CC_RUNTIME_LANGUAGE_4="golang"
VERSION_4="1"
SEQUENCE_4=1

CC_NAME_5="Children"
CC_SRC_PATH_5="../Chaincodes/Children/"
CC_POLICY_5="OR('dataCollectorMSP.peer','dataVerifierMSP.peer')"
CC_RUNTIME_LANGUAGE_5="golang"
VERSION_5="1"
SEQUENCE_5=1

CC_NAME_6="Vaccination"
CC_SRC_PATH_6="../Chaincodes/Vaccination/"
CC_POLICY_6="OR('dataCollectorMSP.peer','dataVerifierMSP.peer')"
CC_RUNTIME_LANGUAGE_6="golang"
VERSION_6="1"
SEQUENCE_6=1

CHANNEL_NAME="channel1"

# Package Chaincodes
packageChaincode() {
    rm -rf ${CC_NAME_1}.tar.gz
    peer lifecycle chaincode package ${CC_NAME_1}.tar.gz \
        --path ${CC_SRC_PATH_1} --lang ${CC_RUNTIME_LANGUAGE_1} \
        --label ${CC_NAME_1}_${VERSION_1}

    rm -rf ${CC_NAME_2}.tar.gz
    peer lifecycle chaincode package ${CC_NAME_2}.tar.gz \
        --path ${CC_SRC_PATH_2} --lang ${CC_RUNTIME_LANGUAGE_2} \
        --label ${CC_NAME_2}_${VERSION_2}


    rm -rf ${CC_NAME_3}.tar.gz
    peer lifecycle chaincode package ${CC_NAME_3}.tar.gz \
        --path ${CC_SRC_PATH_3} --lang ${CC_RUNTIME_LANGUAGE_3} \
        --label ${CC_NAME_3}_${VERSION_3}
    

    rm -rf ${CC_NAME_4}.tar.gz
    peer lifecycle chaincode package ${CC_NAME_4}.tar.gz \
        --path ${CC_SRC_PATH_4} --lang ${CC_RUNTIME_LANGUAGE_4} \
        --label ${CC_NAME_4}_${VERSION_4}

        rm -rf ${CC_NAME_5}.tar.gz
    peer lifecycle chaincode package ${CC_NAME_5}.tar.gz \
        --path ${CC_SRC_PATH_5} --lang ${CC_RUNTIME_LANGUAGE_5} \
        --label ${CC_NAME_5}_${VERSION_5}

     rm -rf ${CC_NAME_6}.tar.gz
    peer lifecycle chaincode package ${CC_NAME_6}.tar.gz \
        --path ${CC_SRC_PATH_6} --lang ${CC_RUNTIME_LANGUAGE_6} \
        --label ${CC_NAME_6}_${VERSION_6}
    

    if [ $? -ne 0 ]; then
        echo "Error packaging chaincodes"
        exit 1
    fi
    echo "===================== Chaincodes packaged ===================== "
}

# Install Chaincodes
installChaincode() {
    # # For Org1, DataVerifier Chaincode
    setGlobals 1
    peer lifecycle chaincode install ${CC_NAME_1}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing DataVerifier chaincode"
        exit 1
    fi
    echo "===================== DataVerifier chaincode installed on peer0.DataCollector ===================== "

    # # For Org2, DataVerifier Chaincode
    setGlobals 2
    peer lifecycle chaincode install ${CC_NAME_1}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing DataVerifier chaincode on Org2"
        exit 1
    fi
    echo "===================== DataVerifier chaincode installed on peer0.DataVerifier ===================== "

    # For Org1, DataCollector Chaincode
    setGlobals 1
    peer lifecycle chaincode install ${CC_NAME_2}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing DataCollector chaincode"
        exit 1
    fi
    echo "===================== DataCollector chaincode installed on peer0.DataCollector ===================== "

    # For Org2, DataCollector Chaincode
    setGlobals 2
    peer lifecycle chaincode install ${CC_NAME_2}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing DataCollector chaincode on Org2"
        exit 1
    fi
    echo "===================== DataCollector chaincode installed on peer0.DataVerifier ===================== "

    # For Org1, Registration Chaincode
    setGlobals 1
    peer lifecycle chaincode install ${CC_NAME_3}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing Registration chaincode"
        exit 1
    fi
    echo "===================== Registration chaincode installed on peer0.DataCollector ===================== "

    # For Org2, Registration Chaincode
    setGlobals 2
    peer lifecycle chaincode install ${CC_NAME_3}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing Registration chaincode on Org2"
        exit 1
    fi
    echo "===================== Registration chaincode installed on peer0.DataVerifier ===================== "
    
    # For Org1, VaccinationOrg Chaincode
    setGlobals 1
    peer lifecycle chaincode install ${CC_NAME_4}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing VaccinationOrg chaincode"
        exit 1
    fi
    echo "===================== VaccinationOrg chaincode installed on peer0.DataCollector ===================== "

    # For Org2, VaccinationOrg Chaincode
    setGlobals 2
    peer lifecycle chaincode install ${CC_NAME_4}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing VaccinationOrg chaincode on Org2"
        exit 1
    fi
    echo "===================== VaccinationOrg chaincode installed on peer0.DataVerifier ===================== "    
    
    # For Org1, Children Chaincode
    setGlobals 1
    peer lifecycle chaincode install ${CC_NAME_5}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing Children chaincode"
        exit 1
    fi
    echo "===================== Children chaincode installed on peer0.DataCollector ===================== "

    # For Org2, Children Chaincode
    setGlobals 2
    peer lifecycle chaincode install ${CC_NAME_5}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing Children chaincode on Org2"
        exit 1
    fi
    echo "===================== Children chaincode installed on peer0.DataVerifier ===================== " 

    # For Org1, Vaccination Chaincode
    setGlobals 1
    peer lifecycle chaincode install ${CC_NAME_6}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing Vaccination chaincode"
        exit 1
    fi
    echo "===================== Vaccination chaincode installed on peer0.DataCollector ===================== "

    # For Org2, Vaccination Chaincode
    setGlobals 2
    peer lifecycle chaincode install ${CC_NAME_6}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing Vaccination chaincode on Org2"
        exit 1
    fi
    echo "===================== Vaccination chaincode installed on peer0.DataVerifier ===================== " 
    
       
    

}


# Install Chaincodes
installChaincode() {
    # # For Org1, DataVerifier Chaincode
    setGlobals 1
    peer lifecycle chaincode install ${CC_NAME_1}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing DataVerifier chaincode"
        exit 1
    fi
    echo "===================== DataVerifier chaincode installed on peer0.DataCollector ===================== "

    # For Org2, DataVerifier Chaincode
    setGlobals 2
    peer lifecycle chaincode install ${CC_NAME_1}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing DataVerifier chaincode on Org2"
        exit 1
    fi
    echo "===================== DataVerifier chaincode installed on peer0.DataVerifier ===================== "

    # For Org1, DataCollector Chaincode
    setGlobals 1
    peer lifecycle chaincode install ${CC_NAME_2}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing DataCollector chaincode"
        exit 1
    fi
    echo "===================== DataCollector chaincode installed on peer0.DataCollector ===================== "

    # For Org2, DataCollector Chaincode
    setGlobals 2
    peer lifecycle chaincode install ${CC_NAME_2}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing DataCollector chaincode on Org2"
        exit 1
    fi
    echo "===================== DataCollector chaincode installed on peer0.DataVerifier ===================== "

    # For Org1, Registration Chaincode
    setGlobals 1
    peer lifecycle chaincode install ${CC_NAME_3}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing Registration chaincode"
        exit 1
    fi
    echo "===================== Registration chaincode installed on peer0.DataCollector ===================== "

    # For Org2, Registration Chaincode
    setGlobals 2
    peer lifecycle chaincode install ${CC_NAME_3}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing Registration chaincode on Org2"
        exit 1
    fi
    echo "===================== Registration chaincode installed on peer0.DataVerifier ===================== "
    
    # For Org1, VaccinationOrg  Chaincode
    setGlobals 1
    peer lifecycle chaincode install ${CC_NAME_4}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing VaccinationOrg  chaincode"
        exit 1
    fi
    echo "===================== VaccinationOrg  chaincode installed on peer0.DataCollector ===================== "

    # For Org2, VaccinationOrg  Chaincode
    setGlobals 2
    peer lifecycle chaincode install ${CC_NAME_4}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing VaccinationOrg  chaincode on Org2"
        exit 1
    fi
    echo "===================== VaccinationOrg  chaincode installed on peer0.DataVerifier ===================== "

    # For Org1, Children  Chaincode
    setGlobals 1
    peer lifecycle chaincode install ${CC_NAME_5}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing Children chaincode"
        exit 1
    fi
    echo "===================== Children  chaincode installed on peer0.DataCollector ===================== "

    # For Org2, Children  Chaincode
    setGlobals 2
    peer lifecycle chaincode install ${CC_NAME_5}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing Children  chaincode on Org2"
        exit 1
    fi
    echo "===================== Children  chaincode installed on peer0.DataVerifier ===================== "

    # For Org1, Vaccination  Chaincode
    setGlobals 1
    peer lifecycle chaincode install ${CC_NAME_6}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing Vaccination chaincode"
        exit 1
    fi
    echo "===================== Vaccination  chaincode installed on peer0.DataCollector ===================== "

    # For Org2, Vaccination  Chaincode
    setGlobals 2
    peer lifecycle chaincode install ${CC_NAME_6}.tar.gz
    if [ $? -ne 0 ]; then
        echo "Error installing Vaccination chaincode on Org2"
        exit 1
    fi
    echo "===================== Vaccination  chaincode installed on peer0.DataVerifier ===================== "


 
}

# Query Installed Chaincodes
queryInstalled() {
    setGlobals 1
    peer lifecycle chaincode queryinstalled >&log.txt
    cat log.txt
    PACKAGE_ID_1=$(sed -n "/${CC_NAME_1}_${VERSION_1}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    PACKAGE_ID_2=$(sed -n "/${CC_NAME_2}_${VERSION_2}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    PACKAGE_ID_3=$(sed -n "/${CC_NAME_3}_${VERSION_3}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    PACKAGE_ID_4=$(sed -n "/${CC_NAME_4}_${VERSION_4}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    PACKAGE_ID_5=$(sed -n "/${CC_NAME_5}_${VERSION_5}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    PACKAGE_ID_6=$(sed -n "/${CC_NAME_6}_${VERSION_6}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)



    echo "===================== Query installed successful ===================== "
}

# Approve Chaincodes for Org1
approveForMyOrg1() {
    # # Approve DataVerifier Chaincode for Org1
    setGlobals 1
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com --tls \
        --signature-policy ${CC_POLICY_1} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME_1} --version ${VERSION_1} \
        --package-id ${PACKAGE_ID_1} \
        --sequence ${SEQUENCE_1}
        

    # Approve DataCollector Chaincode for Org1
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com --tls \
        --signature-policy ${CC_POLICY_2} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME_2} --version ${VERSION_2} \
        --package-id ${PACKAGE_ID_2} \
        --sequence ${SEQUENCE_2}

    # Approve Registration Chaincode for Org1
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com --tls \
        --signature-policy ${CC_POLICY_3} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME_3} --version ${VERSION_3} \
        --package-id ${PACKAGE_ID_3} \
        --sequence ${SEQUENCE_3}

    # Approve VaccinationOrg Chaincode for Org1
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com --tls \
        --signature-policy ${CC_POLICY_4} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME_4} --version ${VERSION_4} \
        --package-id ${PACKAGE_ID_4} \
        --sequence ${SEQUENCE_4}

    # Approve Children Chaincode for Org1
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com --tls \
        --signature-policy ${CC_POLICY_5} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME_5} --version ${VERSION_5} \
        --package-id ${PACKAGE_ID_5} \
        --sequence ${SEQUENCE_5}

    # Approve Vaccination Chaincode for Org1
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com --tls \
        --signature-policy ${CC_POLICY_6} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME_6} --version ${VERSION_6} \
        --package-id ${PACKAGE_ID_6} \
        --sequence ${SEQUENCE_6}
    

    if [ $? -ne 0 ]; then
        echo "Error approving chaincodes for Org1"
        exit 1
    fi
    echo "===================== Chaincodes approved by Org1 ===================== "
}

# Approve Chaincodes for Org2
approveForMyOrg2() {
    setGlobals 2

    # Approve DataVerifier Chaincode for Org2
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com --tls \
        --signature-policy ${CC_POLICY_1} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME_1} \
        --version ${VERSION_1} --package-id ${PACKAGE_ID_1} \
        --sequence ${SEQUENCE_1}    

    # Approve DataCollector Chaincode for Org2
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com --tls \
        --signature-policy ${CC_POLICY_2} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME_2} \
        --version ${VERSION_2} --package-id ${PACKAGE_ID_2} \
        --sequence ${SEQUENCE_2}

    # Approve Registration Chaincode for Org2
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com --tls \
        --signature-policy ${CC_POLICY_3} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME_3} \
        --version ${VERSION_3} --package-id ${PACKAGE_ID_3} \
        --sequence ${SEQUENCE_3}

    # # Approve VaccinationOrg Chaincode for Org2
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com --tls \
        --signature-policy ${CC_POLICY_4} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME_4} \
        --version ${VERSION_4} --package-id ${PACKAGE_ID_4} \
        --sequence ${SEQUENCE_4}

    # # Approve Children Chaincode for Org2
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com --tls \
        --signature-policy ${CC_POLICY_5} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME_5} \
        --version ${VERSION_5} --package-id ${PACKAGE_ID_5} \
        --sequence ${SEQUENCE_5}

    # # Approve Vaccination Chaincode for Org2
    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com --tls \
        --signature-policy ${CC_POLICY_6} \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME_6} \
        --version ${VERSION_6} --package-id ${PACKAGE_ID_6} \
        --sequence ${SEQUENCE_6}


    if [ $? -ne 0 ]; then
        echo "Error approving chaincodes for Org2"
        exit 1
    fi
    echo "===================== Chaincodes approved by Org2 ===================== "
}

checkCommitReadyness() {
    setGlobals 1

    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --signature-policy ${CC_POLICY_1} \
        --name ${CC_NAME_1} --version ${VERSION_1} --sequence ${SEQUENCE_1} --output json 
    echo "===================== checking commit readyness from DataVerifier ===================== "

    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --signature-policy ${CC_POLICY_2} \
        --name ${CC_NAME_2} --version ${VERSION_2} --sequence ${SEQUENCE_2} --output json 
    echo "===================== checking commit readyness from DataCollector ===================== "

    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --signature-policy ${CC_POLICY_3} \
        --name ${CC_NAME_3} --version ${VERSION_3} --sequence ${SEQUENCE_3} --output json 
    echo "===================== checking commit readyness from Registration ===================== "

    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --signature-policy ${CC_POLICY_4} \
        --name ${CC_NAME_4} --version ${VERSION_4} --sequence ${SEQUENCE_4} --output json 
    echo "===================== checking commit readyness from VaccinationOrg ===================== "

    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --signature-policy ${CC_POLICY_5} \
        --name ${CC_NAME_5} --version ${VERSION_5} --sequence ${SEQUENCE_5} --output json 
    echo "===================== checking commit readyness from Children ===================== "

    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --signature-policy ${CC_POLICY_6} \
        --name ${CC_NAME_6} --version ${VERSION_6} --sequence ${SEQUENCE_6} --output json 
    echo "===================== checking commit readyness from Vaccination ===================== "


    setGlobals 2

    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        --signature-policy ${CC_POLICY_1} \
        --name ${CC_NAME_1} --version ${VERSION_1} --sequence ${SEQUENCE_1} --output json 
    echo "===================== checking commit readyness from DataVerifier ===================== "

    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        --signature-policy ${CC_POLICY_2} \
        --name ${CC_NAME_2} --version ${VERSION_2} --sequence ${SEQUENCE_2} --output json 
    echo "===================== checking commit readyness from DataCollector ===================== "

    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        --signature-policy ${CC_POLICY_3} \
        --name ${CC_NAME_3} --version ${VERSION_3} --sequence ${SEQUENCE_3} --output json 
    echo "===================== checking commit readyness from Registration ===================== "

    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        --signature-policy ${CC_POLICY_4} \
        --name ${CC_NAME_4} --version ${VERSION_4} --sequence ${SEQUENCE_4} --output json 
    echo "===================== checking commit readyness from VaccinationOrg ===================== "

    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        --signature-policy ${CC_POLICY_5} \
        --name ${CC_NAME_5} --version ${VERSION_5} --sequence ${SEQUENCE_5} --output json 
    echo "===================== checking commit readyness from Children ===================== "

    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        --signature-policy ${CC_POLICY_6} \
        --name ${CC_NAME_6} --version ${VERSION_6} --sequence ${SEQUENCE_6} --output json 
    echo "===================== checking commit readyness from Vaccination ===================== "


}
# Commit Chaincodes
commitChaincodeDefination() {
    setGlobals 1
    # Commit DataVerifier Chaincode
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        --channelID $CHANNEL_NAME --name ${CC_NAME_1} \
        --signature-policy ${CC_POLICY_1} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        --version ${VERSION_1} --sequence ${SEQUENCE_1}

    # Commit DataCollector Chaincode
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        --channelID $CHANNEL_NAME --name ${CC_NAME_2} \
        --signature-policy ${CC_POLICY_2} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        --version ${VERSION_2} --sequence ${SEQUENCE_2}

    # Commit Registration Chaincode
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        --channelID $CHANNEL_NAME --name ${CC_NAME_3} \
        --signature-policy ${CC_POLICY_3} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        --version ${VERSION_3} --sequence ${SEQUENCE_3}
    
    # Commit VaccinationOrg Chaincode
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        --channelID $CHANNEL_NAME --name ${CC_NAME_4} \
        --signature-policy ${CC_POLICY_4} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        --version ${VERSION_4} --sequence ${SEQUENCE_4}

    # Commit Children Chaincode
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        --channelID $CHANNEL_NAME --name ${CC_NAME_5} \
        --signature-policy ${CC_POLICY_5} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        --version ${VERSION_5} --sequence ${SEQUENCE_5}

    # Commit Vaccination Chaincode
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        --channelID $CHANNEL_NAME --name ${CC_NAME_6} \
        --signature-policy ${CC_POLICY_6} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        --version ${VERSION_5} --sequence ${SEQUENCE_6}

    if [ $? -ne 0 ]; then
        echo "Error committing chaincodes"
        exit 1
    fi
    echo "===================== Chaincodes committed ===================== "
}

# Query committed chaincodes
queryCommitted() {
    setGlobals 1
    peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME
    echo "===================== Query committed chaincodes ===================== "
}

check1() {
    setGlobals 1  

    # Create Admin User
    echo "Creating User"
    peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME_4} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        -c '{"function":"CreateUser","Args":["user126", "company001", "Tech Corp", "John", "Doe", "john.doe@example.com", "1234567890", "10001", "New York", "USA", "123 Elm Street","DataCollector", "securepassword", "enabled","", "profilepic.jpg", "2024-12-01T12:00:00Z", "2024-12-01T12:00:00Z"]}'
    sleep 5

    echo "Querying User after creation"
    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME_4} \
        -c '{"function":"QueryUser","Args":["user126"]}'

    sleep 5  

    echo "Updating User"
    peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME_4} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        -c '{"function":"UpdateUser","Args":["user126", "company001", "Tech Corp Updated", "John", "Smith", "john.smith@example.com", "0987654321", "10002", "Los Angeles", "USA", "456 Oak Street"]}'
    
    sleep 5

    peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME_4} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA  \
        -c '{"function":"ChangeUserStatus","Args":["user126","disabled"]}'

    sleep 5

    echo "Querying User after update"
    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME_4} \
        -c '{"Args":["QueryUser","user126"]}'

    sleep 5 

    echo "User Hash"
    peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME_4} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        -c '{"function":"GetUsersWithHashes","Args":["user126"]}'


    peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME_4} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        -c '{
                "function":"AddVaccinationCenter",
                "Args":[
                "RC002", 
                "Central Vaccination Center", 
                "{\"wardNo\": \"12\", \"municipality\": \"Budhanilkantha\"}", 
                "2024-12-31", 
                "Sunny", 
                "150", 
                "180", 
                "[{\"name\": \"Dr. Smith\", \"phone\": \"123-456-7890\", \"_id\":\"HP001\"}]", 
                "ongoing", 
                "yes", 
                "{\"observerName\": \"Dr. Smith\", \"observerPhone\": \"123-456-7890\",\"_id\": \"hello1\"}", 
                "clear", 
                "[{\"_id\": \"user1\", \"companyName\": \"Vaccination Corp\", \"userType\": \"Admin\"}, {\"_id\": \"user2\", \"companyName\": \"HealthCare Ltd.\", \"userType\": \"User\"}]",
                 "{\"_id\":\"DCUser1\",\"firstName\":\"John\",\"userType\":\"Data Collector\"}",
                  "{\"_id\":\"DVUser1\",\"firstName\":\"Mayer\",\"userType\":\"Data Verifier\"}",
                "createdAt",
                "updatedAt"
                ]
            }'

        
    
    sleep 5 
    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME_4} \
    -c '{"function":"QueryVaccinationCenter","Args":["RC002"]}' 
     sleep 5 

     peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME_4} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        -c '{"Args":["AssignDataCollector","RC002", "user123", "Dristi", "Data Collector"]}'
    sleep 5 

    peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME_4} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        -c '{"Args":["AssignDataVerifier","RC002","user456", "Sauji", "Data Verifier"]}'
    sleep 5
    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME_4} \
    -c '{"function":"QueryVaccinationCenter","Args":["RC002"]}'
     

   peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME_4} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        -c '{"function":"EditVaccinationCenter","Args":["RC002", "Central Vaccination Center", "{\"wardNo\":\"Ward 1\",\"municipality\":\"City A\"}", "2025-01-01", "Sunny", "200", "150", "[{\"name\":\"Healthcare Provider 1\",\"phone\":\"123-456-7890\",\"_id\":\"HP123\"},{\"name\":\"Healthcare Provider 2\",\"phone\":\"987-654-3210\",\"_id\":\"HP456\"}]", "Completed", "Yes", "{\"observerName\":\"Observer 1\",\"observerPhone\":\"123-123-1234\"},{\"observerName\":\"Observer 2\",\"observerPhone\":\"987-987-9876\"}", "Good", "{\"_id\":\"Admin123\",\"companyName\":\"Admin Corp\",\"userType\":\"Admin\"}", "{\"_id\":\"DCUser1\",\"firstName\":\"John\",\"userType\":\"Data Collector\"}", "{\"_id\":\"DVUser1\",\"firstName\":\"Jane\",\"userType\":\"Data Verifier\"}]"}' 

    
    sleep 5 
    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME_4} \
    -c '{"function":"QueryAllVaccinationCenters","Args":[]}'
    sleep 5 
    echo "VaccinationCenter Hash"
    peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME_4} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        -c '{"function":"GetCentersWithHashes","Args":["RC002"]}'

}
checkAdmin(){
    setGlobals 2
    echo "Creating User"
    peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.dataauth.com \
        --tls --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME_3} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
        -c '{"function":"AddAdminUser","Args":["user129", "company001", "Tech Corp", "John", "Doe", "john.doe@example.com", "1234567890", "10001", "New York", "USA", "123 Elm Street","DataCollector", "securepassword", "Active",null, "profilepic.jpg", "2024-12-01T12:00:00Z", "2024-12-01T12:00:00Z"]}'
    sleep 5
    echo "Querying User after creation"
    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME_3} \
        -c '{"function":"QueryUser","Args":["user129"]}'

    sleep 5  
}

dynamic(){
  setGlobals 1
  peer chaincode invoke -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.dataauth.com \
    --tls --cafile $ORDERER_CA \
    -C $CHANNEL_NAME -n ${CC_NAME_2} \
    --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
    --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
    -c '{"function":"getListOfAssignedVacCenterCollector","Args":["DCUser1"]}'

}

children(){
setGlobals 2
peer chaincode invoke -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.dataauth.com \
    --tls --cafile $ORDERER_CA \
    -C $CHANNEL_NAME -n ${CC_NAME_5} \
    --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
    --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
    -c '{"function":"CreateChild","Args":["CH001", "John", "Doe", "5", "Male", "Sunset Blvd", "12", "City Center", "Jane Doe", "1234567890", "VC001", "City Health Center", "2025-01-01", "2025-01-01"]}'

sleep 5
peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME_5} \
    -c '{"function":"QueryChild","Args":["CH001"]}'

peer chaincode invoke -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.dataauth.com \
    --tls --cafile $ORDERER_CA \
    -C $CHANNEL_NAME -n ${CC_NAME_5} \
    --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
    --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
    -c '{"function":"UpdateChild","Args":["CH001", "John", "Smith", "6", "Male", "Maple St", "15", "Uptown", "Jane Smith", "9876543210", "VC002", "Main Clinic"]}'

sleep 5

peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME_5} \
    -c '{"function":"QueryChild","Args":["CH001"]}'


peer chaincode invoke -o localhost:7050 \
    --ordererTLSHostnameOverride orderer.dataauth.com \
    --tls --cafile $ORDERER_CA \
    -C $CHANNEL_NAME -n ${CC_NAME_5} \
    --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_DATACOLLECTOR_CA \
    --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_DATAVERIFIER_CA \
    -c '{"function":"GetChildrenWithHashes","Args":["CH001"]}'
}


presetup
packageChaincode
installChaincode
queryInstalled
approveForMyOrg1
approveForMyOrg2
checkCommitReadyness
commitChaincodeDefination
queryCommitted 
# check1
# checkAdmin
# dynamic
# children

