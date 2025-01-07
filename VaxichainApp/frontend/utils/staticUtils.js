export const userTypeOptions = [
  { value: "", text: "----- Select A Type -----" },
  { value: "dataCollector", text: "Data Collector" },
  { value: "dataVerifier", text: "Data Verifier" },
]

export const productTypeStatus = {
  true: "enabled",
  false: "disabled",
}

export const routeToCrumb = {
  "product-types": "Product Types",
  "add-product-type": "Add Product Type",
  "add-product": "Add product",
  edit: "Edit",
  dataverifiers: "DataVerifiers",
  datacollectors: "DataCollectors",
  retailers: "Retailers",
  orgusers: "OrganizationUsers",
  dashboard: "Dashboard",
  vaccinationcenters: "VaccinationCenters",
  children: "Children",
  vaccination: "Vaccination",
  "add-orgusers": "Add Users",
  "add-vaccinationcenters": "Add VaccinationCenter",
  "company-sales": "Company Sales",
  "retailer-sales": "Retailer Sales",
  batch: "Batch",
}

export const reactQueryStaleTime = Infinity
