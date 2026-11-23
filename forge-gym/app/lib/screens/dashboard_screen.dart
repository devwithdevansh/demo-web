import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/shell.dart';
import '../ui/widgets.dart';
import 'member_form.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final user = state.session!.user;
    final gym = state.session!.gym;

    return ForgePage(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            eyebrow: weekday(DateTime.now().toIso8601String().substring(0, 10)),
            title: '${greeting()}, ${firstName(user.name)}.',
            subtitle: '${gym.name} · ${titleCase(gym.package)} plan${gym.isDemo ? ' · private demo sandbox' : ''}',
            actions: [
              if (gym.isDemo)
                OutlinedButton.icon(
                  onPressed: () => _resetDemo(context),
                  icon: const Icon(Icons.restart_alt, size: 17),
                  label: const Text('Reset demo'),
                ),
              FilledButton.icon(
                onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AddMemberScreen())),
                icon: const Icon(Icons.person_add_alt_1, size: 18),
                label: const Text('Add member'),
              ),
            ],
          ),
          const SizedBox(height: 20),
          AsyncBuilder<DashboardData>(
            load: () => context.read<AppState>().api.dashboard(),
            builder: (context, data, reload) {
              final c = data.counts;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  LiveGymClockBanner(gymName: gym.name),
                  const SizedBox(height: 14),
                  _HeroBar(data: data, user: user, onReload: reload, onOpenMembers: () => _go(context, 'Members')),
                  const SizedBox(height: 14),
                  ResponsiveGrid(
                    minItemWidth: 190,
                    children: [
                      StatCard(
                        label: 'Active members',
                        value: '${c.activeMembers}',
                        sub: '${c.expiringSoon} expiring soon',
                        icon: Icons.groups_2_outlined,
                        accent: ForgeColors.blue,
                        onTap: () => _go(context, 'Members'),
                      ),
                      StatCard(
                        label: 'Check-ins today',
                        value: '${c.checkinsToday}',
                        sub: 'Live front-desk count',
                        icon: Icons.how_to_reg_outlined,
                        accent: ForgeColors.green,
                        onTap: () => _go(context, 'Attendance'),
                      ),
                      StatCard(
                        label: 'Collected today',
                        value: inr(c.collectedToday),
                        sub: c.collectedMonth == null
                            ? 'Monthly total is owner-only'
                            : '${inr(c.collectedMonth)} this month',
                        icon: Icons.receipt_long_outlined,
                        accent: ForgeColors.amber,
                        onTap: () => _go(context, 'Payments'),
                      ),
                      StatCard(
                        label: 'Dues outstanding',
                        value: inr(c.duesTotal),
                        sub: '${c.duesMembers} member${c.duesMembers == 1 ? '' : 's'} to collect',
                        icon: Icons.account_balance_wallet_outlined,
                        accent: ForgeColors.redHi,
                        onTap: () => _go(context, 'Payments'),
                      ),
                      StatCard(
                        label: 'Open leads',
                        value: '${c.openLeads}',
                        sub: '${c.followUpsDue} follow-up${c.followUpsDue == 1 ? '' : 's'} due',
                        icon: Icons.person_add_alt_outlined,
                        accent: ForgeColors.violet,
                        onTap: () => _go(context, 'Leads'),
                      ),
                      StatCard(
                        label: 'Lapsed members',
                        value: '${c.lapsed}',
                        sub: 'Expired in the last 45 days',
                        icon: Icons.trending_down,
                        accent: ForgeColors.mute,
                        onTap: () => _go(context, 'Renewals'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 22),
                  _QuickActions(),
                  const SizedBox(height: 22),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final wide = constraints.maxWidth >= 1050;
                      final left = Column(
                        children: [
                          _TodayArrivals(checkins: data.checkins),
                          const SizedBox(height: 14),
                          _Attention(expiring: data.expiring, followUps: data.followUps, payments: data.payments),
                        ],
                      );
                      final right = Column(
                        children: [
                          _MoneyPanel(counts: c),
                          const SizedBox(height: 14),
                          _FollowUps(followUps: data.followUps),
                        ],
                      );
                      if (!wide) {
                        return Column(children: [left, const SizedBox(height: 14), right]);
                      }
                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(flex: 7, child: left),
                          const SizedBox(width: 14),
                          Expanded(flex: 5, child: right),
                        ],
                      );
                    },
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  void _go(BuildContext context, String label) {
    final scope = ShellScope.of(context);
    final index = scope.items.indexWhere((item) => item.label == label);
    if (index >= 0) scope.go(index);
  }

  Future<void> _resetDemo(BuildContext context) async {
    final ok = await showConfirm(
      context,
      title: 'Reset the demo?',
      message: 'Your sandbox goes back to the original sample gym. Anything you entered here is removed.',
      confirmLabel: 'Reset demo',
    );
    if (!ok || !context.mounted) return;
    try {
      await context.read<AppState>().resetDemo();
      if (context.mounted) showSnack(context, 'Demo data restored.');
    } catch (_) {
      if (context.mounted) showSnack(context, 'Could not reset the demo.', error: true);
    }
  }
}

class _HeroBar extends StatelessWidget {
  const _HeroBar({required this.data, required this.user, required this.onReload, required this.onOpenMembers});

  final DashboardData data;
  final dynamic user;
  final VoidCallback onReload;
  final VoidCallback onOpenMembers;

  @override
  Widget build(BuildContext context) {
    final c = data.counts;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [ForgeColors.panelHi, ForgeColors.redDeep.withValues(alpha: 0.28)],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ForgeColors.red.withValues(alpha: 0.24)),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final narrow = constraints.maxWidth < 700;
          final text = Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Eyebrow('Today · ${dayLabel(data.today)}'),
              const SizedBox(height: 12),
              Text(
                '${c.checkinsToday} in the gym. ${c.duesMembers} to collect.',
                style: ForgeTheme.display(narrow ? 26 : 34, height: 1.05),
              ),
              const SizedBox(height: 8),
              Text(
                c.checkinsToday == 0
                    ? 'The floor is quiet. Open the desk and check someone in.'
                    : 'The front desk is moving. Keep renewals and dues from slipping.',
                style: ForgeTheme.body(12.5, color: ForgeColors.boneDim),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 9,
                runSpacing: 9,
                children: [
                  FilledButton.icon(
                    onPressed: onOpenMembers,
                    icon: const Icon(Icons.groups_2_outlined, size: 16),
                    label: const Text('Open members'),
                  ),
                  OutlinedButton.icon(
                    onPressed: onReload,
                    icon: const Icon(Icons.refresh, size: 16),
                    label: const Text('Refresh'),
                  ),
                ],
              ),
            ],
          );
          if (narrow) return text;
          return Row(
            children: [
              Expanded(child: text),
              const SizedBox(width: 24),
              _Ring(value: c.activeMembers, max: c.activeMembers + c.lapsed, label: 'ACTIVE'),
            ],
          );
        },
      ),
    );
  }
}

