import { buildDashboardTrendSeries } from './dashboard-utils';

describe('buildDashboardTrendSeries', () => {
  it('会基于参考业务日生成最近 7 天窗口，并用运行时数据覆盖当天', () => {
    const series = buildDashboardTrendSeries('2026-04-12', 784, 4);

    expect(series).toHaveLength(7);
    expect(series[0]).toMatchObject({
      date: '2026-04-06',
      label: '04/06',
      grossAmount: 182340,
      orderCount: 862,
    });
    expect(series[6]).toMatchObject({
      date: '2026-04-12',
      label: '04/12',
      grossAmount: 784,
      orderCount: 4,
    });
  });

  it('会随参考业务日滚动整个 7 日窗口', () => {
    const series = buildDashboardTrendSeries('2026-04-15', 1200, 8);

    expect(series[0]?.date).toBe('2026-04-09');
    expect(series[6]).toMatchObject({
      date: '2026-04-15',
      grossAmount: 1200,
      orderCount: 8,
    });
  });
});
