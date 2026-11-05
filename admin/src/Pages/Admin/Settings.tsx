import { DashboardLayout } from "@/Layouts";
import { Container } from "@/Components/Dashboard";
import { useAdminStore } from "@/Stores";
import { useState } from "react";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { changePasscodeSchema } from "@/Schemas/schemas";

const Settings = () => {
  const { changePasscode, isUpdating } = useAdminStore();
  const [currentPasscode, setCurrentPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");

  const handleUpdatePasscode = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parsed = changePasscodeSchema.safeParse({ currentPasscode, newPasscode });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    toast.promise(changePasscode(currentPasscode, newPasscode), {
      loading: "Updating passcode...",
      success: () => {
        setCurrentPasscode("");
        setNewPasscode("");
        return "Passcode updated successfully";
      },
      error: (error: Error) => error.message,
    });
  };
  return (
    <DashboardLayout title="Settings">
      <Container title="Update Passcode">
        {/* The passcode is stored hashed on the server, so it can no longer be displayed. */}
        <form onSubmit={handleUpdatePasscode} className="space-y-2">
          <input
            type="password"
            autoComplete="off"
            placeholder="Enter current passcode"
            className="input w-full"
            value={currentPasscode}
            onChange={(e) => setCurrentPasscode(e.target.value)}
          />
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Enter new passcode"
            className="input w-full"
            value={newPasscode}
            onChange={(e) => setNewPasscode(e.target.value)}
          />
          <button
            disabled={isUpdating}
            type="submit"
            className="btn-primary w-full h-10 rounded-lg"
          >
            {isUpdating ? (
              <Loader size={20} className="animate-spin" />
            ) : (
              "Update"
            )}
          </button>
        </form>
      </Container>
    </DashboardLayout>
  );
};

export default Settings;
