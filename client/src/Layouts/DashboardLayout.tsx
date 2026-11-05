import { Sidebar, Header } from "@/Components/Dashboard";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  isDashboard?: boolean;
}

const DashboardLayout = ({
  children,
  title,
  isDashboard = false,
}: DashboardLayoutProps) => {
  return (
    <>
      <main className="flex h-[100dvh]">
        <Sidebar />
        <div className="flex-1 overflow-scroll hide-scrollbar">
          <Header isDashboard={isDashboard} />
          <div className="w-[90%] mx-auto py-4 space-y-4">
          {title && <h2 className="text-lg font-sora font-medium text-gradient-1">
              {title}
            </h2>}
            <section className="space-y-4 pb-20">{children}</section>
          </div>
        </div>
      </main>
    </>
  );
};

export default DashboardLayout;
