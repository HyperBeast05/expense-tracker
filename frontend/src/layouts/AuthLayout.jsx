import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className=" col-12 col-sm-10 col-md-8 col-lg-5">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-md-5">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AuthLayout;
