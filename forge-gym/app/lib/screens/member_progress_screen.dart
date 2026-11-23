import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/widgets.dart';
import '../ui/workout_tools.dart';

class MemberProgressScreen extends StatefulWidget {
  const MemberProgressScreen({super.key, this.initialTab = 0});

  final int initialTab;

  @override
  State<MemberProgressScreen> createState() => _MemberProgressScreenState();
}

class _MemberProgressScreenState extends State<MemberProgressScreen> {
  static const _tabs = [
    ('Workout', Icons.fitness_center),
    ('Progress', Icons.insights),
    ('Diet', Icons.restaurant_menu),
    ('Autopay', Icons.autorenew),
  ];

  late Future<MemberPortal> _future;
  late int _tab = widget.initialTab.clamp(0, _tabs.length - 1);
  bool _busy = false;

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

  Future<void> _openVideo(String url) async {
    final uri = Uri.tryParse(url);
    if (uri == null || !await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (mounted) showSnack(context, 'Could not open this video link.', error: true);
    }
  }

  Future<void> _autopay(MemberPortal data, String action) async {
    final member = data.member;
    if (action == 'approve') {
      final approved = await _confirmConsent(member);
      if (!approved) return;
    }
    if (!mounted) return;
    setState(() => _busy = true);
    try {
      await context.read<AppState>().api.memberAutopay(action, consent: action == 'approve');
      if (!mounted) return;
      _reload();
      showSnack(context, switch (action) {
        'approve' => 'Autopay approved. It applies from your next renewal.',
        'pause' => 'Autopay paused. Nothing will be collected.',
        'resume' => 'Autopay resumed.',
        _ => 'Autopay cancelled.',
      });
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<bool> _confirmConsent(Member member) async {
    var checked = false;
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setLocal) => AlertDialog(
          title: Text('Approve Autopay?', style: ForgeTheme.display(23)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'This is a demo mandate. No bank or UPI app is contacted and no money is collected.',
                style: ForgeTheme.body(12, color: ForgeColors.mute),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: ForgeColors.ink2,
                  borderRadius: BorderRadius.circular(11),
                  border: Border.all(color: ForgeColors.line),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(member.planName, style: ForgeTheme.body(12, color: ForgeColors.boneDim)),
                    ),
                    Text(inr(member.planPrice), style: ForgeTheme.display(20)),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              CheckboxListTile(
                value: checked,
                onChanged: (value) => setLocal(() => checked = value ?? false),
                contentPadding: EdgeInsets.zero,
                controlAffinity: ListTileControlAffinity.leading,
                activeColor: ForgeColors.red,
                title: Text(
                  'I approve automatic renewal payments for this membership.',
                  style: ForgeTheme.body(11.5, color: ForgeColors.boneDim),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Not now')),
            FilledButton(onPressed: checked ? () => Navigator.pop(context, true) : null, child: const Text('Approve')),
          ],
        ),
      ),
    );
    return result ?? false;
  }

  @override
  Widget build(BuildContext context) {
    return ForgePage(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            eyebrow: 'Your training',
            title: '${_tabs[_tab].$1}.',
            subtitle: switch (_tab) {
              0 => 'The plan your coach wrote, day by day. Tick exercises as you finish them.',
              1 => 'Visits, measurements and notes from your trainer.',
              2 => 'Meals and guidance set by your coach.',
              _ => 'Automatic renewals, approved and controlled by you.',
            },
            actions: [IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19))],
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: ForgeColors.ink2,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: ForgeColors.line),
            ),
            child: Row(
              children: [
                for (var i = 0; i < _tabs.length; i++)
                  Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _tab = i),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: _tab == i ? ForgeColors.panelHi : Colors.transparent,
                          borderRadius: BorderRadius.circular(9),
                          border: Border.all(color: _tab == i ? ForgeColors.lineHi : Colors.transparent),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(_tabs[i].$2, size: 14, color: _tab == i ? ForgeColors.redHi : ForgeColors.mute),
                            const SizedBox(width: 6),
                            Flexible(
                              child: Text(
                                _tabs[i].$1.toUpperCase(),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: ForgeTheme.mono(
                                  8.5,
                                  letterSpacing: 0.8,
                                  color: _tab == i ? ForgeColors.bone : ForgeColors.mute,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          FutureBuilder<MemberPortal>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const ForgeLoading(label: 'Loading your training');
              }
              if (snapshot.hasError) return ErrorPanel(error: snapshot.error!, onRetry: _reload);
              final data = snapshot.data;
              if (data == null) return ErrorPanel(error: 'No portal data returned.', onRetry: _reload);
              return switch (_tab) {
                0 => _WorkoutPanel(data: data, onOpenVideo: _openVideo),
                1 => _ProgressPanel(data: data),
                2 => _DietPanel(data: data),
                _ => _AutopayPanel(data: data, busy: _busy, onAction: (action) => _autopay(data, action)),
              };
            },
          ),
        ],
      ),
    );
  }
}

