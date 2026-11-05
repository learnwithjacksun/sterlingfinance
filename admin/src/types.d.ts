interface ThemeStore {
  theme: string;
  toggleTheme: () => void;
  fetchTheme: () => void;
}

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  country: string;
  accountType: string;
  currency: string;
  pin: string;
  agree: boolean;
}

interface Transaction {
  id: string;
  transactionId: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  balance: number;
  user: string;
}
