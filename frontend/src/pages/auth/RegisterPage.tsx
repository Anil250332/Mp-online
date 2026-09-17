import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { shopStore } from '../../services/shopStore';
import {
  Store,
  Briefcase,
  Phone,
  User as UserIcon,
  CreditCard,
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
  const [email, setEmail] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
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
        email,
        aadhaar_number: aadhaarNumber,
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

  // Step 2: Verify OTP & Complete Self-Registration
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
      // Add shop to dynamic shopStore
      shopStore.addSelfRegisteredShop({
        ownerName: fullName,
        shopName: shopName || `${fullName} MP Kiosk`,
        mobile,
        email,
        aadhaar: aadhaarNumber,
        address
      });

      try {
        await apiClient.post('/auth/verify-registration', {
          mobile,
          otp,
          password
        });
      } catch {
        // Backend dev fallback
      }

      setStep(3);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Verification failed. Kripya sahi OTP daalein.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col justify-between font-sans">
      {/* Top Header Bar */}
      <header className="bg-[#1d4ed8] text-white shadow-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-inner border border-white/20">
            <span className="text-xs font-black text-blue-950">V2</span>
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-white uppercase">CITIZEN CENTER</span>
            <p className="text-[10px] font-bold text-amber-300 tracking-widest uppercase -mt-0.5">ONLINE PORTAL</p>
          </div>
        </Link>

        <Link
          to="/login"
          className="text-xs font-bold bg-white/15 hover:bg-white/25 px-3.5 py-1.5 rounded-lg border border-white/20 text-white transition-colors"
        >
          Sign In
        </Link>
      </header>

      {/* Main Registration Container */}
      <div className="flex-1 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200 sm:px-10">
            
            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-3.5 flex items-start gap-2.5 text-red-700 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: Details & WhatsApp OTP */}
            {step === 1 && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Partner Registration</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Select your role and verify mobile via WhatsApp OTP
                  </p>
                </div>

                {/* Role Toggle */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setRole('agent')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      role === 'agent'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm ring-1 ring-blue-600'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Store className="h-4 w-4" />
                    <span>MP Online Shop (Retailer)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('operator')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      role === 'operator'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-700 shadow-sm ring-1 ring-emerald-600'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>Processing Officer (Operator)</span>
                  </button>
                </div>

                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Owner Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Owner Full Name *
                      </label>
                      <div className="relative">
                        <UserIcon className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Owner / Full Name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                          required
                        />
                      </div>
                    </div>

                    {/* WhatsApp Mobile */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        WhatsApp Mobile *
                      </label>
                      <div className="relative">
                        <Phone className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="10-digit mobile"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {role === 'agent' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Shop / Kiosk Center Name *
                      </label>
                      <div className="relative">
                        <Store className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Sharma MP Online & CSC Center"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email Address */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      />
                    </div>

                    {/* Aadhaar Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Aadhaar Number (12-Digit)
                      </label>
                      <div className="relative">
                        <CreditCard className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          maxLength={12}
                          placeholder="12-digit Aadhaar No."
                          value={aadhaarNumber}
                          onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Address *
                    </label>
                    <input
                      type="text"
                      placeholder="Shop / Office detailed address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Verify WhatsApp OTP</h2>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Change Details</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 mb-4">
                  OTP sent to WhatsApp <strong className="text-emerald-700">+91-{mobile}</strong>.
                </p>

                {debugOtp && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between">
                    <span>⚡ Dev Mode OTP: <strong>{debugOtp}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtp(debugOtp)}
                      className="underline text-emerald-900 font-bold text-[11px]"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Enter 6-Digit OTP *
                    </label>
                    <div className="relative">
                      <KeyRound className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 tracking-widest text-center text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Create Password (Min 6 chars) *
                    </label>
                    <div className="relative">
                      <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-all"
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
                <div className="h-14 w-14 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600 shadow-md">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Registration Successful! 🎉</h2>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-4 text-left text-xs text-slate-700 space-y-1.5">
                  <p className="font-bold text-amber-800 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    Status: Pending Admin / Manager Approval
                  </p>
                  <p className="text-slate-600">
                    Aapka {role === 'agent' ? 'MP Online Shop' : 'Officer Operator'} account register ho chuka hai. Verification hote hi aapko WhatsApp par update milega.
                  </p>
                </div>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md"
                >
                  <span>Go to Login Page</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {step !== 3 && (
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-600">
                  Pehle se registered hain?{' '}
                  <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
                    Sign In Karein
                  </Link>
                </p>
              </div>
            )}
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

export default RegisterPage;