class _Ring extends StatelessWidget {
  const _Ring({required this.value, required this.max, required this.label});

  final int value;
  final int max;
  final String label;

  @override
  Widget build(BuildContext context) {
    final ratio = max <= 0 ? 0.0 : (value / max).clamp(0.0, 1.0);
    return SizedBox(
      width: 118,
      height: 118,
      child: Stack(
        alignment: Alignment.center,
        children: [
          SizedBox(
            width: 118,
            height: 118,
            child: CircularProgressIndicator(
              value: ratio,
              strokeWidth: 7,
              backgroundColor: Colors.white.withValues(alpha: 0.08),
              valueColor: const AlwaysStoppedAnimation(ForgeColors.redHi),
            ),
          ),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('$value', style: ForgeTheme.display(30)),
              Text(label, style: ForgeTheme.mono(8.5, letterSpacing: 1.4)),
            ],
          ),
        ],
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  void _go(BuildContext context, String label) {
    final scope = ShellScope.of(context);
    final index = scope.items.indexWhere((item) => item.label == label);
    if (index >= 0) scope.go(index);
  }

  @override
  Widget build(BuildContext context) {
    final actions = [
      (
        Icons.person_add_alt_1,
        'Add member',
        () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AddMemberScreen())),
      ),
      (Icons.how_to_reg_outlined, 'Check someone in', () => _go(context, 'Attendance')),
      (Icons.payments_outlined, 'Record payment', () => _go(context, 'Payments')),
      (Icons.person_search_outlined, 'New enquiry', () => _go(context, 'Leads')),
    ];
    return ResponsiveGrid(
      minItemWidth: 190,
      spacing: 10,
      children: actions
          .map(
            (a) => ForgeCard(
              onTap: a.$3,
              padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 14),
              child: Row(
                children: [
                  Icon(a.$1, size: 18, color: ForgeColors.redHi),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      a.$2,
                      style: ForgeTheme.body(12.5, weight: FontWeight.w600, color: ForgeColors.bone),
                    ),
                  ),
                  const Icon(Icons.arrow_outward, size: 14, color: ForgeColors.mute),
                ],
              ),
            ),
          )
          .toList(),
    );
  }
}

class _TodayArrivals extends StatelessWidget {
  const _TodayArrivals({required this.checkins});

