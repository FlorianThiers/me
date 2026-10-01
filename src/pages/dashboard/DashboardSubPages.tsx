import React from 'react';
import { DashboardGrid } from '../../components/dashboard/DashboardBlock';
import { StockBlock } from '../../components/dashboard/StockBlock';
import { GardenBlock, TasksBlock, WorkoutsBlock, MoodBlock } from '../../components/dashboard/OtherBlocks';
import { useDashboardData } from '../../components/dashboard/dashboardContext';

/** Detailpagina's: dezelfde blokken als het overzicht, maar met variant="detail" (volledige breedte). */
export const DashboardStockPage: React.FC = () => {
  const { homeStock, snapshot } = useDashboardData();
  return (
    <DashboardGrid>
      <StockBlock homeStock={homeStock} snapshotStock={snapshot?.stats.stock ?? null} variant="detail" />
    </DashboardGrid>
  );
};

export const DashboardTasksPage: React.FC = () => {
  const { snapshot } = useDashboardData();
  return (
    <DashboardGrid>
      <TasksBlock snap={snapshot} variant="detail" />
    </DashboardGrid>
  );
};

export const DashboardWorkoutsPage: React.FC = () => {
  const { snapshot } = useDashboardData();
  return (
    <DashboardGrid>
      <WorkoutsBlock snap={snapshot} variant="detail" />
    </DashboardGrid>
  );
};

export const DashboardGardenPage: React.FC = () => {
  const { snapshot } = useDashboardData();
  return (
    <DashboardGrid>
      <GardenBlock snap={snapshot} variant="detail" />
    </DashboardGrid>
  );
};

export const DashboardWellbeingPage: React.FC = () => {
  const { snapshot } = useDashboardData();
  return (
    <DashboardGrid>
      <MoodBlock snap={snapshot} variant="detail" />
    </DashboardGrid>
  );
};
