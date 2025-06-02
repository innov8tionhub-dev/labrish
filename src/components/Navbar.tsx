import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-sm fixed w-full z-50 shadow-sm mb-2">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="font-heading text-2xl text-gray-800">Labrish</a>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#benefits" className="font-body text-gray-600 hover:text-gray-800 transition-colors">Features</a>
            <a href="#how-it-works" className="font-body text-gray-600 hover:text-gray-800 transition-colors">How it Works</a>
            <a href="#pricing" className="font-body text-gray-600 hover:text-gray-800 transition-colors">Pricing</a>
            <a href="#faq" className="font-body text-gray-600 hover:text-gray-800 transition-colors">FAQ</a>
          </div>

          <button className="bg-brandy text-white px-6 py-2 rounded-full font-body font-semibold hover:bg-brandy/90 transition-colors">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;