import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/widgets.dart';
import 'coach_member_screen.dart';
import 'member_detail_screen.dart';
import 'member_form.dart';

class MembersScreen extends StatefulWidget {
  const MembersScreen({super.key, this.coachMode = false});

  final bool coachMode;

  @override
  State<MembersScreen> createState() => _MembersScreenState();
}

class _MembersScreenState extends State<MembersScreen> {
  int _refresh = 0;
  final _search = TextEditingController();
  String _query = '';
  String _status = 'All';

  static const _filters = ['All', 'Active', 'Expiring', 'Lapsed', 'Dues'];

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  Future<Object> _load() {
    final api = context.read<AppState>().api;
    return widget.coachMode ? api.coachOverview() : api.members();
  }

  void _reload() => setState(() => _refresh++);

  Future<void> _open(String memberId) async {
    final changed = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) =>
            widget.coachMode ? CoachMemberScreen(memberId: memberId) : MemberDetailScreen(memberId: memberId),
      ),
    );
    if (changed == true && mounted) _reload();
  }

  bool _matches(Member member) {
    final q = _query.trim().toLowerCase();
    if (q.isNotEmpty) {
      final hit =
          member.name.toLowerCase().contains(q) ||
          member.phone.toLowerCase().contains(q) ||
          member.memberCode.toLowerCase().contains(q);
      if (!hit) return false;
    }
    return switch (_status) {
      'Active' => member.status == 'active',
      'Expiring' => member.status == 'expiring',
      'Lapsed' => member.status == 'expired',
      'Dues' => member.feeDue > 0,
      _ => true,
    };
  }

  @override
  Widget build(BuildContext context) {
    return ForgePage(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            eyebrow: widget.coachMode ? 'Your roster' : 'Member book',
            title: widget.coachMode ? 'My members' : 'Everyone on the floor.',
            subtitle: widget.coachMode
                ? 'Assigned members, their plans and the last time you saw them.'
                : 'Search, open a record, renew a membership or collect a due.',
            actions: [
              IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19)),
              if (!widget.coachMode)
                FilledButton.icon(
                  onPressed: () async {
                    final saved = await Navigator.of(
                      context,
                    ).push<bool>(MaterialPageRoute(builder: (_) => const AddMemberScreen()));
                    if (saved == true && mounted) _reload();
                  },
                  icon: const Icon(Icons.person_add_alt_1, size: 17),
                  label: const Text('Add member'),
                ),
            ],
          ),
          const SizedBox(height: 18),
          AsyncBuilder<Object>(
            key: ValueKey(_refresh),
            load: _load,
            builder: (context, data, reload) {
              final members = data is TrainerOverview
                  ? data.members.map((row) => row.member).toList()
                  : (data as List<Member>);
              final trainerRows = data is TrainerOverview ? data.members : const <TrainerMember>[];
              final visible = members.where(_matches).toList();
              final dues = members.where((m) => m.feeDue > 0).length;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _Toolbar(
                    search: _search,
                    onQuery: (value) => setState(() => _query = value),
                    status: _status,
                    filters: _filters,
                    onStatus: (value) => setState(() => _status = value),
                    count: visible.length,
                    dues: dues,
                  ),
                  const SizedBox(height: 16),
                  if (visible.isEmpty)
                    EmptyPanel(
                      title: _query.isEmpty && _status == 'All' ? 'No members yet' : 'No member matches',
                      message: _query.isEmpty && _status == 'All'
                          ? 'Add the first member and their plan will start today.'
                          : 'Try a different search or status filter.',
                      icon: Icons.groups_2_outlined,
                    )
                  else
                    LayoutBuilder(
                      builder: (context, constraints) {
                        final columns = (constraints.maxWidth / 340).floor().clamp(1, 4);
                        final width = (constraints.maxWidth - 12 * (columns - 1)) / columns;
                        return Wrap(
                          spacing: 12,
                          runSpacing: 12,
                          children: [
                            for (final member in visible)
                              SizedBox(
                                width: width,
                                child: _MemberCard(
                                  member: member,
                                  trainerRow: trainerRows.where((r) => r.member.id == member.id).toList().isEmpty
                                      ? null
                                      : trainerRows.firstWhere((r) => r.member.id == member.id),
                                  onTap: () => _open(member.id),
                                ),
                              ),
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

class _Toolbar extends StatelessWidget {
  const _Toolbar({
    required this.search,
    required this.onQuery,
    required this.status,
    required this.filters,
    required this.onStatus,
    required this.count,
    required this.dues,
  });

  final TextEditingController search;
  final ValueChanged<String> onQuery;
  final String status;
  final List<String> filters;
  final ValueChanged<String> onStatus;
  final int count;
  final int dues;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: search,
                onChanged: onQuery,
                decoration: const InputDecoration(
                  hintText: 'Search name, phone or member code',
                  prefixIcon: Icon(Icons.search, size: 19),
                  isDense: true,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            for (final filter in filters)
              GestureDetector(
                onTap: () => onStatus(filter),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: filter == status ? ForgeColors.red.withValues(alpha: 0.14) : ForgeColors.ink2,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: filter == status ? ForgeColors.red : ForgeColors.line),
                  ),
                  child: Text(
                    filter.toUpperCase(),
                    style: ForgeTheme.mono(
                      9,
                      color: filter == status ? ForgeColors.bone : ForgeColors.mute,
                      letterSpacing: 1.1,
                      weight: filter == status ? FontWeight.w700 : FontWeight.w500,
                    ),
                  ),
                ),
              ),
            const SizedBox(width: 4),
            Text('$count shown · $dues with dues', style: ForgeTheme.mono(9, letterSpacing: 0.5)),
          ],
        ),
      ],
    );
  }
}

