import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogOut, Home, User } from "lucide-react";
import icon from "../../assets/quiz-icon.png";

const AdminNavbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  const goToUserView = () => {
    navigate("/home");
  };

  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white p-5 fixed left-0 top-0 flex flex-col">
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-700">
        <img 
          src={icon} 
          alt="TriviaTrek Logo" 
          className="h-10 w-10 object-contain"
        />
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>

      <nav className="flex flex-col gap-4 flex-1">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `p-2 rounded-lg ${isActive ? "bg-gray-700" : "hover:bg-gray-800"}`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/add-category"
          className={({ isActive }) =>
            `p-2 rounded-lg ${isActive ? "bg-gray-700" : "hover:bg-gray-800"}`
          }
        >
          Add Category
        </NavLink>

        <NavLink
          to="/admin/add-subcategory"
          className={({ isActive }) =>
            `p-2 rounded-lg ${isActive ? "bg-gray-700" : "hover:bg-gray-800"}`
          }
        >
          Add Sub-Category
        </NavLink>

        <NavLink
          to="/admin/add-questions"
          className={({ isActive }) =>
            `p-2 rounded-lg ${isActive ? "bg-gray-700" : "hover:bg-gray-800"}`
          }
        >
          Add Questions
        </NavLink>

        <NavLink
          to="/admin/manage-categories"
          className={({ isActive }) =>
            `p-2 rounded-lg ${isActive ? "bg-gray-700" : "hover:bg-gray-800"}`
          }
        >
          Manage Categories
        </NavLink>

        <NavLink
          to="/admin/manage-subcategories"
          className={({ isActive }) =>
            `p-2 rounded-lg ${isActive ? "bg-gray-700" : "hover:bg-gray-800"}`
          }
        >
          Manage Sub-Categories
        </NavLink>

        <NavLink
          to="/admin/manage-questions"
          className={({ isActive }) =>
            `p-2 rounded-lg ${isActive ? "bg-gray-700" : "hover:bg-gray-800"}`
          }
        >
          Manage Questions
        </NavLink>

        <NavLink
          to="/admin/analytics"
          className={({ isActive }) =>
            `p-2 rounded-lg ${isActive ? "bg-gray-700" : "hover:bg-gray-800"}`
          }
        >
          Analytics
        </NavLink>
      </nav>

      {/* User Info and Actions */}
      <div className="mt-auto pt-6 border-t border-gray-700">
        <div className="mb-4 px-2">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-gray-400" />
            <span className="text-sm text-gray-300">{user?.name || "Admin"}</span>
          </div>
          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
        </div>
        
        <button
          onClick={goToUserView}
          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800 transition mb-2 text-left"
        >
          <Home size={18} />
          <span>Go to User View</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-900/50 transition text-red-300 hover:text-red-200 text-left"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;
