"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  continueOffline: () => Promise<void>;
  configured: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured] = useState(() =>
    typeof window !== "undefined" ? isFirebaseConfigured() : false
  );

  useEffect(() => {
    if (typeof window === "undefined" || !configured) {
      setLoading(false);
      return;
    }

    const { onAuthStateChanged } = require("firebase/auth");
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [configured]);

  async function signIn(email: string, password: string) {
    const { signInWithEmailAndPassword } = await import("firebase/auth");
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  }

  async function signUp(email: string, password: string) {
    const { createUserWithEmailAndPassword } = await import("firebase/auth");
    await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  }

  async function signInWithGoogle() {
    const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");
    const provider = new GoogleAuthProvider();
    await signInWithPopup(getFirebaseAuth(), provider);
  }

  async function signOut() {
    const { signOut: fbSignOut } = await import("firebase/auth");
    await fbSignOut(getFirebaseAuth());
  }

  async function continueOffline() {
    const isOnline = typeof navigator !== "undefined" && navigator.onLine;

    if (isOnline && configured) {
      const { signInAnonymously } = await import("firebase/auth");
      await signInAnonymously(getFirebaseAuth());
    } else {
      const offlineUser = {
        uid: "offline-user",
        isAnonymous: true,
        displayName: null,
        email: null,
        emailVerified: false,
        phoneNumber: null,
        photoURL: null,
        providerId: "anonymous",
        metadata: {},
        providerData: [],
        refreshToken: "",
        tenantId: null,
        delete: async () => {},
        getIdToken: async () => "",
        getIdTokenResult: async () => ({}) as any,
        reload: async () => {},
        toJSON: () => ({}),
      } as unknown as User;
      setUser(offlineUser);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        continueOffline,
        configured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