// ---- Workout ---------------------------------------------------------------

class _WorkoutPanel extends StatelessWidget {
  const _WorkoutPanel({required this.data, required this.onOpenVideo});

  final MemberPortal data;
  final Future<void> Function(String url) onOpenVideo;

  @override
  Widget build(BuildContext context) {
    final workout = data.member.workout;
    if (workout == null || workout.days.isEmpty) {
      return const EmptyPanel(
        title: 'No workout yet',
        message: 'Your coach has not written a plan for you. Ask them on your next visit.',
        icon: Icons.fitness_center,
      );
    }
    final state = context.watch<AppState>();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ForgeCard(
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: ForgeColors.red.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: ForgeColors.red.withValues(alpha: 0.3)),
                ),
                child: const Icon(Icons.fitness_center, size: 21, color: ForgeColors.redHi),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      workout.title.isEmpty ? 'Your plan' : workout.title,
                      style: ForgeTheme.display(22, letterSpacing: 0.4),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      workout.updatedBy.isEmpty
                          ? '${workout.days.length} training days'
                          : 'Set by ${workout.updatedBy} · ${workout.days.length} days',
                      style: ForgeTheme.body(10.5, color: ForgeColors.mute),
                    ),
                  ],
                ),
              ),
              StatusPill(label: '${workout.days.length} days', color: ForgeColors.green, dense: true),
            ],
          ),
        ),
        const SizedBox(height: 12),
        for (var d = 0; d < workout.days.length; d++) ...[
          _WorkoutDayCard(
            memberId: data.member.id,
            day: workout.days[d],
            dayIndex: d,
            isToday: _isToday(workout.days[d].day, data.weekday),
            done: (exerciseIndex) => state.exerciseDone('${data.member.id}:${workout.days[d].day}:$exerciseIndex'),
            onToggle: (exerciseIndex) =>
                state.toggleExercise('${data.member.id}:${workout.days[d].day}:$exerciseIndex'),
            onOpenVideo: onOpenVideo,
          ),
          const SizedBox(height: 10),
        ],
      ],
    );
  }

  bool _isToday(String label, String weekdayName) {
    final lower = label.toLowerCase();
    return lower.contains(weekdayName.toLowerCase()) || (lower.contains('day') && false);
  }
}

class _WorkoutDayCard extends StatelessWidget {
  const _WorkoutDayCard({
    required this.memberId,
    required this.day,
    required this.dayIndex,
    required this.isToday,
    required this.done,
    required this.onToggle,
    required this.onOpenVideo,
  });

  final String memberId;
  final WorkoutDay day;
  final int dayIndex;
  final bool isToday;
  final bool Function(int index) done;
  final void Function(int index) onToggle;
  final Future<void> Function(String url) onOpenVideo;

