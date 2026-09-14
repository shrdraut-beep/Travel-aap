import { create } from 'zustand';
import { auth, signInWithGoogle, signOutUser, getAuthSafe } from '../firebase';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { secureStorage } from '../utils/security';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: 'user' | 'agent' | 'admin' | 'vendor';
}

interface AuthState {
  currentUser: User | null;
  isAuthModalOpen: boolean;
  pendingAction: (() => void) | null;
  
  login: () => Promise<User | null>;
  loginWithUser: (user: User) => void;
  logout: () => void;
  openAuthModal: (callback?: () => void) => void;
  closeAuthModal: () => void;
  initAuthListener: () => () => void;
}

const getStoredUser = (): User | null => {
  if (typeof window !== 'undefined') {
    try {
      const user = secureStorage.getItem<User>('routripo_user');
      if (user && typeof user === 'object' && typeof user.id === 'string' && typeof user.email === 'string') {
        return user;
      }
    } catch (e) {
      console.error("Failed to parse routripo_user from secureStorage", e);
    }
  }
  return null;
};

const saveStoredUser = (user: User | null) => {
  if (typeof window === 'undefined') return;
  if (user) {
    secureStorage.setItem('routripo_user', user);
  } else {
    secureStorage.removeItem('routripo_user');
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: getStoredUser(),
  isAuthModalOpen: false,
  pendingAction: null,

  loginWithUser: (user: User) => {
    set({ currentUser: user, isAuthModalOpen: false });
    saveStoredUser(user);
    const action = get().pendingAction;
    if (action) {
      action();
      set({ pendingAction: null });
    }
  },

  login: async () => {
    try {
      const fbUser = await signInWithGoogle();
      if (fbUser) {
        const name = fbUser.displayName || fbUser.email?.split('@')[0] || 'Google Traveler';
        const avatar = fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&bold=true`;
        
        const user: User = {
          id: fbUser.uid,
          name,
          email: fbUser.email || '',
          avatar,
        };

        get().loginWithUser(user);
        return user;
      }
    } catch (err: any) {
      if (
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/popup-blocked'
      ) {
        console.warn("Google Sign-In popup was blocked or closed by user/browser.");
        return null;
      }
      console.warn("Google Sign-In error:", err);
      return null;
    }
    return null;
  },

  logout: async () => {
    await signOutUser();
    set({ currentUser: null });
    saveStoredUser(null);
  },

  openAuthModal: (callback?: () => void) => {
    set({ isAuthModalOpen: true, pendingAction: callback || null });
  },

  closeAuthModal: () => set({ isAuthModalOpen: false, pendingAction: null }),

  initAuthListener: () => {
    // Safely check redirect auth result if redirected back from auth provider
    try {
      getRedirectResult(auth).then((result) => {
        if (result?.user) {
          const fbUser = result.user;
          const name = fbUser.displayName || fbUser.email?.split('@')[0] || 'Google Traveler';
          const avatar = fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&bold=true`;
          
          const user: User = {
            id: fbUser.uid,
            name,
            email: fbUser.email || '',
            avatar,
          };

          set({ currentUser: user });
          saveStoredUser(user);
        }
      }).catch((err) => {
        console.debug("Redirect result check completed:", err?.message || err);
      });
    } catch (err) {
      console.debug("getRedirectResult exception handled:", err);
    }

    return onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const name = fbUser.displayName || fbUser.email?.split('@')[0] || 'Traveler';
        const avatar = fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true`;
        
        const user: User = {
          id: fbUser.uid,
          name,
          email: fbUser.email || '',
          avatar,
        };

        set({ currentUser: user });
        saveStoredUser(user);
      }
    });
  },
}));
