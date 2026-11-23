import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/widgets.dart';
import 'member_form.dart';

const _weekdays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

class CoachingScreen extends StatefulWidget {
  const CoachingScreen({super.key});

  @override
  State<CoachingScreen> createState() => _CoachingScreenState();
}

class _CoachingScreenState extends State<CoachingScreen> {
  late Future<_CoachingData> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<_CoachingData> _load() async {
    final state = context.read<AppState>();
    final isOwner = state.session?.user.isOwner ?? false;
    final timetable = await state.api.timetable();
    final announcements = await state.api.announcements();
    final assignments = isOwner ? await state.api.assignments() : <String, dynamic>{};
    return _CoachingData(
      slots: asList(timetable['slots']).map(ClassSlot.fromJson).toList(),
      today: str(timetable['today']),
      announcements: announcements,
      assignments: assignments,
      isOwner: isOwner,
    );
  }

  void _reload() {
    setState(() {
      _future = _load();
    });
  }

  Future<void> _addClass() async {
    final saved = await showForgeSheet<bool>(context: context, title: 'Add a class', child: const _ClassSheet());
    if (saved == true && mounted) {
      _reload();
      showSnack(context, 'Class added to the timetable.');
    }
  }

  Future<void> _deleteClass(ClassSlot slot) async {
    final ok = await showConfirm(
      context,
      title: 'Remove this class?',
      message: '${slot.name} on ${slot.day} at ${timeLabel(slot.time)} is removed from the timetable.',
      confirmLabel: 'Remove',
      danger: true,
    );
    if (!ok) return;
    if (!mounted) return;
    try {
      await context.read<AppState>().api.deleteClass(slot.id);
      if (mounted) _reload();
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    }
  }

  Future<void> _addAnnouncement() async {
    final saved = await showForgeSheet<bool>(
      context: context,
      title: 'Post an announcement',
      child: const _AnnouncementSheet(),
    );
    if (saved == true && mounted) {
      _reload();
      showSnack(context, 'Announcement posted.');
    }
  }

  Future<void> _deleteAnnouncement(Announcement announcement) async {
    final ok = await showConfirm(
      context,
      title: 'Delete announcement?',
      message: 'Members will no longer see "${announcement.title}".',
      confirmLabel: 'Delete',
      danger: true,
    );
    if (!ok) return;
    if (!mounted) return;
    try {
      await context.read<AppState>().api.deleteAnnouncement(announcement.id);
      if (mounted) _reload();
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    }
  }

