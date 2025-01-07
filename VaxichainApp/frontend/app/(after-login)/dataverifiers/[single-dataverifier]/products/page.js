"use client"; 

import React from "react";
import ProductsTemplate from "@/components/structures/products-template";
export default function ViewCompanyProductsRetailer({params}) {
  const {"single-company": companyId} = params 
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl">View company products</h2>
      </div>

      {/* <div>
        <CompaniesProductsProvider>
        <ViewCompanyProducts params={params} />
        </CompaniesProductsProvider>
      </div> */}
      {/* <h2>{params}</h2> */}
      <ProductsTemplate companyId={companyId}/>
    </div>
  );
}
