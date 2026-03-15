import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

import PublicLayout from '../components/layout/PublicLayout';
import PrivateLayout from '../components/layout/PrivateLayout';
import RequireAuth from '../components/layout/RequireAuth';
import AppLayout from '../components/layout/AppLayout';

import LandingPage from '../pages/public/LandingPage';
import Login from '../pages/public/Login';

import Dashboard from '../pages/app/Dashboard';
import MealGenerator from '../pages/app/MealGenerator';
import ClientNutritionCalculator from '../pages/app/ClientNutritionCalculator';
import InviteUser from '../features/users/InviteUser';

import { useAppSelector } from '../app/hooks';
import ForgotPassword from '../pages/public/ForgotPassword';
import AdminUsersPage from '../features/users/AdminUsers';

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

  if (!isAppRole(roleRaw) || !allowed.includes(roleRaw)) {
    return <Navigate to='/app' replace />;
  }

  return children;
};

const RootEntry: React.FC = () => {
  const step = useAppSelector((s) => s.auth.step);
  const isNative = Capacitor.isNativePlatform();

  if (!isNative) {
    return <LandingPage />;
  }

  if (step === 'SIGNED_IN') {
    return <Navigate to='/app' replace />;
  }

  if (step === 'SIGNING_IN' || step === 'UNINITIALIZED') {
    return null;
  }

  return <Navigate to='/login' replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route element={<PublicLayout />}>
          <Route path='/' element={<RootEntry />} />
          <Route path='/login' element={<Login />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path='/app' element={<PrivateLayout />}>
            <Route index element={<Dashboard />} />
            <Route
              path='nutrition-profile'
              element={<ClientNutritionCalculator />}
            />
            <Route path='meal-generator' element={<MealGenerator />} />

            <Route path='users'>
              <Route
                index
                element={
                  <RequireRole allowed={['admin', 'staff']}>
                    <AdminUsersPage />
                  </RequireRole>
                }
              />
              <Route
                path='invite'
                element={
                  <RequireRole allowed={['admin', 'staff', 'coach']}>
                    <InviteUser />
                  </RequireRole>
                }
              />
            </Route>

            <Route path='*' element={<Navigate to='/app' replace />} />
          </Route>
        </Route>

        <Route path='*' element={<Navigate to='/' replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
