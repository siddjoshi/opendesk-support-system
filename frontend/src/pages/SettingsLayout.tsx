import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BellIcon, UserIcon, CogIcon } from '@heroicons/react/24/outline';

const settingsNavigation = [
  {
    name: 'Notifications',
    href: '/settings/notifications',
    icon: BellIcon,
    description: 'Configure email notification preferences'
  },
  {
    name: 'Profile',
    href: '/settings/profile',
    icon: UserIcon,
    description: 'Update your profile information'
  },
  {
    name: 'General',
    href: '/settings/general',
    icon: CogIcon,
    description: 'General application settings'
  }
];

const SettingsLayout: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        {/* Settings Navigation */}
        <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
          <nav className="space-y-1">
            {settingsNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-500'
                      : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
                  }`
                }
              >
                <item.icon
                  className={`flex-shrink-0 -ml-1 mr-3 h-6 w-6 ${
                    window.location.pathname === item.href 
                      ? 'text-indigo-500' 
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Settings Content */}
        <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;