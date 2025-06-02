import React from 'react';
import { ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-heading text-2xl text-gray-800">Labrish</h3>
            <p className="font-body text-gray-600">Where every voice has a story, and every story finds its voice.</p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-heading text-lg text-gray-800">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#benefits" className="font-body text-gray-600 hover:text-gray-800 transition-colors">Features</a>
              </li>
              <li>
                <a href="#pricing" className="font-body text-gray-600 hover:text-gray-800 transition-colors">Pricing</a>
              </li>
              <li>
                <a href="#" className="font-body text-gray-600 hover:text-gray-800 transition-colors">API</a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-heading text-lg text-gray-800">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="font-body text-gray-600 hover:text-gray-800 transition-colors">About</a>
              </li>
              <li>
                <a href="#" className="font-body text-gray-600 hover:text-gray-800 transition-colors">Blog</a>
              </li>
              <li>
                <a href="#" className="font-body text-gray-600 hover:text-gray-800 transition-colors">Careers</a>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-heading text-lg text-gray-800">Legal</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="font-body text-gray-600 hover:text-gray-800 transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="font-body text-gray-600 hover:text-gray-800 transition-colors">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-gray-600">&copy; {new Date().getFullYear()} Labrish. All rights reserved.</p>
          <a 
            href="https://innov8tionhub.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/site-by.png" 
              alt="Site by Innov8tion Hub" 
              className="h-8 bg-transparent"
            />
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;