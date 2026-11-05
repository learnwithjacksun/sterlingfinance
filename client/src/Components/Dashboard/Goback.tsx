import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Goback = () => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(-1)}
      className="p-3 hover:bg-foreground bg-background rounded-full"
    >
      <ArrowLeft size={20} className="text-main" />
    </div>
  );
};

export default Goback;
