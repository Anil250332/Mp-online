import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Phone,
  Mail,
  Store,
  MapPin,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function AgentProfile() {
  const { user } = useAuth();

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New Password and Confirm Password do not match.');
      return;
    }

    setSuccessMsg('Security password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            <span>Shop Retailer Account & Security Profile</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your kiosk profile information, contact details, and account security credentials.
          </p>
        </div>

        {/* Action Message Banner */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left Box: Profile Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="h-12 w-12 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-lg">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">{user?.full_name || 'Rajesh Sharma'}</h2>
                <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                  MP Online Kiosk Agent / Retailer
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Store className="h-4 w-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Shop / Kiosk Name</div>
                  <div className="font-bold text-slate-800">{user?.shop_name || 'Sharma MP Online & CSC Center'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Phone className="h-4 w-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Mobile Number</div>
                  <div className="font-bold text-slate-800">{user?.mobile || '9876543210'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Email Address</div>
                  <div className="font-bold text-slate-800">{user?.email || 'rajesh.sharma@mponline.in'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">District / Location</div>
                  <div className="font-bold text-slate-800">{user?.district || 'Bhopal'}, MP</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Box: Security & Password Update */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-base">
              <Lock className="h-5 w-5 text-blue-600" />
              <span>Security & Password</span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