  Future<void> _editAssignment(Member member, _CoachingData data) async {
    final trainers = asList(data.assignments['trainers']).map((t) => asMap(t)).toList();
    final categories = (data.assignments['categories'] as List? ?? const []).map((c) => '$c').toList();
    final saved = await showForgeSheet<bool>(
      context: context,
      title: 'Assign ${firstName(member.name)}',
      child: _AssignmentSheet(
        member: member,
        trainers: trainers,
        categories: categories.isEmpty ? memberCategories : categories,
      ),
    );
    if (saved == true && mounted) {
      _reload();
      showSnack(context, 'Assignment saved.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AppState>().session?.user;
    final canPost = user?.isOwner == true || user?.isStaff == true;
    return ForgePage(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            eyebrow: 'Coaching',
            title: 'Timetable & notices.',
            subtitle: 'The weekly class board, gym announcements and trainer assignments.',
            actions: [
              IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19)),
              if (user?.isOwner == true)
                FilledButton.icon(
                  onPressed: _addClass,
                  icon: const Icon(Icons.add, size: 17),
                  label: const Text('Add class'),
                ),
            ],
          ),
          const SizedBox(height: 16),
          FutureBuilder<_CoachingData>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const ForgeLoading(label: 'Loading timetable');
              }
              if (snapshot.hasError) return ErrorPanel(error: snapshot.error!, onRetry: _reload);
              final data = snapshot.data;
              if (data == null) return ErrorPanel(error: 'No timetable returned.', onRetry: _reload);
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final wide = constraints.maxWidth >= 980;
                      final timetable = _Timetable(
                        slots: data.slots,
                        today: data.today,
                        canEdit: user?.isOwner == true,
                        onDelete: _deleteClass,
                        onAdd: _addClass,
                      );
                      final notices = _Notices(
                        announcements: data.announcements,
                        canPost: canPost,
                        onAdd: _addAnnouncement,
                        onDelete: _deleteAnnouncement,
                      );
                      if (!wide) return Column(children: [timetable, const SizedBox(height: 14), notices]);
                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(flex: 7, child: timetable),
                          const SizedBox(width: 14),
                          Expanded(flex: 4, child: notices),
                        ],
                      );
                    },
                  ),
                  if (data.isOwner) ...[
                    const SizedBox(height: 16),
                    _Assignments(data: data, onEdit: (member) => _editAssignment(member, data)),
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

class _CoachingData {
  const _CoachingData({
    required this.slots,
    required this.today,
    required this.announcements,
    required this.assignments,
    required this.isOwner,
  });

  final List<ClassSlot> slots;
  final String today;
  final List<Announcement> announcements;
  final Json assignments;
  final bool isOwner;
}

class _Timetable extends StatelessWidget {
  const _Timetable({
    required this.slots,
    required this.today,
    required this.canEdit,
    required this.onDelete,
    required this.onAdd,
  });

  final List<ClassSlot> slots;
  final String today;
  final bool canEdit;
  final ValueChanged<ClassSlot> onDelete;
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(
            title: 'Weekly classes',
            subtitle: '${slots.length} class${slots.length == 1 ? '' : 'es'} on the board',
            trailing: canEdit
                ? TextButton.icon(onPressed: onAdd, icon: const Icon(Icons.add, size: 15), label: const Text('Add'))
                : null,
          ),
          const SizedBox(height: 14),
          if (slots.isEmpty)
            const EmptyPanel(
              title: 'No classes yet',
              message: 'The week is empty. Add the first class to the board.',
              icon: Icons.calendar_month_outlined,
            )
          else
            for (final day in _weekdays) ...[
              if (slots.any((slot) {
                final d = slot.day.toUpperCase();
                return d == day || d.contains(day) || d == 'DAILY';
              })) ...[
                Padding(
                  padding: const EdgeInsets.only(bottom: 7),
                  child: Row(
                    children: [
                      Text(
                        day,
                        style: ForgeTheme.mono(
                          9.5,
                          letterSpacing: 1.6,
                          color: day == today ? ForgeColors.redHi : ForgeColors.mute,
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (day == today) const StatusPill(label: 'today', color: ForgeColors.red, dense: true),
                      Expanded(
                        child: Container(height: 1, color: ForgeColors.line, margin: const EdgeInsets.only(left: 8)),
                      ),
                    ],
                  ),
                ),
                for (final slot in slots.where((slot) {
                  final d = slot.day.toUpperCase();
                  return d == day || d.contains(day) || d == 'DAILY';
                }))
                  Padding(
                    padding: const EdgeInsets.only(bottom: 7),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 10),
                      decoration: BoxDecoration(
                        color: ForgeColors.ink2,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: ForgeColors.line),
                      ),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 66,
                            child: Text(timeLabel(slot.time), style: ForgeTheme.mono(9.5, color: ForgeColors.bone)),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  slot.name,
                                  style: ForgeTheme.body(12, weight: FontWeight.w600, color: ForgeColors.bone),
                                ),
                                Text(
                                  '${slot.durationMin} min${slot.trainerName == null || slot.trainerName!.isEmpty ? '' : ' · ${slot.trainerName}'}',
                                  style: ForgeTheme.body(10, color: ForgeColors.mute),
                                ),
                              ],
                            ),
                          ),
                          if (canEdit)
                            IconButton(
                              tooltip: 'Remove class',
                              onPressed: () => onDelete(slot),
                              icon: const Icon(Icons.close, size: 15, color: ForgeColors.mute),
                            ),
                        ],
                      ),
                    ),
                  ),
                const SizedBox(height: 6),
              ],
            ],
        ],
      ),
    );
  }
}

class _Notices extends StatelessWidget {
  const _Notices({required this.announcements, required this.canPost, required this.onAdd, required this.onDelete});

  final List<Announcement> announcements;
  final bool canPost;
  final VoidCallback onAdd;
  final ValueChanged<Announcement> onDelete;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(
            title: 'Notice board',
            trailing: canPost
                ? TextButton.icon(onPressed: onAdd, icon: const Icon(Icons.add, size: 15), label: const Text('Post'))
                : null,
          ),
          const SizedBox(height: 12),
          if (announcements.isEmpty)
            EmptyPanel(
              title: 'No announcements',
              message: canPost
                  ? 'Post opening hours, holidays or a new class.'
                  : 'The gym has not posted anything yet.',
              icon: Icons.campaign_outlined,
            )
          else
            for (final announcement in announcements.take(8))
              Padding(
                padding: const EdgeInsets.only(bottom: 11),
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: ForgeColors.ink2,
                    borderRadius: BorderRadius.circular(11),
                    border: Border.all(color: ForgeColors.line),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              announcement.title,
                              style: ForgeTheme.body(12, weight: FontWeight.w700, color: ForgeColors.bone),
                            ),
                          ),
                          if (canPost)
                            IconButton(
                              visualDensity: VisualDensity.compact,
                              onPressed: () => onDelete(announcement),
                              icon: const Icon(Icons.close, size: 14, color: ForgeColors.mute),
                            ),
                        ],
                      ),
                      if (announcement.body.isNotEmpty)
                        Text(announcement.body, style: ForgeTheme.body(11, color: ForgeColors.mute)),
                      const SizedBox(height: 5),
                      Text(
                        '${announcement.postedBy.isEmpty ? 'FORGE' : announcement.postedBy.toUpperCase()} · ${stampLabel(announcement.createdAt)}',
                        style: ForgeTheme.mono(7.5, letterSpacing: 0.6),
                      ),
                    ],
                  ),
                ),
              ),
        ],
      ),
    );
  }
}

