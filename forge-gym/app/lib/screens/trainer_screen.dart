import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/widgets.dart';
import 'coach_member_screen.dart';
import 'coaching_screen.dart';

class TrainerScreen extends StatefulWidget {
  const TrainerScreen({super.key});

  @override
  State<TrainerScreen> createState() => _TrainerScreenState();
}

class _TrainerScreenState extends State<TrainerScreen> {
  late Future<TrainerOverview> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<TrainerOverview> _load() => context.read<AppState>().api.coachOverview();

  void _reload() {
    setState(() {
      _future = _load();
    });
  }

  Future<void> _openMember(String memberId) async {
    await Navigator.of(context).push(MaterialPageRoute(builder: (_) => CoachMemberScreen(memberId: memberId)));
    if (mounted) _reload();
  }

  @override
  Widget build(BuildContext context) {
    return ForgePage(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FutureBuilder<TrainerOverview>(
            future: _future,
            builder: (context, snapshot) {
              final data = snapshot.data;
              return PageHeader(
                eyebrow: 'Coaching desk',
                title: data == null || data.trainerName.isEmpty
                    ? 'Today.'
                    : '${greeting()}, ${firstName(data.trainerName)}.',
                subtitle: data == null
                    ? 'Your members, plans and sessions for today.'
                    : '${weekday(data.today)} · ${data.trainerTitle.isEmpty ? 'Trainer' : data.trainerTitle}. Here is what needs you.',
                actions: [
                  IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19)),
                ],
              );
            },
          ),
          const SizedBox(height: 16),
          FutureBuilder<TrainerOverview>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const ForgeLoading(label: 'Loading your day');
              }
              if (snapshot.hasError) return ErrorPanel(error: snapshot.error!, onRetry: _reload);
              final data = snapshot.data;
              if (data == null) return ErrorPanel(error: 'No coaching data returned.', onRetry: _reload);

              final planMissing = data.tasks.where((t) => t.kind == 'plan').length;
              final quiet = data.members.where((m) => (m.sinceCheckin ?? 99) >= 7).length;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const LiveGymClockBanner(),
                  const SizedBox(height: 14),
                  ResponsiveGrid(
                    minItemWidth: 205,
                    children: [
                      StatCard(
                        label: 'My members',
                        value: '${data.members.length}',
                        sub: 'assigned to you',
                        icon: Icons.groups_2_outlined,
                        accent: ForgeColors.blue,
                      ),
                      StatCard(
                        label: 'Needs a plan',
                        value: '$planMissing',
                        sub: 'workout not written yet',
                        icon: Icons.assignment_outlined,
                        accent: ForgeColors.redHi,
                      ),
                      StatCard(
                        label: 'Quiet 7+ days',
                        value: '$quiet',
                        sub: 'reach out today',
                        icon: Icons.snooze_outlined,
                        accent: ForgeColors.amber,
                      ),
                      StatCard(
                        label: 'Classes today',
                        value: '${data.classesToday.length}',
                        sub: data.classesToday.isEmpty ? 'no classes on your timetable' : 'on the timetable',
                        icon: Icons.calendar_month_outlined,
                        accent: ForgeColors.green,
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final wide = constraints.maxWidth >= 960;
                      final left = Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          ForgeCard(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                SectionHeader(
                                  title: 'Today\'s list',
                                  subtitle: 'Everything the desk and your members need from you.',
                                  trailing: StatusPill(label: '${data.tasks.length}', color: ForgeColors.amber),
                                ),
                                const SizedBox(height: 12),
                                if (data.tasks.isEmpty)
                                  const EmptyPanel(
                                    title: 'All clear',
                                    message: 'No plans missing, no quiet members and no renewals to chase.',
                                    icon: Icons.check_circle_outline,
                                  )
                                else
                                  for (final task in data.tasks)
                                    _TaskRow(task: task, onTap: () => _openMember(task.memberId)),
                              ],
                            ),
                          ),
                          const SizedBox(height: 14),
                          ForgeCard(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                SectionHeader(
                                  title: 'Classes today',
                                  subtitle: 'Sessions on the gym timetable with you leading.',
                                  trailing: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      TextButton.icon(
                                        onPressed: () async {
                                          await Navigator.of(context).push(
                                            MaterialPageRoute(builder: (_) => const CoachingScreen()),
                                          );
                                          if (mounted) _reload();
                                        },
                                        icon: const Icon(Icons.edit_calendar_outlined, size: 14),
                                        label: const Text('Timetable'),
                                      ),
                                      const SizedBox(width: 6),
                                      StatusPill(
                                        label: weekday(data.today),
                                        color: ForgeColors.blue,
                                        dense: true,
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 12),
                                if (data.classesToday.isEmpty)
                                  const EmptyPanel(
                                    title: 'No classes booked',
                                    message: 'The timetable has nothing assigned to you today.',
                                    icon: Icons.event_available_outlined,
                                  )
                                else
                                  for (final slot in data.classesToday)
                                    Padding(
                                      padding: const EdgeInsets.only(bottom: 9),
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 54,
                                            padding: const EdgeInsets.symmetric(vertical: 7),
                                            alignment: Alignment.center,
                                            decoration: BoxDecoration(
                                              color: ForgeColors.blue.withValues(alpha: 0.1),
                                              borderRadius: BorderRadius.circular(9),
                                              border: Border.all(color: ForgeColors.blue.withValues(alpha: 0.3)),
                                            ),
                                            child: Text(
                                              timeLabel(slot.time),
                                              style: ForgeTheme.mono(9, color: ForgeColors.blue, letterSpacing: 0.2),
                                            ),
                                          ),
                                          const SizedBox(width: 11),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  slot.name,
                                                  style: ForgeTheme.body(
                                                    12.5,
                                                    weight: FontWeight.w600,
                                                    color: ForgeColors.bone,
                                                  ),
                                                ),
                                                Text(
                                                  '${slot.durationMin} min',
                                                  style: ForgeTheme.body(10, color: ForgeColors.mute),
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
                      );
                      final right = ForgeCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SectionHeader(
                              title: 'Your members',
                              subtitle: 'Tap a member for their plan, diet and measurements.',
                              trailing: StatusPill(
                                label: '${data.members.length}',
                                color: ForgeColors.mute,
                                dense: true,
                              ),
                            ),
                            const SizedBox(height: 12),
                            if (data.members.isEmpty)
                              const EmptyPanel(
                                title: 'No members yet',
                                message: 'The owner assigns members to trainers. Ask for your first one.',
                                icon: Icons.groups_2_outlined,
                              )
                            else
                              for (final row in data.members)
                                _MemberRow(row: row, onTap: () => _openMember(row.member.id)),
                          ],
                        ),
                      );
                      if (!wide) {
                        return Column(children: [left, const SizedBox(height: 14), right]);
                      }
                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(flex: 6, child: left),
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
}

