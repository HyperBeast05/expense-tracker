import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const MainLayout = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
