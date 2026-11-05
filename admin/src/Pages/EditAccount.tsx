import { Container, UploadImage } from "@/Components/Dashboard";
import { DashboardLayout } from "@/Layouts";
import { useParams } from "react-router-dom";
import { useAdminStore } from "@/Stores";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { editUserSchema } from "@/Schemas/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCountries, useUser } from "@/Hooks";
import {
  employmentStatus,
  gender,
  currency,
  accountTypes,
} from "@/Constants/data";
import { Camera, ChevronDown, Loader } from "lucide-react";
import { UserDetails } from "@/Components/Admin";
import { Modal } from "@/Components/UI";
import { AnimatePresence } from "framer-motion";

const EditAccount = () => {
  const { id } = useParams();
  const { updateAvatar, updateUser, isUpdating } = useAdminStore();
  const { user } = useUser(id);

  const { countries } = useCountries();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof editUserSchema>>({
    resolver: zodResolver(editUserSchema),
  });

  // Fill the form once the user has loaded.
  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      dob: user.dob,
      currency: user.currency,
      employment_status: user.employmentStatus,
      country: user.country,
      address: user.street,
      city: user.city,
      state: user.state,
      zip: user.zip,
      accountType: user.accountType,
      pin: "",
    });
  }, [user?.id, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (data: z.infer<typeof editUserSchema>) => {
    if (!id) return;
    toast.promise(updateUser(id, data), {
      loading: "Updating...",
      success: "Updated successfully",
      error: (e: Error) => e.message || "Failed to update",
    });
  };

  const [isOpen, setIsOpen] = useState(false);

  const avatar =
    user?.avatar ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${user?.name}`;

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = () => {
    if (!image || !id) {
      toast.error("Please select an image");
      return;
    }
    if (image.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }
    if (image) {
      toast.promise(updateAvatar(id, image), {
        loading: "Updating...",
        success: () => {
          setIsOpen(false);
          setImage(null);
          setPreview(null);
          return "Avatar updated successfully";
        },
        error: (e: Error) => e.message || "Failed to update",
      });
    }
  };

  const handleCancel = () => {
    setImage(null);
    setPreview(null);
    setIsOpen(false);
  };

  return (
    <>
    
    
    <DashboardLayout>
      <UserDetails userData={user} />

      <div className="flex gap-6 flex-wrap md:flex-nowrap">
        <Container title={`Account Overview`}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  readOnly
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 pl-1">
                    {errors.name.message as string}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-muted text-sm">
                  Email Address (Read Only)
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="input"
                  readOnly
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 pl-1">
                    {errors.email.message as string}
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
                    {errors.phone.message as string}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="gender" className="text-muted text-sm">
                  Gender
                </label>
                <div className="relative">
                  <select
                    id="accountType"
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
                    {errors.gender.message as string}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="dob" className="text-muted text-sm">
                  Date of Birth (Read Only)
                </label>
                <input
                  type="date"
                  id="dob"
                  placeholder="Enter your date of birth"
                  className="input"
                  readOnly
                  {...register("dob")}
                />
                {errors.dob && (
                  <p className="text-xs text-red-500 pl-1">
                    {errors.dob.message as string}
                  </p>
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
                    {errors.currency.message as string}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="employment_status"
                  className="text-muted text-sm"
                >
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
                    {errors.employment_status.message as string}
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
                    {...register("country")}
                  >
                    <option value="">Select your country</option>
                    {countries.map((country) => (
                      <option
                        key={country.name.common}
                        value={country.name.common}
                      >
                        {country.name.common}
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
                    {errors.country.message as string}
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
                    {errors.address.message as string}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="address" className="text-muted text-sm">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  placeholder="Enter your city"
                  className="input"
                  {...register("city")}
                />
                {errors.city && (
                  <p className="text-xs text-red-500 pl-1">
                    {errors.city.message as string}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="address" className="text-muted text-sm">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  placeholder="Enter your state"
                  className="input"
                  {...register("state")}
                />
                {errors.state && (
                  <p className="text-xs text-red-500 pl-1">
                    {errors.state.message as string}
                  </p>
                )}
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
                  <p className="text-xs text-red-500 pl-1">
                    {errors.zip.message as string}
                  </p>
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
                    {errors.accountType.message as string}
                  </p>
                )}
              </div>

              {/* Transaction PIN */}
              <div className="flex flex-col gap-1">
                <label htmlFor="pin" className="text-muted text-sm">
                  Transaction Pin (leave blank to keep the current one)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  id="pin"
                  placeholder="New 4 to 6 digit PIN"
                  autoComplete="off"
                  className="input"
                  {...register("pin")}
                />
                {errors.pin && (
                  <p className="text-xs text-red-500 pl-1">
                    {errors.pin.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* Passwords are hashed and cannot be viewed or set here; use the reset email on the profile page. */}
            <p className="text-xs text-muted">
              Passwords are stored securely and cannot be viewed. To help a user get back in, use "Email password
              reset link" on their profile page.
            </p>

            {/* Submit Button */}
            <button
              disabled={isUpdating}
              type="submit"
              className="btn btn-primary w-full h-10 rounded-lg"
            >
              {isUpdating ? (
                <Loader className="animate-spin" />
              ) : (
                "Update Account"
              )}
            </button>
          </form>
        </Container>

        <div className="center flex-col bg-gradient-to-br from-gradient-1 to-gradient-2 p-4 min-h-[400px] max-h-[400px] md:min-w-[280px] min-w-full rounded-lg space-y-8">
              <div className="w-40 h-40 border-6 border-white rounded-full overflow-hidden">
                <img
                  src={avatar}
                  alt="avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <div className="text-center text-white space-y-4">
                <p className="text-xs">You are viewing!</p>
                <p className="uppercase text-sm font-medium">{user?.name}</p>
              </div>

              <button
                onClick={() => setIsOpen(true)}
                className="btn mt-4 bg-dark p-2 text-white rounded-md text-sm"
              >
                <Camera size={18} />
                Change Avatar
              </button>
            </div>
      </div>
    </DashboardLayout>


    <AnimatePresence>
        {isOpen && (
          <Modal
            title="Profile Image"
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          >
            <UploadImage
              onChange={handleChange}
              preview={preview}
              name="Avatar"
              handleUpload={handleUpload}
              cancelUpload={handleCancel}
              isLoading={isUpdating}
            />
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export default EditAccount;
