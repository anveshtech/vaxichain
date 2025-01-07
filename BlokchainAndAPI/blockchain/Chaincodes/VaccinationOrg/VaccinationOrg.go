package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"strconv"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-protos-go/peer"
	"github.com/hyperledger/fabric/common/flogging"
)

var logger = flogging.MustGetLogger("Vaccination_contract")

type VaccinationOrg struct{}

// CompanyName represents the structure of a company
type CompanyName struct {
	ID   string `json:"_id"`
	Name string `json:"name"`
}

type Address struct {
	Zip         int    `json:"zip"`
	City        string `json:"city"`
	Country     string `json:"country"`
	AddressLine string `json:"addressLine"`
}

type createdBy struct {
	Id          string `json:"_id"`
	CompanyName string `json:"companyName"`
	UserType    string `json:"userType"`
}
type HealthcareProvider struct {
	Name  string `json:"providerName"`
	Phone int    `json:"providerPhone"`
	ID    string `json:"_id"`
}
type dv_orguser struct {
	Id        string `json:"_id"`
	FirstName string `json:"firstName"`
	Email     string `json:"email"`
}

type dc_orguser struct {
	Id        string `json:"_id"`
	FirstName string `json:"firstName"`
	Email     string `json:"email"`
}
type observerDetail struct {
	ObserverName  string `json:"observerName"`
	ObserverPhone int    `json:"observerPhone"`
}
type vaccinationCenterAddress struct {
	Location     string `json:"location"`
	WardNo       int    `json:"wardNo"`
	Municipality string `json:"municipality"`
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
	HealthcareProviderIDs      []HealthcareProvider     `json:"healthCareProviders"`
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

// User represents the structure of a user
type User struct {
	UserID     string      `json:"id"`
	Company    CompanyName `json:"organization"`
	FirstName  string      `json:"firstName"`
	LastName   string      `json:"lastName"`
	Email      string      `json:"email"`
	Phone      int         `json:"phone"`
	Address    Address     `json:"address"`
	UserType   string      `json:"userType"`
	Password   string      `json:"password"`
	Status     string      `json:"status"`
	Remarks    *string     `json:"remarks"`
	ProfilePic *string     `json:"profilePic"`
	CreatedAt  string      `json:"createdAt"`
	UpdatedAt  string      `json:"-"`
}

// Init method for chaincode
func (vo *VaccinationOrg) Init(stub shim.ChaincodeStubInterface) peer.Response {
	fmt.Println("Initializing the chaincode")
	return shim.Success(nil)
}

// CreateUser creates a new data collector and stores it in the ledger
func (vo *VaccinationOrg) CreateUser(stub shim.ChaincodeStubInterface, userID, companyID, companyName, firstName, lastName, email string, phone, zip int, city, country, addressLine, userType, password, status string, remarks *string, profilePic *string, createdAt, updatedAt string) peer.Response {
	// Validate required fields
	if userID == "" || companyID == "" || companyName == "" ||
		firstName == "" || lastName == "" || email == "" ||
		password == "" || status == "" ||
		createdAt == "" || updatedAt == "" {
		return shim.Error("missing required fields")
	}

	// Ensure unique user ID
	exists, err := vo.UserExists(stub, userID)
	if err != nil {
		return shim.Error(fmt.Sprintf("failed to check if user exists: %v", err))
	}
	if exists {
		return shim.Error(fmt.Sprintf("user with user ID %s already exists", userID))
	}

	// Create the user
	user := User{
		UserID: userID,
		Company: CompanyName{
			ID:   companyID,
			Name: companyName,
		},
		FirstName: firstName,
		LastName:  lastName,
		Email:     email,
		Phone:     phone,
		Address: Address{
			Zip:         zip,
			City:        city,
			Country:     country,
			AddressLine: addressLine,
		},
		UserType:   userType,
		Password:   password,
		Status:     status,
		Remarks:    remarks,
		ProfilePic: profilePic,
		CreatedAt:  createdAt,
		UpdatedAt:  updatedAt,
	}

	// Store the user in the ledger
	userBytes, err := json.Marshal(user)
	if err != nil {
		return shim.Error(fmt.Sprintf("failed to serialize user: %v", err))
	}

	if err := stub.PutState(userID, userBytes); err != nil {
		return shim.Error(fmt.Sprintf("failed to store user: %v", err))
	}

	logger.Info("Data collector created successfully")
	return shim.Success(nil)
}

// UserExists checks if a user exists by user ID
func (vo *VaccinationOrg) UserExists(stub shim.ChaincodeStubInterface, userID string) (bool, error) {
	userBytes, err := stub.GetState(userID)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}
	return userBytes != nil, nil
}

