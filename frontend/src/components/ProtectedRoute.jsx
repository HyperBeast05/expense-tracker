import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { isAuthenticated, loading, authUnavailable, checkAuth } = useAuth();

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>

        <p className="mt-3">Checking authentication...</p>
      </div>
    );
  }

  if (authUnavailable) {
    return (
      <div className="container py-5">
        <div
          className="alert alert-warning mx-auto"
          style={{ maxWidth: "600px" }}
          role="alert"
        >
          <h5 className="alert-heading">Server Unavailable</h5>

          <p>
            We couldn't verify your login session. Please start the backend
            server and try again.
          </p>

          <button type="button" className="btn btn-primary" onClick={checkAuth}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
