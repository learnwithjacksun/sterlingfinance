import { stats } from "@/Constants/data";

const Banner = () => {
  return (
    <>
      <div
        className="bg-cover bg-center bg-no-repeat bg-attachment-fixed py-10 "
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://i.ibb.co/Pz5QPFM1/banner.jpg")`,
        }}
      >
        <div className="main">
          <div className="flex items-center justify-between gap-4 flex-col md:flex-row min-h-[400px] ">
            {stats.map((stat, idx) => (
              <div
                data-aos="zoom-in"
                data-aos-delay={idx * 100}
                key={stat.title}
                className="bg-white/10 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none p-4 rounded-lg space-y-4 flex-1 w-full text-center"
              >
                <div className="mx-auto center bg-white rounded-full h-18 w-18">
                  <stat.icon size={40} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-sora text-white font-bold">
                    {stat.title}
                  </h3>
                  <p className=" text-white/80 text-muted">
                    {stat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Banner;
