

interface TitleProps {
    title: string;
    description: string;
}
const Title = ({ title, description }: TitleProps) => {
  return (
    <div data-aos="fade-up" className="space-y-6 text-center layout">
        <h1 className="text-2xl md:text-4xl font-sora font-bold">{title}</h1>
        <p className="text-muted text-sm md:text-base">{description}</p>
    </div>
  )
}

export default Title