  @override
  Widget build(BuildContext context) {
    final completed = List.generate(day.exercises.length, (i) => done(i)).where((v) => v).length;
    return ForgeCard(
      accent: isToday ? ForgeColors.red : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                day.day.toUpperCase(),
                style: ForgeTheme.mono(9.5, color: isToday ? ForgeColors.redHi : ForgeColors.mute, letterSpacing: 1.4),
              ),
              if (isToday) ...[
                const SizedBox(width: 8),
                const StatusPill(label: 'today', color: ForgeColors.red, dense: true),
              ],
              const Spacer(),
              Text(
                '${day.exercises.isEmpty ? 0 : completed}/${day.exercises.length} done',
                style: ForgeTheme.mono(8.5, letterSpacing: 0.4),
              ),
            ],
          ),
          if (day.focus.isNotEmpty) ...[
            const SizedBox(height: 5),
            Text(
              day.focus,
              style: ForgeTheme.body(12.5, weight: FontWeight.w600, color: ForgeColors.bone),
            ),
          ],
          const SizedBox(height: 10),
          if (day.exercises.isEmpty)
            Text('Rest day. Recovery is training too.', style: ForgeTheme.body(11.5, color: ForgeColors.mute))
          else
            for (var i = 0; i < day.exercises.length; i++)
              _ExerciseRow(
                exercise: day.exercises[i],
                done: done(i),
                onToggle: () => onToggle(i),
                onOpenVideo: onOpenVideo,
              ),
          if (day.exercises.isNotEmpty) ...[
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: LinearProgressIndicator(
                value: day.exercises.isEmpty ? 0 : completed / day.exercises.length,
                minHeight: 4,
                backgroundColor: ForgeColors.ink2,
                valueColor: AlwaysStoppedAnimation(isToday ? ForgeColors.red : ForgeColors.green),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _ExerciseRow extends StatelessWidget {
  const _ExerciseRow({required this.exercise, required this.done, required this.onToggle, required this.onOpenVideo});

  final Exercise exercise;
  final bool done;
  final VoidCallback onToggle;
  final Future<void> Function(String url) onOpenVideo;

  @override
  Widget build(BuildContext context) {
    final meta = [
      if (exercise.sets.isNotEmpty) '${exercise.sets} sets',
      if (exercise.reps.isNotEmpty) exercise.reps,
    ].join(' · ');
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          GestureDetector(
            onTap: onToggle,
            child: Container(
              width: 21,
              height: 21,
              margin: const EdgeInsets.only(top: 1),
              decoration: BoxDecoration(
                color: done ? ForgeColors.green.withValues(alpha: 0.16) : Colors.transparent,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: done ? ForgeColors.green : ForgeColors.lineHi, width: 1.4),
              ),
              child: done ? const Icon(Icons.check, size: 14, color: ForgeColors.green) : null,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  exercise.name,
                  style: ForgeTheme.body(
                    12.5,
                    weight: FontWeight.w600,
                    color: done ? ForgeColors.mute : ForgeColors.bone,
                  ).copyWith(decoration: done ? TextDecoration.lineThrough : null),
                ),
                if (meta.isNotEmpty || exercise.note.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 1),
                    child: Text(
                      [if (meta.isNotEmpty) meta, if (exercise.note.isNotEmpty) exercise.note].join(' · '),
                      style: ForgeTheme.body(10, color: ForgeColors.mute),
                    ),
                  ),
              ],
            ),
          ),
          if (exercise.videoUrl.isNotEmpty)
            IconButton(
              tooltip: 'Watch form video',
              onPressed: () => onOpenVideo(exercise.videoUrl),
              visualDensity: VisualDensity.compact,
              icon: const Icon(Icons.play_circle_outline, size: 18, color: ForgeColors.blue),
            ),
        ],
      ),
    );
  }
}

// ---- Progress --------------------------------------------------------------

class _ProgressPanel extends StatelessWidget {
  const _ProgressPanel({required this.data});

  final MemberPortal data;

