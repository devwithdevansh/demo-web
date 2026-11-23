import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/shell.dart';
import '../ui/widgets.dart';
import '../ui/workout_tools.dart';

class MemberHomeScreen extends StatefulWidget {
  const MemberHomeScreen({super.key});

  @override
  State<MemberHomeScreen> createState() => _MemberHomeScreenState();
}

class _MemberHomeScreenState extends State<MemberHomeScreen> {
  late Future<MemberPortal> _future;
  final Set<String> _checkedExercises = {};

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<MemberPortal> _load() => context.read<AppState>().api.portal();

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
          FutureBuilder<MemberPortal>(
            future: _future,
            builder: (context, snapshot) {
              final data = snapshot.data;
              return PageHeader(
                eyebrow: data?.gymName ?? 'Member pass',
                title: data == null ? 'Your pass.' : '${greeting()}, ${firstName(data.member.name)}.',
                subtitle: 'Your digital membership card, today at the gym, and what your coach has set.',
                actions: [
                  IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19)),
                ],
              );
            },
          ),
          const SizedBox(height: 16),
          FutureBuilder<MemberPortal>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const ForgeLoading(label: 'Loading your pass');
              }
              if (snapshot.hasError) return ErrorPanel(error: snapshot.error!, onRetry: _reload);
              final data = snapshot.data;
              if (data == null) return ErrorPanel(error: 'No portal data returned.', onRetry: _reload);
              final member = data.member;
              final curWeekday = data.weekday.isNotEmpty ? data.weekday : DateFormat('EEEE').format(DateTime.now());
              final shortDayStr = curWeekday.length >= 3 ? curWeekday.substring(0, 3).toLowerCase() : curWeekday.toLowerCase();

              // Today's classes matching day (e.g. Fri, Mon, Wed, Fri, or Daily)
              final todaySlots = data.slots.where((slot) {
                final d = slot.day.toLowerCase();
                return d.contains(shortDayStr) || d.contains('daily') || d.contains(curWeekday.toLowerCase());
              }).toList();

              // Today's workout goal matching day
              final workoutDays = member.workout?.days ?? const [];
              final todaysWorkout = workoutDays.cast<WorkoutDay?>().firstWhere(
                (d) => d != null && (d.day.toLowerCase().contains(shortDayStr) || d.day.toLowerCase() == curWeekday.toLowerCase()),
                orElse: () => null,
              );

              final lastLog = data.logs.where((log) => log.type == 'checkin').toList();

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Live Gym Clock, Date & Open/Closed Status Banner
                  LiveGymClockBanner(
                    gymName: data.gymName,
                    noticeCount: data.announcements.length,
                    onTapNotices: () => showNoticesSheet(context, data.announcements),
                  ),
                  const SizedBox(height: 12),

                  // 2. Urgent Notices & Announcements NoticeBar
                  if (data.announcements.isNotEmpty) ...[
                    NoticeBar(
                      title: data.announcements.first.title,
                      body: data.announcements.first.body,
                      date: stampLabel(data.announcements.first.createdAt),
                      isUrgent: true,
                      onTap: () => showNoticesSheet(context, data.announcements),
                    ),
                    const SizedBox(height: 12),
                  ],

                  // 3. Membership Alert NoticeBar (if dues or expiring)
                  if (member.feeDue > 0 || member.isExpiring || member.isExpired) ...[
                    _NoticeBar(member: member),
                    const SizedBox(height: 12),
                  ],

                  // 4. Quick Metrics
                  ResponsiveGrid(
                    minItemWidth: 190,
                    children: [
                      StatCard(
                        label: 'Visits · 30 days',
                        value: '${data.visits.length}',
                        sub: 'self check-ins at the door',
                        icon: Icons.how_to_reg_outlined,
                        accent: ForgeColors.blue,
                      ),
                      StatCard(
                        label: 'Days left',
                        value: member.daysLeft < 0 ? '0' : '${member.daysLeft}',
                        sub: dayLabel(member.expiryDate),
                        icon: Icons.event_available_outlined,
                        accent: member.daysLeft <= 7 ? ForgeColors.amber : ForgeColors.green,
                      ),
                      StatCard(
                        label: 'PT sessions left',
                        value: '${member.ptLeft}',
                        sub: member.ptTotal == 0 ? 'no PT pack active' : 'of ${member.ptTotal}',
                        icon: Icons.fitness_center,
                        accent: ForgeColors.violet,
                      ),
                      StatCard(
                        label: 'Dues',
                        value: member.feeDue <= 0 ? 'Clear' : inr(member.feeDue),
                        sub: member.feeDue <= 0 ? 'nothing outstanding' : 'pay at the front desk',
                        icon: Icons.account_balance_wallet_outlined,
                        accent: member.feeDue <= 0 ? ForgeColors.green : ForgeColors.redHi,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // 5. Today's Goal Card
                  _TodaysGoalCard(
                    workout: todaysWorkout,
                    weekday: curWeekday,
                    diet: member.diet,
                    checkedExercises: _checkedExercises,
                    onToggleExercise: (name) {
                      setState(() {
                        if (_checkedExercises.contains(name)) {
                          _checkedExercises.remove(name);
                        } else {
                          _checkedExercises.add(name);
                        }
                      });
                    },
                    onOpenWorkout: () => ShellScope.of(context).go(2),
                  ),
                  const SizedBox(height: 16),

                  // 6. Split layout: Pass card & Today's Timetable / Shortcuts
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final wide = constraints.maxWidth >= 940;
                      final pass = _PassCard(member: member, onCheckin: () => ShellScope.of(context).go(1));
                      final side = Column(
                        children: [
                          _TodaysTimetableCard(
                            slots: todaySlots,
                            weekday: curWeekday,
                            onBook: (slot) {
                              showSnack(context, 'Spot confirmed for ${slot.name} (${timeLabel(slot.time)})!');
                            },
                          ),
                          const SizedBox(height: 14),
                          ForgeCard(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SectionHeader(title: 'Shortcuts', subtitle: 'Everything you need in one tap.'),
                                const SizedBox(height: 12),
                                _Shortcut(
                                  icon: Icons.qr_code_scanner,
                                  title: 'Check in',
                                  subtitle: 'Scan the QR at reception',
                                  tone: ForgeColors.green,
                                  onTap: () => ShellScope.of(context).go(1),
                                ),
                                _Shortcut(
                                  icon: Icons.fitness_center,
                                  title: 'My workout',
                                  subtitle: member.workout == null || member.workout!.days.isEmpty
                                      ? 'Your coach has not added a plan yet'
                                      : member.workout!.title,
                                  tone: ForgeColors.redHi,
                                  onTap: () => ShellScope.of(context).go(2),
                                ),
                                _Shortcut(
                                  icon: Icons.restaurant_menu,
                                  title: 'Diet guide',
                                  subtitle: member.diet == null || member.diet!.meals.isEmpty
                                      ? 'No diet plan yet'
                                      : member.diet!.title,
                                  tone: ForgeColors.amber,
                                  onTap: () => ShellScope.of(context).go(4),
                                ),
                                _Shortcut(
                                  icon: Icons.play_circle_outline,
                                  title: 'Training videos',
                                  subtitle: 'Form checks and lessons from your gym',
                                  tone: ForgeColors.blue,
                                  onTap: () => ShellScope.of(context).go(5),
                                ),
                                _Shortcut(
                                  icon: Icons.calculate_outlined,
                                  title: '1RM Calculator & PRs',
                                  subtitle: 'Calculate one-rep max & view all personal bests',
                                  tone: ForgeColors.violet,
                                  onTap: () => showPrCalculatorSheet(context),
                                ),
                                _Shortcut(
                                  icon: Icons.compare_rounded,
                                  title: 'Before & After Reveal',
                                  subtitle: 'Interactive 90-day progress slider',
                                  tone: ForgeColors.amber,
                                  onTap: () => showBeforeAfterSheet(context),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 14),
                          StreakHeatmapCard(streakDays: 14, visits: data.visits),
                        ],
                      );
                      if (!wide) {
                        return Column(children: [pass, const SizedBox(height: 14), side]);
                      }
                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(flex: 5, child: pass),
                          const SizedBox(width: 14),
                          Expanded(flex: 5, child: side),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 14),
                  ForgeCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionHeader(title: 'From your gym', subtitle: 'Notices posted by the team.'),
                        const SizedBox(height: 12),
                        if (data.announcements.isEmpty)
                          const EmptyPanel(
                            title: 'No notices',
                            message: 'Announcements from the gym will appear here.',
                            icon: Icons.campaign_outlined,
                          )
                        else
                          for (final announcement in data.announcements.take(4))
                            Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    width: 30,
                                    height: 30,
                                    decoration: BoxDecoration(
                                      color: ForgeColors.amber.withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: ForgeColors.amber.withValues(alpha: 0.28)),
                                    ),
                                    child: const Icon(Icons.campaign_outlined, size: 15, color: ForgeColors.amber),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          announcement.title,
                                          style: ForgeTheme.body(
                                            12.5,
                                            weight: FontWeight.w600,
                                            color: ForgeColors.bone,
                                          ),
                                        ),
                                        if (announcement.body.isNotEmpty) ...[
                                          const SizedBox(height: 2),
                                          Text(
                                            announcement.body,
                                            style: ForgeTheme.body(11, color: ForgeColors.mute, height: 1.45),
                                          ),
                                        ],
                                        const SizedBox(height: 3),
                                        Text(
                                          '${announcement.postedBy.isEmpty ? 'Gym team' : announcement.postedBy} · ${stampLabel(announcement.createdAt)}',
                                          style: ForgeTheme.mono(8, letterSpacing: 0.3),
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
                  if (lastLog.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    ForgeCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SectionHeader(
                            title: 'Coach notes',
                            subtitle: 'The latest check-ins from your trainer.',
                          ),
                          const SizedBox(height: 10),
                          for (final log in lastLog.take(4))
                            Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    shortDay(log.day),
                                    style: ForgeTheme.mono(8.5, color: ForgeColors.mute, letterSpacing: 0.3),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(log.note, style: ForgeTheme.body(11.5, color: ForgeColors.boneDim)),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}

class _NoticeBar extends StatelessWidget {
  const _NoticeBar({required this.member});

  final Member member;

  @override
  Widget build(BuildContext context) {
    final expired = member.status == 'expired';
    final tone = expired ? ForgeColors.redHi : ForgeColors.amber;
    final text = expired
        ? 'Your membership ended on ${dayLabel(member.expiryDate)}. Renew at the front desk to check in again.'
        : member.feeDue > 0
        ? '${inr(member.feeDue)} is pending on your membership. Pay at the front desk on your next visit.'
        : 'Your membership ends in ${member.daysLeft} day${member.daysLeft == 1 ? '' : 's'}. Renew at the front desk to keep training.';
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: tone.withValues(alpha: 0.09),
        borderRadius: BorderRadius.circular(13),
        border: Border.all(color: tone.withValues(alpha: 0.35)),
      ),
      child: Row(
        children: [
          Icon(expired ? Icons.error_outline : Icons.info_outline, size: 18, color: tone),
          const SizedBox(width: 10),
          Expanded(
            child: Text(text, style: ForgeTheme.body(12, color: ForgeColors.boneDim)),
          ),
        ],
      ),
    );
  }
}

