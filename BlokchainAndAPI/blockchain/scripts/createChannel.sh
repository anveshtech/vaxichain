#!/bin/bash

# imports  
. enVar.sh
. utils.sh

CHANNEL_NAME='channel1'

createChannel(){
    setGlobals 1
    osnadmin channel join --channelID $CHANNEL_NAME \
    --config-block ../channel-artifacts/${CHANNEL_NAME}.block -o localhost:7053 \
    --ca-file $ORDERER_CA \
    --client-cert $ORDERER_ADMIN_TLS_SIGN_CERT \
    --client-key $ORDERER_ADMIN_TLS_PRIVATE_KEY 

    setGlobals 1
    osnadmin channel join --channelID $CHANNEL_NAME \
    --config-block ../channel-artifacts/${CHANNEL_NAME}.block -o localhost:8053 \
    --ca-file $ORDERER_CA \
    --client-cert $ORDERER2_ADMIN_TLS_SIGN_CERT \
    --client-key $ORDERER2_ADMIN_TLS_PRIVATE_KEY 

    setGlobals 1
    osnadmin channel join --channelID $CHANNEL_NAME \
    --config-block ../channel-artifacts/${CHANNEL_NAME}.block -o localhost:9053 \
    --ca-file $ORDERER_CA \
    --client-cert $ORDERER3_ADMIN_TLS_SIGN_CERT \
    --client-key $ORDERER3_ADMIN_TLS_PRIVATE_KEY 

}

createChannel

sleep 3

joinChannel(){ 
    sleep 5
    FABRIC_CFG_PATH=${FABRIC_CFG_PATH}
    setGlobals 1
    peer channel join -b ../channel-artifacts/${CHANNEL_NAME}.block

    sleep 5
    
    setGlobals 2
    peer channel join -b ../channel-artifacts/${CHANNEL_NAME}.block
    
}

joinChannel

# peer channel fetch

# createChannel
# joinChannel
# setAnchorPeer