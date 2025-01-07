
# -----------


# configtxgen -profile Org3Channel -outputBlock ./channel-artifacts/channel2.block -channelID channel2

createChannel(){
export CORE_PEER_TLS_ENABLED = true
export FABRIC_LOGGING_SPEC=DEBUG

export CHANNEL_NAME=channel2

export ORDERER_CA=${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/msp/tlscacerts/tlsca.dataauth.com-cert.pem

export ORDERER_ADMIN_TLS_SIGN_CERT=${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/server.crt
export ORDERER_ADMIN_TLS_PRIVATE_KEY=${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/server.key

export ORDERER2_ADMIN_TLS_SIGN_CERT=${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls/server.crt
export ORDERER2_ADMIN_TLS_PRIVATE_KEY=${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls/server.key

export ORDERER3_ADMIN_TLS_SIGN_CERT=${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls/server.crt
export ORDERER3_ADMIN_TLS_PRIVATE_KEY=${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls/server.key

osnadmin channel join --channelID $CHANNEL_NAME \
    --config-block ./channel-artifacts/${CHANNEL_NAME}.block -o localhost:7053 \
    --ca-file $ORDERER_CA \
    --client-cert $ORDERER_ADMIN_TLS_SIGN_CERT \
    --client-key $ORDERER_ADMIN_TLS_PRIVATE_KEY 

sleep 2

osnadmin channel join --channelID $CHANNEL_NAME \
    --config-block ./channel-artifacts/${CHANNEL_NAME}.block -o localhost:8053 \
    --ca-file $ORDERER_CA \
    --client-cert $ORDERER2_ADMIN_TLS_SIGN_CERT \
    --client-key $ORDERER2_ADMIN_TLS_PRIVATE_KEY 

sleep 2

osnadmin channel join --channelID $CHANNEL_NAME \
    --config-block ./channel-artifacts/${CHANNEL_NAME}.block -o localhost:9053 \
    --ca-file $ORDERER_CA \
    --client-cert $ORDERER3_ADMIN_TLS_SIGN_CERT \
    --client-key $ORDERER3_ADMIN_TLS_PRIVATE_KEY 

}

# createChannel

sleep 2

joinchannel(){

export CORE_PEER_TLS_ENABLED=true
export FABRIC_CFG_PATH=${PWD}/../config/


export CORE_PEER_ADDRESS=localhost:11051
export CORE_PEER_LOCALMSPID="Org3MSP"
export CORE_PEER_MSPCONFIGPATH=${PWD}/../crypto-config/peerOrganizations/org3.dataauth.com/users/Admin@org3.dataauth.com/msp/
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/../crypto-config/peerOrganizations/org3.dataauth.com/peers/peer0.org3.dataauth.com/tls/ca.crt

# peer channel getinfo -c channel2

peer channel join -b ./channel-artifacts/channel2.block 
}

joinchannel

listchannel(){
export CHANNEL_NAME=channel2

export ORDERER_CA=${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/msp/tlscacerts/tlsca.dataauth.com-cert.pem

export ORDERER_ADMIN_TLS_SIGN_CERT=${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/server.crt
export ORDERER_ADMIN_TLS_PRIVATE_KEY=${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/server.key

osnadmin channel list --orderer-address localhost:7053 \
    --ca-file $ORDERER_CA \
    --client-cert $ORDERER_ADMIN_TLS_SIGN_CERT \
    --client-key $ORDERER_ADMIN_TLS_PRIVATE_KEY 
}

# listchannel

