import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import 'payment_sheet.dart';
import 'widgets.dart';

/// Renews a membership from today (or the running expiry) on the chosen plan.
/// Returns true when the renewal was saved.
Future<bool> showRenewSheet(BuildContext context, Member member) async {
  List<Plan> plans;
  try {
    plans = await context.read<AppState>().api.plans();
  } catch (err) {
    if (context.mounted) showSnack(context, '$err', error: true);
    return false;
  }
  if (!context.mounted) return false;
  final result = await showForgeSheet<bool>(
    context: context,
    title: 'Renew ${firstName(member.name)}\'s membership',
    child: RenewSheet(member: member, plans: plans),
  );
  return result ?? false;
}

class RenewSheet extends StatefulWidget {
  const RenewSheet({super.key, required this.member, required this.plans});

  final Member member;
  final List<Plan> plans;

  @override
  State<RenewSheet> createState() => _RenewSheetState();
}

class _RenewSheetState extends State<RenewSheet> {
  final _paid = TextEditingController();
  late String? _planId = widget.plans.any((p) => p.id == widget.member.planId)
      ? widget.member.planId
      : (widget.plans.isEmpty ? null : widget.plans.first.id);
  String _method = 'cash';
  bool _busy = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final plan = _selectedPlan;
    if (plan != null) _paid.text = '${plan.price}';
  }

  @override
  void dispose() {
    _paid.dispose();
    super.dispose();
  }

  Plan? get _selectedPlan {
    final found = widget.plans.where((p) => p.id == _planId).toList();
    return found.isEmpty ? null : found.first;
  }

  Future<void> _submit() async {
    if (_planId == null) {
      setState(() => _error = 'Choose the plan to renew on.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final paid = int.tryParse(_paid.text.trim()) ?? 0;
      await context.read<AppState>().api.renewMember(widget.member.id, {
        'planId': _planId,
        if (paid > 0) 'paidNow': paid,
        if (paid > 0) 'method': _method,
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
    final plan = _selectedPlan;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.member.daysLeft < 0
              ? 'This membership lapsed. The renewal starts from today.'
              : 'Extends from the current expiry, ${dayLabel(widget.member.expiryDate)}. The plan fee is added to their account.',
          style: ForgeTheme.body(12, color: ForgeColors.mute),
        ),
        if (_error != null) ...[
          const SizedBox(height: 9),
          Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
        ],
        const SizedBox(height: 16),
        ForgeField(
          label: 'Plan',
          child: Column(
            children: [
              for (final p in widget.plans)
                GestureDetector(
                  onTap: () => setState(() {
                    _planId = p.id;
                    _paid.text = '${p.price}';
                  }),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 7),
                    padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 12),
                    decoration: BoxDecoration(
                      color: p.id == _planId ? ForgeColors.red.withValues(alpha: 0.1) : ForgeColors.ink2,
                      borderRadius: BorderRadius.circular(11),
                      border: Border.all(color: p.id == _planId ? ForgeColors.red : ForgeColors.line),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(
                            p.name,
                            style: ForgeTheme.body(12.5, weight: FontWeight.w600, color: ForgeColors.bone),
                          ),
                        ),
                        Text(
                          '${inr(p.price)} · ${durationLabel(p.durationMonths, p.durationDays)}',
                          style: ForgeTheme.mono(9),
                        ),
                      ],
                    ),
                  ),
                ),
              if (widget.plans.isEmpty)
                const EmptyPanel(
                  title: 'No plans to renew on',
                  message: 'Add a plan first.',
                  icon: Icons.card_membership,
                ),
            ],
          ),
        ),
        if (plan != null)
          Padding(
            padding: const EdgeInsets.only(top: 3, bottom: 4),
            child: Text(
              'New expiry: ${dayLabel(_previewExpiry(plan))}',
              style: ForgeTheme.mono(9, color: ForgeColors.green, letterSpacing: 0.4),
            ),
          ),
        const SizedBox(height: 14),
        ForgeField(
          label: 'Collected now (optional)',
          child: TextField(
            controller: _paid,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(hintText: plan == null ? '0' : '${plan.price}'),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Method',
          child: ChoiceRow<(String, String)>(
            values: payMethods,
            selected: payMethods.firstWhere((m) => m.$1 == _method),
            label: (m) => m.$2,
            onSelected: (m) => setState(() => _method = m.$1),
          ),
        ),
        const SizedBox(height: 20),
        LoadingButton(
          label: 'Renew membership',
          icon: Icons.update,
          loading: _busy,
          onPressed: widget.plans.isEmpty ? null : _submit,
        ),
      ],
    );
  }

  String _previewExpiry(Plan plan) {
    final base = widget.member.daysLeft < 0 ? DateTime.now() : (parseDay(widget.member.expiryDate) ?? DateTime.now());
    final next = plan.durationDays != null && plan.durationDays! > 0
        ? base.add(Duration(days: plan.durationDays!))
        : DateTime(base.year, base.month + plan.durationMonths, base.day);
    return next.toIso8601String().substring(0, 10);
  }
}
