import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface NotificationPreferences {
  ticketCreated: boolean;
  ticketUpdated: boolean;
  ticketAssigned: boolean;
  ticketCommented: boolean;
  ticketResolved: boolean;
  ticketClosed: boolean;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  emailNotifications: NotificationPreferences;
}

const NotificationSettings: React.FC = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    ticketCreated: true,
    ticketUpdated: true,
    ticketAssigned: true,
    ticketCommented: true,
    ticketResolved: true,
    ticketClosed: true,
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
        setPreferences(data.user.emailNotifications || {
          ticketCreated: true,
          ticketUpdated: true,
          ticketAssigned: true,
          ticketCommented: true,
          ticketResolved: true,
          ticketClosed: true,
        });
      } else {
        setError('Failed to load user profile');
      }
    } catch (err) {
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/users/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailNotifications: preferences
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save preferences');
      }
    } catch (err) {
      setError('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    {
      key: 'ticketCreated' as keyof NotificationPreferences,
      title: 'New Ticket Created',
      description: 'Receive notifications when a new ticket is created',
      icon: '🎫',
    },
    {
      key: 'ticketUpdated' as keyof NotificationPreferences,
      title: 'Ticket Status Updated',
      description: 'Receive notifications when ticket status changes',
      icon: '📝',
    },
    {
      key: 'ticketAssigned' as keyof NotificationPreferences,
      title: 'Ticket Assigned',
      description: 'Receive notifications when a ticket is assigned to you or someone else',
      icon: '👤',
    },
    {
      key: 'ticketCommented' as keyof NotificationPreferences,
      title: 'New Comments',
      description: 'Receive notifications when someone comments on your tickets',
      icon: '💬',
    },
    {
      key: 'ticketResolved' as keyof NotificationPreferences,
      title: 'Ticket Resolved',
      description: 'Receive notifications when a ticket is resolved',
      icon: '✅',
    },
    {
      key: 'ticketClosed' as keyof NotificationPreferences,
      title: 'Ticket Closed',
      description: 'Receive notifications when a ticket is closed',
      icon: '🔒',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading notification settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <BellIcon className="h-6 w-6 text-gray-400 mr-3" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Notification Settings</h1>
              <p className="text-sm text-gray-600">
                Configure which email notifications you want to receive
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          {userProfile && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">User Information</h3>
              <div className="text-sm text-gray-600">
                <p><strong>Name:</strong> {userProfile.name}</p>
                <p><strong>Email:</strong> {userProfile.email}</p>
                <p><strong>Role:</strong> {userProfile.role}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Notification preferences saved successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <XCircleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {notificationTypes.map((type) => (
              <div key={type.key} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start">
                  <div className="text-2xl mr-3">{type.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{type.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                  </div>
                </div>
                <div className="flex items-center ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences[type.key]}
                      onChange={(e) => handlePreferenceChange(type.key, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;