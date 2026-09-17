import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Key, 
  CheckCircle2, 
  Lock
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function DistributorProfile() {
  // Static profile state
  const [profile] = useState({
    name: 'Rajesh Sharma',
    distributorId: 'DIST-MP-48201',
    mobile: '+91 98260 12345',
    email: 'rajesh.sharma@mponline.gov.in',
    district: 'Bhopal',
    tehsil: 'Huzur',
    joiningDate: '15 Jan 2024',
    status: 'ACTIVE',
    commissionRate: '3.5%',
    totalAgents: 28,
    aadhaar: 'XXXX-XXXX-8921',
    pan: 'ABCDE1234F',
    bank: {
      accountName: 'Rajesh Sharma',
      bankName: 'State Bank of India',
      accountNo: '30987654321',
      ifsc: 'SBIN0001234',
      upiId: '9826012345@sbi'
    }
  });

  // Password change state
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState('');

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      setPassError('Please fill in all password fields');
      return;
    }

    if (passwords.newPass !== passwords.confirm) {
      setPassError('New password and confirm password do not match');
      return;
    }

    if (passwords.newPass.length < 6) {
      setPassError('New password must be at least 6 characters long');
      return;
    }

    // Success static feedback
    setPassSuccess(true);
    setPasswords({ current: '', newPass: '', confirm: '' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl border border-blue-200 shadow-inner">
              RS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800">{profile.name}</h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {profile.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Distributor ID: <span className="font-semibold text-slate-700">{profile.distributorId}</span> • Joined {profile.joiningDate}
              </p>
            </div>
          </div>
          
         
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Columns: Personal & Territory Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Overview */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                  <User className="h-4 w-4 text-blue-600" />
                  <span>Personal & Account Details</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Read Only</span>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-xs font-medium block">Full Name</span>
                  <span className="font-semibold text-slate-800">{profile.name}</span>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-xs font-medium block">Mobile Number</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{profile.mobile}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-xs font-medium block">Email Address</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{profile.email}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-xs font-medium block">Distributor ID</span>
                  <span className="font-semibold text-blue-700">{profile.distributorId}</span>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-xs font-medium block">Aadhaar Number</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{profile.aadhaar}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                  <span className="text-slate-400 text-xs font-medium block">PAN Number</span>
                  <span className="font-semibold text-slate-800">{profile.pan}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Security & Password Change */}
          <div className="space-y-6">
            
            {/* Password Reset Form */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center gap-2 text-slate-700 font-semibold text-sm">
                <Lock className="h-4 w-4 text-blue-600" />
                <span>Security & Password</span>
              </div>

              <form onSubmit={handlePasswordSubmit} className="p-5 space-y-4">
                
                {passSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Password updated successfully! Use your new password for your next login.</span>
                  </div>
                )}

                {passError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                    {passError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Password *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Password *</label>
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({...passwords, newPass: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  <span>Update Password</span>
                </button>
              </form>
            </div>

            {/* Quick Support / Contact Card */}
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-400" />
                <h3 className="font-bold text-sm">Distributor Support Hub</h3>
              </div>
              <p className="text-xs text-slate-300">
                Need to modify profile details or update bank account? Contact your assigned MP Online District Manager.
              </p>
              <div className="pt-2 border-t border-slate-800 text-xs space-y-1 text-slate-400">
                <p>📞 DM Helpline: <span className="text-white font-semibold">+91 0755 2700800</span></p>
                <p>✉️ Support: <span className="text-white font-semibold">distributor-help@mponline.gov.in</span></p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
