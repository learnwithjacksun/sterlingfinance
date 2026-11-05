export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  dob: string;
  gender: string;
  employmentStatus: string;
  accountType: string;
  accountNumber: string;
  currency: string;
  balance: number;
  isActive: boolean;
  role: "user" | "admin";
  isAdmin: boolean;
  hasPin: boolean;
  avatar: string;
  createdAt: string;
}

export interface AdminTransaction {
  id: string;
  reference: string;
  amount: number;
  type: "credit" | "debit";
  status: "pending" | "success" | "failed";
  description: string;
  balanceAfter?: number;
  createdAt: string;
  user?: string | { id: string; name?: string; email?: string; currency?: string };
}

export interface VerificationCode {
  id: string;
  codeName: string;
  codeNumber: string;
  instruction: string;
  message: string;
  status: "successful" | "declined" | "";
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