  @override
  Widget build(BuildContext context) {
    final measurements = data.logs.where((log) => log.type == 'measurement').toList();
    final checkins = data.logs.where((log) => log.type == 'checkin').toList();
    final pt = data.logs.where((log) => log.type == 'pt_session').toList();
    final weights = measurements.where((log) => log.weightKg != null).toList();
    final latest = weights.isEmpty ? null : weights.first.weightKg;
    final first = weights.isEmpty ? null : weights.last.weightKg;
    final delta = latest != null && first != null ? latest - first : null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ResponsiveGrid(
          minItemWidth: 180,
          children: [
            StatCard(
              label: 'Visits · 30 days',
              value: '${data.visits.length}',
              sub: 'check-ins at the gym',
              icon: Icons.how_to_reg_outlined,
              accent: ForgeColors.blue,
            ),
            StatCard(
              label: 'Latest weight',
              value: latest == null ? '—' : '${latest.toStringAsFixed(1)} kg',
              sub: delta == null
                  ? 'no measurements yet'
                  : '${delta <= 0 ? '' : '+'}${delta.toStringAsFixed(1)} kg since first',
              icon: Icons.monitor_weight_outlined,
              accent: ForgeColors.violet,
            ),
            StatCard(
              label: 'PT sessions',
              value: '${data.member.ptUsed}',
              sub: data.member.ptTotal == 0 ? 'no PT pack' : 'of ${data.member.ptTotal} used',
              icon: Icons.fitness_center,
              accent: ForgeColors.green,
            ),
            StatCard(
              label: 'Coach notes',
              value: '${checkins.length}',
              sub: 'check-ins logged',
              icon: Icons.notes_outlined,
              accent: ForgeColors.amber,
            ),
          ],
        ),
        const SizedBox(height: 16),
        LayoutBuilder(
          builder: (context, constraints) {
            final wide = constraints.maxWidth >= 880;
            final left = ForgeCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionHeader(title: 'Measurements', subtitle: 'Weight and waist, logged by your trainer.'),
                  const SizedBox(height: 12),
                  if (measurements.isEmpty)
                    const EmptyPanel(
                      title: 'No measurements yet',
                      message: 'Your trainer will log them during check-ins.',
                      icon: Icons.straighten,
                    )
                  else
                    for (final log in measurements.take(8))
                      Padding(
                        padding: const EdgeInsets.only(bottom: 9),
                        child: Row(
                          children: [
                            SizedBox(
                              width: 68,
                              child: Text(shortDay(log.day), style: ForgeTheme.mono(9, letterSpacing: 0.3)),
                            ),
                            Expanded(
                              child: Wrap(
                                spacing: 10,
                                runSpacing: 4,
                                children: [
                                  if (log.weightKg != null)
                                    StatusPill(
                                      label: '${log.weightKg!.toStringAsFixed(1)} kg',
                                      color: ForgeColors.violet,
                                      dense: true,
                                    ),
                                  if (log.waistCm != null)
                                    StatusPill(
                                      label: 'waist ${log.waistCm!.toStringAsFixed(1)} cm',
                                      color: ForgeColors.blue,
                                      dense: true,
                                    ),
                                ],
                              ),
                            ),
                            if (log.note.isNotEmpty)
                              Flexible(
                                child: Text(
                                  log.note,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  textAlign: TextAlign.right,
                                  style: ForgeTheme.body(10, color: ForgeColors.mute),
                                ),
                              ),
                          ],
                        ),
                      ),
                ],
              ),
            );
            final right = ForgeCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SectionHeader(
                    title: 'Recent training notes',
                    subtitle: 'Check-ins, PT sessions and what to work on.',
                  ),
                  const SizedBox(height: 12),
                  if (data.logs.isEmpty)
                    const EmptyPanel(
                      title: 'Nothing logged yet',
                      message: 'Your coach will add notes here.',
                      icon: Icons.notes_outlined,
                    )
                  else
                    for (final log in data.logs.take(10))
                      Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 27,
                              height: 27,
                              decoration: BoxDecoration(
                                color: ForgeColors.ink2,
                                borderRadius: BorderRadius.circular(7),
                                border: Border.all(color: ForgeColors.line),
                              ),
                              child: Icon(
                                switch (log.type) {
                                  'pt_session' => Icons.fitness_center,
                                  'measurement' => Icons.straighten,
                                  _ => Icons.check,
                                },
                                size: 13,
                                color: ForgeColors.mute,
                              ),
                            ),
                            const SizedBox(width: 9),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    log.note.isEmpty ? titleCase(log.type) : log.note,
                                    style: ForgeTheme.body(11.5, color: ForgeColors.boneDim),
                                  ),
                                  const SizedBox(height: 1),
                                  Text(
                                    '${shortDay(log.day)}${log.trainerName.isEmpty ? '' : ' · ${log.trainerName}'}',
                                    style: ForgeTheme.mono(8, letterSpacing: 0.3),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                  if (pt.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      '${pt.length} PT session${pt.length == 1 ? '' : 's'} completed.',
                      style: ForgeTheme.mono(8.5, letterSpacing: 0.3),
                    ),
                  ],
                ],
              ),
            );
            if (!wide) return Column(children: [left, const SizedBox(height: 12), right]);
            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: left),
                const SizedBox(width: 12),
                Expanded(child: right),
              ],
            );
          },
        ),
        const SizedBox(height: 16),
        StreakHeatmapCard(streakDays: 14, visits: data.visits),
        const SizedBox(height: 16),
        const BeforeAfterSliderCard(),
        const SizedBox(height: 16),
        const PrCalculatorView(),
      ],
    );
  }
}

