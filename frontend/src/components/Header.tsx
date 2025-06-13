import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="flex justify-between items-center h-16 pl-8 pr-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex items-center">
        <div className="text-right mr-3">
          {user?.name && <div className="text-sm font-medium text-white">{user.name}</div>}
          <div className="text-sm text-gray-400">{user?.email}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white hover:bg-secondary/80 transition-colors"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('settings.title')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('auth.logout.title')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Header;
