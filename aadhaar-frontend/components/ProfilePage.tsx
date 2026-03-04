import React from 'react';
import { User, Mail, Shield, Building2, Clock, Camera, KeyRound, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const roleBadge = (role?: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      admin: { bg: 'bg-red-100', text: 'text-red-700', label: 'Administrator' },
      analyst: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Analyst' },
      viewer: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Viewer' },
    };
    const r = map[role || 'viewer'] ?? map.viewer;
    return (
      <span className={`${r.bg} ${r.text} text-xs font-semibold px-2.5 py-0.5 rounded-full`}>
        {r.label}
      </span>
    );
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AU';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account information and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-[#0f2942] via-[#1a3a5c] to-[#0f2942]" />

        <div className="px-6 pb-6 -mt-12">
          {/* Avatar */}
          <div className="flex items-end gap-5">
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-24 w-24 rounded-full border-4 border-white shadow-md object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full border-4 border-white shadow-md bg-[#0f2942] flex items-center justify-center text-white text-2xl font-bold">
                  {initials}
                </div>
              )}
              <button className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-1.5 shadow hover:bg-gray-50 transition">
                <Camera className="h-3.5 w-3.5 text-gray-600" />
              </button>
            </div>

            <div className="mb-1">
              <h2 className="text-xl font-bold text-gray-900">{user?.name || 'Admin User'}</h2>
              <div className="flex items-center gap-2 mt-1">
                {roleBadge(user?.role)}
                {user?.department && (
                  <span className="text-xs text-gray-500">{user.department}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Personal Information
          </h3>
          <dl className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs text-gray-500">Full Name</dt>
                <dd className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs text-gray-500">Email Address</dt>
                <dd className="text-sm font-medium text-gray-900">{user?.email || 'admin@uidai.gov.in'}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs text-gray-500">Department</dt>
                <dd className="text-sm font-medium text-gray-900">{user?.department || 'UIDAI Central'}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs text-gray-500">Role</dt>
                <dd className="text-sm font-medium text-gray-900 capitalize">{user?.role || 'admin'}</dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Account Details
          </h3>
          <dl className="space-y-4">
            <div className="flex items-start gap-3">
              <KeyRound className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs text-gray-500">User ID</dt>
                <dd className="text-sm font-medium text-gray-900 font-mono">{user?.id || '—'}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs text-gray-500">Last Login</dt>
                <dd className="text-sm font-medium text-gray-900">{formatDate(user?.lastLogin)}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs text-gray-500">Notifications</dt>
                <dd className="text-sm font-medium text-green-600">Enabled</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs text-gray-500">Two-Factor Authentication</dt>
                <dd className="text-sm font-medium text-amber-600">Not configured</dd>
              </div>
            </div>
          </dl>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
            <KeyRound className="h-4 w-4" />
            Change Password
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition">
            <Bell className="h-4 w-4" />
            Notification Preferences
          </button>
          <button
            onClick={() => logout()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
