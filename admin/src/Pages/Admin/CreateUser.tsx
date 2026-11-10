import { DashboardLayout } from "@/Layouts";
import { registerSchema } from "@/Schemas/registerSchema";
import { Country, State, City } from "country-state-city";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { useAdminStore } from "@/Stores";
import { gender, employmentStatus, currency, accountTypes } from "@/Constants/data";
import { ChevronDown, Eye, EyeOff, Loader } from "lucide-react";
import { Container } from "@/Components/Dashboard";

const CreateUser = () => {
  const { createUser, isLoading } = useAdminStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const countries = useMemo(() => Country.getAllCountries(), []);
  const countryName = watch("country");
  const stateName = watch("state");
  const countryCode = countries.find((c) => c.name === countryName)?.isoCode;
  const states = useMemo(() => (countryCode ? State.getStatesOfCountry(countryCode) : []), [countryCode]);
  const stateCode = states.find((x) => x.name === stateName)?.isoCode;
  const cities = useMemo(
    () => (countryCode && stateCode ? City.getCitiesOfState(countryCode, stateCode) : []),
    [countryCode, stateCode],
  );

  const onSubmit = (data: z.infer<typeof registerSchema>) => {
    toast.promise(createUser(data), {
      loading: "Creating account...",
      success: (user) => {
        reset();
        return data.password
          ? `Account created for ${user.email}`
          : `Account created. An email was sent to ${user.email} to set their password`;
      },
      error: (error: Error) => error.message,
    });
  };
  return (
    <DashboardLayout title="Create User">
        <Container>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4  mt-6">
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-muted text-sm">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              placeholder="Enter your full legal name"
              className="input"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500 pl-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-muted text-sm">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="input"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500 pl-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-muted text-sm">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              placeholder="Enter your phone number"
              className="input"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 pl-1">
                {errors.phone.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="gender" className="text-muted text-sm">
              Gender
            </label>
            <div className="relative">
              <select
                id="gender"
                className="input w-full appearance-none"
                {...register("gender")}
              >
                <option value="">Select your gender</option>
                {gender.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
            {errors.gender && (
              <p className="text-xs text-red-500 pl-1">
                {errors.gender.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="dob" className="text-muted text-sm">
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              placeholder="Enter your date of birth"
              className="input"
              {...register("dob")}
            />
            {errors.dob && (
              <p className="text-xs text-red-500 pl-1">{errors.dob.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="currency" className="text-muted text-sm">
              Currency
            </label>
            <div className="relative">
              <select
                id="currency"
                className="input w-full appearance-none"
                {...register("currency")}
              >
                <option value="">Select your currency</option>
                {currency.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
            {errors.currency && (
              <p className="text-xs text-red-500 pl-1">
                {errors.currency.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="employment_status" className="text-muted text-sm">
              Employment Status
            </label>
            <div className="relative">
              <select
                id="employment_status"
                className="input w-full appearance-none"
                {...register("employment_status")}
              >
                <option value="">Select your employment status</option>
                {employmentStatus.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
            {errors.employment_status && (
              <p className="text-xs text-red-500 pl-1">
                {errors.employment_status.message}
              </p>
            )}
          </div>

          {/* Country */}
          <div className="flex flex-col gap-1">
            <label htmlFor="country" className="text-muted text-sm">
              Country
            </label>
            <div className="relative">
              <select
                id="country"
                className="input w-full appearance-none"
                {...register("country", {
                  onChange: () => {
                    setValue("state", "");
                    setValue("city", "");
                  },
                })}
              >
                <option value="">Select your country</option>
                {countries.map((country) => (
                  <option key={country.isoCode} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
            {errors.country && (
              <p className="text-xs text-red-500 pl-1">
                {errors.country.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="address" className="text-muted text-sm">
              Address
            </label>
            <input
              type="text"
              id="address"
              placeholder="Enter your address"
              className="input"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-xs text-red-500 pl-1">
                {errors.address.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="state" className="text-muted text-sm">
              State / Province
            </label>
            {states.length > 0 ? (
              <div className="relative">
                <select
                  id="state"
                  className="input w-full appearance-none"
                  {...register("state", { onChange: () => setValue("city", "") })}
                >
                  <option value="">Select your state</option>
                  {states.map((x) => (
                    <option key={x.isoCode} value={x.name}>
                      {x.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            ) : (
              <input
                type="text"
                id="state"
                placeholder={countryName ? "Enter your state" : "Select a country first"}
                className="input"
                {...register("state")}
              />
            )}
            {errors.state && <p className="text-xs text-red-500 pl-1">{errors.state.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="city" className="text-muted text-sm">
              City
            </label>
            {cities.length > 0 ? (
              <div className="relative">
                <select id="city" className="input w-full appearance-none" {...register("city")}>
                  <option value="">Select your city</option>
                  {cities.map((x, i) => (
                    <option key={`${x.name}-${i}`} value={x.name}>
                      {x.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            ) : (
              <input
                type="text"
                id="city"
                placeholder="Enter your city"
                className="input"
                {...register("city")}
              />
            )}
            {errors.city && <p className="text-xs text-red-500 pl-1">{errors.city.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="zip" className="text-muted text-sm">
              Zip Code
            </label>
            <input
              type="text"
              id="zip"
              placeholder="Enter your zip code"
              className="input"
              {...register("zip")}
            />
            {errors.zip && (
              <p className="text-xs text-red-500 pl-1">{errors.zip.message}</p>
            )}
          </div>

          {/* Account Type */}
          <div className="flex flex-col gap-1">
            <label htmlFor="accountType" className="text-muted text-sm">
              Account Type
            </label>
            <div className="relative">
              <select
                id="accountType"
                className="input w-full appearance-none"
                {...register("accountType")}
              >
                <option value="">Select account type</option>
                {accountTypes.map((accountType) => (
                  <option key={accountType.value} value={accountType.value}>
                    {accountType.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted"
              />
            </div>
            {errors.accountType && (
              <p className="text-xs text-red-500 pl-1">
                {errors.accountType.message}
              </p>
            )}
          </div>

          {/* Transaction PIN */}
          <div className="flex flex-col gap-1">
            <label htmlFor="pin" className="text-muted text-sm">
              4 Digit Transaction Pin
            </label>
            <input
              type="text"
              inputMode="numeric"
              id="pin"
              autoComplete="off"
              placeholder="Enter the transaction PIN (4 to 6 digits)"
              className="input"
              {...register("pin")}
            />
            {errors.pin && (
              <p className="text-xs text-red-500 pl-1">{errors.pin.message}</p>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm text-muted">
            Password (optional: leave blank to email the user a link to set their own)
          </label>
          <div className="relative flex items-center justify-between gap-2">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Minimum 8 characters"
              className="input flex-1"
              autoComplete="new-password"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-xs absolute right-2 center"
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 pl-1">
              {errors.password.message}
            </p>
          )}
        </div>

      

        {/* Submit Button */}
        <button
          disabled={isLoading}
          type="submit"
          className="btn btn-primary w-full h-10 rounded-lg"
        >
          {isLoading ? <Loader className="animate-spin" /> : "Create Account"}
        </button>
      </form>
      </Container>

    </DashboardLayout>
  );
};

export default CreateUser;
