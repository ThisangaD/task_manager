import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * Custom hook that subscribes to Firebase authentication state.
 * Returns the current user and a loading flag so components can
 * render appropriate loading/redirect states.
 */
export function useAuth() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function for cleanup
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe; // Cleanup on component unmount
  }, []);

  const logout = () => signOut(auth);

  return { user, loading, logout };
}
