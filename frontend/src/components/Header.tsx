import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();

  return (
    <div className="flex justify-between items-center h-16 pl-8 pr-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center">
        <div className="text-right mr-3">
          <div className="text-sm text-gray-400">{user?.email}</div>
        </div>
        <button 
          onClick={logout}
          className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white"
        >
          {user?.email.charAt(0).toUpperCase()}
        </button>
      </div>
    </div>
  );
};

export default Header;
