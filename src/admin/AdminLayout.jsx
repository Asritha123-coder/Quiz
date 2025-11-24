import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "./components/AdminNavbar";

const AdminLayout = () => {
  return (
    <div className="flex">
      {/* Left Sidebar */}
      <AdminNavbar />

      {/* Right Content */}
      <div className="ml-64 p-6 w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
