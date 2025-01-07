package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-protos-go/peer"
)

type DataVerifier struct{}

type createdBy struct {
	Id          string `json:"_id"`
	CompanyName string `json:"companyName"`
	UserType    string `json:"userType"`
}
type HealthcareProvider struct {
	Name  string `json:"name"`
	Phone int    `json:"phone"`
	ID    string `json:_id`
}
type dv_orguser struct {
	Id        string `json:"_id"`
	FirstName string `json:"firstName"`
	UserType  string `json:"userType"`
}

type dc_orguser struct {
	Id        string `json:"_id"`
	FirstName string `json:"firstName"`
	UserType  string `json:"userType"`
}
type observerDetail struct {
	ObserverName  string `json:"observerName"`
	ObserverPhone int    `json:"observerPhone"`
}
type vaccinationCenterAddress struct {
	WardNo       int    `json:"wardNo"`
	Municipality string `json:"municipality"`
	Location     string `json:"location"`
}

// VaccinationCenter represents the structure of a vaccination center
type VaccinationCenter struct {
	RcID                       string                   `json:"id"`
	RcName                     string                   `json:"vaccinationCenterName"`
	VaccinationCenterAddress   vaccinationCenterAddress `json:"vaccinationCenterAddress"`
	VaccinationDate            string                   `json:"vaccinationDate"`
	WeatherCondition           string                   `json:"weatherCondition"`
	TotalBoys                  int                      `json:"totalBoys"`
	TotalGirls                 int                      `json:"totalGirls"`
	HealthcareProviderIDs      []HealthcareProvider     `json:"healthCareProvider"`
	VaccinationStatus          string                   `json:"vaccinationCenterStatus"`
	ObservationPeriodCompleted string                   `json:"observationPeriod"`
	ObserverDetail             observerDetail           `json:"observerDetail"`
	RoadStatus                 string                   `json:"roadStatus"`
	CreatedBy                  createdBy                `json:"createdBy"`
	Dc_orguser                 dc_orguser               `json:"assignedDataCollectorUser"`
	Dv_orguser                 dv_orguser               `json:"assignedDataVerifierUser"`
	CreatedAt                  string                   `json:"createdAt"`
	UpdatedAt                  string                   `json:"-"`
}

func (dv *DataVerifier) Init(stub shim.ChaincodeStubInterface) peer.Response {
	fmt.Println("Initializing the chaincode")
	return shim.Success(nil)
}

func (dv *DataVerifier) GetCentersWithHashes(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	// Implementation for GetCentersWithHashes
	return shim.Error("Not implemented yet")
}

func (dv *DataVerifier) QueryVaccinationCenter(stub shim.ChaincodeStubInterface, rcID string) (VaccinationCenter, error) {
	// Query logic to fetch vaccination center data from the ledger
	var vaccinationCenter VaccinationCenter
	centerBytes, err := stub.GetState(rcID)
	if err != nil {
		return vaccinationCenter, fmt.Errorf("Failed to get state for rcID %s: %v", rcID, err)
	}
	if centerBytes == nil {
		return vaccinationCenter, fmt.Errorf("No data found for rcID %s", rcID)
	}
	err = json.Unmarshal(centerBytes, &vaccinationCenter)
	if err != nil {
		return vaccinationCenter, fmt.Errorf("Failed to unmarshal vaccination center data: %v", err)
	}
	return vaccinationCenter, nil
}

func (dv *DataVerifier) invokeAnotherChaincode(stub shim.ChaincodeStubInterface, args []string) peer.Response {
	if len(args) < 2 {
		return shim.Error("Insufficient arguments. Expected: <chaincodeName> <function> [args...]")
	}

	// Extract inputs
	chaincodeName := args[0] // Name of the target chaincode
	function := args[1]      // Function to invoke in the target chaincode
	functionArgs := args[2:] // Arguments to pass to the function

	// Convert string arguments to byte slices
	invokeArgs := make([][]byte, len(functionArgs)+1)
	invokeArgs[0] = []byte(function)
	for i, arg := range functionArgs {
		invokeArgs[i+1] = []byte(arg)
	}

	// Call the target chaincode on the same channel using InvokeChaincode
	response := stub.InvokeChaincode(chaincodeName, invokeArgs, "")

	// Handle the response
	if response.Status != shim.OK {
		return shim.Error(fmt.Sprintf("Error invoking chaincode '%s': %s", chaincodeName, response.Message))
	}

	return shim.Success(response.Payload)
}

