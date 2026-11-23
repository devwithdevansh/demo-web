import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/payment_sheet.dart';
import '../ui/widgets.dart';

const memberCategories = [
  'General fitness',
  'Weight loss',
  'Strength',
  'Beginner',
  'Senior',
  'Student',
  'Personal training',
];

class AddMemberScreen extends StatelessWidget {
  const AddMemberScreen({super.key});

  @override
  Widget build(BuildContext context) => const MemberFormScreen();
}

/// Adds a new member or edits an existing one. Pops with `true` when saved.
class MemberFormScreen extends StatefulWidget {
  const MemberFormScreen({super.key, this.member});

  final Member? member;

  bool get isEdit => member != null;

  @override
  State<MemberFormScreen> createState() => _MemberFormScreenState();
}

class _MemberFormScreenState extends State<MemberFormScreen> {
  late final TextEditingController _name = TextEditingController(text: widget.member?.name ?? '');
  late final TextEditingController _phone = TextEditingController(text: widget.member?.phone ?? '');
  late final TextEditingController _email = TextEditingController(text: widget.member?.email ?? '');
  late final TextEditingController _notes = TextEditingController(text: widget.member?.notes ?? '');
  late final TextEditingController _password = TextEditingController();
  late final TextEditingController _paidNow = TextEditingController();

  List<Plan> _plans = const [];
  List<TeamMember> _trainers = const [];
  String _category = 'General fitness';
  String? _planId;
  String? _trainerId;
  String _startDate = todayKey();
  String _method = 'cash';
  bool _loading = true;
  bool _saving = false;
  String? _loadError;
  String? _error;

