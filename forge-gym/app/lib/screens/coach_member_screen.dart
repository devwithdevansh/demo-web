import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/widgets.dart';

class CoachMemberScreen extends StatefulWidget {
  const CoachMemberScreen({super.key, required this.memberId});

  final String memberId;

  @override
  State<CoachMemberScreen> createState() => _CoachMemberScreenState();
}

class _CoachMemberScreenState extends State<CoachMemberScreen> {
  late Future<CoachMemberData> _future;
  bool _changed = false;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<CoachMemberData> _load() => context.read<AppState>().api.coachMember(widget.memberId);

  void _reload() {
    setState(() {
      _future = _load();
    });
  }

  Future<void> _addLog(CoachMemberData data) async {
    final saved = await showForgeSheet<bool>(
      context: context,
      title: 'Add to ${firstName(data.member.name)}\'s record',
      child: _LogSheet(memberId: widget.memberId, ptLeft: data.member.ptLeft),
    );
    if (saved == true && mounted) {
      _changed = true;
      _reload();
      showSnack(context, 'Record updated.');
    }
  }

  Future<void> _editWorkout(CoachMemberData data) async {
    final api = context.read<AppState>().api;
    List<Json>? templates;
    if (context.read<AppState>().session?.gym.addon('trainerPlus') == true) {
      try {
        templates = await api.templates();
      } catch (_) {
        templates = null;
      }
    }
    if (!mounted) return;
    final saved = await showForgeSheet<bool>(
      context: context,
      title: 'Workout plan',
      maxWidth: 720,
      child: _WorkoutSheet(memberId: widget.memberId, workout: data.member.workout, templates: templates),
    );
    if (saved == true && mounted) {
      _changed = true;
      _reload();
      showSnack(context, 'Workout plan saved.');
    }
  }

  Future<void> _editDiet(CoachMemberData data) async {
    final saved = await showForgeSheet<bool>(
      context: context,
      title: 'Diet guide',
      maxWidth: 620,
      child: _DietSheet(memberId: widget.memberId, diet: data.member.diet),
    );
    if (saved == true && mounted) {
      _changed = true;
      _reload();
      showSnack(context, 'Diet guide saved.');
    }
  }

