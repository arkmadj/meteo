import React from 'react';

import App from '@/components/app/App';

/**
 * Home page component - main weather app interface
 */
const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Main Weather App */}
      <App />
    </div>
  );
};

export default HomePage;
