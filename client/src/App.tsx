import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ScrollToTop } from "@/Components/UI";
import { Register, Login, ForgotPassword, ResetPassword } from "./Pages/Auth";
import {
  Dashboard,
  Transfer,
  Transactions,
  Statement,
  Profile,
  Settings,
  KYC,
} from "./Pages/Dashboard";
import ProtectedRoute from "./Pages/ProtectedRoute";
import { useAutoRefresh } from "@/Hooks";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Notfound from "./Pages/Notfound";
const App = () => {
  useAutoRefresh();

  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <>
      <Toaster position="top-center" richColors />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/statement" element={<Statement />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/kyc" element={<KYC />} />
        </Route>
        <Route path="*" element={<Notfound />} />
      </Routes>
    </>
  );
};

export default App;
