import React from 'react';
import { TimelineSection } from '../components/TimelineSection';

export const JourneyPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-20">
      <div className="container-custom px-4 py-8">
        <TimelineSection />
      </div>
    </div>
  );
};
