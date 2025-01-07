
  # ---------------------------------------------------------------------------
  #  * Data Collector

createCertificatesForDataCollector(){
  echo
  echo "Enroll the CA admin"
  echo
  mkdir -p ../crypto-config/peerOrganizations/datacollector.dataauth.com/
  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/

   
  fabric-ca-client enroll -u https://admin:adminpw@localhost:7054 --caname ca.datacollector.dataauth.com --tls.certfiles ${PWD}/fabric-ca/datacollector/tls-cert.pem

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-datacollector-dataauth-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-datacollector-dataauth-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-datacollector-dataauth-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-7054-ca-datacollector-dataauth-com.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/msp/config.yaml

  echo
  echo "Register peer0"
  echo
  fabric-ca-client register --caname ca.datacollector.dataauth.com --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/datacollector/tls-cert.pem

  echo
  echo "Register user"
  echo
  fabric-ca-client register --caname ca.datacollector.dataauth.com --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/fabric-ca/datacollector/tls-cert.pem

  echo
  echo "Register the org admin"
  echo
  fabric-ca-client register --caname ca.datacollector.dataauth.com --id.name datacollectoradmin --id.secret datacollectoradminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/datacollector/tls-cert.pem

  mkdir -p ../crypto-config/peerOrganizations/datacollector.dataauth.com/peers
  

  # -----------------------------------------------------------------------------------
  #  Peer 0

  mkdir -p ../crypto-config/peerOrganizations/datacollector.dataauth.com/peers/peer0.datacollector.dataauth.com

  echo
  echo "## Generate the peer0 msp"
  echo
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca.datacollector.dataauth.com -M ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/peers/peer0.datacollector.dataauth.com/msp --csr.hosts peer0.datacollector.dataauth.com --tls.certfiles ${PWD}/fabric-ca/datacollector/tls-cert.pem

  cp ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/peers/peer0.datacollector.dataauth.com/msp/config.yaml

  echo
  echo "## Generate the peer0-tls certificates"
  echo
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:7054 --caname ca.datacollector.dataauth.com -M ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/peers/peer0.datacollector.dataauth.com/tls --enrollment.profile tls --csr.hosts peer0.datacollector.dataauth.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/datacollector/tls-cert.pem

  cp ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/peers/peer0.datacollector.dataauth.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/peers/peer0.datacollector.dataauth.com/tls/ca.crt
  cp ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/peers/peer0.datacollector.dataauth.com/tls/signcerts/* ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/peers/peer0.datacollector.dataauth.com/tls/server.crt
  cp ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/peers/peer0.datacollector.dataauth.com/tls/keystore/* ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/peers/peer0.datacollector.dataauth.com/tls/server.key

  mkdir ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/peers/peer0.datacollector.dataauth.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/tlsca
  cp ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/peers/peer0.datacollector.dataauth.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/tlsca/tlsca.datacollector.dataauth.com-cert.pem

  mkdir ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/ca
  cp ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/peers/peer0.datacollector.dataauth.com/msp/cacerts/* ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/ca/ca.datacollector.dataauth.com-cert.pem

  # --------------------------------------------------------------------------------------------------

  mkdir -p ../crypto-config/peerOrganizations/datacollector.dataauth.com/users
  mkdir -p ../crypto-config/peerOrganizations/datacollector.dataauth.com/users/User1@datacollector.dataauth.com

  echo
  echo "## Generate the user msp"
  echo
  fabric-ca-client enroll -u https://user1:user1pw@localhost:7054 --caname ca.datacollector.dataauth.com -M ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/users/User1@datacollector.dataauth.com/msp --tls.certfiles ${PWD}/fabric-ca/datacollector/tls-cert.pem
  cp ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/users/User1@datacollector.dataauth.com/msp/keystore/* ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/users/User1@datacollector.dataauth.com/msp/keystore/priv_sk
  mkdir -p ../crypto-config/peerOrganizations/datacollector.dataauth.com/users/Admin@datacollector.dataauth.com

  echo
  echo "## Generate the org admin msp"
  echo
  fabric-ca-client enroll -u https://datacollectoradmin:datacollectoradminpw@localhost:7054 --caname ca.datacollector.dataauth.com -M ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/users/Admin@datacollector.dataauth.com/msp --tls.certfiles ${PWD}/fabric-ca/datacollector/tls-cert.pem
  cp ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/users/Admin@datacollector.dataauth.com/msp/keystore/* ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/users/Admin@datacollector.dataauth.com/msp/keystore/priv_sk
  cp ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/datacollector.dataauth.com/users/Admin@datacollector.dataauth.com/msp/config.yaml

}

  # ---------------------------------------------------------------------------
  #  * Data Verifier

createCertificatesForDataVerifier() {
  echo
  echo "Enroll the CA admin"
  echo
  mkdir -p /../crypto-config/peerOrganizations/dataverifier.dataauth.com/

  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/

   
  fabric-ca-client enroll -u https://admin:adminpw@localhost:8054 --caname ca.dataverifier.dataauth.com --tls.certfiles ${PWD}/fabric-ca/dataverifier/tls-cert.pem
   

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-dataverifier-dataauth-com.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-dataverifier-dataauth-com.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-dataverifier-dataauth-com.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-8054-ca-dataverifier-dataauth-com.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/msp/config.yaml

  echo
  echo "Register peer0"
  echo
   
  fabric-ca-client register --caname ca.dataverifier.dataauth.com --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/fabric-ca/dataverifier/tls-cert.pem
   

  echo
  echo "Register user"
  echo
   
  fabric-ca-client register --caname ca.dataverifier.dataauth.com --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/fabric-ca/dataverifier/tls-cert.pem
   

  echo
  echo "Register the org admin"
  echo
   
  fabric-ca-client register --caname ca.dataverifier.dataauth.com --id.name dataverifieradmin --id.secret dataverifieradminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/dataverifier/tls-cert.pem
   

  mkdir -p ../crypto-config/peerOrganizations/dataverifier.dataauth.com/peers
  mkdir -p ../crypto-config/peerOrganizations/dataverifier.dataauth.com/peers/peer0.dataverifier.dataauth.com

  # --------------------------------------------------------------
  # Peer 0
  echo
  echo "## Generate the peer0 msp"
  echo
   
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca.dataverifier.dataauth.com -M ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/peers/peer0.dataverifier.dataauth.com/msp --csr.hosts peer0.dataverifier.dataauth.com --tls.certfiles ${PWD}/fabric-ca/dataverifier/tls-cert.pem
   

  cp ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/peers/peer0.dataverifier.dataauth.com/msp/config.yaml

  echo
  echo "## Generate the peer0-tls certificates"
  echo
   
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:8054 --caname ca.dataverifier.dataauth.com -M ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/peers/peer0.dataverifier.dataauth.com/tls --enrollment.profile tls --csr.hosts peer0.dataverifier.dataauth.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/dataverifier/tls-cert.pem
   

  cp ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/peers/peer0.dataverifier.dataauth.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/peers/peer0.dataverifier.dataauth.com/tls/ca.crt
  cp ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/peers/peer0.dataverifier.dataauth.com/tls/signcerts/* ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/peers/peer0.dataverifier.dataauth.com/tls/server.crt
  cp ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/peers/peer0.dataverifier.dataauth.com/tls/keystore/* ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/peers/peer0.dataverifier.dataauth.com/tls/server.key

  mkdir ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/peers/peer0.dataverifier.dataauth.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/msp/tlscacerts/ca.crt

  mkdir ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/tlsca
  cp ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/peers/peer0.dataverifier.dataauth.com/tls/tlscacerts/* ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/tlsca/tlsca.dataverifier.dataauth.com-cert.pem

  mkdir ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/ca
  cp ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/peers/peer0.dataverifier.dataauth.com/msp/cacerts/* ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/ca/ca.dataverifier.dataauth.com-cert.pem

  # --------------------------------------------------------------------------------
 
  mkdir -p ../crypto-config/peerOrganizations/dataverifier.dataauth.com/users
  mkdir -p ../crypto-config/peerOrganizations/dataverifier.dataauth.com/users/User1@dataverifier.dataauth.com

  echo
  echo "## Generate the user msp"
  echo
   
  fabric-ca-client enroll -u https://user1:user1pw@localhost:8054 --caname ca.dataverifier.dataauth.com -M ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/users/User1@dataverifier.dataauth.com/msp --tls.certfiles ${PWD}/fabric-ca/dataverifier/tls-cert.pem
  cp ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/users/User1@dataverifier.dataauth.com/msp/keystore/* ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/users/User1@dataverifier.dataauth.com/msp/keystore/priv_sk

  mkdir -p ../crypto-config/peerOrganizations/dataverifier.dataauth.com/users/Admin@dataverifier.dataauth.com

  echo
  echo "## Generate the org admin msp"
  echo
   
  fabric-ca-client enroll -u https://dataverifieradmin:dataverifieradminpw@localhost:8054 --caname ca.dataverifier.dataauth.com -M ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/users/Admin@dataverifier.dataauth.com/msp --tls.certfiles ${PWD}/fabric-ca/dataverifier/tls-cert.pem
  cp ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/users/Admin@dataverifier.dataauth.com/msp/keystore/* ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/users/Admin@dataverifier.dataauth.com/msp/keystore/priv_sk

  cp ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/msp/config.yaml ${PWD}/../crypto-config/peerOrganizations/dataverifier.dataauth.com/users/Admin@dataverifier.dataauth.com/msp/config.yaml

}

  # ---------------------------------------------------------------------------
  #  * Orderers 

createCretificatesForOrderer() {
  echo
  echo "Enroll the CA admin"
  echo
  mkdir -p ../crypto-config/ordererOrganizations/dataauth.com

  export FABRIC_CA_CLIENT_HOME=${PWD}/../crypto-config/ordererOrganizations/dataauth.com

   
  fabric-ca-client enroll -u https://admin:adminpw@localhost:9054 --caname ca-orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-9054-ca-orderer.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/../crypto-config/ordererOrganizations/dataauth.com/msp/config.yaml

  echo
  echo "Register orderer"
  echo
   
  fabric-ca-client register --caname ca-orderer --id.name orderer --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  echo
  echo "Register orderer2"
  echo
   
  fabric-ca-client register --caname ca-orderer --id.name orderer2 --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  echo
  echo "Register orderer3"
  echo
   
  fabric-ca-client register --caname ca-orderer --id.name orderer3 --id.secret ordererpw --id.type orderer --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  echo
  echo "Register the orderer admin"
  echo
   
  fabric-ca-client register --caname ca-orderer --id.name ordererAdmin --id.secret ordererAdminpw --id.type admin --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  mkdir -p ../crypto-config/ordererOrganizations/dataauth.com/orderers
  # mkdir -p ../crypto-config/ordererOrganizations/dataauth.com/orderers/dataauth.com

  # ---------------------------------------------------------------------------
  #  Orderer

  mkdir -p ../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com

  echo
  echo "## Generate the orderer msp"
  echo
   
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/msp --csr.hosts orderer.dataauth.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo
   
  fabric-ca-client enroll -u https://orderer:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls --enrollment.profile tls --csr.hosts orderer.dataauth.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/ca.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/signcerts/* ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/server.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/keystore/* ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/server.key

  mkdir ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/msp/tlscacerts/tlsca.dataauth.com-cert.pem

  mkdir ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer.dataauth.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/msp/tlscacerts/tlsca.dataauth.com-cert.pem

  # -----------------------------------------------------------------------
  #  Orderer 2

  mkdir -p ../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com

  echo
  echo "## Generate the orderer msp"
  echo
   
  fabric-ca-client enroll -u https://orderer2:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/msp --csr.hosts orderer2.dataauth.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo
   
  fabric-ca-client enroll -u https://orderer2:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls --enrollment.profile tls --csr.hosts orderer2.dataauth.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls/ca.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls/signcerts/* ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls/server.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls/keystore/* ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls/server.key

  mkdir ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/msp/tlscacerts/tlsca.dataauth.com-cert.pem

  # mkdir ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/msp/tlscacerts
  # cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer2.dataauth.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/msp/tlscacerts/tlsca.dataauth.com-cert.pem

  # ---------------------------------------------------------------------------
  #  Orderer 3
  mkdir -p ../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com

  echo
  echo "## Generate the orderer msp"
  echo
   
  fabric-ca-client enroll -u https://orderer3:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/msp --csr.hosts orderer3.dataauth.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/msp/config.yaml

  echo
  echo "## Generate the orderer-tls certificates"
  echo
   
  fabric-ca-client enroll -u https://orderer3:ordererpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls --enrollment.profile tls --csr.hosts orderer3.dataauth.com --csr.hosts localhost --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls/ca.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls/signcerts/* ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls/server.crt
  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls/keystore/* ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls/server.key

  mkdir ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/msp/tlscacerts
  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/msp/tlscacerts/tlsca.dataauth.com-cert.pem

  # mkdir ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/msp/tlscacerts
  # cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/orderers/orderer3.dataauth.com/tls/tlscacerts/* ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/msp/tlscacerts/tlsca.dataauth.com-cert.pem

  # ---------------------------------------------------------------------------

  mkdir -p ../crypto-config/ordererOrganizations/dataauth.com/users
  mkdir -p ../crypto-config/ordererOrganizations/dataauth.com/users/Admin@dataauth.com

  echo
  echo "## Generate the admin msp"
  echo
   
  fabric-ca-client enroll -u https://ordererAdmin:ordererAdminpw@localhost:9054 --caname ca-orderer -M ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/users/Admin@dataauth.com/msp --tls.certfiles ${PWD}/fabric-ca/ordererOrg/tls-cert.pem
   

  cp ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/msp/config.yaml ${PWD}/../crypto-config/ordererOrganizations/dataauth.com/users/Admin@dataauth.com/msp/config.yaml

}

# Removing Old Credentials
removeOldCredentials() {
  sudo rm -rf ../../../../api/dataverifier-wallet/*
  sudo rm -rf ../../../../api/datacollector-wallet/*
  sudo rm -rf ../crypto-config/*
}

# CreateConnectionProfile For API Connection
createConnectionProfile() {
  cd ../../../../api/connection-profile && ./generate-ccp.sh
}

removeOldCredentials
createCertificatesForDataCollector
createCertificatesForDataVerifier
createCretificatesForOrderer
createConnectionProfile