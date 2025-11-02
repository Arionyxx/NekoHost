"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/supabase/types";

type AuthState = "loading" | "authenticated" | "unauthenticated";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  authState: AuthState;
  supabase: SupabaseClient<Database>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider component for Supabase authentication
 * Wraps your app to provide auth state to all components
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setAuthState(initialSession ? "authenticated" : "unauthenticated");
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuthState("unauthenticated");
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setAuthState(currentSession ? "authenticated" : "unauthenticated");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, session, authState, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access the current auth session
 * Returns user, session, and loading state
 *
 * @example
 * ```tsx
 * const { user, session, authState } = useSession();
 *
 * if (authState === 'loading') return <Loader />;
 * if (authState === 'unauthenticated') return <SignIn />;
 * return <div>Hello {user?.email}</div>;
 * ```
 */
export function useSession() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSession must be used within an AuthProvider");
  }

  return {
    user: context.user,
    session: context.session,
    authState: context.authState,
    isLoading: context.authState === "loading",
    isAuthenticated: context.authState === "authenticated",
    isUnauthenticated: context.authState === "unauthenticated",
  };
}

/**
 * Hook to access the Supabase client
 * Returns the authenticated Supabase client instance
 *
 * @example
 * ```tsx
 * const supabase = useSupabase();
 *
 * // Query data
 * const { data } = await supabase.from('profiles').select('*');
 *
 * // Sign out
 * await supabase.auth.signOut();
 * ```
 */
export function useSupabase() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within an AuthProvider");
  }

  return context.supabase;
}
