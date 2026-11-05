import { DashboardLayout } from "@/Layouts";
import { Container, UserDetails } from "@/Components/Dashboard";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { useState } from "react";
import { useAuthStore } from "@/Stores";
import { Loader } from "lucide-react";
import IdMeForm from "./components/IdMeForm";
import HelocForm from "./components/HelocForm";

const KYC = () => {
  const { user: userData } = useAuthStore();

  const tabs = [
    {
      label: "Id.me",
      id: "idme",
    },
    {
      label: "HELOC",
      id: "heloc",
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  if (!userData) {
    return (
      <div className="layout center min-h-[calc(100vh-100px)]">
        <Loader className="animate-spin" /> Preparing your account...
      </div>
    );
  }

  return (
    <>
    <DashboardLayout title="KYC Verification">
        <UserDetails userData={userData} />
        <div className="relative z-10">
      <Container>
        <div className="flex gap-4 mb-10 border-b border-line pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={clsx(
                "text-sm capitalize px-4 py-2 rounded-sm font-medium font-sans",
                {
                  "btn-primary text-white font-sans": tab.id === activeTab,
                }
              )}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          </div>
        

        {activeTab === "idme" && <IdMeForm />}
        {activeTab === "heloc" && <HelocForm />}

            <div className="absolute inset-0 z-50 center">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />
              <div className="relative z-50 max-w-md w-[90%] mx-auto text-center px-6 py-8 rounded-2xl bg-card border border-line shadow-lg bg-white">
                <h2 className="text-2xl font-bold mb-3">KYC Verification</h2>
                <p className="text-sm text-muted mb-4 leading-relaxed">
                  Identity verification (Id.me) and HELOC applications are not yet available. We are preparing a secure, streamlined process and will notify you when it’s ready.
                </p>
                <p className="text-sm text-muted mb-6 leading-relaxed">
                  You will be required to complete KYC verification before accessing certain services. For now, no action is needed—we’ll reach out when verification is required.
                </p>
                <Link
                  to="/support"
                  className="btn-primary inline-flex items-center justify-center w-full h-10 rounded-full font-medium"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </Container>
        </div>

    </DashboardLayout>

   
    </>
  );
};

export default KYC;
