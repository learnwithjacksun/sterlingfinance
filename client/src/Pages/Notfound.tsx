import { Link } from "react-router-dom";

const Notfound = () => {
  return (
    <div className="layout center min-h-[calc(100vh-100px)]">
      <div className="space-y-4 center flex-col">
        <div className="text-center">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-muted">Page not found</p>
        </div>
        <Link to="/" className="btn btn-primary px-4 py-2 rounded-lg">
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default Notfound;
