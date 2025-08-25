import React from 'react';
import { GoalsSection } from '../components/GoalsSection';

export const GoalsPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-20">
      <div className="container-custom px-4 py-8">
        <GoalsSection />
      </div>
    </div>
  );
};
