import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/renew_sheet.dart';
import '../ui/widgets.dart';
import 'member_detail_screen.dart';

class RenewalsScreen extends StatefulWidget {
  const RenewalsScreen({super.key});

  @override
  State<RenewalsScreen> createState() => _RenewalsScreenState();
}

class _RenewalsScreenState extends State<RenewalsScreen> {
  late Future<RenewalsData> _future;
  String _tab = 'Expiring';

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<RenewalsData> _load() => context.read<AppState>().api.renewals();

  void _reload() {
    setState(() {
      _future = _load();
    });
  }

  Future<void> _renew(Member member) async {
    final saved = await showRenewSheet(context, member);
    if (saved && mounted) {
      _reload();
      showSnack(context, '${firstName(member.name)} is renewed.');
    }
  }

  Future<void> _open(Member member) async {
    final changed = await Navigator.of(
      context,
    ).push<bool>(MaterialPageRoute(builder: (_) => MemberDetailScreen(memberId: member.id)));
    if (changed == true && mounted) _reload();
  }

  Future<void> _remind(Member member) async {
    try {
      final draft = await context.read<AppState>().api.sendMessage({
        'template': 'renewal',
        'memberId': member.id,
        'send': false,
      });
      if (!mounted) return;
      final ok = await showConfirm(
        context,
        title: 'Send a renewal reminder?',
        message: '${draft['message']}\n\n${draft['note'] ?? ''}',
        confirmLabel: 'Send',
      );
      if (!ok || !mounted) return;
      await context.read<AppState>().api.sendMessage({'template': 'renewal', 'memberId': member.id, 'send': true});
      if (mounted) showSnack(context, 'Reminder handed to WhatsApp.');
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final whatsapp = context.watch<AppState>().session?.gym.addon('whatsapp') ?? false;
    return ForgePage(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            eyebrow: 'Retention',
            title: 'Renewals.',
            subtitle: 'Memberships nearing the end, and the ones that already slipped.',
            actions: [IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19))],
          ),
          const SizedBox(height: 16),
          FutureBuilder<RenewalsData>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const ForgeLoading(label: 'Checking expiry dates');
              }
              if (snapshot.hasError) return ErrorPanel(error: snapshot.error!, onRetry: _reload);
              final data = snapshot.data;
              if (data == null) return ErrorPanel(error: 'No renewals returned.', onRetry: _reload);
              final rows = _tab == 'Expiring' ? data.expiring : data.lapsed;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ResponsiveGrid(
                    minItemWidth: 200,
                    children: [
                      StatCard(
                        label: 'Expiring in 14 days',
                        value: '${data.expiring.length}',
                        sub: 'worth a call',
                        icon: Icons.update,
                        accent: ForgeColors.amber,
                      ),
                      StatCard(
                        label: 'Lapsed recently',
                        value: '${data.lapsed.length}',
                        sub: 'last 45 days',
                        icon: Icons.trending_down,
                        accent: ForgeColors.redHi,
                      ),
                      StatCard(
                        label: 'Value at risk',
                        value: inr([...data.expiring, ...data.lapsed].fold<int>(0, (sum, m) => sum + m.planPrice)),
                        sub: 'plan fees up for renewal',
                        icon: Icons.account_balance_wallet_outlined,
                        accent: ForgeColors.violet,
                      ),
                      StatCard(
                        label: 'Renewal rate',
                        value:
                            '${data.expiring.isEmpty && data.lapsed.isEmpty ? 100 : ((data.expiring.length / (data.expiring.length + data.lapsed.length)) * 100).round()}%',
                        sub: 'currently live',
                        icon: Icons.percent,
                        accent: ForgeColors.green,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  _TabBar(
                    tab: _tab,
                    expiring: data.expiring.length,
                    lapsed: data.lapsed.length,
                    onChanged: (value) => setState(() => _tab = value),
                  ),
                  const SizedBox(height: 14),
                  if (rows.isEmpty)
                    EmptyPanel(
                      title: _tab == 'Expiring' ? 'No renewals due' : 'Nobody lapsed',
                      message: _tab == 'Expiring'
                          ? 'Nothing ends in the next two weeks.'
                          : 'No membership ended in the last 45 days.',
                      icon: Icons.verified_outlined,
                    )
                  else
                    ForgeCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SectionHeader(
                            title: _tab == 'Expiring' ? 'Ending soon' : 'Lapsed members',
                            trailing: StatusPill(
                              label: '${rows.length}',
                              color: _tab == 'Expiring' ? ForgeColors.amber : ForgeColors.redHi,
                              dense: true,
                            ),
                          ),
                          const SizedBox(height: 12),
                          for (final member in rows)
                            Padding(
                              padding: const EdgeInsets.only(bottom: 11),
                              child: Row(
                                children: [
                                  AvatarCircle(name: member.name, size: 38),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          member.name,
                                          style: ForgeTheme.body(13, weight: FontWeight.w600, color: ForgeColors.bone),
                                        ),
                                        Text(
                                          '${member.planName} · ${relDays(member.daysLeft)} · ${inr(member.planPrice)}',
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: ForgeTheme.body(10.5, color: ForgeColors.mute),
                                        ),
                                      ],
                                    ),
                                  ),
                                  StatusPill(label: member.status, dense: true),
                                  const SizedBox(width: 8),
                                  if (whatsapp)
                                    IconButton(
                                      tooltip: 'WhatsApp reminder',
                                      onPressed: () => _remind(member),
                                      icon: const Icon(Icons.chat_bubble_outline, size: 17),
                                    ),
                                  TextButton(onPressed: () => _open(member), child: const Text('Open')),
                                  const SizedBox(width: 4),
                                  FilledButton(onPressed: () => _renew(member), child: const Text('Renew')),
                                ],
                              ),
                            ),
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

class _TabBar extends StatelessWidget {
  const _TabBar({required this.tab, required this.expiring, required this.lapsed, required this.onChanged});

  final String tab;
  final int expiring;
  final int lapsed;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final tabs = [('Expiring', '$expiring ending soon'), ('Lapsed', '$lapsed recently expired')];
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: ForgeColors.ink2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: ForgeColors.line),
      ),
      child: Row(
        children: [
          for (final t in tabs)
            Expanded(
              child: GestureDetector(
                onTap: () => onChanged(t.$1),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 9),
                  decoration: BoxDecoration(
                    color: tab == t.$1 ? ForgeColors.panelHi : Colors.transparent,
                    borderRadius: BorderRadius.circular(9),
                  ),
                  child: Column(
                    children: [
                      Text(
                        t.$1.toUpperCase(),
                        style: ForgeTheme.mono(
                          9,
                          letterSpacing: 1.2,
                          color: tab == t.$1 ? ForgeColors.bone : ForgeColors.mute,
                        ),
                      ),
                      Text(t.$2, style: ForgeTheme.body(9.5, color: ForgeColors.mute)),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