  @override
  void initState() {
    super.initState();
    _category = widget.member?.category ?? 'General fitness';
    _trainerId = widget.member?.trainerId;
    _startDate = widget.member?.startDate.isNotEmpty == true ? widget.member!.startDate : todayKey();
    _load();
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _email.dispose();
    _notes.dispose();
    _password.dispose();
    _paidNow.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final api = context.read<AppState>().api;
      final results = await Future.wait([api.plans(), api.team()]);
      if (!mounted) return;
      final plans = results[0] as List<Plan>;
      final team = results[1] as List<TeamMember>;
      setState(() {
        _plans = plans.where((p) => p.active).toList();
        _trainers = team.where((t) => t.role == 'trainer' && t.active).toList();
        final current = widget.member?.planId;
        _planId = (current != null && plans.any((p) => p.id == current))
            ? current
            : (_plans.isNotEmpty ? _plans.first.id : null);
        _loading = false;
      });
    } catch (err) {
      if (mounted) {
        setState(() {
          _loading = false;
          _loadError = err is Exception ? '$err' : 'Could not load plans and trainers.';
        });
      }
    }
  }

  Future<void> _pickStartDate() async {
    final current = parseDay(_startDate) ?? DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: current,
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now().add(const Duration(days: 90)),
    );
    if (picked != null) {
      setState(() => _startDate = picked.toIso8601String().substring(0, 10));
    }
  }

  Future<void> _save() async {
    final name = _name.text.trim();
    final phone = _phone.text.trim();
    if (name.length < 2) {
      setState(() => _error = 'Enter the member\'s full name.');
      return;
    }
    if (phone.length < 8) {
      setState(() => _error = 'Enter a phone number with at least 8 digits.');
      return;
    }
    if (_planId == null) {
      setState(() => _error = 'Choose a membership plan.');
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    final api = context.read<AppState>().api;
    try {
      if (widget.isEdit) {
        await api.updateMember(widget.member!.id, {
          'name': name,
          'phone': phone,
          'email': _email.text.trim(),
          'category': _category,
          'planId': _planId,
          'trainerId': _trainerId ?? '',
          'notes': _notes.text.trim(),
          if (_password.text.trim().isNotEmpty) 'password': _password.text.trim(),
        });
      } else {
        final paid = int.tryParse(_paidNow.text.trim()) ?? 0;
        await api.createMember({
          'name': name,
          'phone': phone,
          if (_email.text.trim().isNotEmpty) 'email': _email.text.trim(),
          'category': _category,
          'planId': _planId,
          'startDate': _startDate,
          if (_trainerId != null) 'trainerId': _trainerId,
          'notes': _notes.text.trim(),
          if (_password.text.trim().isNotEmpty) 'password': _password.text.trim(),
          if (paid > 0) 'paidNow': paid,
          if (paid > 0) 'method': _method,
        });
      }
      if (mounted) Navigator.of(context).pop(true);
    } catch (err) {
      if (mounted) setState(() => _error = '$err');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ForgeBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          surfaceTintColor: Colors.transparent,
          title: Text(
            widget.isEdit ? 'Edit member' : 'Add a member',
            style: ForgeTheme.body(14, weight: FontWeight.w600),
          ),
        ),
        body: _loading
            ? const Center(child: ForgeLoading(label: 'Loading plans'))
            : _loadError != null
            ? Center(
                child: ErrorPanel(
                  error: _loadError!,
                  onRetry: () {
                    setState(() {
                      _loading = true;
                      _loadError = null;
                    });
                    _load();
                  },
                ),
              )
            : ForgePage(
                maxWidth: 900,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    PageHeader(
                      eyebrow: widget.isEdit ? 'Member record' : 'New sign-up',
                      title: widget.isEdit ? widget.member!.name : 'Put someone on the floor.',
                      subtitle: widget.isEdit
                          ? '${widget.member!.memberCode} · joined ${dayLabel(widget.member!.startDate)}'
                          : 'A plan, a phone number and a start date is all it takes.',
                    ),
                    const SizedBox(height: 18),
                    if (_error != null) ...[
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: ForgeColors.red.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(11),
                          border: Border.all(color: ForgeColors.red.withValues(alpha: 0.4)),
                        ),
                        child: Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
                      ),
                      const SizedBox(height: 14),
                    ],
                    LayoutBuilder(
                      builder: (context, constraints) {
                        final wide = constraints.maxWidth >= 760;
                        final person = _personCard();
                        final plan = _planCard();
                        if (!wide) {
                          return Column(children: [person, const SizedBox(height: 14), plan]);
                        }
                        return Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(child: person),
                            const SizedBox(width: 14),
                            Expanded(child: plan),
                          ],
                        );
                      },
                    ),
                    const SizedBox(height: 16),
                    ForgeCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SectionHeader(title: 'Staff notes'),
                          const SizedBox(height: 12),
                          TextField(
                            controller: _notes,
                            maxLines: 3,
                            decoration: const InputDecoration(
                              hintText: 'Injuries, preferences, anything the desk should know…',
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _saving ? null : () => Navigator.of(context).pop(false),
                            child: const Text('Cancel'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 2,
                          child: LoadingButton(
                            label: widget.isEdit ? 'Save changes' : 'Add member',
                            icon: widget.isEdit ? Icons.save_outlined : Icons.person_add_alt_1,
                            loading: _saving,
                            onPressed: _save,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _personCard() {
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(title: 'Who is joining'),
          const SizedBox(height: 16),
          ForgeField(
            label: 'Full name',
            child: TextField(
              controller: _name,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(hintText: 'e.g. Aarav Shah'),
            ),
          ),
          const SizedBox(height: 13),
          ForgeField(
            label: 'Phone',
            child: TextField(
              controller: _phone,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(hintText: '10-digit mobile number'),
            ),
          ),
          const SizedBox(height: 13),
          ForgeField(
            label: 'Email (optional)',
            child: TextField(
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(hintText: 'name@example.com'),
            ),
          ),
          const SizedBox(height: 13),
          ForgeField(
            label: 'Category',
            child: ChoiceRow<String>(
              values: memberCategories,
              selected: _category,
              label: (c) => c,
              onSelected: (c) => setState(() => _category = c),
            ),
          ),
        ],
      ),
    );
  }

  Widget _planCard() {
    final matchedPlans = _plans.where((p) => p.id == _planId).toList();
    final plan = matchedPlans.isEmpty ? null : matchedPlans.first;
    final matchedTrainers = _trainers.where((t) => t.id == _trainerId).toList();
    final trainer = matchedTrainers.isEmpty ? null : matchedTrainers.first;
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(title: 'Membership'),
          const SizedBox(height: 16),
          ForgeField(
            label: 'Plan',
            child: _PickerField(
              value: plan == null ? 'Choose a plan' : '${plan.name} · ${inr(plan.price)}',
              empty: plan == null,
              icon: Icons.card_membership,
              onTap: () => _pickPlan(),
            ),
          ),
          if (plan != null)
            Padding(
              padding: const EdgeInsets.only(top: 7),
              child: Text(
                '${durationLabel(plan.durationMonths, plan.durationDays)} membership',
                style: ForgeTheme.mono(9.5, letterSpacing: 0.4),
              ),
            ),
          const SizedBox(height: 13),
          ForgeField(
            label: 'Trainer (optional)',
            child: _PickerField(
              value: trainer?.name ?? 'No trainer yet',
              empty: trainer == null,
              icon: Icons.fitness_center,
              onTap: _pickTrainer,
            ),
          ),
          if (!widget.isEdit) ...[
            const SizedBox(height: 13),
            ForgeField(
              label: 'Start date',
              child: _PickerField(
                value: dayLabel(_startDate),
                icon: Icons.calendar_today_outlined,
                onTap: _pickStartDate,
              ),
            ),
            const SizedBox(height: 13),
            ForgeField(
              label: 'Paid now (optional)',
              hint: 'Leave blank to keep the full plan fee as dues.',
              child: TextField(
                controller: _paidNow,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(hintText: '0'),
              ),
            ),
            if ((int.tryParse(_paidNow.text.trim()) ?? 0) > 0) ...[
              const SizedBox(height: 11),
              ForgeField(
                label: 'Method',
                child: ChoiceRow<(String, String)>(
                  values: payMethods,
                  selected: payMethods.firstWhere((m) => m.$1 == _method),
                  label: (m) => m.$2,
                  onSelected: (m) => setState(() => _method = m.$1),
                ),
              ),
            ],
          ],
          const SizedBox(height: 13),
          ForgeField(
            label: widget.isEdit ? 'Reset app password (optional)' : 'App password (optional)',
            hint: widget.isEdit
                ? 'Only needed if the member signs in to the member app.'
                : 'Creates a member sign-in so they can use this app.',
            child: TextField(
              controller: _password,
              obscureText: true,
              decoration: const InputDecoration(hintText: 'At least 4 characters'),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _pickPlan() async {
    final picked = await showForgeSheet<Plan>(
      context: context,
      title: 'Choose a plan',
      child: Column(
        children: [
          for (final plan in _plans)
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.card_membership, size: 20, color: ForgeColors.redHi),
              title: Text(
                plan.name,
                style: ForgeTheme.body(13.5, weight: FontWeight.w600, color: ForgeColors.bone),
              ),
              subtitle: Text(
                '${durationLabel(plan.durationMonths, plan.durationDays)} · ${inr(plan.price)}',
                style: ForgeTheme.body(11, color: ForgeColors.mute),
              ),
              trailing: plan.id == _planId ? const Icon(Icons.check, size: 18, color: ForgeColors.redHi) : null,
              onTap: () => Navigator.pop(context, plan),
            ),
          if (_plans.isEmpty)
            const EmptyPanel(title: 'No active plans', message: 'Add a plan first from the Plans screen.'),
        ],
      ),
    );
    if (picked != null) setState(() => _planId = picked.id);
  }

  Future<void> _pickTrainer() async {
    final picked = await showForgeSheet<Object?>(
      context: context,
      title: 'Assign a trainer',
      child: Column(
        children: [
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.person_off_outlined, size: 20, color: ForgeColors.mute),
            title: Text('No trainer', style: ForgeTheme.body(13.5, color: ForgeColors.boneDim)),
            onTap: () => Navigator.pop(context, 'none'),
          ),
          for (final trainer in _trainers)
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: AvatarCircle(name: trainer.name, size: 34),
              title: Text(
                trainer.name,
                style: ForgeTheme.body(13.5, weight: FontWeight.w600, color: ForgeColors.bone),
              ),
              subtitle: Text(
                '${trainer.title.isEmpty ? 'Trainer' : trainer.title} · ${trainer.members} members',
                style: ForgeTheme.body(11, color: ForgeColors.mute),
              ),
              trailing: trainer.id == _trainerId ? const Icon(Icons.check, size: 18, color: ForgeColors.redHi) : null,
              onTap: () => Navigator.pop(context, trainer),
            ),
          if (_trainers.isEmpty)
            const EmptyPanel(
              title: 'No trainers yet',
              icon: Icons.fitness_center,
              message: 'Add a trainer from the Team screen.',
            ),
        ],
      ),
    );
    if (picked == null) return;
    setState(() => _trainerId = picked is TeamMember ? picked.id : null);
  }
}

class _PickerField extends StatelessWidget {
  const _PickerField({required this.value, required this.onTap, required this.icon, this.empty = false});

  final String value;
  final VoidCallback onTap;
  final IconData icon;
  final bool empty;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 15),
        decoration: BoxDecoration(
          color: ForgeColors.ink2,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: ForgeColors.line),
        ),
        child: Row(
          children: [
            Icon(icon, size: 17, color: ForgeColors.mute),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                value,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: ForgeTheme.body(13, color: empty ? ForgeColors.mute : ForgeColors.bone),
              ),
            ),
            const Icon(Icons.expand_more, size: 17, color: ForgeColors.mute),
          ],
        ),
      ),
    );
  }
}
