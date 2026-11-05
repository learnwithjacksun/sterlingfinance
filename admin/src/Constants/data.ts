import {
  Banknote,
  CreditCard,
  LayoutDashboard,
  Settings,
  UserRound,
  Wallet,
  Briefcase,
  Home,
  Users,
  Car,
  Book,
  PencilRuler,
  Hammer,
  Gem,
  ThumbsUp,
  DollarSign,
  Award,
  MonitorSmartphone,
  FileText,
  Mail,
  CheckCircle,
  UserPlus,
} from "lucide-react";

export const navLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Services",
    href: "/#services",
  },
  {
    label: "Projects",
    href: "/#projects",
  },
  {
    label: "Contact",
    href: "/#contact",
  },
];

export const accountTypes = [
  {
    label: "Checking Account",
    value: "checking ",
  },
  {
    label: "Online Account",
    value: "online",
  },
  {
    label: "Current Account",
    value: "current",
  },
  {
    label: "Corporate Account",
    value: "corporate",
  },
  {
    label: "Offshore Account",
    value: "offshore",
  },
  {
    label: "Joint Account",
    value: "joint",
  },
];

export const gender = [
  {
    label: "Male",
    value: "male",
  },
  {
    label: "Female",
    value: "female",
  },
  {
    label: "Others",
    value: "others",
  },
];

export const employmentStatus = [
  {
    label: "Employed",
    value: "employed",
  },
  {
    label: "Unemployed",
    value: "unemployed",
  },
  {
    label: "Self-Employed",
    value: "self-employed",
  },
  {
    label: "Retired",
    value: "retired",
  },
];

export const currency = [
  {
    label: "USD",
    value: "$",
  },
  {
    label: "EUR",
    value: "€",
  },
  {
    label: "GBP",
    value: "£",
  },
];

export const dashboardMenuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Funds Transfer",
    href: "/transfer",
    icon: CreditCard,
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: Wallet,
  },
  {
    label: "Accounts Statement",
    href: "/statement",
    icon: Banknote,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: UserRound,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export const adminNavLinks = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Create User",
    href: "/admin/create-user",
    icon: UserPlus,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export const loans = [
  {
    title: "Business Loan",
    description:
      "Nurture the fast growth of your business or enterprise with any of our bank's business loans and grants.",
    icon: Briefcase,
  },
  {
    title: "Home Loan",
    description:
      "This is available for customers interested in buying houses with any of the Bank’s accredited property.",
    icon: Home,
  },
  {
    title: "Commercial Loan",
    description:
      "This loan is available to our customers who wish to establish large-scale businesses which demand high capital.",
    icon: Users,
  },
  {
    title: "Car Loan",
    description:
      "Whether for a new car, truck, or boat, or for your dream house, First Financial Bank will be there to guide you through.",
    icon: Car,
  },
  {
    title: "Education Loan",
    description:
      "For those who have a strong will for manpower development or want to further their education, we have got you covered.",
    icon: Book,
  },
  {
    title: "Construction Loan",
    description:
      "This loan is available for those who want to go into real estate building and management investment, with minimal interest.",
    icon: Hammer,
  },
  {
    title: "Gold Loan",
    description:
      "About 25 gold mining companies are partnering with us for loans, which they invest across the globe for equipment purchase.",
    icon: Gem,
  },
  {
    title: "Land Loan",
    description:
      "Do you have a dream of becoming a landowner? Our bank has got you covered with the world's most attractive offer.",
    icon: PencilRuler,
  },
];

export const stats = [
  {
    title: "100%",
    description: "Success Rate",
    icon: ThumbsUp,
  },
  {
    title: "280,000",
    description: "Happy Customers",
    icon: Users,
  },
  {
    title: "1.4B",
    description: "Loan Disbursed",
    icon: DollarSign,
  },
  {
    title: "401",
    description: "Award Achieved",
    icon: Award,
  },
];

export const projects = [
  {
    title: "Funding",
    description: "Fund Management",
    image: "/img1.jpg",
  },
  {
    title: "Funding",
    description: "Business Loan",
    image: "/img2.jpg",
  },
  {
    title: "Funding",
    description: "Housing Loan",
    image: "/img3.jpg",
  },
];

export const loanProcess = [
  {
    title: "Apply From Online",
    description: "Download the loan application form, fill and email it to us.",
    icon: MonitorSmartphone,
  },
  {
    title: "Need to Review",
    description:
      "Our management will review the application and consider your request within three working days.",
    icon: FileText,
  },
  {
    title: "Client Communication",
    description:
      "After the review, you will be notified through the email you provided for further information.",
    icon: Mail,
  },
  {
    title: "Approval",
    description:
      "Once you meet up with our loan's terms and agreement, you receive the fund in your account within 24 hours.",
    icon: CheckCircle,
  },
];

export const benefits = [
  "Installation of free tracking device for autos valued at $300,000 and above (Free for cars above $3 million; otherwise, $50,000).",
  "Buy a car of your choice from our list of acceptable brands and spread payment over a convenient period.",
  "We have reliable dealers accredited to ensure you buy from a safe source.",
  "Convenient insurance payment included in the loan repayment amount.",
  "No residual cost at the end of the loan tenure.",
];

export const features = [
  "Borrow $50,000.00 to $150,000.00",
  "Payment over 12 to 48 months",
  "Contribute as low as 20% towards the purchase",
  "Comprehensive insurance on the car for the entire loan period",
  "No security required",
  "Competitive pricing and no hidden charges",
];
