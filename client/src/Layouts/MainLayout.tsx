import { Header } from "@/Components/Main";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div style={
       {
        backgroundImage: "url('https://i.ibb.co/Pz5QPFM1/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
       }                            
      } className="min-h-screen">
        <Header />
        <main className="flex-1 pb-10">{children}</main>
      </div>
    </>
  );
};

export default MainLayout;
