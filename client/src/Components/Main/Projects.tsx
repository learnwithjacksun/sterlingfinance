import { Title } from "@/Components/UI";
import { projects } from "@/Constants/data";
import { Plus } from "lucide-react";
const Projects = () => {
  return (
    <>
      <div id="projects" className="my-10">
        <Title
          title="1000+ Projects Completed With Absolute Quality"
          description="Create new products, reduce cost and risk, and enable the manufacturing. Innovations enabled by the First Financial Bank and afiliate institutes results in products that assist workers."
        />
        <div className="main mt-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((project, idx) => (
              <div
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                key={idx}
                className="bg-white/10 relative backdrop-blur-sm md:bg-transparent md:backdrop-blur-none p-4 rounded-lg space-y-4 flex-1 w-full overflow-hidden max-h-[400px]"
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] p-4 bg-white space-y-2 flex justify-between items-center">
                  <div>
                    <h3 className="text-blue-700 text-sm font-medium">
                      {project.title}
                    </h3>
                    <p className=" text-md font-sora font-semibold">
                      {project.description}
                    </p>
                  </div>
                  <div className="center bg-primary h-10 w-10">
                    <Plus size={20} className="text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Projects;
