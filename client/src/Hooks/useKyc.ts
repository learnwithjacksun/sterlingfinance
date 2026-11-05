import React from "react";
import { api } from "@/Libs/api";

export interface IdMePayload {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  address: string;
  id_type: string;
  id_number: string;
  frontIdImg: File;
  backIdImg: File;
}

export interface HelocPayload {
  property_address: string;
  property_type: string;
  estimated_value: string;
  loan_amount: string;
  employment_status: string;
  annual_income: string;
  credit_score: string;
  existing_mortgage: string;
  mortgage_balance?: string;
  purpose: string;
}

export default function useKyc() {
  const [loading, setLoading] = React.useState(false);

  // The server uploads the ID images (the image-host key never reaches the browser).
  const submitKycIdme = async (data: IdMePayload) => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("firstName", data.first_name);
      form.append("lastName", data.last_name);
      form.append("dateOfBirth", data.date_of_birth);
      form.append("email", data.email);
      form.append("phone", data.phone);
      form.append("address", data.address);
      form.append("idType", data.id_type);
      form.append("idNumber", data.id_number);
      form.append("frontIdImg", data.frontIdImg);
      form.append("backIdImg", data.backIdImg);
      const response = await api.post("/me/kyc/idme", form);
      return response.data.kyc;
    } finally {
      setLoading(false);
    }
  };

  const submitKycHeloc = async (data: HelocPayload) => {
    setLoading(true);
    try {
      const response = await api.post("/me/kyc/heloc", {
        propertyAddress: data.property_address,
        propertyType: data.property_type,
        estimatedValue: data.estimated_value,
        loanAmount: data.loan_amount,
        employmentStatus: data.employment_status,
        annualIncome: data.annual_income,
        creditScore: data.credit_score,
        existingMortgage: data.existing_mortgage,
        mortgageBalance: data.mortgage_balance,
        purpose: data.purpose,
      });
      return response.data.application;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitKycIdme,
    submitKycHeloc,
    loading,
  };
}
