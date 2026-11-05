import { useKyc } from "@/Hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Building2, 
  CalendarDays, 
  CheckCircle, 
  CreditCard, 
  FileCheck, 
  Mail, 
  MapPin,  
  Smartphone, 
  Upload, 
  User, 
  X
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// --- Schema Definition ---
const idMeSchema = z.object({
  // Personal Info
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  date_of_birth: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date < new Date();
  }, "Date of birth must be in the past"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  
  // Government ID Section
  id_type: z.enum(["drivers_license", "passport", "state_id"], {
    errorMap: () => ({ message: "Please select an ID type" }),
  }),
  id_number: z.string().min(5, "ID number must be at least 5 characters"),
});

type IdMeFormData = z.infer<typeof idMeSchema>;

const IdMeForm = () => {
  const {submitKycIdme, loading} = useKyc()
  const [frontIdImg, setFrontIdImg] = useState<File | null>(null);
  const [backIdImg, setBackIdImg] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<IdMeFormData>({
    resolver: zodResolver(idMeSchema),
    mode: "onChange",
  });

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const removeImage = (
    setFile: (file: File | null) => void,
    setPreview: (url: string | null) => void,
    previewUrl: string | null
  ) => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreview(null);
  };

  const onSubmit = async (data: IdMeFormData) => {
    if (!frontIdImg || !backIdImg) {
      toast.error("Please upload both front and back images of your ID");
      return;
    }

    // Submitted once only (it used to be called twice, creating duplicate submissions).
    toast.promise(submitKycIdme({ ...data, frontIdImg, backIdImg }), {
      loading: "Verifying identity...",
      success: () => {
        reset();
        setFrontIdImg(null);
        setBackIdImg(null);
        setFrontPreview(null);
        setBackPreview(null);
        return "Identity verification submitted successfully!";
      },
      error: (error: Error) => error.message || "Verification failed. Please try again.",
    });
  };

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h2 className="text-lg font-bold">
        
          Identity Verification
        </h2>
        <p className="text-gray-500 text-sm mt-2">
          Verify your identity to unlock all features. Your data is encrypted and secure.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information Section */}
        <section className="">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2 border border-line bg-background p-2">
            <User className="w-5 h-5 text-indigo-500" />
            Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">First Name</label>
              <div className="relative">
                <input
                  type="text"
                  {...register("first_name")}
                  className={`w-full text-sm px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none ${
                    errors.first_name ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="John"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.first_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Last Name</label>
              <div className="relative">
                <input
                  type="text"
                  {...register("last_name")}
                  className={`w-full text-sm px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none ${
                    errors.last_name ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="Doe"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date of Birth</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarDays size={18} className=" text-muted" />
                </div>
                <input
                  type="date"
                  {...register("date_of_birth")}
                  className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none ${
                    errors.date_of_birth ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                />
                {errors.date_of_birth && (
                  <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.date_of_birth.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className=" text-muted" />
                </div>
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none ${
                    errors.email ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Smartphone size={18} className=" text-muted" />
                </div>
                <input
                  type="tel"
                  {...register("phone")}
                  className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none ${
                    errors.phone ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={18} className=" text-muted" />
                </div>
                <input
                  type="text"
                  {...register("address")}
                  className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none ${
                    errors.address ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="123 Main St, Apt 4B"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Government ID Section */}
        <section className="">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2 border border-line bg-background p-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            Government ID Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">ID Type</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard size={18} className=" text-muted" />
                </div>
                <select
                  {...register("id_type")}
                  className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none bg-white ${
                    errors.id_type ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                >
                  <option value="">Select ID Type</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="passport">Passport</option>
                  <option value="state_id">State ID</option>
                </select>
                {errors.id_type && (
                  <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.id_type.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">ID Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileCheck size={18} className=" text-muted" />
                </div>
                <input
                  type="text"
                  {...register("id_number")}
                  className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none ${
                    errors.id_number ? "border-red-300 bg-red-50" : "border-gray-200"
                  }`}
                  placeholder="Enter ID Number"
                />
                {errors.id_number && (
                  <p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1">
                    <X className="w-3 h-3" /> {errors.id_number.message}
                  </p>
                )}
              </div>
            </div>

            {/* Document Upload Area */}
            <div className="md:col-span-2 space-y-4 pt-4">
              <h4 className="text-sm font-medium text-gray-900">Document Photos</h4>
              <p className="text-sm text-gray-500">Please provide clear photos of the front and back of your ID.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Front ID Upload */}
                <div className="space-y-2">
                   <span className="text-xs font-medium text-gray-600 block mb-1">Front of ID</span>
                  {!frontPreview ? (
                    <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${!frontIdImg && isSubmitting ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className={`w-8 h-8 mb-3 ${!frontIdImg && isSubmitting ? 'text-red-400' : 'text-gray-400'}`} />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG or PDF</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, setFrontIdImg, setFrontPreview)}
                      />
                    </label>
                  ) : (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={frontPreview} alt="Front ID Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(setFrontIdImg, setFrontPreview, frontPreview)}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                         <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 text-center">
                        Front ID Selected
                      </div>
                    </div>
                  )}
                   {!frontIdImg && isSubmitting && (
                    <p className="text-red-500 text-xs mt-1">Front ID image is required</p>
                  )}
                </div>

                {/* Back ID Upload */}
                <div className="space-y-2">
                   <span className="text-xs font-medium text-gray-600 block mb-1">Back of ID</span>
                  {!backPreview ? (
                    <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${!backIdImg && isSubmitting ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className={`w-8 h-8 mb-3 ${!backIdImg && isSubmitting ? 'text-red-400' : 'text-gray-400'}`} />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                         <p className="text-xs text-gray-500">PNG, JPG or PDF</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                         onChange={(e) => handleImageUpload(e, setBackIdImg, setBackPreview)}
                      />
                    </label>
                  ) : (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={backPreview} alt="Back ID Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(setBackIdImg, setBackPreview, backPreview)}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                       <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 text-center">
                        Back ID Selected
                      </div>
                    </div>
                  )}
                   {!backIdImg && isSubmitting && (
                    <p className="text-red-500 text-xs mt-1">Back ID image is required</p>
                  )}
                </div>

              </div>
            </div>
          </div>
        </section>

        <div className=" pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 w-full bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {loading ? (
              <>Converting...</>
            ) : (
              <>
                Submit Verification <CheckCircle className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IdMeForm;
