package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-protos-go/peer"
)

type ChildrenChaincode struct {
}

type Address struct {
	Location     string `json:"location"`
	WardNo       int    `json:"wardNo"`
	Municipality string `json:"municipality"`
}

type GuardianDetails struct {
	GuardianName  string `json:"guardianName"`
	GuardianPhone int    `json:"guardianPhone"`
}

type VaccinationCenter struct {
	ID                    string `json:"_id"`
	VaccinationCenterName string `json:"vaccinationCenterName"`
}

type Child struct {
	ID                string            `json:"id"`
	FirstName         string            `json:"firstName"`
	LastName          string            `json:"lastName"`
	Age               int               `json:"age"`
	Gender            string            `json:"gender"`
	Address           Address           `json:"address"`
	GuardianDetails   GuardianDetails   `json:"guardianDetails"`
	VaccinationCenter VaccinationCenter `json:"vaccinationCenter"`
	CreatedAt         string            `json:"createdAt"`
	UpdatedAt         string            `json:"-"`
}

// CreateChild - Create a new child record with multiple parameters
func (c *ChildrenChaincode) CreateChild(
	stub shim.ChaincodeStubInterface,
	childID, firstName, lastName string,
	ageStr, gender, location string,
	wardNoStr, municipality, guardianName string,
	guardianPhoneStr, vaccinationCenterID, vaccinationCenterName, createdAt, updatedAt string,
) peer.Response {

	age, err := strconv.Atoi(ageStr)
	if err != nil {
		return shim.Error(fmt.Sprintf("Invalid age value: %s", err))
	}

	wardNo, err := strconv.Atoi(wardNoStr)
	if err != nil {
		return shim.Error(fmt.Sprintf("Invalid ward number value: %s", err))
	}

	guardianPhone, err := strconv.Atoi(guardianPhoneStr)
	if err != nil {
		return shim.Error(fmt.Sprintf("Invalid guardian phone number value: %s", err))
	}

	if childID == "" || firstName == "" || lastName == "" || gender == "" || location == "" || municipality == "" || vaccinationCenterID == "" || vaccinationCenterName == "" {
		return shim.Error("Missing required fields. Ensure all required fields are provided.")
	}

	child := Child{
		ID:        childID,
		FirstName: firstName,
		LastName:  lastName,
		Age:       age,
		Gender:    gender,
		Address: Address{
			Location:     location,
			WardNo:       wardNo,
			Municipality: municipality,
		},
		GuardianDetails: GuardianDetails{
			GuardianName:  guardianName,
			GuardianPhone: guardianPhone,
		},
		VaccinationCenter: VaccinationCenter{
			ID:                    vaccinationCenterID,
			VaccinationCenterName: vaccinationCenterName,
		},
		CreatedAt: createdAt,
		UpdatedAt: updatedAt,
	}

	// Marshal the child object to JSON
	childBytes, err := json.Marshal(child)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to marshal child data: %s", err))
	}

	// Store the child record in the ledger
	err = stub.PutState(childID, childBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to put child data to state: %s", err))
	}

	return shim.Success(nil)
}

// QueryChild - Retrieve a child record by ID
func (c *ChildrenChaincode) QueryChild(
	stub shim.ChaincodeStubInterface,
	childID string,
) peer.Response {

	// Check if child record exists
	childBytes, err := stub.GetState(childID)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to read from world state: %s", err))
	}
	if childBytes == nil {
		return shim.Error(fmt.Sprintf("Child record with ID %s does not exist", childID))
	}

	// Deserialize the data into a Child struct
	var child Child
	err = json.Unmarshal(childBytes, &child)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to unmarshal child data: %s", err))
	}

	// Marshal the child struct back to JSON to return it in the response
	childResponseBytes, err := json.Marshal(child)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to marshal child response: %s", err))
	}

	return shim.Success(childResponseBytes)
}

// UpdateChild - Update an existing child record with multiple parameters
func (c *ChildrenChaincode) UpdateChild(
	stub shim.ChaincodeStubInterface,
	childID, firstName, lastName string,
	ageStr, gender, location string,
	wardNoStr, municipality, guardianName string,
	guardianPhoneStr, vaccinationCenterID, vaccinationCenterName string,
) peer.Response {

	// Validate and convert age, wardNo, and guardianPhone
	age, err := strconv.Atoi(ageStr)
	if err != nil {
		return shim.Error(fmt.Sprintf("Invalid age value: %s", err))
	}

	wardNo, err := strconv.Atoi(wardNoStr)
	if err != nil {
		return shim.Error(fmt.Sprintf("Invalid ward number value: %s", err))
	}

	guardianPhone, err := strconv.Atoi(guardianPhoneStr)
	if err != nil {
		return shim.Error(fmt.Sprintf("Invalid guardian phone number value: %s", err))
	}

	// Check if the child record exists
	childBytes, err := stub.GetState(childID)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to get child data: %s", err))
	}
	if childBytes == nil {
		return shim.Error(fmt.Sprintf("Child with ID %s does not exist", childID))
	}

	// Unmarshal the existing child record
	var existingChild Child
	err = json.Unmarshal(childBytes, &existingChild)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to unmarshal existing child data: %s", err))
	}

	// Dynamically update only the provided fields (if non-empty)
	existingChild.FirstName = firstName
	existingChild.LastName = lastName
	existingChild.Age = age
	existingChild.Gender = gender
	existingChild.Address.Location = location
	existingChild.Address.WardNo = wardNo
	existingChild.Address.Municipality = municipality
	existingChild.GuardianDetails.GuardianName = guardianName
	existingChild.GuardianDetails.GuardianPhone = guardianPhone
	existingChild.VaccinationCenter.ID = vaccinationCenterID
	existingChild.VaccinationCenter.VaccinationCenterName = vaccinationCenterName

	// Marshal the updated child object to JSON
	updatedChildBytes, err := json.Marshal(existingChild)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to marshal updated child data: %s", err))
	}

	// Update the child record in the ledger
	err = stub.PutState(childID, updatedChildBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to put updated child data to state: %s", err))
	}

	// Return success response
	return shim.Success(nil)
}