class _PassCard extends StatelessWidget {
  const _PassCard({required this.member, required this.onCheckin});

  final Member member;
  final VoidCallback onCheckin;

  @override
  Widget build(BuildContext context) {
    final tone = StatusPill.colorFor(member.status);
    return ForgeCard(
      padding: const EdgeInsets.all(20),
      accent: tone,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Eyebrow('Digital pass', color: tone),
              const Spacer(),
              StatusPill(label: member.status),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(member.name, style: ForgeTheme.display(30, letterSpacing: 0.3)),
                    const SizedBox(height: 4),
                    Text(member.planName, style: ForgeTheme.body(12.5, color: ForgeColors.boneDim)),
                    const SizedBox(height: 16),
                    _MiniRow(label: 'Member code', value: member.memberCode, mono: true),
                    _MiniRow(label: 'Valid until', value: dayLabel(member.expiryDate)),
                    _MiniRow(label: 'Trainer', value: member.trainerName ?? 'Not assigned'),
                    _MiniRow(label: 'Category', value: member.category),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.all(9),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                child: QrImageView(
                  data: member.memberCode,
                  version: QrVersions.auto,
                  size: 116,
                  backgroundColor: Colors.white,
                  eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: ForgeColors.ink),
                  dataModuleStyle: const QrDataModuleStyle(
                    dataModuleShape: QrDataModuleShape.square,
                    color: ForgeColors.ink,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(11),
            decoration: BoxDecoration(
              color: ForgeColors.ink2,
              borderRadius: BorderRadius.circular(11),
              border: Border.all(color: ForgeColors.line),
            ),
            child: Row(
              children: [
                Icon(Icons.qr_code_scanner, size: 18, color: tone),
                const SizedBox(width: 9),
                Expanded(
                  child: Text(
                    'Show this code at the front desk, or check in yourself from the door QR.',
                    style: ForgeTheme.body(10.5, color: ForgeColors.mute),
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton(
                  onPressed: onCheckin,
                  style: FilledButton.styleFrom(
                    minimumSize: const Size(0, 38),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                  ),
                  child: const Text('Check in'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniRow extends StatelessWidget {
  const _MiniRow({required this.label, required this.value, this.mono = false});

  final String label;
  final String value;
  final bool mono;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 7),
      child: Row(
        children: [
          SizedBox(width: 84, child: Text(label.toUpperCase(), style: ForgeTheme.mono(8, letterSpacing: 1))),
          Expanded(
            child: Text(
              value,
              style: mono
                  ? ForgeTheme.mono(11, color: ForgeColors.bone, letterSpacing: 0.6)
                  : ForgeTheme.body(11.5, weight: FontWeight.w600, color: ForgeColors.bone),
            ),
          ),
        ],
      ),
    );
  }
}

class _Shortcut extends StatelessWidget {
  const _Shortcut({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.tone,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Color tone;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 3),
          child: Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: tone.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(9),
                  border: Border.all(color: tone.withValues(alpha: 0.28)),
                ),
                child: Icon(icon, size: 16, color: tone),
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
                    Text(
                      subtitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: ForgeTheme.body(10, color: ForgeColors.mute),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, size: 17, color: ForgeColors.mute),
            ],
          ),
        ),
      ),
    );
  }
}

class _TodaysGoalCard extends StatelessWidget {
  const _TodaysGoalCard({
    required this.workout,
    required this.weekday,
    required this.diet,
    required this.checkedExercises,
    required this.onToggleExercise,
    required this.onOpenWorkout,
  });