  final List<CheckinRow> checkins;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(
            title: "Today's arrivals",
            trailing: StatusPill(label: '${checkins.length} in', color: ForgeColors.green),
          ),
          const SizedBox(height: 14),
          if (checkins.isEmpty)
            const EmptyPanel(
              title: 'No check-ins yet',
              message: 'The first arrival will appear here with their time.',
              icon: Icons.door_front_door_outlined,
            )
          else
            for (final row in checkins.take(6))
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  children: [
                    AvatarCircle(name: row.name, size: 34),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            row.name,
                            style: ForgeTheme.body(12.5, weight: FontWeight.w600, color: ForgeColors.bone),
                          ),
                          Text(
                            row.memberCode.isEmpty ? row.method : '${row.memberCode} · ${row.method}',
                            style: ForgeTheme.body(10, color: ForgeColors.mute),
                          ),
                        ],
                      ),
                    ),
                    Text(row.time, style: ForgeTheme.mono(9.5, color: ForgeColors.boneDim)),
                  ],
                ),
              ),
        ],
      ),
    );
  }
}

class _Attention extends StatelessWidget {
  const _Attention({required this.expiring, required this.followUps, required this.payments});

  final List<Member> expiring;
  final List<Lead> followUps;
  final List<Payment> payments;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(title: 'Needs attention'),
          const SizedBox(height: 12),
          if (expiring.isEmpty && followUps.isEmpty && payments.isEmpty)
            const EmptyPanel(
              title: 'All clear',
              message: 'No renewals or follow-ups are due right now.',
              icon: Icons.verified_outlined,
            )
          else ...[
            for (final member in expiring.take(3))
              _AttentionRow(
                icon: Icons.update,
                color: ForgeColors.amber,
                title: member.name,
                subtitle: '${member.planName} · ${relDays(member.daysLeft)}',
                trailing: 'RENEW',
              ),
            for (final lead in followUps.take(2))
              _AttentionRow(
                icon: Icons.phone_in_talk_outlined,
                color: ForgeColors.violet,
                title: lead.name,
                subtitle:
                    'Lead · ${titleCase(lead.status)}${lead.followUpOn.isNotEmpty ? ' · ${shortDay(lead.followUpOn)}' : ''}',
                trailing: 'CALL',
              ),
            for (final payment in payments.take(2))
              _AttentionRow(
                icon: Icons.payments_outlined,
                color: ForgeColors.green,
                title: payment.memberName.isEmpty ? 'Payment' : payment.memberName,
                subtitle: '${inr(payment.amount)} · ${titleCase(payment.method)}',
                trailing: 'PAID',
              ),
          ],
        ],
      ),
    );
  }
}

class _AttentionRow extends StatelessWidget {
  const _AttentionRow({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.trailing,
  });

  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final String trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 11),
      child: Row(
        children: [
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, size: 15, color: color),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: ForgeTheme.body(12, weight: FontWeight.w600, color: ForgeColors.bone),
                ),
                Text(subtitle, style: ForgeTheme.body(10.5, color: ForgeColors.mute)),
              ],
            ),
          ),
          Text(trailing, style: ForgeTheme.mono(8, color: color, letterSpacing: 1.2)),
        ],
      ),
    );
  }
}

class _MoneyPanel extends StatelessWidget {
  const _MoneyPanel({required this.counts});

  final DashboardCounts counts;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(title: 'Money at a glance'),
          const SizedBox(height: 16),
          Text(inr(counts.duesTotal), style: ForgeTheme.display(32, color: ForgeColors.redHi)),
          Text('OUTSTANDING DUES', style: ForgeTheme.mono(9, letterSpacing: 1.5)),
          const SizedBox(height: 16),
          InfoRow(label: 'Collected today', value: inr(counts.collectedToday), icon: Icons.today_outlined),
          InfoRow(
            label: 'Collected this month',
            value: counts.collectedMonth == null ? 'Owner only' : inr(counts.collectedMonth),
            icon: Icons.calendar_month_outlined,
          ),
          InfoRow(label: 'Members with dues', value: '${counts.duesMembers}', icon: Icons.people_outline),
        ],
      ),
    );
  }
}

class _FollowUps extends StatelessWidget {
  const _FollowUps({required this.followUps});

  final List<Lead> followUps;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(
            title: 'Follow-ups due',
            trailing: StatusPill(label: '${followUps.length}', color: ForgeColors.violet),
          ),
          const SizedBox(height: 12),
          if (followUps.isEmpty)
            const EmptyPanel(
              title: 'No follow-ups',
              message: 'New website enquiries and walk-ins land here.',
              icon: Icons.notifications_none,
            )
          else
            for (final lead in followUps.take(5))
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  children: [
                    AvatarCircle(name: lead.name, size: 30),
                    const SizedBox(width: 9),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            lead.name,
                            style: ForgeTheme.body(12, weight: FontWeight.w600, color: ForgeColors.bone),
                          ),
                          Text(
                            '${titleCase(lead.source)} · ${lead.phone}',
                            style: ForgeTheme.body(10, color: ForgeColors.mute),
                          ),
                        ],
                      ),
                    ),
                    StatusPill(label: lead.status, dense: true),
                  ],
                ),
              ),
        ],
      ),
    );
  }
}
