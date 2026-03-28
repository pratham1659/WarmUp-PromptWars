import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// A lightweight fake user for local dev when Firebase keys are absent
const DEV_USER = {
  uid: 'dev-local-user',
  email: 'dev@localhost',
  displayName: 'Dev User',
  photoURL: null,
  // Mimic Firebase's getIdToken so API calls use the mock token
  getIdToken: async () => 'mock-token-for-tests',
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loginWithGoogle() {
    if (!isFirebaseConfigured) {
      // In dev mode without Firebase, instantly "log in" with the dev user
      setCurrentUser(DEV_USER);
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Popup Auth Error:', e);
      throw e;
    }
  }

  function logout() {
    if (!isFirebaseConfigured) {
      setCurrentUser(null);
      return;
    }
    return signOut(auth);
  }

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // No Firebase — skip listener, auto-login as dev user for quick local development
      setCurrentUser(DEV_USER);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loginWithGoogle,
    logout,
    isFirebaseConfigured,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
