import { useState } from 'react';
import { X, ArrowRight, ShieldCheck, Loader2, CheckCircle, KeyRound } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';

const API_URL = import.meta.env.VITE_API_URL;

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

type LoginStep = 'phone' | 'otp' | 'register' | 'success';

export default function LoginPopup({ isOpen, onClose }: LoginPopupProps) {
  const { login } = useUserAuth();
  const [step, setStep] = useState<LoginStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<any>(null);

  const handleSubmitPhone = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/check-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      });

      const data = await response.json();

      if (response.ok && data.exists) {
        // Existing user - send OTP
        setUserData(data.user);
        setEmail(data.user.email);
        await handleSendOTP(data.user.email);
        setStep('otp');
      } else {
        // New user - go to registration
        setStep('register');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Unable to connect to security server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (targetEmail: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, email: targetEmail })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, otp })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid code');
      // Store JWT token from registration
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }
      completeLogin(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !displayName) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: displayName,
          phone: phoneNumber,
          email: email
        })
      });

      if (!response.ok) throw new Error('Failed to create account');
      
      // After registration, send OTP to verify email
      await handleSendOTP(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const completeLogin = (data: any) => {
    // Store JWT token for API authentication
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    login({
      uid: data.user.id.toString(),
      phone: phoneNumber,
      email: data.user.email,
      displayName: data.user.name
    });
    setStep('success');
    setTimeout(() => {
      resetForm();
      onClose();
    }, 1500);
  };

  const resetForm = () => {
    setStep('phone');
    setPhoneNumber('');
    setOtp('');
    setEmail('');
    setDisplayName('');
    setError('');
    setUserData(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-md z-[80] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => { resetForm(); onClose(); }}
      />

      {/* Slide-in Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[480px] bg-zinc-950 border-l border-white/5 z-[90] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
              <ShieldCheck size={20} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-white font-black uppercase tracking-widest text-sm">Auth Access</h2>
              <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">Protocol secure</p>
            </div>
          </div>
          <button
            onClick={() => { resetForm(); onClose(); }}
            className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-xl"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-10 flex flex-col">

          {/* Login Steps Rendering */}
          {error && (
            <div className="mb-6 p-4 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest">
              {error}
            </div>
          )}

          {step === 'phone' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Enter Identity</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Input your primary mobile number</p>
              </div>
              <div className="space-y-4">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Mobile Number</label>
                <div className="flex items-center gap-3">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm font-bold shrink-0">+91</div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-white text-lg font-black focus:border-red-600 outline-none transition-colors placeholder:text-zinc-800 tracking-[0.2em]"
                    autoFocus
                  />
                </div>
              </div>
              <button
                onClick={handleSubmitPhone}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-black uppercase py-5 rounded-2xl flex items-center justify-center gap-4 transition-all group"
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                  <>
                    <span className="tracking-[0.2em] text-sm">Verify Identity</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Verification</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Code sent to {userData?.email || email}</p>
              </div>
              
              <div className="p-4 bg-red-600/10 border border-red-600/30 rounded-2xl">
                <p className="text-red-400 text-sm font-bold text-center">
                  Check your Gmail and enter the code below (or '000000' for Dev Mode)
                </p>
              </div>
              
              <div className="space-y-4">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">6-Digit Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000 000"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 pl-16 pr-6 text-white text-2xl font-black focus:border-red-600 outline-none transition-colors tracking-[0.5em]"
                  />
                </div>
              </div>
              <button
                onClick={handleVerifyOTP}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-bold uppercase py-5 rounded-2xl flex items-center justify-center gap-4 transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Finalize Authentication"}
              </button>
            </div>
          )}

          {step === 'register' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Initialize User</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Setup your protocol profile</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-white font-black outline-none focus:border-red-600 transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-white font-black outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-black uppercase py-5 rounded-2xl flex items-center justify-center gap-4 transition-all"
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Create Profile"}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-500">
              <div className="w-24 h-24 rounded-full bg-green-600/10 border border-green-600/20 flex items-center justify-center text-green-500">
                <CheckCircle size={48} className="animate-bounce" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">Access Granted</h3>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Redirecting to Interface...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-black/50">
          <div className="flex items-center gap-4 opacity-50">
            <ShieldCheck size={16} className="text-red-500" />
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.1em]">
              Encrypted session. 256-bit AES protection active.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

