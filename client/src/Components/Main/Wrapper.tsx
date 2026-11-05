import clsx from "clsx";
import { Link } from "react-router-dom";
interface WrapperProps {
  children?: React.ReactNode;
  title: string;
  description: string;
  isReverse?: boolean;
  image: string;
  buttonPath?: string;
  buttonText?: string;
}

const Wrapper = ({
  children,
  title,
  description,
  isReverse = false,
  image,
  buttonPath,
  buttonText,
}: WrapperProps) => {
  return (
    <div
      className={clsx(
        "flex flex-col md:items-center gap-10 md:flex-row main mt-16",
        isReverse && "md:flex-row-reverse"
      )}
    >
      <div data-aos="zoom-in" className="w-full h-full flex-1 flex flex-col items-center justify-center">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div data-aos="fade-left" className="w-full h-full flex-1 space-y-6">
        <h1 className="text-2xl md:text-4xl font-sora font-bold">{title}</h1>
        {description && <p className="text-muted text-sm md:text-base">{description}</p>}
        <div>{children}</div>
        <div className="mt-10">
         {buttonPath && buttonText && <Link to={buttonPath} className="btn-primary px-10 py-4 rounded-lg">
              {buttonText}
            </Link>}
        </div>
      </div>
    </div>
  );
};

export default Wrapper;
