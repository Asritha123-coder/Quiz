import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  FileQuestion,
  Settings,
  BarChart3,
  Users,
  LogOut,
} from "lucide-react";

const AdminSidebar = () => {
  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin/dashboard" },
    {
      name: "Categories",
      icon: <FolderKanban size={20} />,
      path: "/admin/categories",
    },
    {
      name: "Questions",
      icon: <FileQuestion size={20} />,
      path: "/admin/questions",
    },
    {
      name: "Quiz Settings",
      icon: <Settings size={20} />,
      path: "/admin/settings",
    },
    {
      name: "Analytics",
      icon: <BarChart3 size={20} />,
      path: "/admin/analytics",
    },
    {
      name: "Users",
      icon: <Users size={20} />,
      path: "/admin/users",
    },
  ];

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-xl flex flex-col p-4">

      {/* Logo */}
      <div className="text-2xl font-bold tracking-wide mb-8 mt-2 pl-2">
        Admin Panel
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 
               ${isActive ? "bg-white/25 shadow-md backdrop-blur-sm" : "hover:bg-white/10"}`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Logout Button */}
      <button className="flex items-center gap-3 px-4 py-3 rounded-xl mt-6 hover:bg-white/10 transition">
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
};

export default AdminSidebar;
