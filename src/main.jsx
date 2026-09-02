import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Login from './components/Login.jsx';
import { supabase } from './lib/supabaseClient.js';
import { LogOut, User, Loader2 } from 'lucide-react';

function AuthWrapper() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 font-sans">
        <Loader2 className="w-10 h-10 text-sky-400 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Memeriksa sesi login...</p>
      </div>
    );
  }

  if (!session) {
    return <Login onLoginSuccess={(newSession) => setSession(newSession)} />;
  }

  return (
    <div className="relative">
      {/* Floating Top Auth Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-4 py-2 flex items-center justify-between text-xs text-slate-300 no-print sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Aplikasi RPM (Terpisah)</span>
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-1 text-slate-400">
            <User className="w-3.5 h-3.5" />
            <span>{session.user?.email || 'User'}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-1 rounded-lg font-medium transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar (Logout)</span>
        </button>
      </div>

      {/* Main Application */}
      <App session={session} />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<AuthWrapper />);
