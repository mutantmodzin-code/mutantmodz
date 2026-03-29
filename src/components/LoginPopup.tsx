import { useState } from 'react';
import { X, Phone, ArrowRight, ShieldCheck, Loader2, CheckCircle } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';

const API_URL = import.meta.env.VITE_API_URL;

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

type LoginStep = 'phone' | 'email' | 'success';

export default function LoginPopup({ isOpen, onClose }: LoginPopupProps) {
  const { login } = useUserAuth();
  const [step, setStep] = useState<LoginStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitPhone = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      // Direct check in database instead of OTP
      const response = await fetch(`${API_URL}/customers/search?phone=${phoneNumber}`);

      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.id) {
          // User exists, login directly
          login({
            uid: userData.id.toString(),
            phone: userData.phone,
            email: userData.email,
            displayName: userData.name
          });
          setStep('success');
          setTimeout(() => {
            resetForm();
            onClose();
          }, 1500);
          return;
        }
      }

      // User doesn't exist, move to profile completion
      setStep('email');
    } catch (err: any) {
      console.error('Login error:', err);
      // Fallback for demo if server is down: move to profile anyway
      setStep('email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!email || !displayName) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      // Save user to backend
      const response = await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: displayName,
          phone: phoneNumber,
          email: email,
          address: ''
        })
      });

      if (!response.ok) throw new Error('Failed to save user profile');
      const userData = await response.json();

      // Login the user
      login({
        uid: userData.id?.toString() || Date.now().toString(),
        phone: phoneNumber,
        email: email,
        displayName: displayName
      });

      setStep('success');

      // Auto-close after success
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('phone');
    setPhoneNumber('');
    setEmail('');
    setDisplayName('');
    setError('');
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
              <h2 className="text-white font-black uppercase tracking-widest text-sm">Login</h2>
              <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-widest">Secure Protocol</p>
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

          {/* Step Indicator */}
          <div className="flex items-center gap-3 mb-12">
            {['phone', 'email'].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${step === s ? 'bg-red-600 text-white scale-110 shadow-[0_0_20px_rgba(220,38,38,0.5)]' :
                    (step === 'email' && s === 'phone') || step === 'success' ? 'bg-green-600 text-white' :
                      'bg-zinc-800 text-zinc-500'
                  }`}>
                  {((step === 'email' && s === 'phone') || step === 'success') ? <CheckCircle size={14} /> : i + 1}
                </div>
                {i < 1 && <div className={`w-12 h-0.5 transition-colors duration-500 ${(step === 'email' || step === 'success') ? 'bg-green-600' : 'bg-zinc-800'}`}></div>}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest animate-in fade-in duration-300">
              {error}
            </div>
          )}

          {/* Phone Step */}
          {step === 'phone' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Enter Mobile</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Enter your number to access your account</p>
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
                disabled={isLoading || phoneNumber.length < 10}
                className="w-full bg-red-600 hover:bg-white hover:text-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><Phone size={16} /> Continue</>}
              </button>
            </div>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Complete Profile</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Add your email and name to continue</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Your Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Rider"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-white text-sm font-bold focus:border-red-600 outline-none transition-colors placeholder:text-zinc-800 uppercase"
                    autoFocus
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-6 text-white text-sm font-bold focus:border-red-600 outline-none transition-colors placeholder:text-zinc-800"
                  />
                </div>
              </div>
              <button
                onClick={handleCompleteProfile}
                disabled={isLoading || !email || !displayName}
                className="w-full bg-red-600 hover:bg-white hover:text-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={16} /> Complete Login</>}
              </button>
              <button
                onClick={() => setStep('phone')}
                className="w-full text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors py-3"
              >
                Change phone number
              </button>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="flex-1 flex items-center justify-center animate-in fade-in zoom-in-95 duration-700">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-green-600/10 rounded-[2rem] flex items-center justify-center mx-auto border border-green-600/20">
                  <CheckCircle size={48} className="text-green-500" />
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">You're In!</h3>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Welcome to MutantModz</p>
              </div>
            </div>
          )}

          {/* Branding Footer */}
          <div className="mt-auto pt-10 text-center">
            <p className="text-zinc-800 text-[9px] font-black uppercase tracking-[0.3em]">
              Secured by MutantModz Protocol
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