// QueryUser retrieves a user from the ledger by user ID
func (vo *VaccinationOrg) QueryUser(stub shim.ChaincodeStubInterface, userID string) (*User, error) {
	userBytes, err := stub.GetState(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to read user: %v", err)
	}
	if userBytes == nil {
		return nil, fmt.Errorf("user with user ID %s does not exist", userID)
	}

	var user User
	if err := json.Unmarshal(userBytes, &user); err != nil {
		return nil, fmt.Errorf("failed to unmarshal user: %v", err)
	}

	return &user, nil
}

// UpdateUser updates an existing user in the ledger
func (vo *VaccinationOrg) UpdateUser(stub shim.ChaincodeStubInterface, userID, companyID, companyName, firstName, lastName, email string, phone, zip int, city, country, addressLine string) peer.Response {
	// Validate input parameters
	if userID == "" {
		return shim.Error("UserID is required")
	}
	if companyID == "" || companyName == "" {
		return shim.Error("CompanyID and CompanyName are required")
	}
	if firstName == "" || lastName == "" {
		return shim.Error("FirstName and LastName are required")
	}

	// Fetch the existing user
	userBytes, err := stub.GetState(userID)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to read user from ledger: %v", err))
	}
	if userBytes == nil {
		return shim.Error(fmt.Sprintf("User with ID %s does not exist", userID))
	}

	// Deserialize existing user
	var existingUser User
	if err := json.Unmarshal(userBytes, &existingUser); err != nil {
		return shim.Error(fmt.Sprintf("Failed to deserialize existing user: %v", err))
	}

	// Update user details
	existingUser.Company.ID = companyID
	existingUser.Company.Name = companyName
	existingUser.FirstName = firstName
	existingUser.LastName = lastName
	existingUser.Email = email
	existingUser.Phone = phone
	existingUser.Address = Address{
		Zip:         zip,
		City:        city,
		Country:     country,
		AddressLine: addressLine,
	}

	// Serialize updated user
	updatedUserBytes, err := json.Marshal(existingUser)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to serialize updated user: %v", err))
	}

	// Save updated user to the ledger
	if err := stub.PutState(userID, updatedUserBytes); err != nil {
		return shim.Error(fmt.Sprintf("Failed to update user in ledger: %v", err))
	}

	logger.Info(fmt.Sprintf("User with ID %s updated successfully", userID))
	return shim.Success(nil)
}

func (vo *VaccinationOrg) GetUsersWithHashes(stub shim.ChaincodeStubInterface, ids []string) peer.Response {
	// Prepare a slice to hold the results
	var userHashes []map[string]interface{}

	// Iterate over each provided ID
	for _, id := range ids {

		// Query the User using the QueryUser method
		User, err := vo.QueryUser(stub, id)
		if err != nil {
			// If User not found, mark as pending
			userHash := map[string]interface{}{
				"id":        id,
				"userName":  "Pending",
				"blockHash": "Pending",
			}
			// Append the pending result to the list
			userHashes = append(userHashes, userHash)
			continue
		}

		// Marshal the company data to JSON
		UserBytes, err := json.Marshal(User)
		if err != nil {
			return shim.Error(fmt.Sprintf("Failed to marshal Company data for %s: %v", id, err))
		}

		// Generate SHA-256 hash of the company data
		hash := sha256.New()
		hash.Write(UserBytes)
		hashBytes := hash.Sum(nil)
		hashHex := fmt.Sprintf("%x", hashBytes) // Convert the hash to a hexadecimal string

		// Create a response map for each company with the hash
		userHash := map[string]interface{}{
			"id":        User.UserID,
			"UserName":  User.FirstName + "" + User.LastName,
			"blockHash": hashHex,
		}

		// Append the individual result to the list
		userHashes = append(userHashes, userHash)
	}

	// Marshal the list of company hashes to JSON
	responseBytes, err := json.Marshal(userHashes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to marshal response: %v", err))
	}

	// Return the response with the list of company hashes
	return shim.Success(responseBytes)
}
func (vo *VaccinationOrg) GetCentersWithHashes(stub shim.ChaincodeStubInterface, ids []string) peer.Response {
	// Prepare a slice to hold the results
	var userCenters []map[string]interface{}

	// Iterate over each provided ID
	for _, id := range ids {

		// Query the User using the QueryUser method
		Center, err := vo.QueryVaccinationCenter(stub, id)
		if err != nil {
			// If User not found, mark as pending
			userCenter := map[string]interface{}{
				"id":         id,
				"centername": "Pending",
				"blockHash":  "Pending",
			}
			// Append the pending result to the list
			userCenters = append(userCenters, userCenter)
			continue
		}

		// Marshal the company data to JSON
		CenterBytes, err := json.Marshal(Center)
		if err != nil {
			return shim.Error(fmt.Sprintf("Failed to marshal Company data for %s: %v", id, err))
		}

		// Generate SHA-256 hash of the Center data
		hash := sha256.New()
		hash.Write(CenterBytes)
		hashBytes := hash.Sum(nil)
		hashHex := fmt.Sprintf("%x", hashBytes) // Convert the hash to a hexadecimal string

		// Create a response map for each Center with the hash
		userCenter := map[string]interface{}{
			"id":        Center.RcID,
			"UserName":  Center.RcName,
			"blockHash": hashHex,
		}

		// Append the individual result to the list
		userCenters = append(userCenters, userCenter)
	}

	// Marshal the list of company hashes to JSON
	responseBytes, err := json.Marshal(userCenters)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to marshal response: %v", err))
	}

	// Return the response with the list of company hashes
	return shim.Success(responseBytes)
}

