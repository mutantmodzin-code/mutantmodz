import { useState } from 'react';
import { X, ArrowRight, Loader2, CheckCircle, KeyRound } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';
import Turnstile from './Turnstile';

import { getApiUrl } from '../utils/url';
const API_URL = getApiUrl();
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAC-6098vM6kY6J37G91tYq0M5w-';

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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);

  const handleSubmitPhone = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!turnstileToken) {
      setError('Please verify that you are not a robot');
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

      if (!response.ok) {
        setError(data.error || 'Verification failed. Please try again.');
        setTurnstileToken(null);
        setTurnstileKey(prev => prev + 1); // Reset Turnstile widget
        setIsLoading(false);
        return;
      }

      if (data.exists) {
        // User exists, initiate OTP verification via email
        setUserData(data.user);
        try {
          await handleSendOTP(data.user.email, turnstileToken);
          setStep('otp');
        } catch (otpErr) {
          // Error already set by handleSendOTP
        }
      } else {
        // New user - go to registration
        setTurnstileToken(null);
        setTurnstileKey(prev => prev + 1);
        setStep('register');
      }

    } catch (err: any) {
      console.error('Login error:', err);
      setError('Unable to connect to security server');
      setTurnstileToken(null);
      setTurnstileKey(prev => prev + 1); // Reset Turnstile widget
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (targetEmail: string, token: string | null) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, email: targetEmail, recaptchaToken: token })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      setError(err.message);
      // Reset Turnstile on error so they can re-verify
      setTurnstileToken(null);
      setTurnstileKey(prev => prev + 1);
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
    if (!turnstileToken) {
      setError('Please verify that you are not a robot');
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
          email: email,
          is_verified: true
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create account');
      
      setUserData(data.user);
      
      // After registration, trigger OTP for email verification using the same Turnstile token
      try {
        await handleSendOTP(email, turnstileToken);
        setStep('otp');
      } catch (otpErr) {
        // Error handling in handleSendOTP
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const completeLogin = (data: any) => {
    // Determine where the user data is
    const user = data.user || data;
    
    // Store JWT token for API authentication
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    
    if (!user || (!user.id && !user.uid)) {
      console.error('Invalid auth data structure:', data);
      setError('System Error: Authentication Protocol Mismatch');
      return;
    }

    login({
      uid: (user.id || user.uid).toString(),
      phone: phoneNumber || user.phone || '',
      email: user.email || '',
      displayName: user.name || user.displayName || user.username || 'User'
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
    setTurnstileToken(null);
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
              <KeyRound size={20} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-white font-black text-sm">Login or Sign Up</h2>
              <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider">Fast & Secure Access</p>
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
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-white tracking-tighter">Welcome back</h3>
                <p className="text-zinc-500 text-sm font-medium">Please enter your mobile number to continue.</p>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mobile Number</label>
                <div className="flex items-center gap-3">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 text-white text-sm font-bold shrink-0">+91</div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="8807727227"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-white text-lg font-black focus:border-red-600 outline-none transition-colors placeholder:text-zinc-800 tracking-[0.2em]"
                    autoFocus
                  />
                </div>
              </div>
              {TURNSTILE_SITE_KEY && (
                <Turnstile
                  key={`phone-${turnstileKey}`}
                  siteKey={TURNSTILE_SITE_KEY}
                  onChange={setTurnstileToken}
                  theme="dark"
                />
              )}
              <button
                onClick={handleSubmitPhone}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-black uppercase py-5 rounded-2xl flex items-center justify-center gap-4 transition-all group shadow-xl shadow-red-600/20"
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                  <>
                    <span className="tracking-widest text-sm">Continue</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-white tracking-tighter">Enter OTP</h3>
                <p className="text-zinc-500 text-sm font-medium">Verification code sent to {userData?.email || email}</p>
              </div>
              
              <div className="p-4 bg-zinc-900 border border-white/5 rounded-2xl">
                <p className="text-zinc-400 text-xs leading-relaxed text-center">
                  We've sent a 6-digit verification code to your email. Please enter it below to verify your account.
                </p>
              </div>
              
              <div className="space-y-4">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">6-Digit Code</label>
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
                <div className="flex justify-end">
                  <button 
                    onClick={() => handleSendOTP(userData?.email || email, turnstileToken)}
                    disabled={isLoading || !turnstileToken}
                    className="text-[10px] font-bold text-zinc-500 hover:text-red-500 disabled:text-zinc-800 uppercase tracking-widest transition-colors mr-2"
                  >
                    Resend Code
                  </button>
                </div>
                {TURNSTILE_SITE_KEY && (
                  <Turnstile
                    key={`otp-${turnstileKey}`}
                    siteKey={TURNSTILE_SITE_KEY}
                    onChange={setTurnstileToken}
                    theme="dark"
                  />
                )}
              </div>
              <button
                onClick={handleVerifyOTP}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white font-bold uppercase py-5 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-red-600/20"
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Verify & Login"}
              </button>
            </div>
          )}

          {step === 'register' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-white tracking-tighter">Create Account</h3>
                <p className="text-zinc-500 text-sm font-medium">Join the Mutant Mods community today.</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-white font-black outline-none focus:border-red-600 transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-white font-black outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              </div>
              {TURNSTILE_SITE_KEY && (
                <Turnstile
                  key={`register-${turnstileKey}`}
                  siteKey={TURNSTILE_SITE_KEY}
                  onChange={setTurnstileToken}
                  theme="dark"
                />
              )}
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
                <h3 className="text-3xl font-black text-white tracking-tight">Access Granted</h3>
                <p className="text-zinc-500 text-xs font-black uppercase tracking-wider">Welcome to Mutant Mods</p>
              </div>
            </div>
          )}
        </div>


      </div>
    </>
  );
}
