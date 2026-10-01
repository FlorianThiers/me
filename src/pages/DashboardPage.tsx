import React from 'react';
import { DashboardGrid } from '../components/dashboard/DashboardBlock';
import { StockBlock } from '../components/dashboard/StockBlock';
import { GardenBlock, TasksBlock, WorkoutsBlock, MoodBlock } from '../components/dashboard/OtherBlocks';
import { useDashboardData } from '../components/dashboard/dashboardContext';

/** Overzicht: compacte samenvatting van alle blokken (details op de sub-pagina's). */
export const DashboardPage: React.FC = () => {
  const { homeStock, snapshot } = useDashboardData();
  return (
    <DashboardGrid>
      <StockBlock homeStock={homeStock} snapshotStock={snapshot?.stats.stock ?? null} />
      <GardenBlock snap={snapshot} />
      <TasksBlock snap={snapshot} />
      <WorkoutsBlock snap={snapshot} />
      <MoodBlock snap={snapshot} />
    </DashboardGrid>
  );
};

export default DashboardPage;