func (dv *DataVerifier) getListOfAssignedVacCenterVerifier(stub shim.ChaincodeStubInterface, userID string) peer.Response {
	// Prepare arguments to invoke the QueryAllVaccinationCenters function in the VaccinationOrg chaincode
	args := [][]byte{[]byte("QueryAllVaccinationCenters")}

	// Invoke the VaccinationOrg chaincode to get all vaccination center data
	response := stub.InvokeChaincode("VaccinationOrg", args, "")

	// Handle the response
	if response.Status != shim.OK {
		return shim.Error(fmt.Sprintf("Failed to invoke VaccinationOrg chaincode: %s", response.Message))
	}

	// Unmarshal the response into a slice of VaccinationCenter structs
	var vaccinationCenters []VaccinationCenter
	err := json.Unmarshal(response.Payload, &vaccinationCenters)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to unmarshal VaccinationCenter data: %s", err))
	}

	// Initialize an empty slice to store assigned centers
	var assignedCenters []VaccinationCenter

	// Filter vaccination centers based on the userID and userType
	for _, center := range vaccinationCenters {
		// Check if the center has the assigned Data Verifier user
		if center.Dv_orguser.Id == userID && center.Dv_orguser.UserType == "Data Verifier" {
			assignedCenters = append(assignedCenters, center)
		}
	}

	// Return an error if no centers match the criteria
	if len(assignedCenters) == 0 {
		return shim.Error(fmt.Sprintf("No vaccination centers assigned to the Data Verifier with userID: %s", userID))
	}

	// Marshal the filtered vaccination centers into JSON
	assignedCentersBytes, err := json.Marshal(assignedCenters)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to marshal assigned vaccination centers: %s", err))
	}

	// Return the filtered vaccination centers in the response
	return shim.Success(assignedCentersBytes)
}

func (dv *DataVerifier) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	// Retrieve the requested function and its arguments
	function, args := stub.GetFunctionAndParameters()

	// Determine the function to invoke
	switch function {
	case "GetCentersWithHashes":
		// Ensure that the number of arguments is correct
		if len(args) == 0 {
			return shim.Error("Incorrect number of arguments. Expecting at least one argument: IDs of Users.")
		}
		return dv.GetCentersWithHashes(stub, args)

	case "QueryVaccinationCenter":
		// Ensure the correct number of arguments is provided
		if len(args) != 1 {
			return shim.Error("Incorrect number of arguments. Expecting 1")
		}
		vaccinationCenter, err := dv.QueryVaccinationCenter(stub, args[0])
		if err != nil {
			return shim.Error(fmt.Sprintf("Failed to query vaccination center: %v", err))
		}
		vaccinationCenterBytes, _ := json.Marshal(vaccinationCenter)
		return shim.Success(vaccinationCenterBytes)

	case "getListOfAssignedVacCenterVerifier":
		// Ensure that at least two arguments are provided
		if len(args) < 1 {
			return shim.Error("Incorrect number of arguments. Expecting rcID and userID")
		}
		return dv.getListOfAssignedVacCenterVerifier(stub, args[0])

	case "invokeAnotherChaincode":
		// Ensure the correct number of arguments is provided
		if len(args) < 2 {
			return shim.Error("Incorrect number of arguments. Expecting at least chaincode name, function name, and arguments")
		}
		return dv.invokeAnotherChaincode(stub, args)

	default:
		// Handle unsupported function names
		return shim.Error("Invalid function name")
	}
}

func main() {
	err := shim.Start(new(DataVerifier))
	if err != nil {
		log.Fatalf("Error starting RegistrationChaincode: %s", err)
	}
}
