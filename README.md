# VaxiChain  

## Overview  
VaxiChain is a blockchain-powered application designed to revolutionize the management of children's vaccination data. The platform integrates AI for gender bias detection and uses blockchain for tamper-proof vaccination records and data authenticity.  

---

## Project Structure  

### **1. BlockchainAndAPI**  
- **Purpose**:  
  This folder contains the blockchain logic and API services to manage secure and tamper-proof vaccination records.  
- **Key Features**:  
  - Blockchain smart contracts.  
  - APIs for data retrieval and record updates.  

### **2. GenderBiasAPI**  
- **Purpose**:  
  Hosts the AI module to detect and address gender-based biases in vaccination data.  
- **Key Features**:  
  - AI models for bias detection.  
  - APIs for integration with the VaxiChain application.  

### **3. PoC (Proof of Concept)**  
- **Purpose**:  
  Contains the proof-of-concept implementation for showcasing the core functionality of VaxiChain.  
- **Key Features**:  
  - Demonstrates how data verifier verifies the vaccinations  
  - Includes a basic UI/UX prototype.  

### **4. VaxichainApp**  
- **Purpose**:  
  The main application folder containing the front-end and back-end code for the VaxiChain app.  
- **Key Features**:  
  - This is a running project where data collector/verifier can sign up
  -Super admin approves and provides the blockchain nodes
  - Admin of the org, can create their users
  -Data collector user can add vaccinations info of children 
  - Admin check if there is bias in a particular vaccination center 
  - Integration with blockchain and AI services.  

---

## Features  
- Secure and tamper-proof vaccination record management using blockchain.  
- AI-powered detection and mitigation of gender bias in vaccination programs.  
- Proof of concept to demonstrate the viability of the system.  
- User-friendly application interface for healthcare providers and administrators.  

---

## Getting Started  

### Prerequisites  
- Node.js  
- Python  
- Hyperledger Fabric
- Go
- Mongo
- Next.js
- Docker (for blockchain and APIs)  

### Installation  
- Provided in the each app folder.