package main

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-protos-go/peer"
	"github.com/hyperledger/fabric/common/flogging"
)

var logger = flogging.MustGetLogger("Registration_contract")

type RegistrationContract struct{}

type CompanyName struct {
	ID   string `json:"appleId"`
	Name string `json:"name"`
}

type Address struct {
	Zip         int    `json:"zip"`
	City        string `json:"city"`
	Country     string `json:"country"`
	AddressLine string `json:"addressLine"`
}

type User struct {
	UserID     string      `json:"id"`
	Company    CompanyName `json:"organization"`
	FirstName  string      `json:"firstName"`
	LastName   string      `json:"lastName"`
	Email      string      `json:"email"`
	Phone      int         `json:"phone"`
	Password   string      `json:"password"`
	Address    Address     `json:"address"`
	UserType   string      `json:"userType"`
	Status     string      `json:"status"`
	Remarks    *string     `json:"remarks"`
	ProfilePic *string     `json:"profilePic"`
	CreatedAt  string      `json:"createdAt"`
	UpdatedAt  string      `json:"-"`
}

func (rc *RegistrationContract) Init(stub shim.ChaincodeStubInterface) peer.Response {
	fmt.Println("Initializing the chaincode")
	return shim.Success(nil)
}

// AddAdminUser adds a new admin user to the ledger.
func (rc *RegistrationContract) AddAdminUser(stub shim.ChaincodeStubInterface, userID, companyID, companyName, firstName, lastName, email string, phone, zip int, city, country, addressLine, usertype, password, status string, remarks *string, profilePic *string, createdAt, updatedAt string) peer.Response {
	// Validate required fields
	if userID == "" || companyID == "" || companyName == "" ||
		firstName == "" || lastName == "" || email == "" ||
		password == "" || status == "" ||
		createdAt == "" || updatedAt == "" || usertype == "" {
		return shim.Error("missing required fields")
	}

	// Ensure unique user ID
	exists, err := rc.AdminUserExists(stub, userID)
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
		UserType:   usertype,
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

// AdminUserExists checks if a user exists by user ID
func (rc *RegistrationContract) AdminUserExists(stub shim.ChaincodeStubInterface, userID string) (bool, error) {
	userBytes, err := stub.GetState(userID)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}
	return userBytes != nil, nil
}

// QueryAdminUser retrieves a user from the ledger by user ID
func (rc *RegistrationContract) QueryAdminUser(stub shim.ChaincodeStubInterface, userID string) (*User, error) {
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

func (rc *RegistrationContract) GetAdminUsersWithHashes(APIstub shim.ChaincodeStubInterface, ids []string) peer.Response {
	// Prepare a slice to hold the results
	var userHashes []map[string]interface{}

	// Iterate over each provided ID
	for _, id := range ids {

		// Query the User using the QueryAdminUser method
		User, err := rc.QueryAdminUser(APIstub, id)
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

// AdminUpdateUser updates an existing user in the ledger
func (rc *RegistrationContract) AdminUpdateUser(stub shim.ChaincodeStubInterface, userID, companyID, companyName, firstName, lastName, email string, phone, zip int, city, country, addressLine, usertype, password, status string, remarks *string, profilePic *string, createdAt, updatedAt string) peer.Response {
	// Ensure the user exists
	exists, err := rc.AdminUserExists(stub, userID)
	if err != nil {
		return shim.Error(fmt.Sprintf("failed to check if user exists: %v", err))
	}
	if !exists {
		return shim.Error(fmt.Sprintf("user with user ID %s does not exist", userID))
	}

	// Update the user data
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
		UserType:   usertype,
		Password:   password,
		Status:     status,
		Remarks:    remarks,
		ProfilePic: profilePic,
		CreatedAt:  createdAt,
		UpdatedAt:  updatedAt,
	}

	// Serialize and update in ledger
	userBytes, err := json.Marshal(user)
	if err != nil {
		return shim.Error(fmt.Sprintf("failed to serialize user: %v", err))
	}

	if err := stub.PutState(userID, userBytes); err != nil {
		return shim.Error(fmt.Sprintf("failed to update user: %v", err))
	}

	logger.Info("User updated successfully")
	return shim.Success(nil)
}

func (rc *RegistrationContract) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	function, args := stub.GetFunctionAndParameters()
	switch function {
	case "AddAdminUser":
		// args: userID, companyID, companyName, firstName, lastName, email, phone, password
		if len(args) != 18 {
			return shim.Error("incorrect number of arguments. Expecting 18")
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
		Phone, err := strconv.Atoi(args[6])
		if err != nil {
			return shim.Error("Failed to convert zip to int: " + err.Error())
		}
		return rc.AddAdminUser(stub, args[0], args[1], args[2], args[3], args[4], args[5], Phone, zip, args[8], args[9], args[10], args[11], args[12], args[13], remarks, profilePic, args[16], args[17])
	case "QueryAdminUser":
		// args: userID
		if len(args) != 1 {
			return shim.Error("incorrect number of arguments. Expecting 1")
		}
		user, err := rc.QueryAdminUser(stub, args[0])
		if err != nil {
			return shim.Error(fmt.Sprintf("Failed to query user: %v", err))
		}
		userBytes, _ := json.Marshal(user)
		return shim.Success(userBytes)
	case "AdminUpdateUser":
		// args: userID, userID, companyName, firstName, lastName, email, phone, password
		if len(args) != 18 {
			return shim.Error("incorrect number of arguments. Expecting 17")
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
		Phone, err := strconv.Atoi(args[6])
		if err != nil {
			return shim.Error("Failed to convert zip to int: " + err.Error())
		}
		return rc.AdminUpdateUser(stub, args[0], args[1], args[2], args[3], args[4], args[5], Phone, zip, args[8], args[9], args[10], args[11], args[12], args[13], remarks, profilePic, args[16], args[17])

	case "GetAdminUsersWithHashes":
		// Ensure that the number of arguments is correct
		if len(args) == 0 {
			return shim.Error("Incorrect number of arguments. Expecting at least one argument: IDs of Users.")
		}
		return rc.GetAdminUsersWithHashes(stub, args)

	default:
		return shim.Error("Invalid function name.")
	}
}

func main() {
	err := shim.Start(new(RegistrationContract))
	if err != nil {
		fmt.Printf("Error starting RegistrationContract: %s", err)
	}
}