// addVaccinationOrg adds a new vaccination organization (center) to the ledger
func (vo *VaccinationOrg) addVaccinationCenter(stub shim.ChaincodeStubInterface, rcID, rcName string, vaccinationCenterAddress vaccinationCenterAddress, vaccinationDate, weatherCondition string, totalBoys, totalGirls int, healthcareProviders []HealthcareProvider, vaccinationStatus, observationperiodcomplete string, observerDetail observerDetail, roadStatus string, createdBy createdBy, dc_orguser dc_orguser, dv_orguser dv_orguser, createdAt, updatedAt string) peer.Response {
	// Validate required fields
	if rcID == "" || rcName == "" || vaccinationDate == "" || weatherCondition == "" || vaccinationStatus == "" || roadStatus == "" {
		return shim.Error("missing required fields")
	}
	// Create the vaccination center
	vaccinationCenter := VaccinationCenter{
		RcID:                       rcID,
		RcName:                     rcName,
		VaccinationCenterAddress:   vaccinationCenterAddress,
		VaccinationDate:            vaccinationDate,
		WeatherCondition:           weatherCondition,
		TotalBoys:                  totalBoys,
		TotalGirls:                 totalGirls,
		HealthcareProviderIDs:      healthcareProviders,
		VaccinationStatus:          vaccinationStatus,
		ObservationPeriodCompleted: observationperiodcomplete,
		ObserverDetail:             observerDetail,
		RoadStatus:                 roadStatus,
		CreatedBy:                  createdBy,
		Dc_orguser:                 dc_orguser,
		Dv_orguser:                 dv_orguser,
		CreatedAt:                  createdAt,
		UpdatedAt:                  updatedAt,
	}

	// Serialize and store in ledger
	vaccinationCenterBytes, err := json.Marshal(vaccinationCenter)
	if err != nil {
		return shim.Error(fmt.Sprintf("failed to serialize vaccination center: %v", err))
	}

	if err := stub.PutState("VaccinationCenter:"+rcID, vaccinationCenterBytes); err != nil {
		return shim.Error(fmt.Sprintf("failed to store vaccination center: %v", err))
	}

	logger.Info("Vaccination center added successfully")
	return shim.Success(nil)
}

func (vo *VaccinationOrg) QueryAllVaccinationCenters(stub shim.ChaincodeStubInterface) peer.Response {
	// Define the range for keys prefixed with "VaccinationCenter:"
	startKey := "VaccinationCenter:"
	endKey := "VaccinationCenter;" // ";" is lexicographically greater than ":"

	// Use GetStateByRange to fetch all keys in the range
	resultsIterator, err := stub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to get state by range: %v", err))
	}
	defer resultsIterator.Close()

	// Slice to store all vaccination centers
	var vaccinationCenters []VaccinationCenter

	// Iterate through the results
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(fmt.Sprintf("Failed to iterate results: %v", err))
		}

		var vaccinationCenter VaccinationCenter
		err = json.Unmarshal(queryResponse.Value, &vaccinationCenter)
		if err != nil {
			return shim.Error(fmt.Sprintf("Failed to unmarshal vaccination center data: %v", err))
		}

		vaccinationCenters = append(vaccinationCenters, vaccinationCenter)
	}

	// Marshal the list of vaccination centers into JSON
	vaccinationCentersBytes, err := json.Marshal(vaccinationCenters)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to marshal vaccination centers: %v", err))
	}

	// Return the vaccination centers as a response
	return shim.Success(vaccinationCentersBytes)
}

