import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Goback = () => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(-1)}
      className=" rounded-full"
    >
      <ArrowLeft size={22} className="text-main" />
    </div>
  );
};

export default Goback;
