/* export const getValidLink = (url) => {
  const lowercaseURL = url.toLowerCase()

  const isValidURL = /^(http:\/\/|https:\/\/)?(www\.)?([a-z0-9\-]+\.)?([a-z0-9\-]+\.)([a-z]+)(\.[a-z]{2,8})?/g
  // could end with or without a /

  return isValidURL.test(lowercaseURL)
    ? lowercaseURL.startsWith("http://") || lowercaseURL.startsWith("https://")
      ? lowercaseURL
      : `https://${lowercaseURL}`
    : "#"
}
 */

export const getValidLink = (url) => {
  const lowerCaseURL = url.toLowerCase()

  return lowerCaseURL.startsWith("http://") || lowerCaseURL.startsWith("https://")
    ? lowerCaseURL
    : `https://${lowerCaseURL}`
}

export const capitalize = (string) => {
  if (!string) return

  const initialChar = string[0]

  return initialChar.toUpperCase() + string.slice(1)
}

export const selectOptionWithHeading = (selectOptions = []) =>
  selectOptions.length <= 0
    ? [{ value: "", text: "----- Select Product Type -----" }]
    : [
        { value: "", text: "----- Select Product Type -----" },
        ...selectOptions.map((option) => ({ value: option, text: option.name })),
      ]

export const currencyFormat = (amt) => {
  return new Intl.NumberFormat("ne-NP", { style: "currency", currency: "NPR" }).format(amt)
}