func (vo *VaccinationOrg) ChangeUserStatus(stub shim.ChaincodeStubInterface, userID string, newStatus string) error {
	// Ensure that the status is either "enabled" or "disabled"
	if newStatus != "enabled" && newStatus != "disabled" {
		return fmt.Errorf("invalid status. Valid values are 'enabled' or 'disabled'")
	}

	// Retrieve the company from the ledger using company ID
	UserAsBytes, err := stub.GetState(userID)
	if err != nil {
		return fmt.Errorf("failed to read user: %v", err)
	}
	if UserAsBytes == nil {
		return fmt.Errorf("user not found with ID: %s", userID)
	}

	// Unmarshal the company data
	var user User
	err = json.Unmarshal(UserAsBytes, &user)
	if err != nil {
		return fmt.Errorf("failed to unmarshal user data: %v", err)
	}

	// If the status is already the same as the new status, do nothing
	if user.Status == newStatus {
		return fmt.Errorf("user already in the desired status: %s", newStatus)
	}

	// Update the company's status and updated timestamp
	user.Status = newStatus

	// Marshal the updated company and save it to the ledger
	updatedUserAsBytes, err := json.Marshal(user)
	if err != nil {
		return fmt.Errorf("failed to marshal updated user data: %v", err)
	}

	err = stub.PutState(userID, updatedUserAsBytes)
	if err != nil {
		return fmt.Errorf("failed to update user status: %v", err)
	}

	return nil
}

// QueryVaccinationCenter retrieves a vaccination center by rcID
func (vo *VaccinationOrg) QueryVaccinationCenter(stub shim.ChaincodeStubInterface, rcID string) (*VaccinationCenter, error) {
	vaccinationCenterBytes, err := stub.GetState("VaccinationCenter:" + rcID)
	if err != nil {
		return nil, fmt.Errorf("failed to read vaccination center: %v", err)
	}
	if vaccinationCenterBytes == nil {
		return nil, fmt.Errorf("vaccination center with rcID %s does not exist", rcID)
	}

	var vaccinationCenter VaccinationCenter
	if err := json.Unmarshal(vaccinationCenterBytes, &vaccinationCenter); err != nil {
		return nil, fmt.Errorf("failed to unmarshal vaccination center: %v", err)
	}

	return &vaccinationCenter, nil
}

// editVaccinationOrg edits an existing vaccination organization (center) in the ledger
func (vo *VaccinationOrg) editVaccinationCenter(stub shim.ChaincodeStubInterface, rcID string, rcName string, vaccinationCenterAddress vaccinationCenterAddress, vaccinationDate string, weatherCondition string, totalBoys, totalGirls int, healthcareProviderID []HealthcareProvider, vaccinationStatus string, observationPeriodCompleted string, observerDetail observerDetail, roadStatus string, dc_orguser dc_orguser, dv_orguser dv_orguser) peer.Response {
	// Check if the vaccination center exists
	vaccinationCenterBytes, err := stub.GetState("VaccinationCenter:" + rcID)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to retrieve vaccination center: %v", err))
	}
	if vaccinationCenterBytes == nil {
		return shim.Error(fmt.Sprintf("Vaccination center with rcID %s does not exist", rcID))
	}

	// Unmarshal existing vaccination center
	var vaccinationCenter VaccinationCenter
	err = json.Unmarshal(vaccinationCenterBytes, &vaccinationCenter)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to unmarshal vaccination center data: %v", err))
	}

	// Apply updates based on the provided object fields
	vaccinationCenter.RcName = rcName
	vaccinationCenter.VaccinationCenterAddress = vaccinationCenterAddress
	vaccinationCenter.VaccinationDate = vaccinationDate
	vaccinationCenter.WeatherCondition = weatherCondition
	vaccinationCenter.TotalBoys = totalBoys
	vaccinationCenter.TotalGirls = totalGirls
	vaccinationCenter.HealthcareProviderIDs = healthcareProviderID
	vaccinationCenter.VaccinationStatus = vaccinationStatus
	vaccinationCenter.ObservationPeriodCompleted = observationPeriodCompleted
	vaccinationCenter.ObserverDetail = observerDetail
	vaccinationCenter.RoadStatus = roadStatus
	vaccinationCenter.Dc_orguser = dc_orguser
	vaccinationCenter.Dv_orguser = dv_orguser
	// Serialize and save the updated vaccination center
	updatedBytes, err := json.Marshal(vaccinationCenter)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to marshal updated vaccination center: %v", err))
	}
	err = stub.PutState("VaccinationCenter:"+rcID, updatedBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to update vaccination center: %v", err))
	}

	return shim.Success(nil)
}

