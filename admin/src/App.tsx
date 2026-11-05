import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ScrollToTop } from "@/Components/UI";
import {
  Auth,
  Dashboard,
  Profile,
  FundAccount,
  DebitAccount,
  Transactions,
  EditAccount,
  Codes,
  ViewTransaction,
} from "./Pages";
import ProtectedRoute from "./Pages/ProtectedRoute";
import NotFound from "./Pages/Notfound";
import { ForgotPassword, ResetPassword } from "./Pages/ResetPassword";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import CreateUser from "./Pages/Admin/CreateUser";
import Settings from "./Pages/Admin/Settings";
const App = () => {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <>
      <Toaster position="top-center" richColors />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Every admin screen requires a real admin session that passed the passcode step. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateUser />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/user/:id/profile" element={<Profile />} />
          <Route path="/user/:id/fund" element={<FundAccount />} />
          <Route path="/user/:id/debit" element={<DebitAccount />} />
          <Route path="/user/:id/transactions" element={<Transactions />} />
          <Route path="/user/:id/transactions/:txId" element={<ViewTransaction />} />
          <Route path="/user/:id/edit" element={<EditAccount />} />
          <Route path="/user/:id/code" element={<Codes />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
