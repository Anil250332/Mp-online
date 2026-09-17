import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Phone, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!mobile || !password) {
      setErrorMessage('Kripya Mobile Number aur Password dono enter karein.');
      return;
    }

    if (mobile.length !== 10) {
      setErrorMessage('Mobile number 10 digits ka hona chahiye.');
      return;
    }

    setIsLoading(true);
    const result = await login(mobile, password);
    setIsLoading(false);

    if (result.success && result.redirectUrl) {
      navigate(result.redirectUrl, { replace: true });
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col justify-between font-sans">
      {/* Top Header Bar */}
      <header className="bg-[#1d4ed8] text-white shadow-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-inner border border-white/20">
            <span className="text-xs font-black text-blue-950">V2</span>
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-white uppercase">CITIZEN CENTER</span>
            <p className="text-[10px] font-bold text-amber-300 tracking-widest uppercase -mt-0.5">ONLINE PORTAL</p>
          </div>
        </div>

        <Link
          to="/register"
          className="text-xs font-bold bg-white/15 hover:bg-white/25 px-3.5 py-1.5 rounded-lg border border-white/20 text-white transition-colors"
        >
          New Registration (Agent / Operator)
        </Link>
      </header>

      {/* Main Login Card */}
      <div className="flex-1 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
            <div className="text-center mb-6">
              <div className="h-12 w-12 bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Sign In to Your Account</h2>
              <p className="text-xs text-slate-500 mt-1">
                Super Admin • Manager • Distributor • Operator • MP Online Retailer
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-start gap-2.5 text-red-700 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:bg-white transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <>
                      <span>Secure Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-3">
              {/* Quick Demo Fill Buttons for Testing */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-left space-y-2">
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">⚡ Quick Demo Logins</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobile('9876543210');
                      setPassword('password123');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-lg transition-colors shadow-xs"
                  >
                    🏪 Retailer Shop (9876543210)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobile('8888888888');
                      setPassword('Distributor@123');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-blue-100 border border-blue-200 text-blue-800 text-[11px] font-bold rounded-lg transition-colors shadow-xs"
                  >
                    🏬 Distributor (8888888888)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobile('9999999999');
                      setPassword('Admin@12345');
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors shadow-xs"
                  >
                    👑 Super Admin (9999999999)
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                Naye Retailer ya Operator hain?{' '}
                <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
                  Self Register Karein (OTP)
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 text-center text-[11px] text-slate-500 border-t border-slate-200">
        © 2026 V2Online Citizen Center Portal • Fast Track Government Services Platform
      </footer>
    </div>
  );
};

export default LoginPage;
