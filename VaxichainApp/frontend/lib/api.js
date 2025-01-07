import axios from "axios"

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  baseURL:
    process.env.NEXT_PUBLIC_ENV === "DEV"
      ? process.env.NEXT_PUBLIC_BASE_URL_DEV
      : process.env.NEXT_PUBLIC_BASE_URL_PROD,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")

    if (!token) return config

    config.headers.Authorization = `Bearer ${token}`

    return config
  },
  (error) => {
    // console.error(error.response, "error from request interceptors")
    return Promise.reject(error.response)
  },
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const previousConfig = error.config

    if (
      error.response?.data?.statusCode === 401 &&
      error.response?.data?.name?.toLowerCase() === "jwt error" &&
      !previousConfig._retry
    ) {
      previousConfig._retry = true

      try {
        const response = await axios.post(`${previousConfig.baseURL}/users/refresh-access-token`, {
          refreshToken: localStorage.getItem("refreshToken"),
        })

        const { accessToken, refreshToken } = response.data?.data
        localStorage.setItem("accessToken", accessToken)
        localStorage.setItem("refreshToken", refreshToken)

        return await api(previousConfig)
      } catch (error) {
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export { api }
