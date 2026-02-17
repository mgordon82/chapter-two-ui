import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const isLoggedIn = true; // change to true to test private routes

const RequireAuth: React.FC = () => {
  return isLoggedIn ? <Outlet /> : <Navigate to='/login' replace />;
};

export default RequireAuth;
