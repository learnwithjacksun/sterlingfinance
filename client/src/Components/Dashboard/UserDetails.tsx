import type { User } from "@/Types/api";
import { formatNumber } from "@/Utils/formatNumber";
import { List, Star, UserRound, Wallet } from "lucide-react";

const UserDetails = ({ userData }: { userData: User | null | undefined }) => {
 
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-4">
       <div className="bg-gradient-to-br from-gradient-1 to-gradient-2 text-white p-4 rounded-md space-y-2 flex items-center justify-between">
       <UserRound size={40} />
      
      
       <div className="space-y-2 text-right">
          <h3 className="text-white text-sm font-medium">
            Account Number
          </h3>
          <p className="text-white text-2xl">
            {userData?.accountNumber}
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-500 to-gray-300 text-white p-4 rounded-md space-y-2 flex items-center justify-between">
        
        <List size={40} className="fill-white" />
        
        <div className="space-y-2 text-right">
          <h3 className="text-white text-sm font-medium">
            Account Type
          </h3>
          <p className="text-white text-2xl capitalize">
            {userData?.accountType}
          </p>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-gradient-1 to-gradient-2 flex-row-reverse text-white p-4 rounded-md space-y-2 flex items-center justify-between">
        <div className="space-y-2 text-right">
          <h3 className="text-white text-sm font-medium">
            Account Balance
          </h3>
          <p className="text-white text-2xl">
            {userData?.currency}
            {formatNumber(userData?.balance)}
          </p>
        </div>
        <Wallet size={40} />
      </div>
     
      


      <div className="bg-gradient-to-br from-gray-700 to-gray-500 text-white p-4 rounded-md space-y-2 flex items-center justify-between">
        <Star size={40} />
        
        
        <div className="space-y-2 text-right">
          <h3 className="text-gray-400 text-sm font-medium">
            Account currency
          </h3>
          <p className="text-white text-xl">
            ({userData?.currency})
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
