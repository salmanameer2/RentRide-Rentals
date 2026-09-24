import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import supabase from '../lib/supabase';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Session user object from Supabase Auth: { id, email, user_metadata, ... }
  const [user, setUser] = useState(null);
  // Active Supabase session
  const [session, setSession] = useState(null);
  // Database record from public.profiles: { id, email, full_name, phone, avatar_url, role, ... }
  const [profile, setProfile] = useState(null);
  // Initial auth resolution loading state
  const [authLoading, setAuthLoading] = useState(true);
  // Dedicated profile loading state
  const [profileLoading, setProfileLoading] = useState(false);
  // Track whether the profile for the current user has been resolved
  const [profileResolved, setProfileResolved] = useState(false);
  // Overall initialization state
  const [isInitialized, setIsInitialized] = useState(false);

  const [usersList, setUsersList] = useState([
    {
      id: 'USR-101',
      fullName: 'Alex Rivera',
      email: 'customer@rentrides.com',
      phone: '+1 (555) 234-5678',
      role: 'customer',
      licenseStatus: 'Verified',
      createdAt: '2024-01-15',
    },
    {
      id: 'USR-102',
      fullName: 'Marcus Vance',
      email: 'admin@rentrides.com',
      phone: '+1 (555) 890-1234',
      role: 'admin',
      licenseStatus: 'Verified',
      createdAt: '2023-11-01',
    },
    {
      id: 'USR-103',
      fullName: 'Elena Rostova',
      email: 'elena@gmail.com',
      phone: '+1 (555) 345-6789',
      role: 'customer',
      licenseStatus: 'Verified',
      createdAt: '2024-02-20',
    },
    {
      id: 'USR-104',
      fullName: 'David Kim',
      email: 'david.kim@techcorp.io',
      phone: '+1 (555) 456-7890',
      role: 'customer',
      licenseStatus: 'Pending',
      createdAt: '2024-03-05',
    },
  ]);

  // Ref to track mounting and avoid state updates after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Ref to deduplicate concurrent profile fetch promises
  const activeProfilePromiseRef = useRef(null);
  const activeProfileUserIdRef = useRef(null);

  /**
   * Authoritative profile loader from public.profiles
   * Relies on user.id matching profiles.id (via RLS)
   */
  const loadProfile = useCallback(async (userId, retryCount = 0) => {
    if (!userId || !supabase) {
      if (isMountedRef.current) setProfileResolved(true);
      return null;
    }

    // Deduplicate in-flight fetch for the exact same userId
    if (
      activeProfilePromiseRef.current &&
      activeProfileUserIdRef.current === userId &&
      retryCount === 0
    ) {
      return activeProfilePromiseRef.current;
    }

    const fetchPromise = (async () => {
      if (isMountedRef.current) setProfileLoading(true);

      try {
        // Use authService.getProfile to check public.profiles
        const dbProfile = await authService.getProfile(userId);

        if (dbProfile) {
          if (isMountedRef.current) {
            setProfile(dbProfile);
            setProfileResolved(true);
          }
          return dbProfile;
        }

        // If profile is not found immediately after signup, wait briefly for trigger and retry up to 2 times
        if (retryCount < 2) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          if (isMountedRef.current) {
            return await loadProfile(userId, retryCount + 1);
          }
        }

        console.warn(`[AuthContext] Profile for user ${userId} could not be resolved from database.`);
        if (isMountedRef.current) {
          setProfileResolved(true);
        }
        return null;
      } catch (err) {
        console.error('[AuthContext] Error in loadProfile:', err);
        if (retryCount < 2) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          if (isMountedRef.current) {
            return await loadProfile(userId, retryCount + 1);
          }
        }
        if (isMountedRef.current) {
          setProfileResolved(true);
        }
        return null;
      } finally {
        if (isMountedRef.current) {
          setProfileLoading(false);
        }
        if (activeProfileUserIdRef.current === userId) {
          activeProfilePromiseRef.current = null;
          activeProfileUserIdRef.current = null;
        }
      }
    })();

    if (retryCount === 0) {
      activeProfilePromiseRef.current = fetchPromise;
      activeProfileUserIdRef.current = userId;
    }

    return fetchPromise;
  }, []);

  /**
   * Public helper to refresh profile manually (e.g. after updating details)
   */
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      return await loadProfile(user.id);
    }
    return null;
  }, [user?.id, loadProfile]);

  /**
   * Initialize Supabase session and subscribe to auth state changes
   */
  useEffect(() => {
    let authSubscription = null;

    const initializeAuth = async () => {
      try {
        if (!supabase) {
          if (isMountedRef.current) {
            setAuthLoading(false);
            setProfileResolved(true);
            setIsInitialized(true);
          }
          return;
        }

        // 1. Check initial active session
        const initialSession = await authService.getSession();

        if (initialSession?.user) {
          if (isMountedRef.current) {
            setSession(initialSession);
            setUser(initialSession.user);
            setProfileResolved(false);
          }
          await loadProfile(initialSession.user.id);
        } else {
          if (isMountedRef.current) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setProfileResolved(true);
          }
        }
      } catch (err) {
        console.error('[AuthContext] Error initializing session:', err);
      } finally {
        if (isMountedRef.current) {
          setAuthLoading(false);
          setIsInitialized(true);
        }
      }

      // 2. Set up real-time onAuthStateChange listener
      const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!isMountedRef.current) return;

        if (event === 'INITIAL_SESSION') {
          if (currentSession?.user) {
            setSession(currentSession);
            setUser(currentSession.user);
            await loadProfile(currentSession.user.id);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
            setProfileResolved(true);
          }
          setAuthLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (currentSession?.user) {
            // Prevent stale role state from a previously authenticated user
            setUser((prevUser) => {
              if (prevUser && prevUser.id !== currentSession.user.id) {
                setProfile(null);
                setProfileResolved(false);
              }
              return currentSession.user;
            });
            setSession(currentSession);
            await loadProfile(currentSession.user.id);
          }
          setAuthLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          setSession(currentSession);
          setUser(currentSession?.user || null);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setProfileResolved(true);
          setProfileLoading(false);
          setAuthLoading(false);
        }
      });

      authSubscription = data?.subscription;
    };

    initializeAuth();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [loadProfile]);

  /**
   * Customer Signup
   * Role is NOT sent; DB trigger sets role = 'customer'
   */
  const signUp = async ({ email, password, fullName, phone }) => {
    setAuthLoading(true);
    try {
      const data = await authService.signUp({ email, password, fullName, phone });
      
      // If auto-confirm is enabled in Supabase, session will be returned
      if (data?.session) {
        setSession(data.session);
        setUser(data.user);
        await loadProfile(data.user.id);
      }

      setAuthLoading(false);
      return {
        success: true,
        data,
        session: data?.session || null,
        user: data?.user || null,
        emailConfirmationRequired: !data?.session,
      };
    } catch (err) {
      setAuthLoading(false);
      return {
        success: false,
        error: err.message || 'Signup failed',
      };
    }
  };

  /**
   * Customer Login
   * Authenticates with Supabase, verifies profile.role === 'customer'
   */
  const customerLogin = async ({ email, password }) => {
    setAuthLoading(true);
    setProfileLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (!data?.user) {
        setAuthLoading(false);
        setProfileLoading(false);
        return { success: false, error: 'Authentication failed.' };
      }

      // Check authoritative profile role
      const customerProfile = await loadProfile(data.user.id);

      // Enforce customer clearance: admins must use the admin portal
      if (customerProfile && customerProfile.role !== 'customer') {
        await authService.signOut();
        if (isMountedRef.current) {
          setUser(null);
          setSession(null);
          setProfile(null);
          setAuthLoading(false);
          setProfileLoading(false);
        }
        return {
          success: false,
          error: 'This is the customer login. Administrators must use the admin login.',
        };
      }

      if (isMountedRef.current) {
        setSession(data.session);
        setUser(data.user);
        setProfile(customerProfile);
        setProfileResolved(true);
        setAuthLoading(false);
        setProfileLoading(false);
      }
      
      return { success: true, user: data.user, profile: customerProfile };
    } catch (err) {
      if (isMountedRef.current) {
        setAuthLoading(false);
        setProfileLoading(false);
      }
      return {
        success: false,
        error: err.message || 'Invalid email or password.',
      };
    }
  };

  /**
   * Sign Out
   */
  const signOut = async () => {
    setAuthLoading(true);
    try {
      await authService.signOut();
    } catch (err) {
      console.error('[AuthContext] Sign out error:', err);
    } finally {
      if (isMountedRef.current) {
        setUser(null);
        setSession(null);
        setProfile(null);
        setProfileResolved(true);
        setProfileLoading(false);
        setAuthLoading(false);
      }
    }
  };

  /**
   * Dedicated Admin Login
   * Authenticates with Supabase, verifies profile.role === 'admin'
   */
  const adminLogin = async ({ email, password }) => {
    setAuthLoading(true);
    setProfileLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (!data?.user) {
        setAuthLoading(false);
        setProfileLoading(false);
        return { success: false, error: 'Authentication failed.' };
      }

      // Check authoritative profile role from the database
      const adminProfile = await loadProfile(data.user.id);

      if (!adminProfile || adminProfile.role !== 'admin') {
        // Customer account attempting admin login or clearance denied -> signOut immediately & reject
        await authService.signOut();
        if (isMountedRef.current) {
          setUser(null);
          setSession(null);
          setProfile(null);
          setProfileResolved(true);
          setAuthLoading(false);
          setProfileLoading(false);
        }
        return {
          success: false,
          error: 'Access Denied: This user does not possess administrative privileges.',
        };
      }

      if (isMountedRef.current) {
        setSession(data.session);
        setUser(data.user);
        setProfile(adminProfile);
        setProfileResolved(true);
        setAuthLoading(false);
        setProfileLoading(false);
      }
      
      return { success: true, user: data.user, profile: adminProfile };
    } catch (err) {
      if (isMountedRef.current) {
        setAuthLoading(false);
        setProfileLoading(false);
      }
      return {
        success: false,
        error: err.message || 'Invalid administrative credentials.',
      };
    }
  };

  // Profile fields helper
  // Enforce that profile belongs to current authenticated user (authUser.id === profile.id)
  const isProfileValid = !!(user && profile && user.id === profile.id);
  const role = isProfileValid ? profile.role : null;
  const isAdmin = role === 'admin';
  const isCustomer = role === 'customer';
  const isAuthenticated = !!user;

  // Composite loading state: true while auth is initializing or profile is fetching for an authenticated user
  const effectiveLoading = authLoading || profileLoading || (isAuthenticated && !profileResolved);

  // Normalized display object for UI components
  const normalizedUser = user
    ? {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Driver',
        phone: profile?.phone || user.user_metadata?.phone || '',
        avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || '',
        role: role || 'customer',
        createdAt: profile?.created_at || user.created_at,
      }
    : null;

  const logout = signOut;

  // Aliases for compatibility with existing components
  const customerSignup = async ({ fullName, email, phone, password }) => {
    return await signUp({ fullName, email, phone, password });
  };

  const value = {
    // Core Phase 4 Auth API
    user: normalizedUser,
    rawUser: user,
    session,
    profile,
    role,
    loading: effectiveLoading,
    authLoading,
    profileLoading,
    profileResolved,
    isInitialized,
    isAuthenticated,
    isAdmin,
    isCustomer,
    signUp,
    signIn: customerLogin,
    signOut,
    logout,
    refreshProfile,
    // Customer and Admin methods
    customerLogin,
    customerSignup,
    adminLogin,
    usersList,
    bookings: [],
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