  Future<void> _editTimetable(CoachMemberData data) async {
    final app = context.read<AppState>();
    final saved = await showForgeSheet<bool>(
      context: context,
      title: 'Timetable & Class Schedule',
      maxWidth: 620,
      child: _MemberTimetableSheet(
        member: data.member,
        onSaved: (slots) async {
          await app.api.saveMemberTimetable(widget.memberId, {'slots': slots});
        },
      ),
    );
    if (saved == true && mounted) {
      _changed = true;
      _reload();
      showSnack(context, 'Member timetable updated.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) Navigator.of(context).pop(_changed);
      },
      child: ForgeBackground(
        child: Scaffold(
          backgroundColor: Colors.transparent,
          appBar: AppBar(
            backgroundColor: Colors.transparent,
            surfaceTintColor: Colors.transparent,
            title: Text('Coaching record', style: ForgeTheme.body(14, weight: FontWeight.w600)),
            actions: [
              IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19)),
              const SizedBox(width: 6),
            ],
          ),
          body: FutureBuilder<CoachMemberData>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const Center(child: ForgeLoading(label: 'Opening member'));
              }
              if (snapshot.hasError) {
                return ForgePage(
                  child: ErrorPanel(error: snapshot.error!, onRetry: _reload),
                );
              }
              final data = snapshot.data;
              if (data == null) {
                return ForgePage(
                  child: ErrorPanel(error: 'No record returned.', onRetry: _reload),
                );
              }
              final member = data.member;
              return ForgePage(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    PageHeader(
                      eyebrow: 'Coach view',
                      title: member.name,
                      subtitle: '${member.planName} · ${member.category} · ${relDays(member.daysLeft)}',
                      actions: [
                        FilledButton.icon(
                          onPressed: () => _editWorkout(data),
                          icon: const Icon(Icons.fitness_center, size: 17),
                          label: const Text('Workout plan'),
                        ),
                        OutlinedButton.icon(
                          onPressed: () => _editDiet(data),
                          icon: const Icon(Icons.restaurant_menu, size: 16),
                          label: const Text('Diet guide'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    ResponsiveGrid(
                      minItemWidth: 170,
                      children: [
                        StatCard(
                          label: 'PT sessions left',
                          value: '${member.ptLeft}',
                          sub: '${member.ptUsed} of ${member.ptTotal} used',
                          icon: Icons.timer_outlined,
                          accent: ForgeColors.green,
                        ),
                        StatCard(
                          label: 'Membership',
                          value: '${member.daysLeft < 0 ? 0 : member.daysLeft}',
                          sub: relDays(member.daysLeft),
                          icon: Icons.event_available,
                          accent: ForgeColors.blue,
                        ),
                        StatCard(
                          label: 'Log entries',
                          value: '${data.logs.length}',
                          sub: 'check-ins and measurements',
                          icon: Icons.history,
                          accent: ForgeColors.violet,
                        ),
                        StatCard(
                          label: 'Last weight',
                          value: _lastMetric(data.logs, (log) => log.weightKg, ' kg'),
                          sub: _lastMetric(data.logs, (log) => log.waistCm, ' cm waist'),
                          icon: Icons.monitor_weight_outlined,
                          accent: ForgeColors.amber,
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    LayoutBuilder(
                      builder: (context, constraints) {
                        final wide = constraints.maxWidth >= 980;
                        final left = Column(
                          children: [
                            _PlanCard(
                              title: 'Workout plan',
                              icon: Icons.fitness_center,
                              empty: 'No workout plan yet.',
                              child: _WorkoutPreview(workout: member.workout),
                              onEdit: () => _editWorkout(data),
                            ),
                            const SizedBox(height: 14),
                            _PlanCard(
                              title: 'Diet guide',
                              icon: Icons.restaurant_menu,
                              empty: 'No diet guide yet.',
                              child: _DietPreview(diet: member.diet),
                              onEdit: () => _editDiet(data),
                            ),
                            const SizedBox(height: 14),
                            _PlanCard(
                              title: 'Training Timetable & Slots',
                              icon: Icons.calendar_month_outlined,
                              empty: 'Default gym slots active.',
                              child: _TimetablePreview(member: member),
                              onEdit: () => _editTimetable(data),
                            ),
                          ],
                        );
                        final right = Column(
                          children: [
                            ForgeCard(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SectionHeader(title: 'Record an entry'),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Measurements, check-in notes and PT sessions all feed the member\'s progress screen.',
                                    style: ForgeTheme.body(11.5, color: ForgeColors.mute),
                                  ),
                                  const SizedBox(height: 12),
                                  LoadingButton(
                                    label: 'Add to record',
                                    icon: Icons.add,
                                    onPressed: () => _addLog(data),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 14),
                            ForgeCard(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  SectionHeader(
                                    title: 'History',
                                    trailing: StatusPill(
                                      label: '${data.logs.length}',
                                      color: ForgeColors.violet,
                                      dense: true,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  if (data.logs.isEmpty)
                                    const EmptyPanel(
                                      title: 'Nothing logged yet',
                                      icon: Icons.history,
                                      message: 'Start with a measurement or a check-in note.',
                                    )
                                  else
                                    for (final log in data.logs.take(20)) _LogRow(log: log),
                                ],
                              ),
                            ),
                          ],
                        );
                        if (!wide) return Column(children: [right, const SizedBox(height: 14), left]);
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
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  String _lastMetric(List<CoachLog> logs, double? Function(CoachLog) pick, String suffix) {
    for (final log in logs) {
      final value = pick(log);
      if (value != null) return '${value.toStringAsFixed(value % 1 == 0 ? 0 : 1)}$suffix';
    }
    return '—';
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({
    required this.title,
    required this.icon,
    required this.empty,
    required this.child,
    required this.onEdit,
  });

  final String title;
  final IconData icon;
  final String empty;
  final Widget child;
  final VoidCallback onEdit;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(
            title: title,
            trailing: TextButton.icon(
              onPressed: onEdit,
              icon: const Icon(Icons.edit_outlined, size: 15),
              label: const Text('Edit'),
            ),
          ),
          const SizedBox(height: 8),
          child,
        ],
      ),
    );
  }
}

class _WorkoutPreview extends StatelessWidget {
  const _WorkoutPreview({required this.workout});

  final Workout? workout;

  @override
  Widget build(BuildContext context) {
    final value = workout;
    if (value == null || value.days.isEmpty) {
      return Text('No workout plan yet.', style: ForgeTheme.body(12, color: ForgeColors.mute));
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('${value.title.toUpperCase()} · ${value.days.length} DAYS', style: ForgeTheme.mono(9, letterSpacing: 1.2)),
        const SizedBox(height: 10),
        for (final day in value.days)
          Padding(
            padding: const EdgeInsets.only(bottom: 9),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 74,
                  child: Text(
                    day.day.toUpperCase(),
                    style: ForgeTheme.mono(9, color: ForgeColors.redHi, letterSpacing: 0.8),
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (day.focus.isNotEmpty)
                        Text(
                          day.focus,
                          style: ForgeTheme.body(11.5, weight: FontWeight.w600, color: ForgeColors.boneDim),
                        ),
                      Text(
                        day.exercises
                            .map((e) => '${e.name}${e.sets.isEmpty ? '' : ' ${e.sets}×${e.reps}'}')
                            .join(' · '),
                        style: ForgeTheme.body(11, color: ForgeColors.mute),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _DietPreview extends StatelessWidget {
  const _DietPreview({required this.diet});

  final Diet? diet;

  @override
  Widget build(BuildContext context) {
    final value = diet;
    if (value == null || value.meals.isEmpty) {
      return Text('No diet guide yet.', style: ForgeTheme.body(12, color: ForgeColors.mute));
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value.title.toUpperCase(), style: ForgeTheme.mono(9, letterSpacing: 1.2)),
        if (value.note.isNotEmpty) ...[
          const SizedBox(height: 5),
          Text(value.note, style: ForgeTheme.body(11.5, color: ForgeColors.mute)),
        ],
        const SizedBox(height: 10),
        for (final meal in value.meals)
          Padding(
            padding: const EdgeInsets.only(bottom: 7),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 82,
                  child: Text(
                    meal.label.toUpperCase(),
                    style: ForgeTheme.mono(8.5, color: ForgeColors.amber, letterSpacing: 0.6),
                  ),
                ),
                Expanded(
                  child: Text(meal.items, style: ForgeTheme.body(11.5, color: ForgeColors.boneDim)),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _LogRow extends StatelessWidget {
  const _LogRow({required this.log});

  final CoachLog log;

  @override
  Widget build(BuildContext context) {
    final (icon, color, title) = switch (log.type) {
      'measurement' => (Icons.monitor_weight_outlined, ForgeColors.amber, 'Measurement'),
      'pt_session' => (Icons.timer_outlined, ForgeColors.green, 'PT session'),
      _ => (Icons.check_circle_outline, ForgeColors.blue, 'Check-in'),
    };
    final metrics = <String>[
      if (log.weightKg != null) '${log.weightKg!.toStringAsFixed(log.weightKg! % 1 == 0 ? 0 : 1)} kg',
      if (log.waistCm != null) '${log.waistCm!.toStringAsFixed(log.waistCm! % 1 == 0 ? 0 : 1)} cm',
    ].join(' · ');
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(8)),
            child: Icon(icon, size: 15, color: color),
          ),
          const SizedBox(width: 9),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: ForgeTheme.body(11.5, weight: FontWeight.w600, color: ForgeColors.boneDim),
                      ),
                    ),
                    Text(shortDay(log.day), style: ForgeTheme.mono(8.5, color: ForgeColors.mute)),
                  ],
                ),
                if (metrics.isNotEmpty)
                  Text(
                    metrics,
                    style: ForgeTheme.body(11.5, weight: FontWeight.w600, color: ForgeColors.bone),
                  ),
                if (log.note.isNotEmpty)
                  Text(
                    log.note,
                    style: ForgeTheme.body(10.5, color: ForgeColors.mute),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                if (log.trainerName.isNotEmpty)
                  Text('BY ${log.trainerName.toUpperCase()}', style: ForgeTheme.mono(7.5, letterSpacing: 0.8)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _LogSheet extends StatefulWidget {
  const _LogSheet({required this.memberId, required this.ptLeft});

  final String memberId;
  final int ptLeft;

  @override
  State<_LogSheet> createState() => _LogSheetState();
}

class _LogSheetState extends State<_LogSheet> {
  String _type = 'measurement';
  final _weight = TextEditingController();
  final _waist = TextEditingController();
  final _note = TextEditingController();
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _weight.dispose();
    _waist.dispose();
    _note.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final api = context.read<AppState>().api;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      if (_type == 'pt_session') {
        await api.addPtSession(widget.memberId, {'note': _note.text.trim()});
      } else {
        final weight = double.tryParse(_weight.text.trim());
        final waist = double.tryParse(_waist.text.trim());
        if (_type == 'measurement' && weight == null && waist == null) {
          setState(() {
            _busy = false;
            _error = 'Enter a weight or a waist measurement.';
          });
          return;
        }
        if (_type == 'checkin' && _note.text.trim().isEmpty) {
          setState(() {
            _busy = false;
            _error = 'Add a short note for the check-in.';
          });
          return;
        }
        await api.addLog(widget.memberId, {
          'type': _type,
          'weightKg': ?weight,
          'waistCm': ?waist,
          if (_note.text.trim().isNotEmpty) 'note': _note.text.trim(),
        });
      }
      if (mounted) Navigator.pop(context, true);
    } catch (err) {
      if (mounted) setState(() => _error = '$err');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ForgeField(
          label: 'Entry type',
          child: ChoiceRow<String>(
            values: const ['measurement', 'checkin', 'pt_session'],
            selected: _type,
            label: (v) => switch (v) {
              'measurement' => 'Measurement',
              'checkin' => 'Check-in note',
              _ => 'PT session',
            },
            onSelected: (v) => setState(() => _type = v),
          ),
        ),
        if (_error != null) ...[
          const SizedBox(height: 10),
          Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
        ],
        const SizedBox(height: 15),
        if (_type == 'measurement') ...[
          Row(
            children: [
              Expanded(
                child: ForgeField(
                  label: 'Weight (kg)',
                  child: TextField(
                    controller: _weight,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(hintText: '72.5'),
                  ),
                ),
              ),
              const SizedBox(width: 11),
              Expanded(
                child: ForgeField(
                  label: 'Waist (cm)',
                  child: TextField(
                    controller: _waist,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: const InputDecoration(hintText: '84'),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 13),
        ],
        if (_type == 'pt_session' && widget.ptLeft <= 0) ...[
          const EmptyPanel(
            title: 'No PT sessions left',
            message: 'Add more sessions to the pack from the owner console first.',
            icon: Icons.timer_off_outlined,
          ),
          const SizedBox(height: 12),
        ],
        ForgeField(
          label: _type == 'checkin' ? 'Check-in note' : 'Note (optional)',
          child: TextField(
            controller: _note,
            maxLines: 3,
            decoration: InputDecoration(hintText: _type == 'pt_session' ? 'What was worked on?' : 'How did it go?'),
          ),
        ),
        const SizedBox(height: 18),
        LoadingButton(
          label: _type == 'pt_session' ? 'Log PT session' : 'Save entry',
          loading: _busy,
          onPressed: _type == 'pt_session' && widget.ptLeft <= 0 ? null : _submit,
        ),
      ],
    );
  }
}

class _WorkoutSheet extends StatefulWidget {
  const _WorkoutSheet({required this.memberId, this.workout, this.templates});

  final String memberId;
  final Workout? workout;
  final List<Json>? templates;

  @override
  State<_WorkoutSheet> createState() => _WorkoutSheetState();
}

class _WorkoutSheetState extends State<_WorkoutSheet> {
  late final TextEditingController _title = TextEditingController(text: widget.workout?.title ?? 'Training plan');
  late final List<_DayDraft> _days = widget.workout == null || widget.workout!.days.isEmpty
      ? [_DayDraft(day: 'Day 1', focus: '')]
      : widget.workout!.days.map((d) => _DayDraft.fromDay(d)).toList();
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _title.dispose();
    for (final day in _days) {
      day.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    final days = <Json>[];
    for (final day in _days) {
      final name = day.day.text.trim();
      if (name.isEmpty) continue;
      final exercises = <Json>[];
      for (final exercise in day.exercises) {
        final title = exercise.name.text.trim();
        if (title.isEmpty) continue;
        exercises.add({
          'name': title,
          'sets': exercise.sets.text.trim(),
          'reps': exercise.reps.text.trim(),
          'note': exercise.note.text.trim(),
          if (exercise.video.text.trim().isNotEmpty) 'videoUrl': exercise.video.text.trim(),
        });
      }
      days.add({'day': name, 'focus': day.focus.text.trim(), 'exercises': exercises});
    }
    if (_title.text.trim().length < 2 || days.isEmpty) {
      setState(() => _error = 'Give the plan a title and at least one day.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await context.read<AppState>().api.saveWorkout(widget.memberId, {'title': _title.text.trim(), 'days': days});
      if (mounted) Navigator.pop(context, true);
    } catch (err) {
      if (mounted) setState(() => _error = '$err');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _applyTemplate(Json template) {
    final days = asList(template['days']).map((day) {
      final draft = _DayDraft(day: str(day['day']), focus: str(day['focus']));
      for (final exercise in asList(day['exercises'])) {
        draft.exercises.add(_ExerciseDraft.fromExercise(Exercise.fromJson(exercise)));
      }
      if (draft.exercises.isEmpty) draft.exercises.add(_ExerciseDraft());
      return draft;
    }).toList();
    setState(() {
      for (final day in _days) {
        day.dispose();
      }
      _days
        ..clear()
        ..addAll(days);
      _title.text = str(template['title'], 'Training plan');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.templates != null && widget.templates!.isNotEmpty) ...[
          Text('TRAINER PLUS TEMPLATES', style: ForgeTheme.mono(9, letterSpacing: 1.3)),
          const SizedBox(height: 7),
          Wrap(
            spacing: 7,
            runSpacing: 7,
            children: [
              for (final template in widget.templates!)
                OutlinedButton(
                  onPressed: () => _applyTemplate(template),
                  child: Text(str(template['title'], 'Template')),
                ),
            ],
          ),
          const SizedBox(height: 16),
        ],
        ForgeField(
          label: 'Plan title',
          child: TextField(
            controller: _title,
            decoration: const InputDecoration(hintText: 'e.g. Strength block · 4 weeks'),
          ),
        ),
        if (_error != null) ...[
          const SizedBox(height: 10),
          Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
        ],
        const SizedBox(height: 15),
        for (var d = 0; d < _days.length; d++) ...[
          Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: ForgeColors.ink2,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: ForgeColors.line),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: TextField(
                        controller: _days[d].day,
                        decoration: const InputDecoration(hintText: 'Day 1', isDense: true),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      flex: 3,
                      child: TextField(
                        controller: _days[d].focus,
                        decoration: const InputDecoration(hintText: 'Focus (e.g. Push)', isDense: true),
                      ),
                    ),
                    IconButton(
                      tooltip: 'Remove day',
                      onPressed: _days.length == 1
                          ? null
                          : () => setState(() {
                              _days[d].dispose();
                              _days.removeAt(d);
                            }),
                      icon: const Icon(Icons.delete_outline, size: 18),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                for (var e = 0; e < _days[d].exercises.length; e++)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      children: [
                        Expanded(
                          flex: 4,
                          child: TextField(
                            controller: _days[d].exercises[e].name,
                            decoration: const InputDecoration(hintText: 'Exercise', isDense: true),
                          ),
                        ),
                        const SizedBox(width: 6),
                        SizedBox(
                          width: 52,
                          child: TextField(
                            controller: _days[d].exercises[e].sets,
                            decoration: const InputDecoration(hintText: 'Sets', isDense: true),
                          ),
                        ),
                        const SizedBox(width: 6),
                        SizedBox(
                          width: 62,
                          child: TextField(
                            controller: _days[d].exercises[e].reps,
                            decoration: const InputDecoration(hintText: 'Reps', isDense: true),
                          ),
                        ),
                        IconButton(
                          onPressed: () => setState(() {
                            _days[d].exercises[e].dispose();
                            _days[d].exercises.removeAt(e);
                          }),
                          icon: const Icon(Icons.close, size: 16),
                        ),
                      ],
                    ),
                  ),
                TextButton.icon(
                  onPressed: () => setState(() => _days[d].exercises.add(_ExerciseDraft())),
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Add exercise'),
                ),
              ],
            ),
          ),
        ],
        OutlinedButton.icon(
          onPressed: () => setState(() => _days.add(_DayDraft(day: 'Day ${_days.length + 1}', focus: ''))),
          icon: const Icon(Icons.add, size: 16),
          label: const Text('Add training day'),
        ),
        const SizedBox(height: 18),
        LoadingButton(label: 'Save workout', icon: Icons.save_outlined, loading: _busy, onPressed: _save),
      ],
    );
  }
}

class _DayDraft {
  _DayDraft({required String day, required String focus})
    : day = TextEditingController(text: day),
      focus = TextEditingController(text: focus),
      exercises = [];

  _DayDraft.fromDay(WorkoutDay source)
    : day = TextEditingController(text: source.day),
      focus = TextEditingController(text: source.focus),
      exercises = source.exercises.map(_ExerciseDraft.fromExercise).toList();

  final TextEditingController day;
  final TextEditingController focus;
  final List<_ExerciseDraft> exercises;

  void dispose() {
    day.dispose();
    focus.dispose();
    for (final exercise in exercises) {
      exercise.dispose();
    }
  }
}

class _ExerciseDraft {
  _ExerciseDraft({String name = '', String sets = '3', String reps = '10', String note = '', String video = ''})
    : name = TextEditingController(text: name),
      sets = TextEditingController(text: sets),
      reps = TextEditingController(text: reps),
      note = TextEditingController(text: note),
      video = TextEditingController(text: video);

  _ExerciseDraft.fromExercise(Exercise exercise)
    : name = TextEditingController(text: exercise.name),
      sets = TextEditingController(text: exercise.sets),
      reps = TextEditingController(text: exercise.reps),
      note = TextEditingController(text: exercise.note),
      video = TextEditingController(text: exercise.videoUrl);

  final TextEditingController name;
  final TextEditingController sets;
  final TextEditingController reps;
  final TextEditingController note;
  final TextEditingController video;

  void dispose() {
    name.dispose();
    sets.dispose();
    reps.dispose();
    note.dispose();
    video.dispose();
  }
}

class _DietSheet extends StatefulWidget {
  const _DietSheet({required this.memberId, this.diet});

  final String memberId;
  final Diet? diet;

  @override
  State<_DietSheet> createState() => _DietSheetState();
}

class _DietSheetState extends State<_DietSheet> {
  late final TextEditingController _title = TextEditingController(text: widget.diet?.title ?? 'Daily nutrition');
  late final TextEditingController _note = TextEditingController(text: widget.diet?.note ?? '');
  late final List<_MealDraft> _meals = widget.diet == null || widget.diet!.meals.isEmpty
      ? [_MealDraft(label: 'Breakfast', items: '')]
      : widget.diet!.meals.map((m) => _MealDraft(label: m.label, items: m.items)).toList();
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _title.dispose();
    _note.dispose();
    for (final meal in _meals) {
      meal.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    final meals = <Json>[];
    for (final meal in _meals) {
      if (meal.label.text.trim().isEmpty) continue;
      meals.add({'label': meal.label.text.trim(), 'items': meal.items.text.trim()});
    }
    if (_title.text.trim().length < 2 || meals.isEmpty) {
      setState(() => _error = 'Give the guide a title and at least one meal.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await context.read<AppState>().api.saveDiet(widget.memberId, {
        'title': _title.text.trim(),
        'note': _note.text.trim(),
        'meals': meals,
      });
      if (mounted) Navigator.pop(context, true);
    } catch (err) {
      if (mounted) setState(() => _error = '$err');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ForgeField(
          label: 'Guide title',
          child: TextField(
            controller: _title,
            decoration: const InputDecoration(hintText: 'e.g. Lean bulk · 2,400 kcal'),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Guidance',
          child: TextField(
            controller: _note,
            maxLines: 2,
            decoration: const InputDecoration(hintText: 'Hydration, timing, swaps…'),
          ),
        ),
        if (_error != null) ...[
          const SizedBox(height: 10),
          Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
        ],
        const SizedBox(height: 15),
        for (var i = 0; i < _meals.length; i++)
          Padding(
            padding: const EdgeInsets.only(bottom: 9),
            child: Row(
              children: [
                SizedBox(
                  width: 108,
                  child: TextField(
                    controller: _meals[i].label,
                    decoration: const InputDecoration(hintText: 'Meal', isDense: true),
                  ),
                ),
                const SizedBox(width: 7),
                Expanded(
                  child: TextField(
                    controller: _meals[i].items,
                    decoration: const InputDecoration(hintText: 'What to eat', isDense: true),
                  ),
                ),
                IconButton(
                  onPressed: () => setState(() {
                    _meals[i].dispose();
                    _meals.removeAt(i);
                  }),
                  icon: const Icon(Icons.close, size: 16),
                ),
              ],
            ),
          ),
        TextButton.icon(
          onPressed: () => setState(() => _meals.add(_MealDraft(label: '', items: ''))),
          icon: const Icon(Icons.add, size: 16),
          label: const Text('Add meal'),
        ),
        const SizedBox(height: 16),
        LoadingButton(label: 'Save diet guide', icon: Icons.save_outlined, loading: _busy, onPressed: _save),
      ],
    );
  }
}

class _MealDraft {
  _MealDraft({required String label, required String items})
    : label = TextEditingController(text: label),
      items = TextEditingController(text: items);

  final TextEditingController label;
  final TextEditingController items;

  void dispose() {
    label.dispose();
    items.dispose();
  }
}

class _TimetablePreview extends StatelessWidget {
  const _TimetablePreview({required this.member});
  final Member member;

  @override
  Widget build(BuildContext context) {
    final slots = member.slots;
    if (slots.isEmpty) {
      return Text('Member follows general timetable slots.', style: ForgeTheme.body(12, color: ForgeColors.mute));
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '${slots.length} customized training session${slots.length == 1 ? '' : 's'} assigned:',
          style: ForgeTheme.mono(11, color: ForgeColors.blue),
        ),
        const SizedBox(height: 8),
        for (final s in slots.take(4))
          Padding(
            padding: const EdgeInsets.only(bottom: 5),
            child: Row(
              children: [
                Container(
                  width: 6,
                  height: 6,
                  decoration: const BoxDecoration(color: ForgeColors.red, shape: BoxShape.circle),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '${s.time} · ${s.name}',
                    style: ForgeTheme.body(12, weight: FontWeight.w600, color: ForgeColors.bone),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Text(
                  s.trainerName ?? 'Coach',
                  style: ForgeTheme.body(11, color: ForgeColors.mute),
                ),
              ],
            ),
          ),
        if (slots.length > 4)
          Text('+${slots.length - 4} more slots', style: ForgeTheme.mono(11, color: ForgeColors.mute)),
      ],
    );
  }
}

class _MemberTimetableSheet extends StatefulWidget {
  const _MemberTimetableSheet({required this.member, required this.onSaved});
  final Member member;
  final Future<void> Function(List<Map<String, dynamic>> slots) onSaved;

  @override
  State<_MemberTimetableSheet> createState() => _MemberTimetableSheetState();
}

class _MemberTimetableSheetState extends State<_MemberTimetableSheet> {
  final List<_SlotDraft> _slots = [];
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    if (widget.member.slots.isEmpty) {
      _slots.add(_SlotDraft(time: '07:00 AM - 08:00 AM', title: 'Strength & Conditioning', trainer: 'Trainer 1', capacity: 15));
      _slots.add(_SlotDraft(time: '05:30 PM - 06:30 PM', title: 'Powerlifting / HIIT', trainer: 'Trainer 2', capacity: 10));
    } else {
      for (final s in widget.member.slots) {
        _slots.add(_SlotDraft(time: s.time, title: s.name, trainer: s.trainerName ?? 'Trainer 1', capacity: 15));
      }
    }
  }

  @override
  void dispose() {
    for (final s in _slots) {
      s.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _busy = true);
    final payload = _slots
        .where((s) => s.title.text.trim().isNotEmpty)
        .map((s) => {
              'id': 'custom_slot_${DateTime.now().millisecondsSinceEpoch}_${_slots.indexOf(s)}',
              'time': s.time.text.trim().isEmpty ? '07:00 AM' : s.time.text.trim(),
              'name': s.title.text.trim(),
              'trainerName': s.trainer.text.trim().isEmpty ? 'Trainer 1' : s.trainer.text.trim(),
              'day': 'Mon, Wed, Fri',
              'durationMin': 50,
            })
        .toList();

    try {
      await widget.onSaved(payload);
      if (mounted) Navigator.pop(context, true);
    } catch (_) {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _addPreset(String title, String time, String trainer) {
    setState(() {
      _slots.add(_SlotDraft(time: time, title: title, trainer: trainer, capacity: 12));
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Assign Custom Timetable', style: ForgeTheme.display(16, weight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text('Customize training slots and sessions for ${widget.member.name}', style: ForgeTheme.body(11.5, color: ForgeColors.mute)),
                ],
              ),
            ),
            IconButton(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.close),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              Text('Quick Presets: ', style: ForgeTheme.mono(10.5, color: ForgeColors.mute)),
              ActionChip(
                label: const Text('Morning HIIT', style: TextStyle(fontSize: 11)),
                onPressed: () => _addPreset('Morning HIIT', '06:30 AM - 07:30 AM', 'Trainer 1'),
                visualDensity: VisualDensity.compact,
              ),
              const SizedBox(width: 6),
              ActionChip(
                label: const Text('Hypertrophy', style: TextStyle(fontSize: 11)),
                onPressed: () => _addPreset('Hypertrophy & Core', '05:00 PM - 06:15 PM', 'Trainer 2'),
                visualDensity: VisualDensity.compact,
              ),
              const SizedBox(width: 6),
              ActionChip(
                label: const Text('Strength Camp', style: TextStyle(fontSize: 11)),
                onPressed: () => _addPreset('Strength Camp', '07:00 PM - 08:00 PM', 'Trainer 1'),
                visualDensity: VisualDensity.compact,
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        for (var i = 0; i < _slots.length; i++)
          Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: ForgeColors.panel,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: ForgeColors.line),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      flex: 3,
                      child: TextField(
                        controller: _slots[i].title,
                        decoration: const InputDecoration(labelText: 'Session Title', hintText: 'e.g. Chest & Triceps / HIIT', isDense: true),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, color: ForgeColors.red, size: 20),
                      onPressed: () => setState(() {
                        _slots[i].dispose();
                        _slots.removeAt(i);
                      }),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: TextField(
                        controller: _slots[i].time,
                        decoration: const InputDecoration(labelText: 'Time Slot', hintText: '07:00 AM - 08:00 AM', isDense: true),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      flex: 2,
                      child: TextField(
                        controller: _slots[i].trainer,
                        decoration: const InputDecoration(labelText: 'Trainer', hintText: 'Trainer 1', isDense: true),
                      ),
                    ),
                    const SizedBox(width: 8),
                    SizedBox(
                      width: 65,
                      child: TextField(
                        controller: _slots[i].capacity,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'Cap', hintText: '15', isDense: true),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        TextButton.icon(
          onPressed: () => setState(() {
            _slots.add(_SlotDraft(time: '06:00 PM - 07:00 PM', title: '', trainer: 'Trainer 1', capacity: 15));
          }),
          icon: const Icon(Icons.add, size: 16),
          label: const Text('Add training slot'),
        ),
        const SizedBox(height: 14),
        LoadingButton(
          label: 'Save Member Timetable',
          icon: Icons.save_outlined,
          loading: _busy,
          onPressed: _save,
        ),
      ],
    );
  }
}

class _SlotDraft {
  _SlotDraft({required String time, required String title, required String trainer, required int capacity})
      : time = TextEditingController(text: time),
        title = TextEditingController(text: title),
        trainer = TextEditingController(text: trainer),
        capacity = TextEditingController(text: '$capacity');

  final TextEditingController time;
  final TextEditingController title;
  final TextEditingController trainer;
  final TextEditingController capacity;

  void dispose() {
    time.dispose();
    title.dispose();
    trainer.dispose();
    capacity.dispose();
  }
}
