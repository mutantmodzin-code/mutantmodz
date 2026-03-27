import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserProfile {
  uid: string;
  phone: string;
  email: string;
  displayName: string;
}

interface UserAuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (user: UserProfile) => void;
  logout: () => void;
  showLoginPopup: boolean;
  setShowLoginPopup: (show: boolean) => void;
  pendingAction: (() => void) | null;
  setPendingAction: (action: (() => void) | null) => void;
}

const UserAuthContext = createContext<UserAuthContextType | null>(null);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('mm_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('mm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mm_user');
    }
  }, [user]);

  const login = (profile: UserProfile) => {
    setUser(profile);
    setShowLoginPopup(false);
    // Execute pending action after login
    if (pendingAction) {
      setTimeout(() => {
        pendingAction();
        setPendingAction(null);
      }, 300);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mm_user');
  };

  return (
    <UserAuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      login,
      logout,
      showLoginPopup,
      setShowLoginPopup,
      pendingAction,
      setPendingAction
    }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error('useUserAuth must be used within UserAuthProvider');
  return ctx;
}
