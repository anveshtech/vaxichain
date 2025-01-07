import { userTypeOptions } from "./staticUtils"

export const loginEmailRule = {
  required: {
    value: true,
    message: "email required",
  },
}

export const registerEmailRule = {
  required: {
    value: true,
    message: "email required",
  },
  pattern: {
    value: /^[a-zA-Z][a-zA-Z0-9\-\_]+@[a-zA-Z]+\.[a-zA-Z]{2,8}(\.[a-zA-Z]{2})?$/g,
    message: "invalid email",
  },
}

export const loginPasswordRule = {
  required: {
    value: true,
    message: "password required",
  },
}

export const registrationPasswordRule = {
  required: {
    value: true,
    message: "field required",
  },
  /* pattern: {
    value: /[a-zA-Z0-9]+^([a-zA-Z0-9]+)/g,
    message: "must contain an alpahbet, a number and a symbol",
  }, */
  minLength: {
    value: 8,
    message: "must be at least 8 characters long",
  },
}

export const registrationConfirmPasswordRule = {
  required: {
    value: true,
    message: "field required",
  },
}

export const firstNameRule = {
  required: {
    value: true,
    message: "first name required",
  },
  pattern: {
    value: /^[a-zA-Z]+$/g,
    message: "invalid name",
  },
  maxLength: {
    value: 24,
    message: "max 24 characters",
  },
  minLength: {
    value: 2,
    message: "min 2 characters",
  },
}

export const lastNameRule = {
  required: {
    value: true,
    message: "last name required",
  },
  pattern: {
    value: /^[a-zA-Z]+$/g,
    message: "invalid name",
  },
  maxLength: {
    value: 24,
    message: "max 24 characters",
  },
}

export const middleNameRule = {
  pattern: {
    value: /^[a-zA-Z]+$/g,
    message: "invalid name",
  },
  maxLength: {
    value: 24,
    message: "max 24 characters",
  },
}

export const addressLineRule = {
  required: {
    value: true,
    message: "address line required",
  },
}

export const countryRule = {
  required: {
    value: true,
    message: "country required",
  },
  pattern: {
    value: /^[a-zA-Z]+$/g,
    message: "invalid name",
  },
}

export const cityRule = {
  required: {
    value: true,
    message: "city required",
  },
  pattern: {
    value: /^[a-zA-Z]+$/g,
    message: "invalid name",
  },
}

export const zipRule = {
  required: {
    value: true,
    message: "zip code required",
  },
  pattern: {
    value: /^[0-9]+$/g,
    message: "invalid zip code",
  },
}

export const phoneRule = {
  required: {
    value: true,
    message: "phone number required",
  },
  maxLength: {
    value: 16,
    message: "phone number too long",
  },
  pattern: {
    value: /^[0-9]{10}$/,
    message: "invalid, phone number should be exactly 10 digits",
  },
}

export const companyNameRule = {
  required: {
    value: true,
    message: "company name required",
  },
  minLength: {
    value: 8,
    message: "min 8 characters",
  },
}

export const userTypeRule = {
  required: {
    value: true,
    message: "user type required",
  },
  validate: (value) => {
    return userTypeOptions.some((option) => option.value === value)
  },
}

export const productTypeRule = {
  required: {
    value: true,
    message: "product type required",
  },
}
