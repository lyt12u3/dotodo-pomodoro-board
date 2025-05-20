import { NavLink } from "react-router-dom";
import { ListTodo, Timer } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="w-[220px] min-h-screen bg-[#121212] border-r border-gray-800 p-4 flex flex-col">
      <div className="flex items-center mb-8 gap-2">
        <div className="w-8 h-8 bg-purple-600 flex items-center justify-center text-white rounded">
          <span className="font-bold">D</span>
        </div>
        <h1 className="text-white text-xl font-bold">Do-to-do</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <NavLink 
              to="/tasks" 
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
              }
            >
              <ListTodo className="w-5 h-5 mr-3" />
              Tasks
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/pomodoro" 
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
              }
            >
              <Timer className="w-5 h-5 mr-3" />
              Pomodoro
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
