#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $4)
    local CP=$(one_line_pem $5)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${CAPORT}/$3/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        -e "s#\${low_org}#$6#" \
        ./ccp-templates.json
}

ORG="dataCollector"
low_org="datacollector"
P0PORT=7051
CAPORT=7054
PEERPEM=../../blockchain/artifacts/channel/crypto-config/peerOrganizations/datacollector.dataauth.com/peers/peer0.datacollector.dataauth.com/tls/tlscacerts/tls-localhost-7054-ca-datacollector-dataauth-com.pem
CAPEM=../../blockchain/artifacts/channel/crypto-config/peerOrganizations/datacollector.dataauth.com/msp/tlscacerts/ca.crt

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $low_org)" > connection-datacollector.json


ORG="dataVerifier"
low_org="dataverifier"
P0PORT=9051
CAPORT=8054
PEERPEM=../../blockchain/artifacts/channel/crypto-config/peerOrganizations/dataverifier.dataauth.com/peers/peer0.dataverifier.dataauth.com/tls/tlscacerts/tls-localhost-8054-ca-dataverifier-dataauth-com.pem
CAPEM=../../blockchain/artifacts/channel/crypto-config/peerOrganizations/dataverifier.dataauth.com/msp/tlscacerts/ca.crt

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $low_org)" > connection-dataverifier.json


ORG="BsesTest"
low_org="bsestest"
P0PORT=11051
CAPORT=11054
PEERPEM=../../blockchain/artifacts/channel/crypto-config/peerOrganizations/bsestest.dataauth.com/peers/peer0.bsestest.dataauth.com/tls/tlscacerts/tls-localhost-11054-ca-bsestest-dataauth-com.pem
CAPEM=../../blockchain/artifacts/channel/crypto-config/peerOrganizations/bsestest.dataauth.com/msp/tlscacerts/ca.crt

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM $low_org)" > connection-bsestest.json

echo " -------------------- Conncetion Profile Generated ----------------------- "