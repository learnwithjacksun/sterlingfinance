import { MainLayout } from "@/Layouts";
import { ChevronDown, Eye, EyeOff, Loader } from "lucide-react";
import { accountTypes, gender, employmentStatus, currency } from "@/Constants/data";
import { useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema } from "@/Schemas/registerSchema";
import { toast } from "sonner";
import { useAuthStore } from "@/Stores";
import { Country }  from 'country-state-city';



const Register = () => {
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();
 const [countries] = useState(Country.getAllCountries());
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: z.infer<typeof registerSchema>) => {
    toast.promise(registerUser(data), {
      loading: "Creating account...",
      success: ()=>{
        navigate("/dashboard");
        return "Account created successfully";
      },
      error: (error) => error.message,
    });
  };

  const onErrors = (data: FieldErrors) => {
    const first = Object.values(data)[0];
    if (first?.message) toast.error(String(first.message));
  }

  return (
    <MainLayout>
      <div className="layout my-10 bg-secondary p-6 rounded-lg border border-line">
        <div className="space-y-1 text-center border-b border-line pb-4">
          <h1 className="text-2xl font-sora font-bold">Create an account</h1>
          <p className="text-muted text-sm">Please enter your details to create an account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onErrors)} className="space-y-4  mt-6">
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="text-muted text-sm">Full Name</label>
              <input
                type="text"
                id="name"
                placeholder="Enter your full legal name"
                className="input"
                {...register("name")}
              />
              {errors.name && <p className="text-xs text-red-500 pl-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-muted text-sm">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="input"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-red-500 pl-1">{errors.email.message}</p>}
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1">
              <label htmlFor="phone" className="text-muted text-sm">Phone Number</label>
              <input
                type="tel"
                id="phone"
                placeholder="Enter your phone number"
                className="input"
                {...register("phone")}
              />
              {errors.phone && <p className="text-xs text-red-500 pl-1">{errors.phone.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="gender" className="text-muted text-sm">Gender</label>
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
                <ChevronDown size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted" />
              </div>
              {errors.phone && <p className="text-xs text-red-500 pl-1">{errors.phone.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="dob" className="text-muted text-sm">Date of Birth</label>
              <input
                type="date"
                id="dob"
                placeholder="Enter your date of birth"
                className="input"
                {...register("dob")}
              />
              {errors.dob && <p className="text-xs text-red-500 pl-1">{errors.dob.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="currency" className="text-muted text-sm">Currency</label>
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
                <ChevronDown size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted" />
              </div>
              {errors.phone && <p className="text-xs text-red-500 pl-1">{errors.phone.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="employment_status" className="text-muted text-sm">Employment Status</label>
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
                <ChevronDown size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted" />
              </div>
              {errors.phone && <p className="text-xs text-red-500 pl-1">{errors.phone.message}</p>}
            </div>

            {/* Country */}
            <div className="flex flex-col gap-1">
              <label htmlFor="country" className="text-muted text-sm">Country</label>
              <div className="relative">
                <select
                  id="country"
                  className="input w-full appearance-none"
                  {...register("country")}
                >
                  <option value="">Select your country</option>
                  {countries.map((country) => (
                    <option key={country.name} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted" />
              </div>
              {errors.country && <p className="text-xs text-red-500 pl-1">{errors.country.message}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="address" className="text-muted text-sm">Address</label>
              <input
                type="text"
                id="address"
                placeholder="Enter your address"
                className="input"
                {...register("address")}
              />
              {errors.address && <p className="text-xs text-red-500 pl-1">{errors.address.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="address" className="text-muted text-sm">City</label>
              <input
                type="text"
                id="city"
                placeholder="Enter your city"
                className="input"
                {...register("city")}
              />
              {errors.city && <p className="text-xs text-red-500 pl-1">{errors.city.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="address" className="text-muted text-sm">State</label>
              <input
                type="text"
                id="state"
                placeholder="Enter your state"
                className="input"
                {...register("state")}
              />
              {errors.state && <p className="text-xs text-red-500 pl-1">{errors.state.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="zip" className="text-muted text-sm">Zip Code</label>
              <input
                type="text"
                id="zip"
                placeholder="Enter your zip code"
                className="input"
                {...register("zip")}
              />
              {errors.zip && <p className="text-xs text-red-500 pl-1">{errors.zip.message}</p>}
            </div>

            {/* Account Type */}
            <div className="flex flex-col gap-1">
              <label htmlFor="accountType" className="text-muted text-sm">Account Type</label>
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
                <ChevronDown size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted" />
              </div>
              {errors.accountType && <p className="text-xs text-red-500 pl-1">{errors.accountType.message}</p>}
            </div>

            {/* Transaction PIN */}
            <div className="flex flex-col gap-1">
              <label htmlFor="pin" className="text-muted text-sm">4 Digit Transaction Pin</label>
              <input
                type="number"
                id="pin"
                placeholder="Enter your transaction PIN"
                className="input"
                {...register("pin")}
              />
              {errors.pin && <p className="text-xs text-red-500 pl-1">{errors.pin.message}</p>}
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm text-muted">Password</label>
            <div className="relative flex items-center justify-between gap-2">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Minimum 8 characters"
                className="input flex-1"
                autoComplete="off"
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
            {errors.password && <p className="text-xs text-red-500 pl-1">{errors.password.message}</p>}
          </div>

          <p className="text-xs text-muted">By submitting this form, you agree to our <Link to="/terms" className="text-primary">Terms of Service</Link> and <Link to="/privacy" className="text-primary">Privacy Policy</Link>.</p>

          {/* Submit Button */}
          <button disabled={isLoading} type="submit" className="btn bg-dark text-white w-full h-10 rounded-lg">
            {isLoading ? <Loader className="animate-spin" /> : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-muted text-center mt-6">Already have an account? <Link to="/" className="text-primary font-sora">Login</Link></p>
      </div>
    </MainLayout>
  );
};

export default Register;