class _Assignments extends StatelessWidget {
  const _Assignments({required this.data, required this.onEdit});

  final _CoachingData data;
  final ValueChanged<Member> onEdit;

  @override
  Widget build(BuildContext context) {
    final members = asList(data.assignments['members']).map(Member.fromJson).toList();
    final trainers = asList(data.assignments['trainers']).map((t) => asMap(t)).toList();
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(
            title: 'Trainer assignments',
            subtitle: 'Who coaches whom, and the PT pack on each account',
            trailing: StatusPill(label: '${trainers.length} trainers', color: ForgeColors.violet, dense: true),
          ),
          const SizedBox(height: 12),
          if (members.isEmpty)
            const EmptyPanel(title: 'No active members to assign', icon: Icons.groups_2_outlined)
          else
            LayoutBuilder(
              builder: (context, constraints) {
                final columns = (constraints.maxWidth / 300).floor().clamp(1, 3);
                final width = (constraints.maxWidth - 10 * (columns - 1)) / columns;
                return Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    for (final member in members)
                      SizedBox(
                        width: width,
                        child: InkWell(
                          borderRadius: BorderRadius.circular(11),
                          onTap: () => onEdit(member),
                          child: Container(
                            padding: const EdgeInsets.all(11),
                            decoration: BoxDecoration(
                              color: ForgeColors.ink2,
                              borderRadius: BorderRadius.circular(11),
                              border: Border.all(color: ForgeColors.line),
                            ),
                            child: Row(
                              children: [
                                AvatarCircle(name: member.name, size: 32),
                                const SizedBox(width: 9),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        member.name,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: ForgeTheme.body(11.5, weight: FontWeight.w600, color: ForgeColors.bone),
                                      ),
                                      Text(
                                        '${member.trainerName ?? 'No trainer'} · ${member.category}',
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: ForgeTheme.body(9.5, color: ForgeColors.mute),
                                      ),
                                    ],
                                  ),
                                ),
                                Text(
                                  'PT ${member.ptLeft}/${member.ptTotal}',
                                  style: ForgeTheme.mono(7.5, color: ForgeColors.green, letterSpacing: 0.4),
                                ),
                              ],
                            ),
                          ),
                        ),
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

class _ClassSheet extends StatefulWidget {
  const _ClassSheet();

  @override
  State<_ClassSheet> createState() => _ClassSheetState();
}

class _ClassSheetState extends State<_ClassSheet> {
  final _name = TextEditingController();
  final _time = TextEditingController(text: '18:30');
  final _duration = TextEditingController(text: '45');
  List<TeamMember> _trainers = const [];
  String _day = _weekdays.first;
  String? _trainerId;
  bool _busy = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadTrainers();
  }

  Future<void> _loadTrainers() async {
    try {
      final team = await context.read<AppState>().api.team();
      if (mounted) {
        setState(() => _trainers = team.where((t) => t.role == 'trainer' && t.active).toList());
      }
    } catch (_) {
      // The class can still be added without a trainer.
    }
  }

