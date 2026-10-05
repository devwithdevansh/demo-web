import { inr, monthLabel, prettyDay, shortDay } from '@/lib/format';
import { useData } from '../session';
import { Async, PageHead, Stat, StatusBadge } from '../ui';
import { Bars, ChartCard, Columns } from '../charts';
import { methodLabel } from '../types';

interface ReportData {
  today: string;
  revenueByMonth: { month: string; total: number }[];
  attendanceByDay: { day: string; count: number }[];
  membersByStatus: { status: string; count: number }[];
  membersByPlan: { plan: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
  revenueByMethod: { method: string; total: number }[];
}

const LEAD_LABEL: Record<string, string> = { new: 'New', contacted: 'Contacted', trial: 'Trial booked', joined: 'Joined', lost: 'Not joining' };
const STATUS_NOTE: Record<string, string> = { active: 'More than 7 days left', expiring: 'Ends within 7 days', expired: 'Past the end date' };

/** Axis-friendly rupees: 45K, 1.2L. Full amounts stay in tooltips and tables. */
const compact = (n: number) => (n >= 100000 ? `₹${+(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${+(n / 1000).toFixed(1)}K` : `₹${n}`);
const count = (n: number) => String(Math.round(n));

export default function Reports() {
  const report = useData<ReportData>('/reports');

  return (
    <>
      <PageHead title="Reports" sub="A basic picture of fees, attendance, members and enquiries. Figures come from the sample data in this demo." />
      <Async state={report} label="Loading reports">
        {(r) => {
          const fullMonth = (m: string) => new Date(`${m}-01T00:00:00Z`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {r.membersByStatus.map((s) => (
                  <Stat key={s.status} label="Members" value={s.count} note={STATUS_NOTE[s.status]} badge={<StatusBadge status={s.status} />} />
                ))}
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <ChartCard
                  title="Fees collected, last 6 months"
                  hint="The current month is highlighted and is still in progress."
                  columns={['Month', 'Collected']}
                  rows={r.revenueByMonth.map((m) => [fullMonth(m.month), inr(m.total)])}
                >
                  <Columns
                    format={compact}
                    data={r.revenueByMonth.map((m, i, all) => ({ label: monthLabel(m.month), full: fullMonth(m.month), value: m.total, emphasis: i === all.length - 1 }))}
                  />
                </ChartCard>

                <ChartCard
                  title="Check-ins, last 14 days"
                  hint="Today is highlighted."
                  columns={['Day', 'Check-ins']}
                  rows={r.attendanceByDay.map((d) => [prettyDay(d.day), String(d.count)])}
                >
                  <Columns format={count} data={r.attendanceByDay.map((d) => ({ label: shortDay(d.day), full: prettyDay(d.day), value: d.count, emphasis: d.day === r.today }))} />
                </ChartCard>

                <ChartCard title="Current members by plan" columns={['Plan', 'Members']} rows={r.membersByPlan.map((p) => [p.plan, String(p.count)])}>
                  <Bars format={count} data={r.membersByPlan.map((p) => ({ label: p.plan, value: p.count }))} />
                </ChartCard>

                <ChartCard title="Enquiries by stage" columns={['Stage', 'Enquiries']} rows={r.leadsByStatus.map((l) => [LEAD_LABEL[l.status] ?? l.status, String(l.count)])}>
                  <Bars format={count} data={r.leadsByStatus.map((l) => ({ label: LEAD_LABEL[l.status] ?? l.status, value: l.count }))} />
                </ChartCard>

                <ChartCard
                  title="Fees by payment method, last 6 months"
                  columns={['Method', 'Collected']}
                  rows={r.revenueByMethod.map((m) => [methodLabel(m.method), inr(m.total)])}
                >
                  <Bars format={inr} data={r.revenueByMethod.map((m) => ({ label: methodLabel(m.method), value: m.total }))} />
                </ChartCard>
              </div>
            </div>
          );
        }}
      </Async>
    </>
  );
}