// DeleteChild - Remove a child record by ID
func (c *ChildrenChaincode) DeleteChild(
	stub shim.ChaincodeStubInterface,
	childID string,
) peer.Response {

	// Remove the child record from the ledger
	err := stub.DelState(childID)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to delete child data: %s", err))
	}

	return shim.Success(nil)
}

// Init - Initialize the chaincode
func (c *ChildrenChaincode) Init(stub shim.ChaincodeStubInterface) peer.Response {
	return shim.Success(nil)
}

// GetUsersWithHashes - Retrieves user data by IDs and returns each user's SHA-256 hash
func (c *ChildrenChaincode) GetChildrenWithHashes(stub shim.ChaincodeStubInterface, ids []string) peer.Response {
	// Prepare a slice to hold the results
	var childHashes []map[string]interface{}

	// Iterate over each provided ID
	for _, id := range ids {
		// Query the Child using the QueryChild method
		queryResponse := c.QueryChild(stub, id)

		// Check if the QueryChild call was successful
		if queryResponse.Status != shim.OK {
			// If QueryChild fails, mark as pending
			childHash := map[string]interface{}{
				"id":        id,
				"childName": "Pending",
				"blockHash": "Pending",
			}
			// Append the pending result to the list
			childHashes = append(childHashes, childHash)
			continue
		}

		// Unmarshal the response payload into a Child object (assuming it's in JSON format)
		var Child Child // Replace with the actual struct type of your Child
		err := json.Unmarshal(queryResponse.Payload, &Child)
		if err != nil {
			return shim.Error(fmt.Sprintf("Failed to unmarshal Child data for %s: %v", id, err))
		}

		// Marshal the Child data to JSON
		ChildBytes, err := json.Marshal(Child)
		if err != nil {
			return shim.Error(fmt.Sprintf("Failed to marshal Child data for %s: %v", id, err))
		}

		// Generate SHA-256 hash of the child data
		hash := sha256.New()
		hash.Write(ChildBytes)
		hashBytes := hash.Sum(nil)
		hashHex := fmt.Sprintf("%x", hashBytes) // Convert the hash to a hexadecimal string

		// Create a response map for each child with the hash
		childHash := map[string]interface{}{
			"id":        Child.ID,
			"childName": Child.FirstName + " " + Child.LastName,
			"blockHash": hashHex,
		}

		// Append the individual result to the list
		childHashes = append(childHashes, childHash)
	}

	// Marshal the list of child hashes to JSON
	responseBytes, err := json.Marshal(childHashes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to marshal response: %v", err))
	}

	// Return the response with the list of child hashes
	return shim.Success(responseBytes)
}

// ChildExists - Check if a child record exists in the ledger
func (c *ChildrenChaincode) ChildExists(stub shim.ChaincodeStubInterface, childID string) peer.Response {
	if childID == "" {
		return shim.Error("Child ID must not be empty")
	}

	// Retrieve the child record from the ledger
	childAsBytes, err := stub.GetState(childID)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to get child: %s", err.Error()))
	}

	// Check if the record exists
	if childAsBytes == nil {
		return shim.Success([]byte("false")) // Record does not exist
	}

	return shim.Success([]byte("true")) // Record exists
}

// Invoke - Route function calls to appropriate functions
func (c *ChildrenChaincode) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	function, args := stub.GetFunctionAndParameters()

	switch function {
	case "CreateChild":
		if len(args) != 14 {
			return shim.Error("Incorrect number of arguments. Expecting 14")
		}
		return c.CreateChild(stub, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11], args[12], args[13])
	case "QueryChild":
		if len(args) != 1 {
			return shim.Error("Incorrect number of arguments. Expecting 1")
		}
		return c.QueryChild(stub, args[0])
	case "UpdateChild":
		if len(args) != 12 {
			return shim.Error("Incorrect number of arguments. Expecting 12")
		}
		return c.UpdateChild(stub, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10], args[11])
	case "DeleteChild":
		if len(args) != 1 {
			return shim.Error("Incorrect number of arguments. Expecting 1")
		}
		return c.DeleteChild(stub, args[0])

	case "GetChildrenWithHashes":
		if len(args) < 1 {
			return shim.Error("GetChildrenWithHashes function requires at least one user ID")
		}
		return c.GetChildrenWithHashes(stub, args)
	default:
		return shim.Error("Invalid function name.")
	}
}

func main() {
	err := shim.Start(new(ChildrenChaincode))
	if err != nil {
		fmt.Printf("Error starting ChildrenChaincode: %s", err)
	}
}
