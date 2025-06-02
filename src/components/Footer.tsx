import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-heading text-2xl mb-4">Labrish</h3>
            <p className="font-body text-gray-400">Where every voice has a story, and every story finds its voice.</p>
          </div>
          
          <div>
            <h4 className="font-heading text-lg mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex justify-between items-center">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} Labrish. All rights reserved.</p>
          <a href="https://innov8tionhub.com" target="_blank" rel="noopener noreferrer">
            <img src="/site-by.png" alt="Site by Innov8tion Hub" className="h-8" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;