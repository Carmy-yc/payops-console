export type DashboardTrendSeed = {
  date: string;
  grossAmount: number;
  orderCount: number;
};

export const mockDashboardTrendSeries: DashboardTrendSeed[] = [
  {
    date: '2026-04-06',
    grossAmount: 182340,
    orderCount: 862,
  },
  {
    date: '2026-04-07',
    grossAmount: 205180,
    orderCount: 915,
  },
  {
    date: '2026-04-08',
    grossAmount: 194260,
    orderCount: 884,
  },
  {
    date: '2026-04-09',
    grossAmount: 223900,
    orderCount: 978,
  },
  {
    date: '2026-04-10',
    grossAmount: 248600,
    orderCount: 1026,
  },
  {
    date: '2026-04-11',
    grossAmount: 259420,
    orderCount: 1098,
  },
  {
    date: '2026-04-12',
    grossAmount: 0,
    orderCount: 0,
  },
];
