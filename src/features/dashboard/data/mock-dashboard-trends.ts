export type DashboardTrendBaselineSeed = {
  daysAgo: number;
  grossAmount: number;
  orderCount: number;
};

export const mockDashboardReferenceDate = '2026-04-12';

export const mockDashboardTrendBaseline: DashboardTrendBaselineSeed[] = [
  {
    daysAgo: 6,
    grossAmount: 182340,
    orderCount: 862,
  },
  {
    daysAgo: 5,
    grossAmount: 205180,
    orderCount: 915,
  },
  {
    daysAgo: 4,
    grossAmount: 194260,
    orderCount: 884,
  },
  {
    daysAgo: 3,
    grossAmount: 223900,
    orderCount: 978,
  },
  {
    daysAgo: 2,
    grossAmount: 248600,
    orderCount: 1026,
  },
  {
    daysAgo: 1,
    grossAmount: 259420,
    orderCount: 1098,
  },
  {
    daysAgo: 0,
    grossAmount: 0,
    orderCount: 0,
  },
];
