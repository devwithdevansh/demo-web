import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/widgets.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  late Future<ReportData> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<ReportData> _load() => context.read<AppState>().api.reports();

  void _reload() {
    setState(() {
      _future = _load();
    });
  }

  @override
  Widget build(BuildContext context) {
    return ForgePage(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            eyebrow: 'The numbers',
            title: 'Reports.',
            subtitle: 'Six months of money, two weeks of visits, and where your members and leads sit.',
            actions: [IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19))],
          ),
          const SizedBox(height: 16),
          FutureBuilder<ReportData>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const ForgeLoading(label: 'Crunching the numbers');
              }
              if (snapshot.hasError) return ErrorPanel(error: snapshot.error!, onRetry: _reload);
              final data = snapshot.data;
              if (data == null) return ErrorPanel(error: 'No report data returned.', onRetry: _reload);

              final revenue = data.revenueByMonth.fold<double>(0, (sum, point) => sum + point.value);
              final visits = data.attendanceByDay.fold<double>(0, (sum, point) => sum + point.value);
              final active = data.membersByStatus
                  .where((p) => p.label == 'active')
                  .fold<double>(0, (sum, p) => sum + p.value);
              final leads = data.leadsByStatus.fold<double>(0, (sum, point) => sum + point.value);
              final busiest = data.attendanceByDay.isEmpty
                  ? null
                  : data.attendanceByDay.reduce((a, b) => b.value > a.value ? b : a);

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ResponsiveGrid(
                    minItemWidth: 210,
                    children: [
                      StatCard(
                        label: 'Revenue · 6 months',
                        value: inrShort(revenue),
                        sub: 'all recorded payments',
                        icon: Icons.trending_up,
                        accent: ForgeColors.green,
                      ),
                      StatCard(
                        label: 'Visits · 14 days',
                        value: visits.toStringAsFixed(0),
                        sub: busiest == null
                            ? 'no visits yet'
                            : 'busiest ${shortDay(busiest.label)} · ${busiest.value.toInt()}',
                        icon: Icons.how_to_reg_outlined,
                        accent: ForgeColors.blue,
                      ),
                      StatCard(
                        label: 'Active members',
                        value: active.toStringAsFixed(0),
                        sub: 'expiring and expired excluded',
                        icon: Icons.groups_2_outlined,
                        accent: ForgeColors.redHi,
                      ),
                      StatCard(
                        label: 'Leads on file',
                        value: leads.toStringAsFixed(0),
                        sub: 'every enquiry status',
                        icon: Icons.person_add_alt_outlined,
                        accent: ForgeColors.amber,
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final wide = constraints.maxWidth >= 900;
                      final chart = _ChartCard(
                        title: 'Revenue by month',
                        subtitle: 'Payments recorded at the desk and through links.',
                        child: _BarChart(
                          points: data.revenueByMonth,
                          color: ForgeColors.green,
                          money: true,
                          labelFor: (p) => monthLabel(p.label),
                        ),
                      );
                      final visitsChart = _ChartCard(
                        title: 'Visits by day',
                        subtitle: 'Last 14 days of check-ins.',
                        child: _BarChart(
                          points: data.attendanceByDay,
                          color: ForgeColors.blue,
                          labelFor: (p) {
                            final parsed = parseDay(p.label);
                            return parsed == null ? p.label : '${parsed.day}';
                          },
                        ),
                      );
                      if (!wide) {
                        return Column(
                          children: [
                            chart,
                            const SizedBox(height: 14),
                            visitsChart,
                            const SizedBox(height: 14),
                            _StatusCard(data: data),
                          ],
                        );
                      }
                      return Column(
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(child: chart),
                              const SizedBox(width: 14),
                              Expanded(child: visitsChart),
                            ],
                          ),
                          const SizedBox(height: 14),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(child: _StatusCard(data: data)),
                              const SizedBox(width: 14),
                              Expanded(child: _PlansCard(data: data)),
                            ],
                          ),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 14),
                  _MethodCard(points: data.revenueByMethod),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