  @override
  void dispose() {
    _name.dispose();
    _time.dispose();
    _duration.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final time = _time.text.trim();
    if (_name.text.trim().length < 2) {
      setState(() => _error = 'Name the class.');
      return;
    }
    if (!RegExp(r'^([01]\d|2[0-3]):[0-5]\d$').hasMatch(time)) {
      setState(() => _error = 'Use a time like 18:30 (24-hour).');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await context.read<AppState>().api.addClass({
        'day': _day,
        'time': time,
        'name': _name.text.trim(),
        'durationMin': int.tryParse(_duration.text.trim()) ?? 45,
        if (_trainerId != null) 'trainerId': _trainerId,
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
        if (_error != null) ...[
          Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
          const SizedBox(height: 10),
        ],
        ForgeField(
          label: 'Class name',
          child: TextField(
            controller: _name,
            decoration: const InputDecoration(hintText: 'e.g. Strength circuit'),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Day',
          child: ChoiceRow<String>(
            values: _weekdays,
            selected: _day,
            label: titleCase,
            onSelected: (v) => setState(() => _day = v),
          ),
        ),
        const SizedBox(height: 13),
        Row(
          children: [
            Expanded(
              child: ForgeField(
                label: 'Start time',
                child: TextField(
                  controller: _time,
                  keyboardType: TextInputType.datetime,
                  decoration: const InputDecoration(hintText: '18:30'),
                ),
              ),
            ),
            const SizedBox(width: 11),
            Expanded(
              child: ForgeField(
                label: 'Minutes',
                child: TextField(
                  controller: _duration,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(hintText: '45'),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Trainer (optional)',
          child: Wrap(
            spacing: 7,
            runSpacing: 7,
            children: [
              _TrainerChip(
                label: 'Unassigned',
                active: _trainerId == null,
                onTap: () => setState(() => _trainerId = null),
              ),
              for (final trainer in _trainers)
                _TrainerChip(
                  label: trainer.name,
                  active: _trainerId == trainer.id,
                  onTap: () => setState(() => _trainerId = trainer.id),
                ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        LoadingButton(label: 'Add class', loading: _busy, onPressed: _save),
      ],
    );
  }
}

class _TrainerChip extends StatelessWidget {
  const _TrainerChip({required this.label, required this.active, required this.onTap});

  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 8),
        decoration: BoxDecoration(
          color: active ? ForgeColors.red.withValues(alpha: 0.12) : ForgeColors.ink2,
          borderRadius: BorderRadius.circular(9),
          border: Border.all(color: active ? ForgeColors.red : ForgeColors.line),
        ),
        child: Text(label, style: ForgeTheme.body(11, color: active ? ForgeColors.bone : ForgeColors.mute)),
      ),
    );
  }
}

class _AnnouncementSheet extends StatefulWidget {
  const _AnnouncementSheet();

  @override
  State<_AnnouncementSheet> createState() => _AnnouncementSheetState();
}

class _AnnouncementSheetState extends State<_AnnouncementSheet> {
  final _title = TextEditingController();
  final _body = TextEditingController();
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _title.dispose();
    _body.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_title.text.trim().length < 3) {
      setState(() => _error = 'Add a title.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await context.read<AppState>().api.addAnnouncement({'title': _title.text.trim(), 'body': _body.text.trim()});
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
        if (_error != null) ...[
          Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
          const SizedBox(height: 10),
        ],
        ForgeField(
          label: 'Title',
          child: TextField(
            controller: _title,
            decoration: const InputDecoration(hintText: 'e.g. Closed on Sunday'),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Message',
          child: TextField(
            controller: _body,
            maxLines: 4,
            decoration: const InputDecoration(hintText: 'What should members know?'),
          ),
        ),
        const SizedBox(height: 18),
        LoadingButton(label: 'Post announcement', loading: _busy, onPressed: _save),
      ],
    );
  }
}

class _AssignmentSheet extends StatefulWidget {
  const _AssignmentSheet({required this.member, required this.trainers, required this.categories});

  final Member member;
  final List<Json> trainers;
  final List<String> categories;

  @override
  State<_AssignmentSheet> createState() => _AssignmentSheetState();
}

class _AssignmentSheetState extends State<_AssignmentSheet> {
  late String? _trainerId = widget.member.trainerId;
  late String _category = widget.categories.contains(widget.member.category)
      ? widget.member.category
      : widget.categories.first;
  late final TextEditingController _pt = TextEditingController(text: '${widget.member.ptTotal}');
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _pt.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await context.read<AppState>().api.assign(widget.member.id, {
        'trainerId': _trainerId,
        'category': _category,
        'ptTotal': int.tryParse(_pt.text.trim()) ?? 0,
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
        Text('${widget.member.memberCode} · ${widget.member.planName}', style: ForgeTheme.mono(9, letterSpacing: 0.5)),
        if (_error != null) ...[
          const SizedBox(height: 10),
          Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
        ],
        const SizedBox(height: 15),
        ForgeField(
          label: 'Trainer',
          child: Wrap(
            spacing: 7,
            runSpacing: 7,
            children: [
              _TrainerChip(
                label: 'No trainer',
                active: _trainerId == null,
                onTap: () => setState(() => _trainerId = null),
              ),
              for (final trainer in widget.trainers)
                _TrainerChip(
                  label: str(trainer['name'], 'Trainer'),
                  active: _trainerId == str(trainer['id']),
                  onTap: () => setState(() => _trainerId = str(trainer['id'])),
                ),
            ],
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Category',
          child: ChoiceRow<String>(
            values: widget.categories,
            selected: _category,
            label: (c) => c,
            onSelected: (c) => setState(() => _category = c),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'PT sessions in the pack',
          hint: 'Used sessions stay as they are; reducing below the used count is blocked by the server.',
          child: TextField(
            controller: _pt,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(hintText: '0'),
          ),
        ),
        const SizedBox(height: 18),
        LoadingButton(label: 'Save assignment', loading: _busy, onPressed: _save),
      ],
    );
  }
}
