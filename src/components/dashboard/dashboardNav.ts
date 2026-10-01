import { LayoutDashboard, Package, ListChecks, Dumbbell, Sprout, HeartPulse, type LucideIcon } from 'lucide-react';

export const DASHBOARD_NAV: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/dashboard', label: 'Overzicht', icon: LayoutDashboard, end: true },
  { to: '/dashboard/voorraad', label: 'Voorraad', icon: Package },
  { to: '/dashboard/taken', label: 'Taken', icon: ListChecks },
  { to: '/dashboard/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/dashboard/tuin', label: 'Tuin', icon: Sprout },
  { to: '/dashboard/welzijn', label: 'Welzijn', icon: HeartPulse },
];
