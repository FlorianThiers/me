import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { DashboardPage } from './DashboardPage';
import {
  DashboardStockPage,
  DashboardTasksPage,
  DashboardWorkoutsPage,
  DashboardGardenPage,
  DashboardWellbeingPage,
} from './dashboard/DashboardSubPages';

/**
 * Alle /dashboard/* routes in één lazy chunk. App.tsx registreert `/dashboard/*` alleen in
 * dev / met VITE_ENABLE_DASHBOARD=1; hier staan de geneste sub-routes (relatief).
 */
export const DashboardRoutes: React.FC = () => (
  <Routes>
    <Route element={<DashboardLayout />}>
      <Route index element={<DashboardPage />} />
      <Route path="voorraad" element={<DashboardStockPage />} />
      <Route path="taken" element={<DashboardTasksPage />} />
      <Route path="workouts" element={<DashboardWorkoutsPage />} />
      <Route path="tuin" element={<DashboardGardenPage />} />
      <Route path="welzijn" element={<DashboardWellbeingPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>
  </Routes>
);

export default DashboardRoutes;
