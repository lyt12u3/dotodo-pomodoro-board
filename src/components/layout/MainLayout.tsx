
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout = () => {  
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title="Do-to-do" />
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
