interface ContainerProps {
  children: React.ReactNode;
  title?: string;
}

const Container = ({ children, title }: ContainerProps) => {
  
  return (
    <>
      <div className="border border-line p-4 rounded-lg bg-secondary relative">
        {title && <h3 className="text-sm text-muted">{title}</h3>}
        <div className="mt-4 space-y-4">{children}</div>
      </div>
    </>
  );
};

export default Container;
