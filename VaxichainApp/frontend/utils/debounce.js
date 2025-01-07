import { useEffect, useState } from "react"

export const useDebounce = ({ searchValue, timeout = 1000 }) => {
  const [debounceData, setDebounceData] = useState(searchValue)

  useEffect(() => {
    const interval = setTimeout(() => {
      setDebounceData(searchValue)
    }, timeout)
    return () => {
      clearTimeout(interval)
    }
  }, [searchValue, timeout])

  return debounceData
}
//  const debounceData= useDebounce({searchValue})
