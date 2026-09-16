import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import {
  ShieldCheck,
  Store,
  Briefcase,
  Phone,
  User as UserIcon,
  CreditCard,
  MapPin,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<'agent' | 'operator'>('agent');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [shopName, setShopName] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [district, setDistrict] = useState('Bhopal');
  const [tehsil, setTehsil] = useState('');
  const [wardNo, setWardNo] = useState('');
  const [address, setAddress] = useState('');

  // Step 2 State
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (mobile.length !== 10) {
      setErrorMessage('Kripya 10-digit valid mobile number enter karein.');
      return;
    }

    if (role === 'agent' && !shopName) {
      setErrorMessage('Shop / Kiosk Name enter karna zaroori hai.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register-otp', {
        role,
        full_name: fullName,
        mobile,
        shop_name: shopName,
        aadhaar_number: aadhaarNumber,
        district,
        tehsil,
        ward_no: wardNo,
        address
      });

      if (response.data.status === 'success') {
        if (response.data.debug_otp) {
          setDebugOtp(response.data.debug_otp);
        }
        setStep(2);
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'OTP request failed. Kripya dobara try karein.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP & Create Pending Account
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (otp.length !== 6) {
      setErrorMessage('Kripya 6-digit OTP enter karein.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password kam se kam 6 characters ka hona chahiye.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password aur Confirm Password match nahi kar rahe hain.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/verify-registration', {
        mobile,
        otp,
        password
      });

      if (response.data.status === 'success') {
        setStep(3);
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Verification failed. Kripya sahi OTP daalein.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow shapes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl z-10">
        <div className="flex justify-center items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">V2ONLINE</h1>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Fast Track Registration</p>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl border border-slate-800 sm:px-10">
          
          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 rounded-lg bg-red-950/60 border border-red-800/80 p-3.5 flex items-start gap-3 text-red-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Details & WhatsApp OTP */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-2">New Account Registration</h2>
              <p className="text-xs text-slate-400 mb-6">
                Apna role select karein aur details fill karke WhatsApp OTP verify karein.
              </p>

              {/* Role Toggle */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setRole('agent')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    role === 'agent'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Store className="h-4 w-4" />
                  <span>MP Online Shop (Agent)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('operator')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                    role === 'operator'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Officer (Operator)</span>
                </button>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Owner / Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      WhatsApp Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mobile"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {role === 'agent' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Shop / Kiosk Center Name *
                    </label>
                    <div className="relative">
                      <Store className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        placeholder="e.g. Sharma MP Online & CSC Center"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Aadhaar Number */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Aadhaar Number (12-Digit)
                    </label>
                    <div className="relative">
                      <CreditCard className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        maxLength={12}
                        placeholder="12-digit Aadhaar No."
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      District (MP) *
                    </label>
                    <div className="relative">
                      <MapPin className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Bhopal">Bhopal</option>
                        <option value="Indore">Indore</option>
                        <option value="Jabalpur">Jabalpur</option>
                        <option value="Gwalior">Gwalior</option>
                        <option value="Ujjain">Ujjain</option>
                        <option value="Sagar">Sagar</option>
                        <option value="Rewa">Rewa</option>
                        <option value="Satna">Satna</option>
                        <option value="Sehore">Sehore</option>
                        <option value="Vidisha">Vidisha</option>
                        <option value="Other">Other MP District</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Tehsil / Block
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Huzur, Kolar"
                      value={tehsil}
                      onChange={(e) => setTehsil(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Ward No. / Village
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ward 25"
                      value={wardNo}
                      onChange={(e) => setWardNo(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Address
                  </label>
                  <input
                    type="text"
                    placeholder="Shop / Office detailed address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/25"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <>
                        <span>Send WhatsApp OTP</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: OTP Verification & Set Password */}
          {step === 2 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white">Verify WhatsApp OTP</h2>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Change Details</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                OTP sent to WhatsApp <span className="font-semibold text-emerald-400">+91-{mobile}</span>.
              </p>

              {/* Dev notice banner if debugOtp available */}
              {debugOtp && (
                <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center justify-between">
                  <span>⚡ Dev Mode OTP: <strong>{debugOtp}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtp(debugOtp)}
                    className="underline text-emerald-200 font-semibold text-[11px]"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {/* 6-Digit OTP */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Enter 6-Digit OTP *
                  </label>
                  <div className="relative">
                    <KeyRound className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white tracking-widest text-center text-sm font-bold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Create Password (Min 6 chars) *
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/25"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Pending Approval Screen */}
          {step === 3 && (
            <div className="text-center py-6">
              <div className="h-16 w-16 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Registration Successful! 🎉</h2>
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 my-5 text-left text-xs text-slate-300 space-y-2">
                <p className="flex items-center gap-2 font-medium text-slate-100">
                  <span className="h-2 w-2 rounded-full bg-amber-400"></span>
                  Status: <strong className="text-amber-400">Pending Admin Approval</strong>
                </p>
                <p className="text-slate-400">
                  Aapka {role === 'agent' ? 'MP Online Shop' : 'Operator'} account register ho chuka hai. Admin / Manager dwara verification ke baad account approve ho jayega.
                </p>
                <p className="text-emerald-400 font-medium">
                  Approval hote hi aapko WhatsApp par confirmation message mil jayega.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 border border-transparent rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all"
              >
                <span>Go to Login Page</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Bottom Login Link */}
          {step !== 3 && (
            <div className="mt-6 pt-6 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                Pehle se registered hain?{' '}
                <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                  Login Karein
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