  final WorkoutDay? workout;
  final String weekday;
  final Diet? diet;
  final Set<String> checkedExercises;
  final ValueChanged<String> onToggleExercise;
  final VoidCallback onOpenWorkout;

  @override
  Widget build(BuildContext context) {
    final hasWorkout = workout != null && workout!.exercises.isNotEmpty;
    final exercises = hasWorkout ? workout!.exercises : const <Exercise>[];
    final completedCount = exercises.where((e) => checkedExercises.contains(e.name)).length;
    final progress = exercises.isEmpty ? 0.0 : completedCount / exercises.length;

    return ForgeCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: ForgeColors.red.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: ForgeColors.red.withValues(alpha: 0.3)),
                ),
                child: const Icon(Icons.track_changes_rounded, size: 21, color: ForgeColors.redHi),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          'TODAY\'S GOAL',
                          style: ForgeTheme.mono(9.5, color: ForgeColors.redHi, letterSpacing: 1.2),
                        ),
                        const SizedBox(width: 8),
                        Flexible(
                          child: StatusPill(
                            label: weekday.toUpperCase(),
                            color: ForgeColors.blue,
                            dense: true,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 3),
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerLeft,
                      child: Text(
                        hasWorkout ? workout!.focus : 'Active Recovery & Core Flow',
                        style: ForgeTheme.display(20, letterSpacing: 0.4),
                      ),
                    ),
                  ],
                ),
              ),
              TextButton.icon(
                onPressed: onOpenWorkout,
                icon: const Icon(Icons.fitness_center, size: 14),
                label: const Text('Plan'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Progress bar
          if (exercises.isNotEmpty) ...[
            Row(
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 6,
                      backgroundColor: ForgeColors.line,
                      valueColor: AlwaysStoppedAnimation(
                        progress == 1.0 ? ForgeColors.green : ForgeColors.redHi,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  '$completedCount/${exercises.length} done',
                  style: ForgeTheme.mono(9.5, color: progress == 1.0 ? ForgeColors.green : ForgeColors.mute),
                ),
              ],
            ),
            const SizedBox(height: 12),
          ],
          // Exercise checklist
          if (hasWorkout) ...[
            for (final ex in exercises) ...[
              Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () => onToggleExercise(ex.name),
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
                    child: Row(
                      children: [
                        Icon(
                          checkedExercises.contains(ex.name)
                              ? Icons.check_box_rounded
                              : Icons.check_box_outline_blank_rounded,
                          size: 19,
                          color: checkedExercises.contains(ex.name) ? ForgeColors.green : ForgeColors.mute,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            ex.name,
                            style: ForgeTheme.body(
                              12.5,
                              weight: FontWeight.w600,
                              color: checkedExercises.contains(ex.name) ? ForgeColors.mute : ForgeColors.bone,
                            ).copyWith(
                              decoration: checkedExercises.contains(ex.name) ? TextDecoration.lineThrough : null,
                            ),
                          ),
                        ),
                        Text(
                          '${ex.sets} x ${ex.reps}',
                          style: ForgeTheme.mono(10.5, color: ForgeColors.boneDim),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ] else ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: ForgeColors.ink2,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: ForgeColors.line),
              ),
              child: Row(
                children: [
                  const Icon(Icons.self_improvement_rounded, size: 20, color: ForgeColors.green),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Rest day scheduled. Stay hydrated, hit 10k steps, and do light mobility work.',
                      style: ForgeTheme.body(11.5, color: ForgeColors.boneDim),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 14),
          const InWorkoutRestTimer(),
          if (diet != null && diet!.title.isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: ForgeColors.ink2,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  const Icon(Icons.restaurant_outlined, size: 15, color: ForgeColors.amber),
                  const SizedBox(width: 8),
                  Text('Nutrition Plan:', style: ForgeTheme.mono(9.5, color: ForgeColors.mute)),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      '${diet!.title}${diet!.meals.isNotEmpty ? ' · ${diet!.meals.length} meals' : ''}',
                      overflow: TextOverflow.ellipsis,
                      style: ForgeTheme.mono(9.5, color: ForgeColors.bone, letterSpacing: 0.3),
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
}

class _TodaysTimetableCard extends StatelessWidget {
  const _TodaysTimetableCard({
    required this.slots,
    required this.weekday,
    required this.onBook,
  });

  final List<ClassSlot> slots;
  final String weekday;
  final ValueChanged<ClassSlot> onBook;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(
            title: 'Today\'s Timetable',
            subtitle: '$weekday classes and floor sessions',
            trailing: StatusPill(
              label: '${slots.length} ${slots.length == 1 ? 'class' : 'classes'}',
              color: ForgeColors.blue,
              dense: true,
            ),
          ),
          const SizedBox(height: 12),
          if (slots.isEmpty)
            const EmptyPanel(
              title: 'No classes today',
              message: 'The timetable is clear for today. Train whenever you like.',
              icon: Icons.event_available_outlined,
            )
          else
            for (final slot in slots) ...[
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: ForgeColors.ink2,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: ForgeColors.line),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                        decoration: BoxDecoration(
                          color: ForgeColors.blue.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: ForgeColors.blue.withValues(alpha: 0.3)),
                        ),
                        child: Text(
                          timeLabel(slot.time),
                          style: ForgeTheme.mono(9.5, color: ForgeColors.blue, letterSpacing: 0.3),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              slot.name,
                              style: ForgeTheme.body(12.5, weight: FontWeight.w600, color: ForgeColors.bone),
                            ),
                            Text(
                              slot.trainerName == null || slot.trainerName!.isEmpty
                                  ? '${slot.durationMin} min'
                                  : '${slot.trainerName} · ${slot.durationMin} min',
                              style: ForgeTheme.body(10, color: ForgeColors.mute),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          minimumSize: const Size(54, 30),
                          padding: const EdgeInsets.symmetric(horizontal: 8),
                        ),
                        onPressed: () => onBook(slot),
                        child: const Text('Book', style: TextStyle(fontSize: 11)),
                      ),
                    ],
                  ),
                ),
              ),
            ],
        ],
      ),
    );
  }
}
