import { Title } from "@/Components/UI";
import { MainLayout } from "@/Layouts";
import { features, benefits } from "@/Constants/data";
import { CheckCircle } from "lucide-react";
const Details = () => {
  return (
    <>
      <MainLayout>
        <div className="space-y-10">
          <section
            className="w-full min-h-[calc(100vh-60px)] flex justify-center items-center bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://i.ibb.co/Pz5QPFM1/background.jpg")`,
            }}
          >
            <main className="flex flex-col items-center gap-4 text-center layout">
              <div className="space-y-4">
                <h1
                  data-aos="fade-up"
                  data-aos-delay={100}
                  className="md:text-6xl text-5xl font-bold text-white"
                >
                  Services <span className="text-primary">Details</span>
                </h1>
                <p
                  data-aos="fade-up"
                  data-aos-delay={200}
                  className="text-white"
                >
                  Home - Services - Auto Loans Details
                </p>
              </div>
            </main>
          </section>
          <div className="layout space-y-10">
            <Title
              title="The True Mark Auto Loans Details"
              description="Get your wheels on the road … with the First Financial Bank Limited Auto Loan."
            />
            <img
              src="https://i.ibb.co/jZjs6rdw/car.jpg"
              className="w-full h-full object-cover mt-10"
            />
            <p className="mt-10">
              The True Mark Financial Bank Auto loan offers you short to medium
              term loans for the purchase of brand new vehicles with the
              convenience of spreading repayments over a period of time. This is
              available to both salaried customers and business owners. It
              enables customer purchase vehicles from auto dealers who have been
              prequalified and have agreed an SLA with the bank
            </p>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Features</h3>
              <ul>
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">Benefits</h3>
              <ul>
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="">
              <div>
                <h3 className="text-2xl font-bold">Eligibility</h3>
                <p>
                  Any salaried, self-employed or professional Public and Privat
                  companies, Government sector employees including Public Sector
                  is eligible for a personal loan.
                </p>
              </div>

              <AmortizationSchedule />
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default Details;

const AmortizationSchedule = () => {
  return (
    <div className="container mx-auto mt-10">
      <h2 className="text-white text-center text-xl font-bold bg-primary py-3 rounded-t-lg">
        Car Loan Amortization Schedule
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-primary text-white">
              <th className="p-3 border border-gray-300">Year</th>
              <th className="p-3 border border-gray-300">Opening Balance</th>
              <th className="p-3 border border-gray-300">EMI*12</th>
              <th className="p-3 border border-gray-300">
                Interest paid yearly
              </th>
              <th className="p-3 border border-gray-300">
                Principal paid yearly
              </th>
              <th className="p-3 border border-gray-300">Closing Balance</th>
            </tr>
          </thead>
          <tbody className="text-center">
            <tr className="bg-gray-100">
              <td className="p-3 border border-gray-300">1</td>
              <td className="p-3 border border-gray-300">25,00,000</td>
              <td className="p-3 border border-gray-300">2,28,109</td>
              <td className="p-3 border border-gray-300">1,66,879</td>
              <td className="p-3 border border-gray-300">61,231</td>
              <td className="p-3 border border-gray-300">24,38,769</td>
            </tr>
            <tr className="bg-white">
              <td className="p-3 border border-gray-300">2</td>
              <td className="p-3 border border-gray-300">24,38,769</td>
              <td className="p-3 border border-gray-300">2,28,109</td>
              <td className="p-3 border border-gray-300">1,62,615</td>
              <td className="p-3 border border-gray-300">65,494</td>
              <td className="p-3 border border-gray-300">23,73,276</td>
            </tr>
            <tr className="bg-gray-100">
              <td className="p-3 border border-gray-300">3</td>
              <td className="p-3 border border-gray-300">23,73,276</td>
              <td className="p-3 border border-gray-300">2,28,109</td>
              <td className="p-3 border border-gray-300">1,58,055</td>
              <td className="p-3 border border-gray-300">70,054</td>
              <td className="p-3 border border-gray-300">23,03,222</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
