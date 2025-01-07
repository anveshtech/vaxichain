import { useRouter } from "next/navigation"
import axios from "axios"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"

export default function EditVaccinationCenter({ params }) {
  const router = useRouter()
  const { "single-vaccinationcenter": vaccinationCenterId } = params
  const [formData, setFormData] = useState({
    vaccinationCenterName: "",
    vaccinationCenterAddress: {
      wardNo: "",
      municipality: "",
    },
    vaccinationDate: "",
    weatherCondition: "",
    totalBoys: "",
    totalGirls: "",
    vaccinationCenterStatus: "Ongoing",
    healthCareProvider: [{ providerName: "", providerPhone: "" }],
    observationPeriod: "",
    observerDetail: {
      observerName: "",
      observerPhone: "",
    },
    roadStatus: "",
    assignedDataCollectorUser: "",
    assignedDataVerifierUser: "",
  })

  const [collectors, setCollectors] = useState([])
  const [verifiers, setVerifiers] = useState([])
  const [verifierUsers, setVerifierUsers] = useState([])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          toast.error("Access token not found. Please log in again.")
          return
        }

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/vaccinationCenter/getVaccinationCenterById/${vaccinationCenterId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        const vaccinationCenter = data.data

        setFormData((prev) => ({
          ...prev,
          vaccinationCenterName: vaccinationCenter.vaccinationCenterName || "",
          vaccinationCenterAddress: vaccinationCenter.vaccinationCenterAddress || {
            wardNo: "",
            municipality: "",
          },
          vaccinationDate: vaccinationCenter.vaccinationDate || "",
          weatherCondition: vaccinationCenter.weatherCondition || "",
          totalBoys: vaccinationCenter.totalBoys || "",
          totalGirls: vaccinationCenter.totalGirls || "",
          vaccinationCenterStatus: vaccinationCenter.vaccinationCenterStatus || "Ongoing",
          healthCareProvider: vaccinationCenter.healthCareProvider || [{ providerName: "", providerPhone: "" }],
          observationPeriod: vaccinationCenter.observationPeriod || "",
          observerDetail: vaccinationCenter.observerDetail || {
            observerName: "",
            observerPhone: "",
          },
          roadStatus: vaccinationCenter.roadStatus || "",
          assignedDataCollectorUser: vaccinationCenter.assignedDataCollectorUser || "",
          assignedDataVerifier: vaccinationCenter.assignedDataVerifier || "",
          assignedDataVerifierUser: vaccinationCenter.assignedDataVerifierUser || "",
        }))
      } catch (error) {
        console.error("Error fetching vaccination center details:", error)
        toast.error("Failed to fetch vaccination center details.")
      }
    }

    fetchInitialData()
  }, [vaccinationCenterId])

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          toast.error("Access token not found. Please log in again.")
          return
        }

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/orguser/getAssignedDataCollectorUser`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        setCollectors(data.data)
      } catch (error) {
        console.error("Error fetching data collectors:", error)
        toast.error("Failed to fetch data collectors.")
      }
    }

    const fetchVerifiers = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          toast.error("Access token not found. Please log in again.")
          return
        }

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/orguser/getAssignedDataVerifierUser`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        setVerifiers(data.data)
      } catch (error) {
        console.error("Error fetching data verifiers:", error)
        toast.error("Failed to fetch data verifiers.")
      }
    }

    fetchCollectors()
    fetchVerifiers()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    if (name.startsWith("vaccinationCenterAddress.")) {
      const field = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        vaccinationCenterAddress: {
          ...prev.vaccinationCenterAddress,
          [field]: value,
        },
      }))
    } else if (name.startsWith("observerDetail.")) {
      const field = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        observerDetail: {
          ...prev.observerDetail,
          [field]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleCollectorChange = (e) => {
    const selectedCollector = collectors.find((collector) => collector.email === e.target.value)
    setFormData((prev) => ({
      ...prev,
      assignedDataCollectorUser: selectedCollector,
    }))
  }

  const handleVerifierChange = (e) => {
    const selectedVerifier = verifiers.find((verifier) => verifier.dataVerifier._id === e.target.value)
    setFormData((prev) => ({
      ...prev,
      assignedDataVerifier: selectedVerifier,
    }))
    setVerifierUsers(selectedVerifier?.createdUsers || [])
  }

  const handleVerifierUserChange = (e) => {
    const selectedVerifierUser = verifierUsers.find((user) => user.email === e.target.value)
    setFormData((prev) => ({
      ...prev,
      assignedDataVerifierUser: selectedVerifierUser,
    }))
  }

  const handleHealthCareProviderChange = (index, field, value) => {
    setFormData((prev) => {
      const newProviders = [...prev.healthCareProvider]
      newProviders[index][field] = value
      return { ...prev, healthCareProvider: newProviders }
    })
  }

  const addHealthCareProvider = () => {
    setFormData((prev) => ({
      ...prev,
      healthCareProvider: [...prev.healthCareProvider, { providerName: "", providerPhone: "" }],
    }))
  }

  const validatePhone = (phone) => /^\d{10}$/.test(phone)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const invalidPhones =
      formData.healthCareProvider.some((provider) => !validatePhone(provider.providerPhone)) ||
      !validatePhone(formData.observerDetail.observerPhone)

    if (invalidPhones) {
      toast.error("Please ensure all phone numbers are 10 digits.")
      return
    }

    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        toast.error("Access token not found. Please log in again.")
        return
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/vaccinationCenter/editVaccinationCenter/${vaccinationCenterId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      toast.success("Vaccination details updated successfully!")
      router.push("/vaccinationcenters")
    } catch (error) {
      toast.error("Failed to update details. Please try again.")
      console.error(error)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded bg-white p-6 shadow"
    >
      <h2 className="text-2xl font-semibold">Edit Vaccination Center Details</h2>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Vaccination Center Name <span className="text-red-600">*</span>
          </label>
          <input
            name="vaccinationCenterName"
            value={formData.vaccinationCenterName}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Location <span className="text-red-600">*</span>
          </label>
          <input
            name="vaccinationCenterAddress.location"
            type="text"
            value={formData.vaccinationCenterAddress.location}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
        <div>
          <label>
            Ward No <span className="text-red-600">*</span>
          </label>
          <input
            name="vaccinationCenterAddress.wardNo"
            type="number"
            value={formData.vaccinationCenterAddress.wardNo}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          />
        </div>
        <div>
          <label>
            Municipality <span className="text-red-600">*</span>
          </label>
          <input
            name="vaccinationCenterAddress.municipality"
            value={formData.vaccinationCenterAddress.municipality}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
        <div>
          <label>
            Vaccination Date <span className="text-red-600">*</span>
          </label>
          <input
            name="vaccinationDate"
            type="date"
            value={formData.vaccinationDate}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          />
        </div>

        <div>
          <label>
            Weather Condition <span className="text-red-600">*</span>
          </label>
          <select
            name="weatherCondition"
            value={formData.weatherCondition}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          >
            <option value="">Select Weather Condition</option>
            <option value="Sunny">Sunny</option>
            <option value="Rainy">Rainy</option>
            <option value="Cloudy">Cloudy</option>
            <option value="Stormy">Stormy</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
        <div>
          <label>
            Total Boys <span className="text-red-600">*</span>
          </label>
          <input
            name="totalBoys"
            type="number"
            value={formData.totalBoys}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          />
        </div>

        <div>
          <label>
            Total Girls <span className="text-red-600">*</span>
          </label>
          <input
            name="totalGirls"
            type="number"
            value={formData.totalGirls}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label>
          Observation Period <span className="text-red-600">*</span>
        </label>
        <input
          name="observationPeriod"
          value={formData.observationPeriod}
          onChange={handleChange}
          className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-2">
        <div>
          <label>
            Vaccination Center Status <span className="text-red-600">*</span>
          </label>
          <select
            name="vaccinationCenterStatus"
            value={formData.vaccinationCenterStatus}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          >
            <option value="Ongoing">Ongoing</option>
            <option value="Stopped">Stopped</option>
          </select>
        </div>

        <div>
          <label>
            Road Status <span className="text-red-600">*</span>
          </label>
          <select
            name="roadStatus"
            value={formData.roadStatus}
            onChange={handleChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          >
            <option value="">Select Road Status</option>
            <option value="Good">Good</option>
            <option value="Bad">Bad</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div>
        <h3 className="my-6 text-lg font-bold text-gray-800">Health Care Providers</h3>
        {formData.healthCareProvider.map((provider, index) => (
          <div
            key={index}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <label>
                Provider Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={provider.providerName}
                onChange={(e) => handleHealthCareProviderChange(index, "providerName", e.target.value)}
                className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
                required
              />
            </div>
            <div>
              <label>
                Provider Phone <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={provider.providerPhone}
                onChange={(e) => handleHealthCareProviderChange(index, "providerPhone", e.target.value)}
                className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
                required
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addHealthCareProvider}
          className="my-6 rounded-md bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
        >
          Add Provider
        </button>
      </div>

      <div>
        <h3 className="my-6 text-lg font-bold text-gray-800">Observer Details</h3>
        <div className="mb-6 grid grid-cols-2 gap-6 md:grid-cols-2">
          <div>
            <label>
              Observer Name <span className="text-red-600">*</span>
            </label>
            <input
              name="observerDetail.observerName"
              value={formData.observerDetail.observerName}
              onChange={handleChange}
              className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
              required
            />
          </div>
          <div>
            <label>
              Observer Phone <span className="text-red-600">*</span>
            </label>
            <input
              name="observerDetail.observerPhone"
              value={formData.observerDetail.observerPhone}
              onChange={handleChange}
              className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
              required
            />
          </div>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-6 md:grid-cols-2">
        <div>
          <label className="block">
            Data Collector <span className="text-red-600">*</span>
          </label>
          <select
            value={formData.assignedDataCollectorUser?.email || ""}
            onChange={handleCollectorChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          >
            <option value="">Select Data Collector</option>
            {collectors.map((collector) => (
              <option
                key={collector.email}
                value={collector.email}
              >
                {collector.firstName} ({collector.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block">
            Data Verifing Organization <span className="text-red-600">*</span>
          </label>
          <select
            onChange={handleVerifierChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          >
            <option value="">Select Data Verifing Organization</option>
            {verifiers.map((verifier) => (
              <option
                key={verifier.dataVerifier._id}
                value={verifier.dataVerifier._id}
              >
                {verifier.dataVerifier.firstName} ({verifier.dataVerifier.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {verifierUsers.length > 0 && (
        <div>
          <label className="block">
            Vaccination Verifier <span className="text-red-600">*</span>
          </label>
          <select
            value={formData.assignedDataVerifierUser?.email || ""}
            onChange={handleVerifierUserChange}
            className="mt-1 block h-10 w-full rounded-md border border-gray-500 p-2 text-black shadow-sm focus:outline-blue-500"
            required
          >
            <option value="">Select Vaccination Verifier</option>
            {verifierUsers.map((user) => (
              <option
                key={user.email}
                value={user.email}
              >
                {user.firstName} ({user.email})
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="text-right">
        <button
          type="submit"
          className="rounded-md bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}