// VaccinationCenterExists checks if a vaccination center exists by rcID
func (vo *VaccinationOrg) VaccinationCenterExists(stub shim.ChaincodeStubInterface, rcID string) (bool, error) {
	vaccinationCenterBytes, err := stub.GetState("VaccinationCenter:" + rcID)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}
	return vaccinationCenterBytes != nil, nil
}

// Assign a Data Collector
func (vo *VaccinationOrg) assignDataCollector(stub shim.ChaincodeStubInterface, rcID string, id string, firstName string, email string) peer.Response {
	// Fetch the VaccinationCenter by RcID
	vacCenterJSON, err := stub.GetState("VaccinationCenter:" + rcID)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to get Vaccination Center: %v", err))
	}
	if vacCenterJSON == nil {
		return shim.Error("Vaccination Center not found")
	}

	// Unmarshal the Vaccination Center data
	var vacCenter VaccinationCenter
	err = json.Unmarshal(vacCenterJSON, &vacCenter)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to unmarshal Vaccination Center data: %v", err))
	}

	// Create a new dc_orguser (Data Collector)
	dataCollector := dc_orguser{
		Id:        id,
		FirstName: firstName,
		Email:     email,
	}

	// Assign the Data Collector to the VaccinationCenter
	vacCenter.Dc_orguser = dataCollector

	// Convert the updated VaccinationCenter back to JSON
	updatedVacCenterJSON, err := json.Marshal(vacCenter)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to marshal updated Vaccination Center: %v", err))
	}

	// Save the updated VaccinationCenter back to state
	err = stub.PutState("VaccinationCenter:"+rcID, updatedVacCenterJSON)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to update Vaccination Center: %v", err))
	}

	return shim.Success([]byte(fmt.Sprintf("Data Collector %s assigned to Vaccination Center %s successfully", id, rcID)))
}

// Assign a Data Verifier
func (vo *VaccinationOrg) assignDataVerifier(stub shim.ChaincodeStubInterface, rcID string, id string, firstName string, email string) peer.Response {
	// Fetch the VaccinationCenter by RcID
	vacCenterJSON, err := stub.GetState("VaccinationCenter:" + rcID)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to get Vaccination Center: %v", err))
	}
	if vacCenterJSON == nil {
		return shim.Error("Vaccination Center not found")
	}

	// Unmarshal the Vaccination Center data
	var vacCenter VaccinationCenter
	err = json.Unmarshal(vacCenterJSON, &vacCenter)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to unmarshal Vaccination Center data: %v", err))
	}

	// Create a new dv_orguser (Data Verifier)
	dataVerifier := dv_orguser{
		Id:        id,
		FirstName: firstName,
		Email:     email,
	}

	// Assign the Data Verifier to the VaccinationCenter
	vacCenter.Dv_orguser = dataVerifier

	// Convert the updated VaccinationCenter back to JSON
	updatedVacCenterJSON, err := json.Marshal(vacCenter)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to marshal updated Vaccination Center: %v", err))
	}

	// Save the updated VaccinationCenter back to state
	err = stub.PutState("VaccinationCenter:"+rcID, updatedVacCenterJSON)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to update Vaccination Center: %v", err))
	}

	return shim.Success([]byte(fmt.Sprintf("Data Verifier %s assigned to Vaccination Center %s successfully", id, rcID)))
}

