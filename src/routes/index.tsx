import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PublicLayout from '../components/layout/PublicLayout';
import PrivateLayout from '../components/layout/PrivateLayout';
import RequireAuth from '../components/layout/RequireAuth';

import LandingPage from '../pages/public/LandingPage';
import MealGenerator from '../pages/app/MealGenerator';
import AppLayout from '../components/layout/AppLayout';
import ClientNutritionCalculator from '../pages/app/ClientNutritionCalculator';
import Login from '../pages/public/Login';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route element={<PublicLayout />}>
          <Route path='/' element={<LandingPage />} />
          <Route path='/login' element={<Login />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<PrivateLayout />}>
            <Route
              path='/app/nutrition-profile'
              element={<ClientNutritionCalculator />}
            />
            <Route path='/app/meal-generator' element={<MealGenerator />} />
          </Route>
        </Route>

        <Route path='*' element={<Navigate to='/' replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
