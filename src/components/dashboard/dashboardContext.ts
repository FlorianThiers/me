import { useOutletContext } from 'react-router-dom';
import type { HomeStockSnapshot } from '../../types/homeStock';
import type { DashboardSnapshot } from '../../types/dashboardSnapshot';

/** Data die DashboardLayout één keer laadt en via de router-outlet aan alle sub-pagina's doorgeeft. */
export type DashboardData = {
  homeStock: HomeStockSnapshot | null;
  snapshot: DashboardSnapshot | null;
  usingExample: boolean;
};

export const useDashboardData = (): DashboardData => useOutletContext<DashboardData>();
