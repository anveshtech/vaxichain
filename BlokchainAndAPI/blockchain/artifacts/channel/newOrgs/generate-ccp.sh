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
        ../../../../api/connection-profile/ccp-templates.json
}


# function yaml_ccp {
#     local PP=$(one_line_pem $4)
#     local CP=$(one_line_pem $5) 
#     sed -e "s/\${ORG}/$1/" \
#         -e "s/\${P0PORT}/$2/" \
#         -e "s/\${CAPORT}/$3/" \
#         -e "s#\${PEERPEM}#$PP#" \
#         -e "s#\${CAPEM}#$CP#" \
#         ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
# }

ORG=3
P0PORT=11051
CAPORT=11054
PEERPEM=../crypto-config/peerOrganizations/org3.example.com/tlsca/tlsca.org3.example.com-cert.pem
CAPEM=../crypto-config/peerOrganizations/org3.example.com/ca/ca.org3.example.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > ../../../../api/connection-profile/connection-org3.json
# echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > ../crypto-config/peerOrganizations/org3.example.com/connection-org3.yaml


# ORG=4
# P0PORT=12051
# CAPORT=12054
# PEERPEM=../crypto-config/peerOrganizations/org4.example.com/tlsca/tlsca.org4.example.com-cert.pem
# CAPEM=../crypto-config/peerOrganizations/org4.example.com/ca/ca.org4.example.com-cert.pem

# echo "$(json_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > ../../../../api/connection-profile/connection-org4.json
# echo "$(yaml_ccp $ORG $P0PORT $CAPORT $PEERPEM $CAPEM)" > ../crypto-config/peerOrganizations/org4.example.com/connection-org4.yaml