// ---- Diet ------------------------------------------------------------------

class _DietPanel extends StatelessWidget {
  const _DietPanel({required this.data});

  final MemberPortal data;

  @override
  Widget build(BuildContext context) {
    final diet = data.member.diet;
    if (diet == null || diet.meals.isEmpty) {
      return const EmptyPanel(
        title: 'No diet guide yet',
        message: 'Your coach has not added a diet plan. Ask them on your next visit.',
        icon: Icons.restaurant_menu,
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ForgeCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(child: Text(diet.title, style: ForgeTheme.display(25, letterSpacing: 0.4))),
                  StatusPill(label: '${diet.meals.length} meals', color: ForgeColors.amber, dense: true),
                ],
              ),
              if (diet.note.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(diet.note, style: ForgeTheme.body(12.5, color: ForgeColors.boneDim)),
              ],
              if (diet.updatedBy.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text('Set by ${diet.updatedBy}', style: ForgeTheme.mono(8.5, letterSpacing: 0.4)),
              ],
            ],
          ),
        ),
        const SizedBox(height: 12),
        LayoutBuilder(
          builder: (context, constraints) {
            final columns = (constraints.maxWidth / 300).floor().clamp(1, 3);
            final width = (constraints.maxWidth - 12 * (columns - 1)) / columns;
            return Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                for (final meal in diet.meals)
                  SizedBox(
                    width: width,
                    child: ForgeCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Eyebrow(meal.label, color: ForgeColors.amber),
                          const SizedBox(height: 10),
                          Text(meal.items, style: ForgeTheme.body(12.5, color: ForgeColors.boneDim, height: 1.55)),
                        ],
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: ForgeColors.ink2,
            borderRadius: BorderRadius.circular(13),
            border: Border.all(color: ForgeColors.line),
          ),
          child: Row(
            children: [
              const Icon(Icons.info_outline, size: 16, color: ForgeColors.mute),
              const SizedBox(width: 9),
              Expanded(
                child: Text(
                  'A diet guide is general guidance, not medical advice. Tell your coach about allergies or conditions.',
                  style: ForgeTheme.body(10.5, color: ForgeColors.mute),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// ---- Autopay ---------------------------------------------------------------

class _AutopayPanel extends StatelessWidget {
  const _AutopayPanel({required this.data, required this.busy, required this.onAction});

  final MemberPortal data;
  final bool busy;
  final ValueChanged<String> onAction;

  @override
  Widget build(BuildContext context) {
    final member = data.member;
    final status = member.autopayStatus;
    final enabled = data.autopayAddon;
    final tone = StatusPill.colorFor(status);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ForgeCard(
          accent: enabled ? tone : ForgeColors.mute,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      color: (enabled ? tone : ForgeColors.mute).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(13),
                      border: Border.all(color: (enabled ? tone : ForgeColors.mute).withValues(alpha: 0.32)),
                    ),
                    child: Icon(Icons.autorenew, size: 22, color: enabled ? tone : ForgeColors.mute),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Autopay', style: ForgeTheme.display(26, letterSpacing: 0.4)),
                        Text(
                          enabled ? 'Automatic renewal for your membership.' : 'Not included in this gym\'s plan.',
                          style: ForgeTheme.body(11, color: ForgeColors.mute),
                        ),
                      ],
                    ),
                  ),
                  StatusPill(label: status == 'none' ? 'not set up' : status, color: enabled ? null : ForgeColors.mute),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: ForgeColors.ink2,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: ForgeColors.line),
                ),
                child: Column(
                  children: [
                    InfoRow(label: 'Plan', value: member.planName),
                    InfoRow(
                      label: 'Amount per renewal',
                      value: inr(member.autopayAmount > 0 ? member.autopayAmount : member.planPrice),
                    ),
                    InfoRow(label: 'Next renewal', value: dayLabel(member.expiryDate)),
                    InfoRow(
                      label: 'Status',
                      value: status == 'none' ? 'Not set up' : titleCase(status),
                      valueColor: enabled ? tone : ForgeColors.mute,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              Text(
                'Autopay can only be switched on by you. The gym can send a request, but it cannot approve on your behalf. In this demo no bank or UPI app is contacted and no money is collected.',
                style: ForgeTheme.body(11, color: ForgeColors.mute, height: 1.5),
              ),
              if (enabled) ...[
                const SizedBox(height: 16),
                Wrap(
                  spacing: 9,
                  runSpacing: 9,
                  children: [
                    if (status == 'none' || status == 'requested' || status == 'cancelled')
                      FilledButton.icon(
                        onPressed: busy ? null : () => onAction('approve'),
                        icon: const Icon(Icons.check, size: 16),
                        label: Text(status == 'requested' ? 'Approve the request' : 'Set up Autopay'),
                      ),
                    if (status == 'active')
                      OutlinedButton.icon(
                        onPressed: busy ? null : () => onAction('pause'),
                        icon: const Icon(Icons.pause, size: 16),
                        label: const Text('Pause'),
                      ),
                    if (status == 'paused')
                      FilledButton.icon(
                        onPressed: busy ? null : () => onAction('resume'),
                        icon: const Icon(Icons.play_arrow, size: 16),
                        label: const Text('Resume'),
                      ),
                    if (status == 'active' || status == 'paused' || status == 'requested')
                      TextButton(
                        onPressed: busy ? null : () => onAction('cancel'),
                        style: TextButton.styleFrom(foregroundColor: ForgeColors.redHi),
                        child: const Text('Cancel Autopay'),
                      ),
                  ],
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 12),
        ForgeCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SectionHeader(title: 'How it works', subtitle: 'Three steps, all in your control.'),
              const SizedBox(height: 12),
              const _Step(
                number: '01',
                title: 'The gym asks',
                body: 'The desk sends an Autopay request for your current plan. Nothing changes yet.',
              ),
              const _Step(
                number: '02',
                title: 'You approve',
                body: 'You tick the consent box here. The mandate is attached to your membership only.',
              ),
              const _Step(
                number: '03',
                title: 'You stay in control',
                body: 'Pause or cancel at any time. The gym cannot approve, pause or cancel for you.',
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Step extends StatelessWidget {
  const _Step({required this.number, required this.title, required this.body});

  final String number;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 11),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 30,
            height: 30,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: ForgeColors.red.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: ForgeColors.red.withValues(alpha: 0.25)),
            ),
            child: Text(number, style: ForgeTheme.mono(8.5, color: ForgeColors.redHi, letterSpacing: 0.2)),
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
                const SizedBox(height: 1),
                Text(body, style: ForgeTheme.body(10.5, color: ForgeColors.mute, height: 1.45)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
