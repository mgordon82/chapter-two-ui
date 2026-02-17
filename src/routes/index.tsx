import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PublicLayout from '../components/layout/PublicLayout';
import PrivateLayout from '../components/layout/PrivateLayout';
import RequireAuth from '../components/layout/RequireAuth';

import HomePage from '../pages/public/HomePage';
import MealGenerator from '../pages/app/MealGenerator';
import AppLayout from '../components/layout/AppLayout';
// import LoginPage from '../pages/public/LoginPage';
// import InvitePage from '../pages/public/InvitePage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route element={<PublicLayout />}>
          <Route path='/' element={<HomePage />} />
          {/* <Route path="/login" element={<LoginPage />} />
        <Route path="/invite/:token" element={<InvitePage />} /> */}
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<PrivateLayout />}>
            <Route path='/app/meal-generator' element={<MealGenerator />} />
          </Route>
        </Route>

        <Route path='*' element={<Navigate to='/' replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
