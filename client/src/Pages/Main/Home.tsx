import { MainLayout } from "@/Layouts";
import { Hero, Wrapper, Loans, Banner, Projects, Process, Testimonials } from "@/Components/Main";
import { UsersRound } from "lucide-react";
const Home = () => {
  return (
    <>
      <MainLayout>
        <Hero />
        <section id="about">
          <Wrapper
            title="Small Business Loans For a Daily Expenses"
            description="At True Mark Financial Bank, we believe that your bank should support your dreams and aspirations. That’s why we have developed convenient mortgage solutions to help make your dream of owning your own business a reality. We offer a range of loans to suit your needs, from personal loans to business loans. We also offer a range of savings and investment products to help you grow your money. "
            image="https://i.ibb.co/WYQs36Y/about.png"
          >
            <div className="flex items-center md:flex-row flex-col">
              <div className="bg-primary text-white md:w-[80px] md:h-[80px] h-12 w-full flex items-center justify-center">
                <UsersRound />
              </div>
              <div className="flex-1 bg-black text-white p-4 w-full min-h-full md:h-[80px] flex items-center justify-center">
                <h3 className="text-xl font-semibold text-center md:text-left">
                  We are trusted by more than 25,000 customers
                </h3>
              </div>
            </div>
          </Wrapper>
        </section>
        <Loans />
        <Banner />
        <Projects />
        <Process />
        <Testimonials />
      </MainLayout>
    </>
  );
};

export default Home;
