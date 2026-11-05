import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      className="w-full min-h-[calc(100vh-60px)] flex justify-center items-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://i.ibb.co/Pz5QPFM1/background.jpg")`,
      }}
    >
      <main className="flex flex-col items-center gap-4 text-center layout">
        <div className="space-y-4">
          <p className="uppercase text-white">Simpe. Transparent. Secure</p>
            <h1 data-aos="fade-up" data-aos-delay={100} className="md:text-6xl text-5xl font-bold text-white">
              True Mark <span className="text-primary">Financial</span> Bank
            </h1>
            <p data-aos="fade-up" data-aos-delay={200} className="text-white">Your Banking and Financial Solution</p>
        </div>

        <div data-aos="fade-up" data-aos-delay={300} className="flex gap-4">
            <Link to="/register" className="btn-primary btn min-w-40 h-12 rounded-md">Get Started</Link>
            <a href="/#about" className="text-white border btn border-white rounded-md min-w-40 h-12">Learn More</a>
        </div>
      </main>
    </section>
  );
};

export default Hero;
