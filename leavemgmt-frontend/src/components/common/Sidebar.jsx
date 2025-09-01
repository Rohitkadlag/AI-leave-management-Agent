// TODO: Add component content here
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  BoltIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/constants';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon, roles: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN] },
    { name: 'My Leaves', href: '/leaves', icon: DocumentTextIcon, roles: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN] },
    { name: 'Team Management', href: '/team', icon: UserGroupIcon, roles: [ROLES.MANAGER, ROLES.ADMIN] },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, roles: [ROLES.ADMIN] },
    { name: 'AI Assistant', href: '/ai-assistant', icon: BoltIcon, roles: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN] },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: [ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN] }
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform 
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 lg:justify-center">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LM</span>
              </div>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900 lg:hidden">
              LeaveManager
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {filteredNavigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  onClick={onClose}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* AI Status */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="ml-2 text-xs font-medium text-green-700">
                AI Assistant Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;