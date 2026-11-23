import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/widgets.dart';

class AddonsScreen extends StatefulWidget {
  const AddonsScreen({super.key});

  @override
  State<AddonsScreen> createState() => _AddonsScreenState();
}

class _AddonsScreenState extends State<AddonsScreen> {
  late Future<AddonsData> _future;
  String? _busyKey;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<AddonsData> _load() => context.read<AppState>().api.addons();

  void _reload() {
    setState(() {
      _future = _load();
    });
  }

  Future<void> _toggle(String key, bool enabled) async {
    setState(() => _busyKey = key);
    try {
      await context.read<AppState>().api.setAddon(key, enabled);
      if (mounted) {
        _reload();
        showSnack(context, '${_AddonMeta.of(key).name} ${enabled ? 'switched on' : 'switched off'}.');
      }
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    } finally {
      if (mounted) setState(() => _busyKey = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AppState>().session?.user;
    final isOwner = user?.isOwner ?? false;
    return ForgePage(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            eyebrow: 'Plug-ins',
            title: 'Add-ons.',
            subtitle: 'Optional extras for this gym. Switch one on and it appears for the right people.',
            actions: [IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19))],
          ),
          const SizedBox(height: 16),
          FutureBuilder<AddonsData>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const ForgeLoading(label: 'Loading add-ons');
              }
              if (snapshot.hasError) return ErrorPanel(error: snapshot.error!, onRetry: _reload);
              final data = snapshot.data;
              if (data == null) return ErrorPanel(error: 'No add-on data returned.', onRetry: _reload);
              final enabledCount = _AddonMeta.all.where((meta) => data.addons[meta.key] == true).length;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ResponsiveGrid(
                    minItemWidth: 210,
                    children: [
                      StatCard(
                        label: 'Switched on',
                        value: '$enabledCount',
                        sub: 'of ${_AddonMeta.all.length} add-ons',
                        icon: Icons.extension_outlined,
                        accent: ForgeColors.green,
                      ),
                      StatCard(
                        label: 'WhatsApp',
                        value: _provider(data.providers['whatsapp']) ? 'Connected' : 'Simulated',
                        sub: str(data.providers['whatsappFrom'], 'No sending number yet'),
                        icon: Icons.chat_outlined,
                        accent: _provider(data.providers['whatsapp']) ? ForgeColors.green : ForgeColors.amber,
                      ),
                      StatCard(
                        label: 'Payments',
                        value: _provider(data.providers['payments']) ? 'Connected' : 'Practice',
                        sub: _provider(data.providers['payments'])
                            ? 'Links open test checkout'
                            : 'Links open a practice page',
                        icon: Icons.credit_card,
                        accent: _provider(data.providers['payments']) ? ForgeColors.green : ForgeColors.blue,
                      ),
                      StatCard(
                        label: 'Recent actions',
                        value: '${data.activity.length}',
                        sub: 'messages, links, autopay',
                        icon: Icons.history,
                        accent: ForgeColors.violet,
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  if (!isOwner)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(
                        'Only the owner can switch add-ons on or off. You can still use the ones that are on.',
                        style: ForgeTheme.body(11.5, color: ForgeColors.mute),
                      ),
                    ),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final columns = (constraints.maxWidth / 340).floor().clamp(1, 3);
                      final width = (constraints.maxWidth - 12 * (columns - 1)) / columns;
                      return Wrap(
                        spacing: 12,
                        runSpacing: 12,
                        children: [
                          for (final meta in _AddonMeta.all)
                            SizedBox(
                              width: width,
                              child: _AddonCard(
                                meta: meta,
                                enabled: data.addons[meta.key] ?? false,
                                canToggle: isOwner,
                                busy: _busyKey == meta.key,
                                onChanged: (value) => _toggle(meta.key, value),
                              ),
                            ),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 20),
                  ForgeCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SectionHeader(
                          title: 'Recent add-on activity',
                          subtitle: 'Every message, payment link and Autopay change is kept here.',
                          trailing: StatusPill(label: '${data.activity.length}', color: ForgeColors.mute),
                        ),
                        const SizedBox(height: 12),
                        if (data.activity.isEmpty)
                          const EmptyPanel(
                            title: 'Nothing yet',
                            message: 'Messages and payment links will appear here as your team uses them.',
                            icon: Icons.history,
                          )
                        else
                          for (final entry in data.activity) _ActivityRow(entry: entry),
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

bool _provider(dynamic value) => value == true || (value is String && value.isNotEmpty && value != 'false');

class _AddonMeta {
  const _AddonMeta(this.key, this.name, this.blurb, this.icon, this.color);

  final String key;
  final String name;
  final String blurb;
  final IconData icon;
  final Color color;

  static const all = [
    _AddonMeta(
      'whatsapp',
      'WhatsApp updates',
      'Draft renewal, dues and welcome messages for members. Sending is simulated until a number is connected.',
      Icons.chat_outlined,
      ForgeColors.green,
    ),
    _AddonMeta(
      'upiLinks',
      'Payment links',
      'Create a single-use UPI link so a member can pay a due from home, without calling the desk.',
      Icons.link,
      ForgeColors.blue,
    ),
    _AddonMeta(
      'autopay',
      'Autopay',
      'Ask a member to approve automatic renewals in their own portal. The gym can request, never approve.',
      Icons.autorenew,
      ForgeColors.violet,
    ),
    _AddonMeta(
      'leadFollowup',
      'Lead follow-up',
      'One-tap WhatsApp messages for enquiries, trial visits and members who went quiet.',
      Icons.person_search_outlined,
      ForgeColors.amber,
    ),
    _AddonMeta(
      'trainerPlus',
      'Trainer Plus',
      'Ready-made workout templates your trainers can apply to a member in one tap.',
      Icons.fitness_center,
      ForgeColors.redHi,
    ),
  ];

  static _AddonMeta of(String key) => all.firstWhere((meta) => meta.key == key, orElse: () => all.first);
}

class _AddonCard extends StatelessWidget {
  const _AddonCard({
    required this.meta,
    required this.enabled,
    required this.canToggle,
    required this.busy,
    required this.onChanged,
  });

  final _AddonMeta meta;
  final bool enabled;
  final bool canToggle;
  final bool busy;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      padding: const EdgeInsets.all(17),
      accent: enabled ? meta.color : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: (enabled ? meta.color : ForgeColors.mute).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(11),
                  border: Border.all(color: (enabled ? meta.color : ForgeColors.mute).withValues(alpha: 0.3)),
                ),
                child: Icon(meta.icon, size: 20, color: enabled ? meta.color : ForgeColors.mute),
              ),
              const SizedBox(width: 11),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      meta.name,
                      style: ForgeTheme.body(13.5, weight: FontWeight.w700, color: ForgeColors.bone),
                    ),
                    const SizedBox(height: 3),
                    StatusPill(
                      label: enabled ? 'on' : 'off',
                      color: enabled ? ForgeColors.green : ForgeColors.mute,
                      dense: true,
                    ),
                  ],
                ),
              ),
              if (busy)
                const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
              else
                Switch(value: enabled, onChanged: canToggle ? onChanged : null),
            ],
          ),
          const SizedBox(height: 12),
          Text(meta.blurb, style: ForgeTheme.body(11.5, color: ForgeColors.mute, height: 1.5)),
        ],
      ),
    );
  }
}

