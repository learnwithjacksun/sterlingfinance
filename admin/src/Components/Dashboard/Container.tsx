interface ContainerProps {
  children: React.ReactNode;
  title?: string;
}

const Container = ({ children, title }: ContainerProps) => {
  
  return (
    <>
      <div className="border border-line rounded-lg bg-secondary relative w-full">
        {title && <h3 className="text-sm text-muted p-4 border-b border-line">{title}</h3>}
        <div className="space-y-4 p-4">{children}</div>
      </div>
    </>
  );
};

export default Container;
