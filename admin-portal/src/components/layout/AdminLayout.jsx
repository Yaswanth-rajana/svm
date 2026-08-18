import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar/Sidebar';
import TopNavbar from './header/TopNavbar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-black overflow-hidden text-white font-sans">
      {/* Sidebar Component */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 ml-64">
        <TopNavbar />
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