class _TaskRow extends StatelessWidget {
  const _TaskRow({required this.task, required this.onTap});

  final CoachTask task;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final tone = switch (task.kind) {
      'plan' => ForgeColors.redHi,
      'checkin' => ForgeColors.amber,
      'pt' => ForgeColors.violet,
      'renewal' => ForgeColors.blue,
      _ => ForgeColors.mute,
    };
    final icon = switch (task.kind) {
      'plan' => Icons.assignment_outlined,
      'checkin' => Icons.snooze_outlined,
      'pt' => Icons.fitness_center,
      'renewal' => Icons.update,
      _ => Icons.bolt_outlined,
    };
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 4),
          child: Row(
            children: [
              Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  color: tone.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: tone.withValues(alpha: 0.28)),
                ),
                child: Icon(icon, size: 15, color: tone),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(task.text, style: ForgeTheme.body(12, color: ForgeColors.boneDim)),
              ),
              const Icon(Icons.chevron_right, size: 17, color: ForgeColors.mute),
            ],
          ),
        ),
      ),
    );
  }
}

class _MemberRow extends StatelessWidget {
  const _MemberRow({required this.row, required this.onTap});

  final TrainerMember row;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final member = row.member;
    final since = row.sinceCheckin;
    final last = since == null
        ? 'No check-in yet'
        : since == 0
        ? 'Checked in today'
        : 'Last check-in $since day${since == 1 ? '' : 's'} ago';
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(11),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
          child: Row(
            children: [
              AvatarCircle(name: member.name, size: 38),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            member.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: ForgeTheme.body(12.5, weight: FontWeight.w600, color: ForgeColors.bone),
                          ),
                        ),
                        const SizedBox(width: 7),
                        StatusPill(label: member.status, dense: true),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '$last · ${member.planName}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: ForgeTheme.body(10, color: ForgeColors.mute),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  if (!row.hasWorkout)
                    Text('NO PLAN', style: ForgeTheme.mono(7.5, color: ForgeColors.redHi, letterSpacing: 0.8))
                  else
                    Text('PLAN ✓', style: ForgeTheme.mono(7.5, color: ForgeColors.green, letterSpacing: 0.8)),
                  if (member.ptTotal > 0)
                    Text('${member.ptLeft} PT left', style: ForgeTheme.body(9, color: ForgeColors.mute)),
                ],
              ),
              const SizedBox(width: 4),
              const Icon(Icons.chevron_right, size: 17, color: ForgeColors.mute),
            ],
          ),
        ),
      ),
    );
  }
}
