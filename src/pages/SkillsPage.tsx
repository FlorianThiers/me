import React from 'react';
import { SkillsSection } from '../components/SkillsSection';

export const SkillsPage: React.FC = () => {


  return (
    <div className="min-h-screen pt-20 bg-dark-secondary relative overflow-hidden">
      {/* Decoratieve achtergrond elementen */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-5"
        aria-hidden="true"
        role="presentation"
      >
        <div className="absolute top-32 left-32 w-80 h-80 bg-neon-green rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-neon-purple rounded-full blur-3xl" />
      </div>

      <div className="container-custom px-4 py-8 relative z-10">
        
        {/* Programming Skills */}
        <div className="mb-20">
          <SkillsSection />
        </div>

        
      </div>
    </div>
  );
};
