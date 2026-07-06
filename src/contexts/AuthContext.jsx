import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id).then(setUser);
      }
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data;
  };

  const signup = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);

    // Create profile row
    const avatar = name[0]?.toUpperCase() || '?';
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      name,
      email,
      avatar,
    });
    if (profileError) throw new Error(profileError.message);

    const profile = { id: data.user.id, name, email, avatar };
    setUser(profile);
    return profile;
  };

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // onAuthStateChange will update the user state automatically
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Demo login is removed — Supabase requires real auth
  // Keep the function stub so Auth.jsx doesn't break, but redirect to signup
  const demoLogin = () => {
    throw new Error('Demo mode is not available with Supabase. Please sign up with your email.');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