class _MemberCard extends StatelessWidget {
  const _MemberCard({required this.member, required this.onTap, this.trainerRow});

  final Member member;
  final VoidCallback onTap;
  final TrainerMember? trainerRow;

  @override
  Widget build(BuildContext context) {
    final statusColor = StatusPill.colorFor(member.status);
    return ForgeCard(
      onTap: onTap,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              AvatarCircle(name: member.name, size: 42),
              const SizedBox(width: 11),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      member.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: ForgeTheme.body(14, weight: FontWeight.w700, color: ForgeColors.bone),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${member.memberCode} · ${member.phone}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: ForgeTheme.mono(9, letterSpacing: 0.3),
                    ),
                  ],
                ),
              ),
              StatusPill(label: member.status, dense: true),
            ],
          ),
          const SizedBox(height: 13),
          Row(
            children: [
              _Mini(label: 'PLAN', value: member.planName),
              _Mini(label: 'ENDS', value: shortDay(member.expiryDate)),
              _Mini(
                label: 'DUES',
                value: inr(member.feeDue),
                color: member.feeDue > 0 ? ForgeColors.amber : ForgeColors.green,
              ),
            ],
          ),
          const SizedBox(height: 11),
          ClipRRect(
            borderRadius: BorderRadius.circular(99),
            child: LinearProgressIndicator(
              value: (member.daysLeft.clamp(0, 60)) / 60,
              minHeight: 3,
              backgroundColor: ForgeColors.line,
              valueColor: AlwaysStoppedAnimation(statusColor),
            ),
          ),
          const SizedBox(height: 7),
          Row(
            children: [
              Expanded(
                child: Text(
                  relDays(member.daysLeft),
                  style: ForgeTheme.body(10.5, color: member.daysLeft < 7 ? ForgeColors.amber : ForgeColors.mute),
                ),
              ),
              if (trainerRow?.lastCheckin != null)
                Text(
                  'LAST VISIT ${shortDay(trainerRow!.lastCheckin).toUpperCase()}',
                  style: ForgeTheme.mono(8, letterSpacing: 0.8),
                )
              else
                Text(
                  member.trainerName == null || member.trainerName!.isEmpty
                      ? 'NO TRAINER'
                      : member.trainerName!.toUpperCase(),
                  style: ForgeTheme.mono(8, letterSpacing: 0.8),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Mini extends StatelessWidget {
  const _Mini({required this.label, required this.value, this.color});

  final String label;
  final String value;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: ForgeTheme.mono(7.5, letterSpacing: 1.1)),
          const SizedBox(height: 2),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: ForgeTheme.body(11, weight: FontWeight.w600, color: color ?? ForgeColors.boneDim),
          ),
        ],
      ),
    );
  }
}
