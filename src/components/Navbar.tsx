import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Mic } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Link, useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm fixed w-full z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-heading text-2xl text-gray-800">Labrish</Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#benefits" className="font-body text-gray-600 hover:text-gray-800 transition-colors">Features</a>
            <a href="#how-it-works" className="font-body text-gray-600 hover:text-gray-800 transition-colors">How it Works</a>
            <a href="#pricing" className="font-body text-gray-600 hover:text-gray-800 transition-colors">Pricing</a>
            <a href="#faq" className="font-body text-gray-600 hover:text-gray-800 transition-colors">FAQ</a>
            {user && (
              <Link 
                to="/text-to-speech" 
                className="flex items-center gap-2 font-body text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Mic className="w-4 h-4" />
                TTS Studio
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-body text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-brandy text-white px-6 py-2 rounded-full font-body font-semibold hover:bg-brandy/90 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
            
            <button 
              className="md:hidden w-11 h-11 flex items-center justify-center"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} py-4`}>
          <div className="flex flex-col space-y-4">
            <a href="#benefits" className="font-body text-gray-600 hover:text-gray-800 transition-colors px-2 py-3">Features</a>
            <a href="#how-it-works" className="font-body text-gray-600 hover:text-gray-800 transition-colors px-2 py-3">How it Works</a>
            <a href="#pricing" className="font-body text-gray-600 hover:text-gray-800 transition-colors px-2 py-3">Pricing</a>
            <a href="#faq" className="font-body text-gray-600 hover:text-gray-800 transition-colors px-2 py-3">FAQ</a>
            {user && (
              <Link 
                to="/text-to-speech" 
                className="flex items-center gap-2 font-body text-gray-600 hover:text-gray-800 transition-colors px-2 py-3"
              >
                <Mic className="w-4 h-4" />
                TTS Studio
              </Link>
            )}
            {!user && (
              <>
                <Link to="/login" className="font-body text-gray-600 hover:text-gray-800 transition-colors px-2 py-3">Sign In</Link>
                <Link to="/signup" className="font-body text-gray-600 hover:text-gray-800 transition-colors px-2 py-3">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;