import { loanProcess } from "@/Constants/data"
import { Title } from "../UI"

const Process = () => {
  return (
    <>
    <div id="process" className="my-10 py-10 bg-secondary">
        <Title title="We have a simple online application" description="Which will give you the adjuct information, how to get loan!" />
        <div className="main grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-10 mt-10">
            {loanProcess.map((process, idx) => (
                <div data-aos="fade-up" data-aos-delay={idx * 100} key={process.title} className="bg-white p-4 rounded-lg space-y-4">
                    <process.icon size={40} className="text-primary mx-auto" />
                    <div className="space-y-2 text-center">
                        <h3 className="text-lg font-sora font-bold">{process.title}</h3>
                        <p className="text-sm text-muted">{process.description}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
    </>
  )
}

export default Process