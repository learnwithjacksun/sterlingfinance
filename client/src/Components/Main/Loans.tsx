import { loans } from "@/Constants/data";
import { Link } from "react-router-dom";

const Loans = () => {
  return (
    <>
      <div id="services" className="mt-10 bg-secondary py-10">
        <div className="main grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1  gap-10">
          {loans.map((loan, idx) => (
            <div
              data-aos="fade-up"
              data-aos-delay={idx * 100}
              key={loan.title}
              className="bg-white p-4 rounded-lg space-y-4"
            >
              <loan.icon size={40} className="text-primary" />
              <div>
                <h3 className="text-lg font-sora font-bold">{loan.title}</h3>
                <p className="text-sm text-muted">{loan.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Link to="/details" className="btn-primary mt-10 px-10 py-4 mx-auto block w-fit">
          See Details
        </Link>
      </div>
    </>
  );
};

export default Loans;
