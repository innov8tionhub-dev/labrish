import React from 'react';

const PartnersSection: React.FC = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-gray-600 font-body">Trusted by storytellers worldwide</p>
        </div>
        <div className="flex justify-center items-center gap-8 flex-wrap">
          {/* Partner logos would go here - using placeholder divs for now */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-32 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Partner {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};