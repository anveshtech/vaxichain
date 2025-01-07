package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"strconv"
	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-protos-go/peer"
)

// Vaccine defines the structure for the vaccine data
type Vaccine struct {
	ID             string `json:"id"`
	VaccineName    string `json:"vaccineName"`
	VaccineCompany string `json:"vaccineCompany"`
	VaccinatedDate string `json:"vaccinatedDate"`
	VaccineType    string `json:"vaccineType"`
	ChildDetails   Child  `json:"childDetails"`
	VaccinationCenterDetails vaccinationCenterDetails  `json:"vaccinationCenterDetails"`
	CreatedAt      string `json:"createdAt"`
	UpdatedAt      string `json:"-"`
}


type vaccinationCenterDetails struct{
	ID string `json:"_id"`
	CenterName string `json:"vaccinationCenterName"`
}
// Child defines the structure for the child details
type Child struct {
	ID            string `json:"_id"`
	FirstName     string `json:"firstName"`
	GuardianName  string `json:"guardianName"`
	GuardianPhone int    `json:"guardianPhone"`
}

// VaccineChaincode implements the chaincode interface
type VaccineChaincode struct{}

// Init initializes the chaincode
func (v *VaccineChaincode) Init(stub shim.ChaincodeStubInterface) peer.Response {
	return shim.Success(nil)
}

// Invoke handles different chaincode functions and takes manual input
func (v *VaccineChaincode) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	fn, params := stub.GetFunctionAndParameters()

	// Based on the function name, call the appropriate method
	switch fn {
	case "CreateVaccine":
		// Ensure all parameters are passed correctly for CreateVaccine
		if len(params) != 13 {
			return shim.Error("Incorrect number of arguments. Expecting 13 parameters for CreateVaccine.")
		}
		guardianPhone, err := strconv.Atoi(params[8])
			if err != nil {
				return shim.Error(fmt.Sprintf("Error converting total boys to int: %v", err))
			}
		return v.CreateVaccine(stub, params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7],guardianPhone,params[9],params[10], params[11], params[12])

	case "QueryVaccine":
		// Ensure only 1 parameter (vaccine ID) is passed for QueryVaccine
		if len(params) != 1 {
			return shim.Error("Incorrect number of arguments. Expecting 1 parameter for QueryVaccine.")
		}
		return v.QueryVaccine(stub, params[0])

	case "UpdateVaccine":
		// Ensure all parameters are passed correctly for UpdateVaccine
		if len(params) != 11 {
			return shim.Error("Incorrect number of arguments. Expecting 12 parameters for UpdateVaccine.")
		}
		guardianPhone, err := strconv.Atoi(params[8])
			if err != nil {
				return shim.Error(fmt.Sprintf("Error converting total boys to int: %v", err))
			}
		return v.UpdateVaccine(stub, params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7],guardianPhone,params[9],params[10])

	case "DeleteVaccine":
		// Ensure only 1 parameter (vaccine ID) is passed for DeleteVaccine
		if len(params) != 1 {
			return shim.Error("Incorrect number of arguments. Expecting 1 parameter for DeleteVaccine.")
		}
		return v.DeleteVaccine(stub, params[0])
	case "GetVaccineWithHashes":
		if len(params) < 1 {
			return shim.Error("GetVaccineWithHashes function requires at least one Vaccine ID")
		}
		return v.GetVaccineWithHashes(stub, params)
	default:
		return shim.Error("Invalid function name.")
	}
}

// CreateVaccine creates a new vaccine record with manual input
func (v *VaccineChaincode) CreateVaccine(stub shim.ChaincodeStubInterface, id, vaccineName, vaccineCompany, vaccinatedDate, vaccineType, childID, firstName, guardianName string, guardianPhone int, centerid,centername,createdAt, updatedAt string) peer.Response {
	// Create child structure
	child := Child{
		ID:            childID,
		FirstName:     firstName,
		GuardianName:  guardianName,
		GuardianPhone: guardianPhone,
	}
	centerdetails := vaccinationCenterDetails{
		ID:		centerid,
		CenterName:  centername,  
	}

	// Create vaccine structure
	vaccine := Vaccine{
		ID:             id,
		VaccineName:    vaccineName,
		VaccineCompany: vaccineCompany,
		VaccinatedDate: vaccinatedDate,
		VaccineType:    vaccineType,
		ChildDetails:   child,
		VaccinationCenterDetails: centerdetails,
		CreatedAt:      createdAt,
		UpdatedAt:      updatedAt,
	}

	vaccineJSON, err := json.Marshal(vaccine)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to marshal vaccine data: %s", err))
	}

	err = stub.PutState(id, vaccineJSON)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to create vaccine record: %s", err))
	}

	return shim.Success([]byte("Vaccine record created successfully."))
}

