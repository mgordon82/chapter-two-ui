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
import InviteUser from '../features/users/InviteUser';
import { useAppSelector } from '../app/hooks';

type AppRole = 'client' | 'coach' | 'admin' | 'staff';

const isAppRole = (value: unknown): value is AppRole => {
  return (
    value === 'client' ||
    value === 'coach' ||
    value === 'admin' ||
    value === 'staff'
  );
};

const RequireRole: React.FC<{
  allowed: AppRole[];
  children: React.ReactElement;
}> = ({ allowed, children }) => {
  const roleRaw = useAppSelector((s) => s.auth.currentUser?.role);

  if (!isAppRole(roleRaw)) {
    return <Navigate to='/app/meal-generator' replace />;
  }

  if (!allowed.includes(roleRaw)) {
    return <Navigate to='/app/meal-generator' replace />;
  }

  return children;
};

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

            <Route
              path='/app/users/invite'
              element={
                <RequireRole allowed={['admin', 'staff', 'coach']}>
                  <InviteUser />
                </RequireRole>
              }
            />
          </Route>
        </Route>

        <Route path='*' element={<Navigate to='/' replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
