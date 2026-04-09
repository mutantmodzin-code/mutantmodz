import { useState, useEffect } from 'react';
import { User, Mail, Phone, ShieldCheck, ArrowLeft, Save, Loader2, KeyRound, CheckCircle } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

export default function AccountSettings() {
  const { user, login } = useUserAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP related
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName);
      setEmail(user.email);
      setPhone(user.phone);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Check if email changed
    if (email !== user.email) {
      handleInitiateEmailChange();
      return;
    }

    saveProfile();
  };

  const saveProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/customers/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');

      // Update local context
      login({
        ...user,
        displayName: data.user.name,
        phone: data.user.phone
      });

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateEmailChange = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/send-email-update-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: email, userId: user?.uid, phone: user?.phone })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send verification code');

      setShowOtpStep(true);
      toast.success('Verification code sent to your new email');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (otp.length < 6) {
      toast.error('Please enter 6-digit code');
      return;
    }
    setIsVerifyingEmail(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify-email-update-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid, phone: user?.phone, otp })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid code');

      // Email updated in DB, now update locally and save rest of profile
      login({
        ...user!,
        email: email,
        displayName: name,
        phone: phone
      });

      // Also call saveProfile for other fields
      await saveProfile();
      
      setShowOtpStep(false);
      setOtp('');
      toast.success('Email verified and profile updated');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  if (!user) {
     return (
        <div className="pt-32 px-6 text-center">
            <h2 className="text-white font-black uppercase tracking-widest">Please login to access settings</h2>
            <button 
                onClick={() => window.location.hash = 'home'}
                className="mt-8 text-red-500 font-bold uppercase tracking-widest flex items-center gap-2 mx-auto"
            >
                <ArrowLeft size={16} /> Back to Home
            </button>
        </div>
     );
  }

  return (
    <div className="pt-24 pb-20 px-6 min-h-screen bg-zinc-950">
      <div className="max-w-xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Account Setup</h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Protocol Profile Management</p>
          </div>
          <button 
            onClick={() => window.history.back()}
            className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Profile Details */}
        <form onSubmit={handleUpdateProfile} className="space-y-8">
          <div className="space-y-6 bg-zinc-900/40 p-8 rounded-[2rem] border border-white/5 backdrop-blur-xl">
            {/* Name */}
            <div className="space-y-3">
               <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                 <User size={12} className="text-red-500" /> Authorized Identity
               </label>
               <input 
                 type="text"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 disabled={!isEditing}
                 className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 px-6 text-white font-black focus:border-red-600 outline-none transition-all disabled:opacity-50"
               />
            </div>

            {/* Email */}
            <div className="space-y-3">
               <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                 <Mail size={12} className="text-red-500" /> Email Address
               </label>
               <div className="relative">
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 px-6 text-white font-black focus:border-red-600 outline-none transition-all disabled:opacity-50"
                  />
                  {email !== user.email && isEditing && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-red-500 uppercase tracking-tighter">Requires Verification</span>
                  )}
               </div>
            </div>

            {/* Phone */}
            <div className="space-y-3">
               <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                 <Phone size={12} className="text-red-500" /> Secure Mobile Line
               </label>
               <input 
                 type="tel"
                 value={phone}
                 onChange={(e) => setPhone(e.target.value)}
                 disabled={!isEditing}
                 className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-4 px-6 text-white font-black focus:border-red-600 outline-none transition-all disabled:opacity-50"
               />
            </div>
          </div>

          <div className="flex gap-4">
            {!isEditing ? (
              <button 
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-white text-black font-black uppercase py-5 rounded-2xl tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Modify Access Data
              </button>
            ) : (
              <>
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-zinc-900 text-zinc-400 font-black uppercase py-5 rounded-2xl tracking-[0.2em] text-sm hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-red-600 text-white font-black uppercase py-5 rounded-2xl tracking-[0.2em] text-sm flex items-center justify-center gap-3 hover:bg-red-700 transition-all"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Update Profile</>}
                </button>
              </>
            )}
          </div>
        </form>

        {/* Security Info */}
        <div className="p-6 bg-red-600/5 border border-red-600/10 rounded-2xl flex items-start gap-4">
          <ShieldCheck className="text-red-500 mt-1" size={20} />
          <div className="space-y-1">
             <h4 className="text-white text-xs font-black uppercase tracking-widest">Protocol Protection Active</h4>
             <p className="text-zinc-500 text-[10px] font-medium leading-relaxed">Your data is encrypted using 256-bit AES protection. All changes require secure authentication headers.</p>
          </div>
        </div>
      </div>

      {/* OTP Modal for Email Change */}
      {showOtpStep && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
          <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 space-y-8 animate-in zoom-in duration-300">
            <div className="text-center space-y-4">
               <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center mx-auto">
                 <Mail size={32} className="text-red-500" />
               </div>
               <div className="space-y-2">
                 <h3 className="text-2xl font-black text-white uppercase">Verify New Line</h3>
                 <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Code sent to {email}</p>
               </div>
            </div>

            <div className="space-y-4">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Verification Key</label>
              <div className="relative">
                <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000 000"
                  className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-white text-2xl font-black focus:border-red-600 outline-none transition-all tracking-[0.5em]"
                />
              </div>
            </div>

            <div className="flex gap-4">
               <button 
                 onClick={() => setShowOtpStep(false)}
                 className="flex-1 py-4 text-zinc-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleVerifyEmail}
                 disabled={isVerifyingEmail}
                 className="flex-1 bg-red-600 py-4 rounded-xl text-white font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
               >
                 {isVerifyingEmail ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle size={16} /> Confirm Change</>}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
