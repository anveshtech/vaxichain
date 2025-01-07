# imports
. utils.sh


export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/msp/tlscacerts/tlsca.dataauth.com-cert.pem
export PEER0_DATACOLLECTOR_CA=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/datacollector.dataauth.com/peers/peer0.datacollector.dataauth.com/tls/ca.crt
export PEER0_DATAVERIFIER_CA=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/dataverifier.dataauth.com/peers/peer0.dataverifier.dataauth.com/tls/ca.crt

export FABRIC_CFG_PATH=${PWD}/../artifacts/channel/config/

export ORDERER_ADMIN_TLS_SIGN_CERT=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/server.crt
export ORDERER_ADMIN_TLS_PRIVATE_KEY=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/server.key

export ORDERER2_ADMIN_TLS_SIGN_CERT=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls/server.crt
export ORDERER2_ADMIN_TLS_PRIVATE_KEY=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls/server.key

export ORDERER3_ADMIN_TLS_SIGN_CERT=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls/server.crt
export ORDERER3_ADMIN_TLS_PRIVATE_KEY=${PWD}/../artifacts/channel/crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls/server.key

# Set environment variables for the peer org
setGlobals() {
  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi
  infoln "Using organization ${USING_ORG}"
  if [ $USING_ORG -eq 1 ]; then
    export CORE_PEER_LOCALMSPID="dataCollectorMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_DATACOLLECTOR_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/datacollector.dataauth.com/users/Admin@datacollector.dataauth.com/msp/
    export CORE_PEER_ADDRESS=localhost:7051
  elif [ $USING_ORG -eq 2 ]; then
    export CORE_PEER_LOCALMSPID="dataVerifierMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_DATAVERIFIER_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/../artifacts/channel/crypto-config/peerOrganizations/dataverifier.dataauth.com/users/Admin@dataverifier.dataauth.com/msp/
    export CORE_PEER_ADDRESS=localhost:9051
  else
    errorln "ORG Unknown"
  fi

  if [ "$VERBOSE" == "true" ]; then
    env | grep CORE
  fi
}

# Set environment variables for use in the CLI container
setGlobalsCLI() {
  setGlobals $1

  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi
  if [ $USING_ORG -eq 1 ]; then
    export CORE_PEER_ADDRESS=peer0.datacollector.dataauth.com:7051
  elif [ $USING_ORG -eq 2 ]; then
    export CORE_PEER_ADDRESS=peer0.dataverifier.dataauth.com:9051
  else
    errorln "ORG Unknown"
  fi
}

# parsePeerConnectionParameters $@
# Helper function that sets the peer connection parameters for a chaincode
# operation
parsePeerConnectionParameters() {
  PEER_CONN_PARMS=()
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals $1
    PEER="peer0.org$1"
    ## Set peer addresses
    if [ -z "$PEERS" ]
    then
	PEERS="$PEER"
    else
	PEERS="$PEERS $PEER"
    fi
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" --peerAddresses $CORE_PEER_ADDRESS)
    ## Set path to TLS certificate
    CA=PEER0_ORG$1_CA
    TLSINFO=(--tlsRootCertFiles "${!CA}")
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" "${TLSINFO[@]}")
    # shift by one to get to the next organization
    shift
  done
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    fatalln "$2"
  fi
}