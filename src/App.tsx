import React from 'react';
import HomePage from './pages/HomePage';
import AppLayout from './components/layout/AppLayout';

const App: React.FC = () => {
  return (
    <AppLayout>
      <HomePage />
    </AppLayout>
  );
};

export default App;