// QueryVaccine queries a vaccine record by ID (manual input for the ID)
func (v *VaccineChaincode) QueryVaccine(
	stub shim.ChaincodeStubInterface,
	ID string,
) peer.Response {

	// Check if child record exists
	vaccineBytes, err := stub.GetState(ID)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to read from world state: %s", err))
	}
	if vaccineBytes == nil {
		return shim.Error(fmt.Sprintf("Child record with ID %s does not exist", ID))
	}

	// Deserialize the data into a Child struct
	var vaccine Vaccine
	err = json.Unmarshal(vaccineBytes, &vaccine)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to unmarshal vaccine data: %s", err))
	}

	// Marshal the child struct back to JSON to return it in the response
	vaccineResponseBytes, err := json.Marshal(vaccine)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to marshal vaccine response: %s", err))
	}

	return shim.Success(vaccineResponseBytes)
}

// UpdateVaccine updates an existing vaccine record with manual input
func (v *VaccineChaincode) UpdateVaccine(stub shim.ChaincodeStubInterface, id, vaccineName, vaccineCompany, vaccinatedDate, vaccineType, childID, firstName, guardianName string, guardianPhone int,centerid,centername string) peer.Response {
	// Retrieve the existing vaccine record
	vaccineJSON, err := stub.GetState(id)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to read vaccine record: %s", err))
	}
	if vaccineJSON == nil {
		return shim.Error("Vaccine record not found.")
	}

	// Unmarshal the vaccine data
	var vaccine Vaccine
	err = json.Unmarshal(vaccineJSON, &vaccine)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to unmarshal vaccine data: %s", err))
	}

	// Update the vaccine details
	vaccine.VaccineName = vaccineName
	vaccine.VaccineCompany = vaccineCompany
	vaccine.VaccinatedDate = vaccinatedDate
	vaccine.VaccineType = vaccineType
	vaccine.ChildDetails.ID = childID
	vaccine.ChildDetails.FirstName = firstName
	vaccine.ChildDetails.GuardianName = guardianName
	vaccine.ChildDetails.GuardianPhone = guardianPhone
	vaccine.VaccinationCenterDetails.ID = centerid
	vaccine.VaccinationCenterDetails.CenterName = centername

	// Marshal and store the updated vaccine record
	vaccineJSON, err = json.Marshal(vaccine)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to marshal updated vaccine data: %s", err))
	}

	err = stub.PutState(id, vaccineJSON)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to update vaccine record: %s", err))
	}

	return shim.Success([]byte("Vaccine record updated successfully."))
}

// DeleteVaccine deletes an existing vaccine record by ID
func (v *VaccineChaincode) DeleteVaccine(stub shim.ChaincodeStubInterface, id string) peer.Response {
	// Check if the vaccine record exists
	vaccineJSON, err := stub.GetState(id)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to read vaccine record: %s", err))
	}
	if vaccineJSON == nil {
		return shim.Error("Vaccine record not found.")
	}

	// Delete the vaccine record
	err = stub.DelState(id)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to delete vaccine record: %s", err))
	}

	return shim.Success([]byte("Vaccine record deleted successfully."))
}

func (v *VaccineChaincode) GetVaccineWithHashes(stub shim.ChaincodeStubInterface, ids []string) peer.Response {
    // Prepare a slice to hold the results
    var vaccineHashes []map[string]interface{}

    // Iterate over each provided ID
    for _, id := range ids {
        // Query the Child using the QueryChild method
        queryResponse := v.QueryVaccine(stub, id)

        // Check if the QueryChild call was successful
        if queryResponse.Status != shim.OK {
            // If QueryChild fails, mark as pending
            vaccineHash := map[string]interface{}{
                "id":        id,
                "childName":      "Pending",
                "blockHash": "Pending",
            }
            // Append the pending result to the list
            vaccineHashes = append(vaccineHashes, vaccineHash)
            continue
        }

        // Unmarshal the response payload into a Child object (assuming it's in JSON format)
        var Vaccine Vaccine 
        err := json.Unmarshal(queryResponse.Payload, &Vaccine)
        if err != nil {
            return shim.Error(fmt.Sprintf("Failed to unmarshal Child data for %s: %v", id, err))
        }

        // Marshal the Child data to JSON
        VaccineBytes, err := json.Marshal(Vaccine)
        if err != nil {
            return shim.Error(fmt.Sprintf("Failed to marshal Child data for %s: %v", id, err))
        }

        // Generate SHA-256 hash of the child data
        hash := sha256.New()
        hash.Write(VaccineBytes)
        hashBytes := hash.Sum(nil)
        hashHex := fmt.Sprintf("%x", hashBytes) 

        // Create a response map for each child with the hash
        vaccineHash := map[string]interface{}{
            "id":        Vaccine.ID,
            "vaccineName":  Vaccine.VaccineName,
            "blockHash": hashHex,
        }

        // Append the individual result to the list
        vaccineHashes = append(vaccineHashes, vaccineHash)
    }

    // Marshal the list of child hashes to JSON
    responseBytes, err := json.Marshal(vaccineHashes)
    if err != nil {
        return shim.Error(fmt.Sprintf("Failed to marshal response: %v", err))
    }

    // Return the response with the list of child hashes
    return shim.Success(responseBytes)
}


func main() {
	err := shim.Start(new(VaccineChaincode))
	if err != nil {
		fmt.Printf("Error starting VaccineChaincode: %s", err)
	}
}