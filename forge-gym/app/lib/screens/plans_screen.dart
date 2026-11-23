import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/widgets.dart';

class PlansScreen extends StatefulWidget {
  const PlansScreen({super.key});

  @override
  State<PlansScreen> createState() => _PlansScreenState();
}

class _PlansScreenState extends State<PlansScreen> {
  late Future<List<Plan>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List<Plan>> _load() => context.read<AppState>().api.plans();

  void _reload() {
    setState(() {
      _future = _load();
    });
  }

  Future<void> _edit({Plan? plan}) async {
    final saved = await showForgeSheet<bool>(
      context: context,
      title: plan == null ? 'New plan' : 'Edit ${plan.name}',
      child: _PlanSheet(plan: plan),
    );
    if (saved == true && mounted) {
      _reload();
      showSnack(context, plan == null ? 'Plan added.' : 'Plan updated.');
    }
  }

  Future<void> _toggle(Plan plan) async {
    try {
      await context.read<AppState>().api.updatePlan(plan.id, {'active': !plan.active});
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
            eyebrow: 'Products',
            title: 'Membership plans.',
            subtitle: 'What the desk can sell. Prices are in whole rupees.',
            actions: [
              IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19)),
              if (isOwner)
                FilledButton.icon(
                  onPressed: () => _edit(),
                  icon: const Icon(Icons.add, size: 17),
                  label: const Text('New plan'),
                ),
            ],
          ),
          const SizedBox(height: 16),
          FutureBuilder<List<Plan>>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const ForgeLoading(label: 'Loading plans');
              }
              if (snapshot.hasError) return ErrorPanel(error: snapshot.error!, onRetry: _reload);
              final plans = snapshot.data ?? const <Plan>[];
              if (plans.isEmpty) {
                return EmptyPanel(
                  title: 'No plans yet',
                  message: isOwner
                      ? 'Add your first plan to start selling memberships.'
                      : 'The owner has not added any plans yet.',
                  icon: Icons.card_membership,
                  action: isOwner ? FilledButton(onPressed: () => _edit(), child: const Text('Add a plan')) : null,
                );
              }
              return LayoutBuilder(
                builder: (context, constraints) {
                  final columns = (constraints.maxWidth / 290).floor().clamp(1, 4);
                  final width = (constraints.maxWidth - 12 * (columns - 1)) / columns;
                  return Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      for (final plan in plans)
                        SizedBox(
                          width: width,
                          child: ForgeCard(
                            padding: const EdgeInsets.all(18),
                            accent: plan.active ? null : ForgeColors.mute,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    StatusPill(label: plan.active ? 'active' : 'paused', dense: true),
                                    const Spacer(),
                                    if (isOwner)
                                      PopupMenuButton<String>(
                                        tooltip: 'Plan actions',
                                        icon: const Icon(Icons.more_horiz, size: 18, color: ForgeColors.mute),
                                        onSelected: (value) {
                                          if (value == 'edit') _edit(plan: plan);
                                          if (value == 'toggle') _toggle(plan);
                                        },
                                        itemBuilder: (_) => [
                                          const PopupMenuItem(value: 'edit', child: Text('Edit plan')),
                                          PopupMenuItem(
                                            value: 'toggle',
                                            child: Text(plan.active ? 'Pause plan' : 'Reactivate plan'),
                                          ),
                                        ],
                                      ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  plan.name,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: ForgeTheme.display(23, height: 1.05),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  inr(plan.price),
                                  style: ForgeTheme.display(
                                    36,
                                    color: plan.active ? ForgeColors.bone : ForgeColors.mute,
                                  ),
                                ),
                                Text(
                                  'for ${durationLabel(plan.durationMonths, plan.durationDays)}',
                                  style: ForgeTheme.mono(9, letterSpacing: 0.6),
                                ),
                                const SizedBox(height: 14),
                                Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        plan.active ? 'Available at the desk' : 'Hidden from new sign-ups',
                                        style: ForgeTheme.body(10.5, color: ForgeColors.mute),
                                      ),
                                    ),
                                    if (isOwner) Switch(value: plan.active, onChanged: (_) => _toggle(plan)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                    ],
                  );
                },
              );
            },
          ),
          const SizedBox(height: 20),
          ForgeCard(
            child: Row(
              children: [
                const Icon(Icons.info_outline, size: 18, color: ForgeColors.mute),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Renewals use the plan selected on the member record. A link is not a subscription: the member pays only when they choose to.',
                    style: ForgeTheme.body(11.5, color: ForgeColors.mute),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PlanSheet extends StatefulWidget {
  const _PlanSheet({this.plan});

  final Plan? plan;

  @override
  State<_PlanSheet> createState() => _PlanSheetState();
}

class _PlanSheetState extends State<_PlanSheet> {
  late final TextEditingController _name = TextEditingController(text: widget.plan?.name ?? '');
  late final TextEditingController _price = TextEditingController(
    text: widget.plan == null ? '' : '${widget.plan!.price}',
  );
  late final TextEditingController _months = TextEditingController(
    text: widget.plan == null ? '1' : '${widget.plan!.durationMonths}',
  );
  late final TextEditingController _days = TextEditingController(
    text: widget.plan?.durationDays == null ? '' : '${widget.plan!.durationDays}',
  );
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    _price.dispose();
    _months.dispose();
    _days.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final name = _name.text.trim();
    final price = int.tryParse(_price.text.trim());
    final months = int.tryParse(_months.text.trim()) ?? 0;
    final days = int.tryParse(_days.text.trim());
    if (name.length < 2) {
      setState(() => _error = 'Enter a plan name.');
      return;
    }
    if (price == null || price < 0) {
      setState(() => _error = 'Enter the price in whole rupees.');
      return;
    }
    if (months == 0 && (days == null || days <= 0)) {
      setState(() => _error = 'Set how long the plan lasts: months or days.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    final body = <String, dynamic>{
      'name': name,
      'price': price,
      'durationMonths': months,
      'durationDays': days != null && days > 0 ? days : null,
    };
    try {
      final api = context.read<AppState>().api;
      if (widget.plan == null) {
        await api.createPlan(body);
      } else {
        await api.updatePlan(widget.plan!.id, body);
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
        if (_error != null) ...[
          Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
          const SizedBox(height: 10),
        ],
        ForgeField(
          label: 'Plan name',
          child: TextField(
            controller: _name,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(hintText: 'e.g. Quarterly Fitness'),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Price (₹)',
          child: TextField(
            controller: _price,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(hintText: '4000'),
          ),
        ),
        const SizedBox(height: 13),
        Row(
          children: [
            Expanded(
              child: ForgeField(
                label: 'Duration (months)',
                hint: 'Use 0 if this is a short day-based plan.',
                child: TextField(
                  controller: _months,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(hintText: '3'),
                ),
              ),
            ),
            const SizedBox(width: 11),
            Expanded(
              child: ForgeField(
                label: 'Or duration (days)',
                hint: 'Overrides months when set.',
                child: TextField(
                  controller: _days,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(hintText: 'e.g. 14'),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 18),
        LoadingButton(label: widget.plan == null ? 'Add plan' : 'Save plan', loading: _busy, onPressed: _save),
      ],
    );
  }
}
