import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-white/80 backdrop-blur-sm fixed w-full z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="font-heading text-2xl text-gray-800">Labrish</a>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#benefits" className="font-body text-gray-600 hover:text-gray-800 transition-colors">Features</a>
            <a href="#how-it-works" className="font-body text-gray-600 hover:text-gray-800 transition-colors">How it Works</a>
            <a href="#pricing" className="font-body text-gray-600 hover:text-gray-800 transition-colors">Pricing</a>
            <a href="#faq" className="font-body text-gray-600 hover:text-gray-800 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-brandy text-white px-6 py-2 rounded-full font-body font-semibold hover:bg-brandy/90 transition-colors">
              Get Started
            </button>
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;