class _ActivityRow extends StatelessWidget {
  const _ActivityRow({required this.entry});

  final ActionLog entry;

  @override
  Widget build(BuildContext context) {
    final tone = switch (entry.kind) {
      'whatsapp' => ForgeColors.green,
      'upi_link' => ForgeColors.blue,
      'autopay' => ForgeColors.violet,
      _ => ForgeColors.amber,
    };
    final icon = switch (entry.kind) {
      'whatsapp' => Icons.chat_outlined,
      'upi_link' => Icons.link,
      'autopay' => Icons.autorenew,
      _ => Icons.bolt_outlined,
    };
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            margin: const EdgeInsets.only(top: 1),
            decoration: BoxDecoration(
              color: tone.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(9),
              border: Border.all(color: tone.withValues(alpha: 0.25)),
            ),
            child: Icon(icon, size: 16, color: tone),
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        entry.title,
                        style: ForgeTheme.body(12.5, weight: FontWeight.w600, color: ForgeColors.bone),
                      ),
                    ),
                    if (entry.status.isNotEmpty) StatusPill(label: entry.status, dense: true),
                  ],
                ),
                if (entry.detail.isNotEmpty) ...[
                  const SizedBox(height: 3),
                  Text(
                    entry.detail,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: ForgeTheme.body(10.5, color: ForgeColors.mute),
                  ),
                ],
                const SizedBox(height: 3),
                Row(
                  children: [
                    Text(stampLabel(entry.createdAt), style: ForgeTheme.mono(8.5, letterSpacing: 0.4)),
                    if (entry.amount != null) ...[
                      const SizedBox(width: 10),
                      Text(
                        inr(entry.amount),
                        style: ForgeTheme.mono(8.5, color: ForgeColors.boneDim, letterSpacing: 0.4),
                      ),
                    ],
                    if (entry.simulated) ...[
                      const SizedBox(width: 10),
                      Text('SIMULATED', style: ForgeTheme.mono(7.5, color: ForgeColors.amber, letterSpacing: 0.8)),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
