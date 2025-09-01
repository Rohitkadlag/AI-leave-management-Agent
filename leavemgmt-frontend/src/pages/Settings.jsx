// TODO: Add component content here
import React, { useState } from 'react';
import { 
  Cog6ToothIcon, 
  BellIcon, 
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    leaveUpdates: true,
    weeklyDigest: false
  });
  
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/dd/yyyy',
    timezone: 'UTC'
  });

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleNotificationChange = (setting, value) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: value
    }));
    toast.success('Notification settings updated');
  };

  const handlePreferenceChange = (setting, value) => {
    setPreferences(prev => ({
      ...prev,
      [setting]: value
    }));
    toast.success('Preferences updated');
  };

  const handleSaveSettings = () => {
    // Here you would typically save to backend
    toast.success('All settings saved successfully!');
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and system settings</p>
      </div>

      <div className="space-y-8">
        {/* Notifications */}
        <div className="card">
          <div className="flex items-center mb-6">
            <BellIcon className="h-6 w-6 text-gray-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-600">Receive leave updates via email</p>
              </div>
              <button
                onClick={() => handleNotificationChange('email', !notifications.email)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  notifications.email ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.email ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Leave Updates</h3>
                <p className="text-sm text-gray-600">Get notified when leave status changes</p>
              </div>
              <button
                onClick={() => handleNotificationChange('leaveUpdates', !notifications.leaveUpdates)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  notifications.leaveUpdates ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.leaveUpdates ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Weekly Digest</h3>
                <p className="text-sm text-gray-600">Receive weekly summary of leave activities</p>
              </div>
              <button
                onClick={() => handleNotificationChange('weeklyDigest', !notifications.weeklyDigest)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  notifications.weeklyDigest ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notifications.weeklyDigest ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card">
          <div className="flex items-center mb-6">
            <PaintBrushIcon className="h-6 w-6 text-gray-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={preferences.theme}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                className="input-field"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="input-field"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Format
              </label>
              <select
                value={preferences.dateFormat}
                onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                className="input-field"
              >
                <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                <option value="yyyy-MM-dd">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                className="input-field"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="card">
          <div className="flex items-center mb-6">
            <ShieldCheckIcon className="h-6 w-6 text-gray-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Security</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Password</h3>
                <p className="text-sm text-gray-600">Last changed 3 months ago</p>
              </div>
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="btn-secondary text-sm"
              >
                Change Password
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <button className="btn-secondary text-sm">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>

        {/* AI Settings */}
        <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center mb-6">
            <span className="text-2xl mr-2">🤖</span>
            <h2 className="text-xl font-semibold text-blue-900">AI Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-sm text-gray-600 mb-3">
                Allow AI to analyze your leave patterns for better insights
              </p>
              <button className="btn-primary text-sm">
                Enabled
              </button>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Smart Recommendations</h3>
              <p className="text-sm text-gray-600 mb-3">
                Receive AI-powered suggestions for leave planning
              </p>
              <button className="btn-primary text-sm">
                Enabled
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="btn-primary"
          >
            <Cog6ToothIcon className="h-5 w-5 mr-2" />
            Save All Settings
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        title="Change Password"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Confirm new password"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowChangePasswordModal(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              onClick={(e) => {
                e.preventDefault();
                toast.success('Password changed successfully!');
                setShowChangePasswordModal(false);
              }}
            >
              Update Password
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Settings;