// Invoke is the entry point for invoking functions in this chaincode
func (vo *VaccinationOrg) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	function, args := stub.GetFunctionAndParameters()

	switch function {
	case "CreateUser":
		// args: userID, companyID, companyName, firstName, lastName, email, phone, password
		if len(args) != 18 {
			return shim.Error("incorrect number of arguments. Expecting 18")
		}
		Phone, err := strconv.Atoi(args[6])
		if err != nil {
			return shim.Error(fmt.Sprintf("Error converting Phone number to int: %v", err))
		}
		var remarks *string
		var profilePic *string
		if args[14] != "" && args[14] != "null" {
			remarks = &args[14]
		}
		if args[15] != "" && args[15] != "null" {
			profilePic = &args[15]
		}
		// Convert zip (string -> int)
		zip, err := strconv.Atoi(args[7])
		if err != nil {
			return shim.Error("Failed to convert zip to int: " + err.Error())
		}
		return vo.CreateUser(stub, args[0], args[1], args[2], args[3], args[4], args[5], Phone, zip, args[8], args[9], args[10], args[11], args[12], args[13], remarks, profilePic, args[16], args[17])
	case "QueryUser":
		// args: userID
		if len(args) != 1 {
			return shim.Error("incorrect number of arguments. Expecting 1")
		}
		user, err := vo.QueryUser(stub, args[0])
		if err != nil {
			return shim.Error(fmt.Sprintf("Failed to query user: %v", err))
		}
		userBytes, _ := json.Marshal(user)
		return shim.Success(userBytes)
	case "UpdateUser":
		// args: userID, userID, companyName, firstName, lastName, email, phone, password
		if len(args) != 11 {
			return shim.Error("incorrect number of arguments. Expecting 11")
		}
		// Convert zip (string -> int)
		zip, err := strconv.Atoi(args[7])
		if err != nil {
			return shim.Error("Failed to convert zip to int: " + err.Error())
		}
		Phone, err := strconv.Atoi(args[6])
		if err != nil {
			return shim.Error(fmt.Sprintf("Error converting total boys to int: %v", err))
		}
		return vo.UpdateUser(stub, args[0], args[1], args[2], args[3], args[4], args[5], Phone, zip, args[8], args[9], args[10])

	case "GetUsersWithHashes":
		// Ensure that the number of arguments is correct
		if len(args) == 0 {
			return shim.Error("Incorrect number of arguments. Expecting at least one argument: IDs of Users.")
		}
		return vo.GetUsersWithHashes(stub, args)

	case "ChangeUserStatus":
		// Ensure correct number of arguments, then invoke the ChangeUserStatus function
		if len(args) != 2 {
			return shim.Error("Incorrect number of arguments. Expecting 2")
		}
		vo.ChangeUserStatus(stub, args[0], args[1])
		return shim.Success([]byte("User status changed successfully"))

	case "GetCentersWithHashes":
		// Ensure that the number of arguments is correct
		if len(args) == 0 {
			return shim.Error("Incorrect number of arguments. Expecting at least one argument: IDs of Users.")
		}
		return vo.GetCentersWithHashes(stub, args)

	case "AddVaccinationCenter":
		// args: rcID, rcName, address, wardNo, municipality, vaccinationDate, weatherCondition, vaccinationStatus, observerName, roadStatus, createdBy, totalBoys, totalGirls, healthcareProviders
		if len(args) != 17 {
			return shim.Error("incorrect number of arguments. Expecting 15")
		}
		var healthcareProviders []HealthcareProvider
		if err := json.Unmarshal([]byte(args[7]), &healthcareProviders); err != nil {
			return shim.Error(fmt.Sprintf("failed to unmarshal healthcare providers: %v", err))
		}
		var dc_orguser dc_orguser
		if err := json.Unmarshal([]byte(args[13]), &dc_orguser); err != nil {
			return shim.Error(fmt.Sprintf("failed to unmarshal healthcare providers: %v", err))
		}
		var dv_orguser dv_orguser
		if err := json.Unmarshal([]byte(args[14]), &dv_orguser); err != nil {
			return shim.Error(fmt.Sprintf("failed to unmarshal healthcare providers: %v", err))
		}
		var vaccinationCenterAddress vaccinationCenterAddress
		if err := json.Unmarshal([]byte(args[2]), &vaccinationCenterAddress); err != nil {
			return shim.Error(fmt.Sprintf("failed to unmarshal Vaccination Center Address %v", err))
		}
		var observerDetail observerDetail
		if err := json.Unmarshal([]byte(args[10]), &observerDetail); err != nil {
			return shim.Error(fmt.Sprintf("failed to unmarshal observationDetail: %v", err))
		}
		var CreatedBy createdBy
		if err := json.Unmarshal([]byte(args[12]), &CreatedBy); err != nil {
			return shim.Error(fmt.Sprintf("failed to unmarshal CreatedBy: %v", err))
		}
		totalBoys, err := strconv.Atoi(args[5])
		if err != nil {
			return shim.Error(fmt.Sprintf("Error converting total boys to int: %v", err))
		}
		totalGirls, err := strconv.Atoi(args[6])
		if err != nil {
			return shim.Error(fmt.Sprintf("Error converting total girls to int: %v", err))
		}
		return vo.addVaccinationCenter(stub, args[0], args[1], vaccinationCenterAddress, args[3], args[4], totalBoys, totalGirls, healthcareProviders, args[8], args[9], observerDetail, args[11], CreatedBy, dc_orguser, dv_orguser, args[15], args[16])
	case "EditVaccinationCenter":
		// args: rcID, rcName, address, wardNo, municipality, vaccinationDate, weatherCondition, vaccinationStatus, observerName, roadStatus, createdBy, totalBoys, totalGirls, healthcareProviders
		if len(args) != 14 {
			return shim.Error("incorrect number of arguments. Expecting 14")
		}
		var healthcareProviders []HealthcareProvider
		if err := json.Unmarshal([]byte(args[7]), &healthcareProviders); err != nil {
			return shim.Error(fmt.Sprintf("failed to unmarshal healthcare providers: %v", err))
		}
		var vaccinationCenterAddress vaccinationCenterAddress
		if err := json.Unmarshal([]byte(args[2]), &vaccinationCenterAddress); err != nil {
			return shim.Error(fmt.Sprintf("failed to unmarshal Vaccination Center Address %v", err))
		}
		var observerDetail observerDetail
		if err := json.Unmarshal([]byte(args[10]), &observerDetail); err != nil {
			return shim.Error(fmt.Sprintf("failed to unmarshal observationDetail: %v", err))
		}

		var Dc_orguser dc_orguser
		if err := json.Unmarshal([]byte(args[12]), &Dc_orguser); err != nil {
			return shim.Error(fmt.Sprintf("failed to unmarshal Data collector: %v", err))
		}
		var Dv_orguser dv_orguser
		if err := json.Unmarshal([]byte(args[13]), &Dv_orguser); err != nil {
			return shim.Error(fmt.Sprintf("failed to unmarshal Dataverifier: %v", err))
		}
		totalBoys, err := strconv.Atoi(args[5])
		if err != nil {
			return shim.Error(fmt.Sprintf("Error converting total boys to int: %v", err))
		}
		totalGirls, err := strconv.Atoi(args[6])
		if err != nil {
			return shim.Error(fmt.Sprintf("Error converting total girls to int: %v", err))
		}
		return vo.editVaccinationCenter(stub, args[0], args[1], vaccinationCenterAddress, args[3], args[4], totalBoys, totalGirls, healthcareProviders, args[8], args[9], observerDetail, args[11], Dc_orguser, Dv_orguser)
	case "QueryVaccinationCenter":
		// args: rcID
		if len(args) != 1 {
			return shim.Error("incorrect number of arguments. Expecting 1")
		}
		vaccinationCenter, err := vo.QueryVaccinationCenter(stub, args[0])
		if err != nil {
			return shim.Error(fmt.Sprintf("Failed to query vaccination center: %v", err))
		}
		vaccinationCenterBytes, _ := json.Marshal(vaccinationCenter)
		return shim.Success(vaccinationCenterBytes)

	case "AssignDataCollector":
		// args: id, firstName, userType
		if len(args) != 4 {
			return shim.Error("Incorrect number of arguments. Expecting 3:rcid, id, firstName, userType")
		}
		return vo.assignDataCollector(stub, args[0], args[1], args[2], args[3])

	case "AssignDataVerifier":
		// args: id, firstName, userType
		if len(args) != 4 {
			return shim.Error("Incorrect number of arguments. Expecting 3: rcid,id, firstName, userType")
		}
		return vo.assignDataVerifier(stub, args[0], args[1], args[2], args[3])
	case "QueryAllVaccinationCenters":
		return vo.QueryAllVaccinationCenters(stub)
	default:
		return shim.Error("Invalid function name")
	}
}

func main() {
	err := shim.Start(new(VaccinationOrg))
	if err != nil {
		log.Fatalf("Error starting RegistrationChaincode: %s", err)
	}
}
