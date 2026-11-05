import { DashboardLayout } from "@/Layouts";
import { Container } from "@/Components/Dashboard";
import { Camera } from "lucide-react";
import { useAuthStore } from "@/Stores";
import { useState } from "react";
import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { Modal } from "@/Components/UI";
import { UploadImage, UserDetails } from "@/Components/Dashboard";
const Profile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, updateAvatar, isUpdating } = useAuthStore();

  const userData = {
    name: user?.name,
    email: user?.email,
    avatar: user?.avatar,
    address: user?.street,
    city: user?.city,
    state: user?.state,
    zip: user?.zip,
    country: user?.country,
    phone: user?.phone,
    isAdmin: user?.isAdmin,
  };

  const avatar =
    userData.avatar ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${userData.name}`;

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
    if (!image) {
      toast.error("Please select an image");
      return;
    }
    if (image.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }
    if (image) {
      toast.promise(updateAvatar(image), {
        loading: "Updating avatar...",
        success: () => {
          setIsOpen(false);
          setImage(null);
          setPreview(null);
          return "Avatar updated successfully";
        },
        error: (error: Error) => error.message || "Failed to update avatar",
      });
    }
  };

  const handleCancel = () => {
    setImage(null);
    setPreview(null);
    setIsOpen(false);
  };

  if (!user) {
    return 
  }

  return (
    <>
      <DashboardLayout title="Profile">
        <UserDetails userData={user} />
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="center flex-col">
              <div className="w-30 h-30 rounded-full overflow-hidden">
                <img
                  src={avatar}
                  alt="avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              <button
                onClick={() => setIsOpen(true)}
                className="btn mt-4 bg-dark p-2 text-white rounded-md text-sm"
              >
                <Camera size={18} />
                Change Avatar
              </button>
            </div>
            <div className="col-span-2">
              <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                <div className="bg-foreground p-2 rounded-lg space-y-1">
                  <p className="text-xs text-muted">Full Name</p>
                  <h3 className="text-sm font-medium font-sora">
                    {userData.name}
                  </h3>
                </div>
                <div className="bg-foreground p-2 rounded-lg space-y-1">
                  <p className="text-xs text-muted">Email Address</p>
                  <h3 className="text-sm line-clamp-1 font-medium font-sora">
                    {userData.email}
                  </h3>
                </div>
                <div className="bg-foreground p-2 rounded-lg space-y-1">
                  <p className="text-xs text-muted">Address</p>
                  <h3 className="text-sm line-clamp-1 font-medium font-sora">
                    {userData.address}
                  </h3>
                </div>
                <div className="bg-foreground p-2 rounded-lg space-y-1">
                  <p className="text-xs text-muted">City</p>
                  <h3 className="text-sm line-clamp-1 font-medium font-sora">
                    {userData.city}
                  </h3>
                </div>
                <div className="bg-foreground p-2 rounded-lg space-y-1">
                  <p className="text-xs text-muted">State</p>
                  <h3 className="text-sm line-clamp-1 font-medium font-sora">
                    {userData.state}
                  </h3>
                </div>
                <div className="bg-foreground p-2 rounded-lg space-y-1">
                  <p className="text-xs text-muted">Zip</p>
                  <h3 className="text-sm line-clamp-1 font-medium font-sora">
                    {userData.zip}
                  </h3>
                </div>
                <div className="bg-foreground p-2 rounded-lg space-y-1">
                  <p className="text-xs text-muted">Country</p>
                  <h3 className="text-sm line-clamp-1 font-medium font-sora">
                    {userData.country}
                  </h3>
                </div>
                <div className="bg-foreground p-2 rounded-lg space-y-1">
                  <p className="text-xs text-muted">Phone</p>
                  <h3 className="text-sm line-clamp-1 font-medium font-sora">
                    {userData.phone}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </Container>
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

export default Profile;