class _ChartCard extends StatelessWidget {
  const _ChartCard({required this.title, required this.subtitle, required this.child});

  final String title;
  final String subtitle;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(title: title, subtitle: subtitle),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}

class _BarChart extends StatelessWidget {
  const _BarChart({required this.points, required this.color, required this.labelFor, this.money = false});

  final List<ChartPoint> points;
  final Color color;
  final String Function(ChartPoint) labelFor;
  final bool money;

  @override
  Widget build(BuildContext context) {
    if (points.isEmpty) {
      return const EmptyPanel(
        title: 'Nothing to plot yet',
        icon: Icons.bar_chart,
        message: 'Records will fill this chart as they come in.',
      );
    }
    final maxValue = points.fold<double>(0, (max, p) => p.value > max ? p.value : max);
    final maxY = maxValue <= 0 ? 4.0 : maxValue * 1.25;
    return SizedBox(
      height: 210,
      child: BarChart(
        BarChartData(
          alignment: BarChartAlignment.spaceAround,
          maxY: maxY,
          minY: 0,
          barGroups: [
            for (var i = 0; i < points.length; i++)
              BarChartGroupData(
                x: i,
                barRods: [
                  BarChartRodData(
                    toY: points[i].value,
                    width: points.length > 8 ? 12 : 20,
                    color: points[i].value <= 0 ? ForgeColors.line : color,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                  ),
                ],
                showingTooltipIndicators: const [],
              ),
          ],
          titlesData: FlTitlesData(
            topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 46,
                interval: maxY / 3,
                getTitlesWidget: (value, meta) {
                  if (value <= 0) return const SizedBox.shrink();
                  return SideTitleWidget(
                    meta: meta,
                    space: 6,
                    child: Text(
                      money ? inrShort(value) : value.toInt().toString(),
                      style: ForgeTheme.mono(8, letterSpacing: 0.2),
                    ),
                  );
                },
              ),
            ),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 28,
                getTitlesWidget: (value, meta) {
                  final index = value.toInt();
                  if (index < 0 || index >= points.length) return const SizedBox.shrink();
                  if (points.length > 8 && index.isOdd) return const SizedBox.shrink();
                  return SideTitleWidget(
                    meta: meta,
                    space: 7,
                    child: Text(labelFor(points[index]), style: ForgeTheme.mono(8, letterSpacing: 0.2)),
                  );
                },
              ),
            ),
          ),
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: maxY / 3,
            getDrawingHorizontalLine: (_) => const FlLine(color: ForgeColors.line, strokeWidth: 1),
          ),
          borderData: FlBorderData(show: false),
          barTouchData: BarTouchData(
            enabled: true,
            touchTooltipData: BarTouchTooltipData(
              getTooltipColor: (_) => ForgeColors.panelHi,
              getTooltipItem: (group, groupIndex, rod, rodIndex) {
                final point = points[group.x];
                return BarTooltipItem(
                  '${labelFor(point)}\n${money ? inr(rod.toY) : rod.toY.toInt()}',
                  ForgeTheme.body(11, weight: FontWeight.w600, color: ForgeColors.bone),
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  const _StatusCard({required this.data});

  final ReportData data;

  @override
  Widget build(BuildContext context) {
    final total = data.membersByStatus.fold<double>(0, (sum, p) => sum + p.value);
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(title: 'Members by status', subtitle: 'Where everyone stands today.'),
          const SizedBox(height: 16),
          if (total <= 0)
            const EmptyPanel(
              title: 'No members yet',
              icon: Icons.groups_2_outlined,
              message: 'Add a member to see this chart.',
            )
          else ...[
            SizedBox(
              height: 150,
              child: Row(
                children: [
                  Expanded(
                    flex: 4,
                    child: PieChart(
                      PieChartData(
                        sectionsSpace: 2,
                        centerSpaceRadius: 38,
                        startDegreeOffset: -90,
                        sections: [
                          for (final point in data.membersByStatus.where((p) => p.value > 0))
                            PieChartSectionData(
                              value: point.value,
                              color: _statusColor(point.label),
                              radius: 26,
                              title: '${(point.value / total * 100).round()}%',
                              titleStyle: ForgeTheme.mono(
                                8,
                                color: Colors.white,
                                weight: FontWeight.w700,
                                letterSpacing: 0.2,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 5,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        for (final point in data.membersByStatus)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 5),
                            child: Row(
                              children: [
                                Container(
                                  width: 8,
                                  height: 8,
                                  decoration: BoxDecoration(
                                    color: _statusColor(point.label),
                                    borderRadius: BorderRadius.circular(2),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    titleCase(point.label),
                                    style: ForgeTheme.body(11.5, color: ForgeColors.boneDim),
                                  ),
                                ),
                                Text(
                                  point.value.toInt().toString(),
                                  style: ForgeTheme.body(12, weight: FontWeight.w700, color: ForgeColors.bone),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Color _statusColor(String status) => switch (status) {
    'active' => ForgeColors.green,
    'expiring' => ForgeColors.amber,
    'expired' => ForgeColors.redHi,
    _ => ForgeColors.blue,
  };
}

class _PlansCard extends StatelessWidget {
  const _PlansCard({required this.data});

  final ReportData data;

  @override
  Widget build(BuildContext context) {
    final max = data.membersByPlan.fold<double>(0, (value, p) => p.value > value ? p.value : value);
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(title: 'Members by plan', subtitle: 'Active and expiring memberships.'),
          const SizedBox(height: 14),
          if (data.membersByPlan.isEmpty)
            const EmptyPanel(
              title: 'No plan data',
              icon: Icons.card_membership,
              message: 'Add a plan and some members to compare.',
            )
          else
            for (final point in data.membersByPlan.take(6))
              Padding(
                padding: const EdgeInsets.only(bottom: 11),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            point.label,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: ForgeTheme.body(11.5, color: ForgeColors.boneDim),
                          ),
                        ),
                        Text(
                          point.value.toInt().toString(),
                          style: ForgeTheme.body(11.5, weight: FontWeight.w700, color: ForgeColors.bone),
                        ),
                      ],
                    ),
                    const SizedBox(height: 5),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(3),
                      child: LinearProgressIndicator(
                        value: max <= 0 ? 0 : point.value / max,
                        minHeight: 6,
                        backgroundColor: ForgeColors.ink2,
                        valueColor: const AlwaysStoppedAnimation(ForgeColors.red),
                      ),
                    ),
                  ],
                ),
              ),
        ],
      ),
    );
  }
}

class _MethodCard extends StatelessWidget {
  const _MethodCard({required this.points});

  final List<ChartPoint> points;

  @override
  Widget build(BuildContext context) {
    final total = points.fold<double>(0, (sum, p) => sum + p.value);
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(title: 'Revenue by method', subtitle: 'How members paid over the last six months.'),
          const SizedBox(height: 14),
          if (total <= 0)
            const EmptyPanel(
              title: 'No payments yet',
              icon: Icons.receipt_long_outlined,
              message: 'Payment methods will be compared here.',
            )
          else
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                for (final point in points)
                  Container(
                    width: 168,
                    padding: const EdgeInsets.all(13),
                    decoration: BoxDecoration(
                      color: ForgeColors.ink2,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: ForgeColors.line),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(_methodIcon(point.label), size: 15, color: ForgeColors.mute),
                            const SizedBox(width: 6),
                            Text(titleCase(point.label).toUpperCase(), style: ForgeTheme.mono(8.5, letterSpacing: 1.1)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(inr(point.value), style: ForgeTheme.display(21)),
                        const SizedBox(height: 2),
                        Text(
                          '${(point.value / total * 100).round()}% of collected',
                          style: ForgeTheme.body(9.5, color: ForgeColors.mute),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
        ],
      ),
    );
  }

  IconData _methodIcon(String method) => switch (method) {
    'cash' => Icons.payments_outlined,
    'upi' => Icons.qr_code_2,
    'card' => Icons.credit_card,
    'bank' => Icons.account_balance_outlined,
    _ => Icons.receipt_long_outlined,
  };
}
