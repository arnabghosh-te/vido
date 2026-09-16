import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>
      <nav className="mt-4 flex-1">
        <ul>
          <li className="mb-2">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `block px-4 py-2 hover:bg-gray-700 ${isActive ? 'bg-gray-700 border-l-4 border-blue-500' : ''}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `block px-4 py-2 hover:bg-gray-700 ${isActive ? 'bg-gray-700 border-l-4 border-blue-500' : ''}`
              }
            >
              User Management
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to="/admin/plans"
              className={({ isActive }) =>
                `block px-4 py-2 hover:bg-gray-700 ${isActive ? 'bg-gray-700 border-l-4 border-blue-500' : ''}`
              }
            >
              Subscription Plans
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `block px-4 py-2 hover:bg-gray-700 ${isActive ? 'bg-gray-700 border-l-4 border-blue-500' : ''}`
              }
            >
              My Profile
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-150"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
