import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  User, 
  Calendar, 
  Users, 
  Activity, 
  BarChart3,
  Search,
  FileText
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { profile } = useAuth();

  const getMenuItems = () => {
    switch (profile?.role) {
      case 'patient':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'appointments', label: 'Appointments', icon: Calendar },
          { id: 'find-surgeon', label: 'Find Surgeon', icon: Search },
          { id: 'health-profile', label: 'Health Profile', icon: User },
        ];
      case 'surgeon':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'patients', label: 'My Patients', icon: Users },
          { id: 'schedule', label: 'My Schedule', icon: Calendar },
          { id: 'profile', label: 'Profile', icon: User },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'SurgiCast', icon: BarChart3 },
          { id: 'analytics', label: 'Analytics', icon: Activity },
          { id: 'reports', label: 'Reports', icon: FileText },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-white border-r border-neutral-200 h-full"
    >
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-neutral-500'}`} />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </motion.div>
  );
};