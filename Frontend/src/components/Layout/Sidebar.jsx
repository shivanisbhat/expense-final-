import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import React from 'react';
export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen p-6">
      <div className="mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
          <span className="text-white font-bold text-xl">E</span>
        </div>
        <h2 className="text-xl font-bold">ExpenseTracker</h2>
        <p className="text-sm text-gray-400">{user?.company?.name}</p>
      </div>

      <nav className="space-y-2">
        <div className="px-4 py-2 bg-gray-700 rounded-lg">
          <span className="text-sm font-medium">Dashboard</span>
        </div>
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-gray-400">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}