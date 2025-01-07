import { api } from "@/lib/api"

export const getCurrentUser = async () => {
  try {
    const accessToken = localStorage.getItem("accessToken")

    if (!accessToken) {
      throw new Error("Access token not found")
    }

    const response = await api.get("/users/get-current-user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return response.data
  } catch (error) {
    throw error.response
  }
}

export const signInUser = async (formData) => {
  try {
    const response = await api.post("/users/signin", formData)

    localStorage.setItem("accessToken", response.data?.data.accessToken)
    localStorage.setItem("refreshToken", response.data?.data.refreshToken)

    return response.data
  } catch (error) {
    throw error.response
  }
}

export const signOutUser = async () => {
  try {
    const response = await api.post("/users/signout")

    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")

    return response.data
  } catch (error) {
    throw error.response
  }
}

export const registerUser = async (data) => {
  try {
    const response = await api.post("/users/signup", data)

    return response.data
  } catch (error) {
    throw error.response
  }
}

export const fetchProductTypes = async () => {
  try {
    const response = await api.get("/product-types/get-enabled")

    return response.data
  } catch (error) {
    throw error.response
  }
}

export const createNewProduct = async (formData) => {
  try {
    const accessToken = localStorage.getItem("accessToken")
    const response = await api.post("/products/create-product-item", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // This will set the correct headers for form-data
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  } catch (error) {
    throw error.response
  }
}

// export const fetchProducts = async ({ companyId, filters }) => {
//   try {
//     const accessToken = localStorage.getItem("accessToken")
//     const query = new URLSearchParams(filters).toString()
//     const response = await api.get(
//       companyId ? `/products/getCompanyProducts/${companyId}${query}` : `/products/get-product-items${query}`,
//     )
//     console.log("the response of fetchProductsss isssss", response.data)
//     return response.data
//   } catch (error) {
//     throw error.response
//   }
// }

// export const fetchProducts = async ({ companyId, filters }) => {
//   try {
//     const accessToken = localStorage.getItem("accessToken")

//     if (!accessToken) {
//       throw new Error("Access token not found")
//     }

//     // Convert filters into query parameters
//     const query = new URLSearchParams(filters).toString()
//     const endpoint = companyId
//       ? `/products/getCompanyProducts/${companyId}?${query}`
//       : `/products/get-product-items?${query}`

//     // Make the API request with the Authorization header
//     const response = await api.get(endpoint, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`, // Include accessToken in the header
//       },
//     })

//     console.log("The response of fetchProducts is:", response.data.data.productItems)
//     return response.data
//   } catch (error) {
//     console.error("Error fetching products:", error.message)
//     throw error.response
//   }
// }
export const fetchProducts = async ({ companyId, filters }) => {
  try {
    const accessToken = localStorage.getItem("accessToken")

    if (!accessToken) {
      throw new Error("Access token not found")
    }

    // Clean up filters to remove empty or undefined values
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([key, value]) => value !== undefined && value !== ""),
    )

    const query = new URLSearchParams(cleanedFilters).toString()
    const endpoint = companyId
      ? `/products/getCompanyProducts/${companyId}?${query}`
      : `/products/get-product-items?${query}`

    const response = await api.get(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching products:", error.message)
    throw error.response
  }
}

export const fetchSingleProduct = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`)
    return response.data
  } catch (error) {
    throw error.response
  }
}
export const fetchSingleProductWithSlug = async (slug) => {
  try {
    const response = await api.get(`/products/getSingleProdWithSlug/${slug}`)
    return response.data
  } catch (error) {
    throw error.response
  }
}
