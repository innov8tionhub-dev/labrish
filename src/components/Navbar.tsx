import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
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
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="font-heading text-xl sm:text-2xl text-gray-800 flex-shrink-0">Labrish</Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <a href="#benefits" className="font-body text-gray-600 hover:text-gray-800 transition-colors">Features</a>
            <a href="#how-it-works" className="font-body text-gray-600 hover:text-gray-800 transition-colors">How it Works</a>
            <a href="#pricing" className="font-body text-gray-600 hover:text-gray-800 transition-colors">Pricing</a>
            <a href="#faq" className="font-body text-gray-600 hover:text-gray-800 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {loading ? (
              <div className="w-6 h-6 sm:w-8 sm:h-8 animate-pulse bg-gray-200 rounded-full"></div>
            ) : user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline">Dashboard</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-block font-body text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-brandy text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-body text-sm font-semibold hover:bg-brandy/90 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}

            <button
              className="md:hidden w-10 h-10 flex items-center justify-center -mr-2"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} py-3 border-t border-gray-200`}>
          <div className="flex flex-col space-y-1">
            <a href="#benefits" onClick={toggleMenu} className="font-body text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors px-3 py-2.5 rounded-lg">Features</a>
            <a href="#how-it-works" onClick={toggleMenu} className="font-body text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors px-3 py-2.5 rounded-lg">How it Works</a>
            <a href="#pricing" onClick={toggleMenu} className="font-body text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors px-3 py-2.5 rounded-lg">Pricing</a>
            <a href="#faq" onClick={toggleMenu} className="font-body text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors px-3 py-2.5 rounded-lg">FAQ</a>
            {user ? (
              <>
                <Link to="/dashboard" onClick={toggleMenu} className="font-body text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors px-3 py-2.5 rounded-lg flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button onClick={() => { handleSignOut(); toggleMenu(); }} className="font-body text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors px-3 py-2.5 rounded-lg flex items-center gap-2 text-left w-full">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={toggleMenu} className="font-body text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors px-3 py-2.5 rounded-lg">Sign In</Link>
                <Link to="/signup" onClick={toggleMenu} className="font-body text-sm font-semibold bg-brandy text-white hover:bg-brandy/90 transition-colors px-3 py-2.5 rounded-lg text-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;