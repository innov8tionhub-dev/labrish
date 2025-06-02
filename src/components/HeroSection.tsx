import React from 'react';
import { Mic, MessageSquare, Globe2, ChevronDown, PlayCircle } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-caribbean-100 to-caribbean-200 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnptMCAzMGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnptLTE4LTE1YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2eiIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] rotate-45"></div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-7xl md:text-8xl mb-6 bg-gradient-to-r from-brandy via-apple to-cerise bg-clip-text text-transparent animate-wave drop-shadow-lg">
              Labrish
            </h1>
            <p className="font-heading text-2xl md:text-3xl text-gray-800 mb-8 drop-shadow">
              Where every voice has a story, and every story finds its voice.
            </p>
            <p className="font-body text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              A Caribbean-inspired storytelling hub for the world. Chat, share, and listen to stories in authentic island voices—powered by AI, open to all.
            </p>
          </div>

          {/* Feature Blocks */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Chat Block */}
            <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-caribbean-200 hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-brandy/10 text-brandy">
                <MessageSquare className="w-6 h-6 group-hover:animate-bounce" />
              </div>
              <h3 className="font-heading text-xl mb-2 text-gray-800">Chat in Caribbean Voices</h3>
              <p className="font-body text-gray-600">Chat in real-time with lifelike Caribbean AI voices.</p>
            </div>

            {/* Story Block */}
            <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-caribbean-200 hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-apple/10 text-apple">
                <Mic className="w-6 h-6 group-hover:animate-bounce" />
              </div>
              <h3 className="font-heading text-xl mb-2 text-gray-800">Tell Your Story</h3>
              <p className="font-body text-gray-600">Write and narrate your stories—train your own voice or choose from expressive island accents.</p>
            </div>

            {/* Connect Block */}
            <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-caribbean-200 hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-cerise/10 text-cerise">
                <Globe2 className="w-6 h-6 group-hover:animate-bounce" />
              </div>
              <h3 className="font-heading text-xl mb-2 text-gray-800">Connect Globally</h3>
              <p className="font-body text-gray-600">Explore a global library of tales and connect with storytellers worldwide.</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="px-8 py-4 bg-brandy text-white font-body font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-brandy/90 flex items-center gap-2 hover:scale-105">
              Start Your Story
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </button>
            <button className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-800 font-body font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/90 flex items-center gap-2 hover:scale-105">
              Listen to a Sample
              <PlayCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-brandy/20 rounded-full blur-2xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-20 h-20 bg-apple/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-cerise/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>
    </div>
  );
};

export default HeroSection;