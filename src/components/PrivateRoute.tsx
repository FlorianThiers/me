import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSiteAuth } from '../context/SiteAuthContext';
import { useNoIndex } from '../hooks/useNoIndex';
import { LOGIN_PATH } from '../lib/siteRoutes';

type Props = {
  children: React.ReactElement;
};

export const PrivateRoute: React.FC<Props> = ({ children }) => {
  useNoIndex(true);
  const { loading, authenticated } = useSiteAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-white/60 text-sm">
        Checking session…
      </div>
    );
  }

  if (!authenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${LOGIN_PATH}?redirect=${redirect}`} replace />;
  }

  return children;
};
