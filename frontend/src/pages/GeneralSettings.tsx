import React from 'react';
import { CogIcon } from '@heroicons/react/24/outline';

const GeneralSettings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <CogIcon className="h-6 w-6 text-gray-400 mr-3" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">General Settings</h1>
              <p className="text-sm text-gray-600">
                Configure general application settings
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="text-center py-12">
            <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">General Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              General settings configuration will be available in a future update.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;