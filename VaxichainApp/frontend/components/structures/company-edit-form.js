// "use client"

// import React from "react"
// import AnimatedInput from "../composites/animated-input"
// import Button from "../elements/button"
// import { useSingleCompanyEdit } from "@/contexts/edit-single-dataverifier"
// import Radio from "../elements/radio"
// import RadioGroup from "../blocks/radio-group"
// import InputGroupWithLabel from "../blocks/input-group-with-label"
// import { twMerge } from "tailwind-merge"

// export default function EditCompanyForm() {
//   const { handleSubmit, register, watch, errors } = useSingleCompanyEdit()

//   const submitFn = (data) => {
//     console.log(data)
//   }

//   return (
//     <div>
//       <div className="space-y-6">
//         <div className="space-y-6 rounded-md border-2 border-gray-200 bg-white p-6">
//           <div
//             className={twMerge(
//               "rounded-md border-2 border-[#aea0a0] px-4 pb-8",
//               errors && errors["companyStatus"] ? "border-red-600" : "",
//             )}
//           >
//             <RadioGroup
//               wrapperClassName="-my-3"
//               name="companyStatus"
//               register={register}
//               errors={errors}
//               fieldRule={{ required: "This field is required" }}
//               label="Company Status"
//             >
//               <Radio
//                 label="Approved"
//                 value="approved"
//               />
//               <Radio
//                 label="Pending"
//                 value="pending"
//               />
//               <Radio
//                 label="Declined"
//                 value="declined"
//               />
//             </RadioGroup>
//           </div>

//           <div className="rounded-md border-2 border-[#aea0a0] px-4 pb-8 pt-12">
//             <InputGroupWithLabel
//               cols={2}
//               wrapperClassName="p-0"
//             >
//               <AnimatedInput
//                 placeholder="Company Name"
//                 required
//                 register={register}
//                 errors={errors}
//                 name="companyName"
//                 fieldRule={{ required: "This field is required" }}
//               />
//               <AnimatedInput
//                 placeholder="Full Name"
//                 required
//                 register={register}
//                 errors={errors}
//                 name="ownerName"
//                 fieldRule={{ required: "This field is required" }}
//               />
//             </InputGroupWithLabel>
//           </div>

//           <div className="rounded-md border-2 border-[#aea0a0] px-4 pb-8 pt-12">
//             <InputGroupWithLabel
//               cols={2}
//               wrapperClassName="p-0"
//             >
//               <AnimatedInput
//                 placeholder="User Type"
//                 required
//                 register={register}
//                 errors={errors}
//                 name="userType"
//                 fieldRule={{ required: "This field is required" }}
//               />
//               <AnimatedInput
//                 placeholder="Product Type"
//                 required
//                 register={register}
//                 errors={errors}
//                 name="productType"
//                 fieldRule={{ required: "This field is required" }}
//               />
//             </InputGroupWithLabel>
//           </div>

//           <div className="space-y-4 rounded-md border-2 border-[#aea0a0] px-4 pb-8 pt-12">
//             <InputGroupWithLabel wrapperClassName="p-0">
//               <AnimatedInput
//                 placeholder="Full Address"
//                 required
//                 register={register}
//                 errors={errors}
//                 name="fullAddress"
//                 fieldRule={{ required: "This field is required" }}
//               />
//             </InputGroupWithLabel>

//             <InputGroupWithLabel
//               cols={3}
//               wrapperClassName="p-0"
//             >
//               <AnimatedInput
//                 placeholder="Country"
//                 required
//                 register={register}
//                 errors={errors}
//                 name="addressCountry"
//                 fieldRule={{ required: "This field is required" }}
//               />

//               <AnimatedInput
//                 placeholder="City"
//                 required
//                 register={register}
//                 errors={errors}
//                 name="addressCity"
//                 fieldRule={{ required: "This field is required" }}
//               />

//               <AnimatedInput
//                 placeholder="Zip Code"
//                 required
//                 register={register}
//                 errors={errors}
//                 name="addressZipCode"
//                 fieldRule={{ required: "This field is required" }}
//               />
//             </InputGroupWithLabel>
//           </div>

//           <div className="rounded-md border-2 border-[#aea0a0] px-4 pb-8 pt-12">
//             <InputGroupWithLabel
//               cols={2}
//               wrapperClassName="p-0"
//             >
//               <AnimatedInput
//                 placeholder="Phone Number"
//                 required
//                 register={register}
//                 errors={errors}
//                 name="phoneNumber"
//                 fieldRule={{ required: "This field is required" }}
//               />

//               <AnimatedInput
//                 placeholder="Email"
//                 required
//                 register={register}
//                 errors={errors}
//                 name="email"
//                 fieldRule={{ required: "This field is required" }}
//               />
//             </InputGroupWithLabel>
//           </div>
//         </div>

//         <div className="space-y-6 rounded-md border-2 border-gray-200 p-6">
//           <div>
//             <Button
//               className="bg-purple-700 px-12 py-2 text-white"
//               onClick={handleSubmit(submitFn)}
//             >
//               Save
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
