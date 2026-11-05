import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useKyc } from "@/Hooks";

const helocSchema = z.object({
  property_address: z.string().min(5, "Property address must be at least 5 characters"),
  property_type: z.string().min(1, "Property type is required"),
  estimated_value: z.string().min(1, "Estimated property value is required"),
  loan_amount: z.string().min(1, "Loan amount is required"),
  employment_status: z.string().min(1, "Employment status is required"),
  annual_income: z.string().min(1, "Annual income is required"),
  credit_score: z.string().min(1, "Credit score is required"),
  existing_mortgage: z.string().min(1, "Please specify if you have an existing mortgage"),
  mortgage_balance: z.string().optional(),
  purpose: z.string().min(1, "Loan purpose is required"),
});

type HelocFormData = z.infer<typeof helocSchema>;

const HelocForm = () => {
  const { submitKycHeloc } = useKyc();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<HelocFormData>({
    resolver: zodResolver(helocSchema),
  });

  const existingMortgage = watch("existing_mortgage");

  const onSubmit = (data: HelocFormData) => {
    toast.promise(submitKycHeloc(data), {
      loading: "Submitting HELOC application...",
      success: () => {
        reset();
        return "HELOC application submitted successfully";
      },
      error: (error: Error) => error.message || "Failed to submit HELOC application",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 lg:col-span-2">
          <label htmlFor="property_address" className="text-sm text-muted">
            Property Address
          </label>
          <input
            type="text"
            id="property_address"
            placeholder="Enter the property address"
            className="input w-full"
            {...register("property_address")}
          />
          {errors.property_address && (
            <p className="text-xs text-red-500">{errors.property_address.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="property_type" className="text-sm text-muted">
            Property Type
          </label>
          <select
            id="property_type"
            className="input w-full"
            {...register("property_type")}
          >
            <option value="">Select property type</option>
            <option value="single_family">Single Family Home</option>
            <option value="condo">Condominium</option>
            <option value="townhouse">Townhouse</option>
            <option value="multi_family">Multi-Family</option>
            <option value="other">Other</option>
          </select>
          {errors.property_type && (
            <p className="text-xs text-red-500">{errors.property_type.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="estimated_value" className="text-sm text-muted">
            Estimated Property Value
          </label>
          <input
            type="number"
            id="estimated_value"
            placeholder="Enter estimated property value"
            className="input w-full"
            {...register("estimated_value")}
          />
          {errors.estimated_value && (
            <p className="text-xs text-red-500">{errors.estimated_value.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="loan_amount" className="text-sm text-muted">
            Desired Loan Amount
          </label>
          <input
            type="number"
            id="loan_amount"
            placeholder="Enter desired loan amount"
            className="input w-full"
            {...register("loan_amount")}
          />
          {errors.loan_amount && (
            <p className="text-xs text-red-500">{errors.loan_amount.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="employment_status" className="text-sm text-muted">
            Employment Status
          </label>
          <select
            id="employment_status"
            className="input w-full"
            {...register("employment_status")}
          >
            <option value="">Select employment status</option>
            <option value="employed">Employed</option>
            <option value="self_employed">Self-Employed</option>
            <option value="retired">Retired</option>
            <option value="unemployed">Unemployed</option>
          </select>
          {errors.employment_status && (
            <p className="text-xs text-red-500">{errors.employment_status.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="annual_income" className="text-sm text-muted">
            Annual Income
          </label>
          <input
            type="number"
            id="annual_income"
            placeholder="Enter your annual income"
            className="input w-full"
            {...register("annual_income")}
          />
          {errors.annual_income && (
            <p className="text-xs text-red-500">{errors.annual_income.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="credit_score" className="text-sm text-muted">
            Credit Score
          </label>
          <input
            type="number"
            id="credit_score"
            placeholder="Enter your credit score"
            className="input w-full"
            {...register("credit_score")}
          />
          {errors.credit_score && (
            <p className="text-xs text-red-500">{errors.credit_score.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="existing_mortgage" className="text-sm text-muted">
            Existing Mortgage
          </label>
          <select
            id="existing_mortgage"
            className="input w-full"
            {...register("existing_mortgage")}
          >
            <option value="">Select an option</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
          {errors.existing_mortgage && (
            <p className="text-xs text-red-500">{errors.existing_mortgage.message}</p>
          )}
        </div>

        {existingMortgage === "yes" && (
          <div className="flex flex-col gap-1">
            <label htmlFor="mortgage_balance" className="text-sm text-muted">
              Current Mortgage Balance
            </label>
            <input
              type="number"
              id="mortgage_balance"
              placeholder="Enter current mortgage balance"
              className="input w-full"
              {...register("mortgage_balance")}
            />
            {errors.mortgage_balance && (
              <p className="text-xs text-red-500">{errors.mortgage_balance.message}</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1 lg:col-span-2">
          <label htmlFor="purpose" className="text-sm text-muted">
            Loan Purpose
          </label>
          <select
            id="purpose"
            className="input w-full"
            {...register("purpose")}
          >
            <option value="">Select loan purpose</option>
            <option value="home_improvement">Home Improvement</option>
            <option value="debt_consolidation">Debt Consolidation</option>
            <option value="education">Education</option>
            <option value="investment">Investment</option>
            <option value="other">Other</option>
          </select>
          {errors.purpose && (
            <p className="text-xs text-red-500">{errors.purpose.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="btn bg-dark text-white w-full h-10 rounded-sm font-medium"
      >
        Submit HELOC Application
      </button>
    </form>
  );
};

export default HelocForm;
