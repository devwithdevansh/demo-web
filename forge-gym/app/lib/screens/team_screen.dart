import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/widgets.dart';

class TeamScreen extends StatefulWidget {
  const TeamScreen({super.key});

  @override
  State<TeamScreen> createState() => _TeamScreenState();
}

class _TeamScreenState extends State<TeamScreen> {
  late Future<List<TeamMember>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<TeamMember>> _load() => context.read<AppState>().api.team();

  void _reload() {
    setState(() {
      _future = _load();
    });
  }

  Future<void> _add() async {
    final saved = await showForgeSheet<bool>(context: context, title: 'Add to the team', child: const _TeamSheet());
    if (saved == true && mounted) {
      _reload();
      showSnack(context, 'Team member added.');
    }
  }

  Future<void> _toggle(TeamMember member) async {
    try {
      await context.read<AppState>().api.updateTeam(member.id, {'active': !member.active});
      if (mounted) _reload();
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isOwner = context.watch<AppState>().session?.user.isOwner ?? false;
    return ForgePage(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            eyebrow: 'The people',
            title: 'Your team.',
            subtitle: 'Owners, front desk and trainers. Trainers only see members assigned to them.',
            actions: [
              IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19)),
              if (isOwner)
                FilledButton.icon(
                  onPressed: _add,
                  icon: const Icon(Icons.person_add_alt_1, size: 17),
                  label: const Text('Add team member'),
                ),
            ],
          ),
          const SizedBox(height: 16),
          FutureBuilder<List<TeamMember>>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const ForgeLoading(label: 'Loading team');
              }
              if (snapshot.hasError) return ErrorPanel(error: snapshot.error!, onRetry: _reload);
              final team = snapshot.data ?? const <TeamMember>[];
              final trainers = team.where((t) => t.role == 'trainer').length;
              final staff = team.where((t) => t.role == 'staff').length;
              final assigned = team.fold<int>(0, (sum, t) => sum + t.members);
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ResponsiveGrid(
                    minItemWidth: 190,
                    children: [
                      StatCard(
                        label: 'Trainers',
                        value: '$trainers',
                        sub: 'coaching members',
                        icon: Icons.fitness_center,
                        accent: ForgeColors.green,
                      ),
                      StatCard(
                        label: 'Front desk',
                        value: '$staff',
                        sub: 'desk accounts',
                        icon: Icons.badge_outlined,
                        accent: ForgeColors.amber,
                      ),
                      StatCard(
                        label: 'Assigned members',
                        value: '$assigned',
                        sub: 'across all trainers',
                        icon: Icons.groups_2_outlined,
                        accent: ForgeColors.blue,
                      ),
                      StatCard(
                        label: 'Whole team',
                        value: '${team.length}',
                        sub: 'including owner',
                        icon: Icons.people_outline,
                        accent: ForgeColors.violet,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final columns = (constraints.maxWidth / 330).floor().clamp(1, 3);
                      final width = (constraints.maxWidth - 12 * (columns - 1)) / columns;
                      return Wrap(
                        spacing: 12,
                        runSpacing: 12,
                        children: [
                          for (final member in team)
                            SizedBox(
                              width: width,
                              child: ForgeCard(
                                padding: const EdgeInsets.all(16),
                                accent: member.active ? null : ForgeColors.mute,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        AvatarCircle(
                                          name: member.name,
                                          size: 44,
                                          color: switch (member.role) {
                                            'owner' => ForgeColors.red,
                                            'trainer' => ForgeColors.green,
                                            _ => ForgeColors.amber,
                                          },
                                        ),
                                        const SizedBox(width: 11),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                member.name,
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                                style: ForgeTheme.body(
                                                  14,
                                                  weight: FontWeight.w700,
                                                  color: ForgeColors.bone,
                                                ),
                                              ),
                                              Text(
                                                member.title.isEmpty ? roleLabel(member.role) : member.title,
                                                style: ForgeTheme.body(10.5, color: ForgeColors.mute),
                                              ),
                                            ],
                                          ),
                                        ),
                                        StatusPill(
                                          label: member.active ? roleLabel(member.role) : 'inactive',
                                          dense: true,
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 13),
                                    InfoRow(
                                      label: 'Phone',
                                      value: member.phone.isEmpty ? '—' : member.phone,
                                      icon: Icons.phone_outlined,
                                    ),
                                    InfoRow(
                                      label: 'Assigned members',
                                      value: member.role == 'trainer' ? '${member.members}' : '—',
                                      icon: Icons.groups_2_outlined,
                                    ),
                                    if (isOwner && member.role != 'owner')
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              member.active ? 'Can sign in' : 'Sign-in disabled',
                                              style: ForgeTheme.body(10.5, color: ForgeColors.mute),
                                            ),
                                          ),
                                          Switch(value: member.active, onChanged: (_) => _toggle(member)),
                                        ],
                                      ),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 18),
                  ForgeCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionHeader(title: 'How roles work'),
                        const SizedBox(height: 10),
                        const InfoRow(label: 'Owner', value: 'Money, reports, plans, team, all members'),
                        const InfoRow(label: 'Front desk', value: 'Check-ins, payments, leads, renewals'),
                        const InfoRow(label: 'Trainer', value: 'Only their assigned members, plans and logs'),
                        const InfoRow(label: 'Member', value: 'Own pass, check-in, workout, diet and videos'),
                      ],
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

class _TeamSheet extends StatefulWidget {
  const _TeamSheet();

  @override
  State<_TeamSheet> createState() => _TeamSheetState();
}

class _TeamSheetState extends State<_TeamSheet> {
  final _name = TextEditingController();
  final _title = TextEditingController();
  final _phone = TextEditingController();
  String _role = 'trainer';
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    _title.dispose();
    _phone.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_name.text.trim().length < 2) {
      setState(() => _error = 'Enter their name.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await context.read<AppState>().api.createTeam({
        'name': _name.text.trim(),
        'role': _role,
        'title': _title.text.trim(),
        'phone': _phone.text.trim(),
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
        Text(
          'A team account signs in with their phone number. Ask them to use the Activation link on the sign-in screen if they need to set a password.',
          style: ForgeTheme.body(11.5, color: ForgeColors.mute),
        ),
        if (_error != null) ...[
          const SizedBox(height: 10),
          Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
        ],
        const SizedBox(height: 15),
        ForgeField(
          label: 'Name',
          child: TextField(
            controller: _name,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(hintText: 'Their full name'),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Role',
          child: ChoiceRow<String>(
            values: const ['trainer', 'staff'],
            selected: _role,
            label: roleLabel,
            onSelected: (value) => setState(() => _role = value),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Title (optional)',
          child: TextField(
            controller: _title,
            decoration: const InputDecoration(hintText: 'e.g. Strength coach'),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Phone',
          child: TextField(
            controller: _phone,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(hintText: 'For signing in'),
          ),
        ),
        const SizedBox(height: 18),
        LoadingButton(label: 'Add team member', loading: _busy, onPressed: _save),
      ],
    );
  }
}
