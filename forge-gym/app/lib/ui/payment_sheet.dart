import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/widgets.dart';

const payMethods = [('cash', 'Cash'), ('upi', 'UPI'), ('card', 'Card'), ('bank', 'Bank transfer')];

Future<bool> showRecordPaymentSheet(BuildContext context, {Member? preselected, List<Member>? members}) async {
  final result = await showForgeSheet<bool>(
    context: context,
    title: 'Record a payment',
    maxWidth: 520,
    child: _PaymentForm(preselected: preselected, members: members),
  );
  return result ?? false;
}

class _PaymentForm extends StatefulWidget {
  const _PaymentForm({this.preselected, this.members});

  final Member? preselected;
  final List<Member>? members;

  @override
  State<_PaymentForm> createState() => _PaymentFormState();
}

class _PaymentFormState extends State<_PaymentForm> {
  late List<Member> _members;
  Member? _member;
  final _amount = TextEditingController();
  final _note = TextEditingController();
  String _method = 'cash';
  bool _loading = true;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _member = widget.preselected;
    _members = widget.members ?? const [];
    if (_member != null) _amount.text = '${_member!.feeDue > 0 ? _member!.feeDue : _member!.planPrice}';
    if (_members.isEmpty) {
      _load();
    } else {
      _loading = false;
    }
  }

  Future<void> _load() async {
    try {
      final rows = await context.read<AppState>().api.members();
      if (!mounted) return;
      setState(() {
        _members = rows;
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _amount.dispose();
    _note.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final amount = int.tryParse(_amount.text.trim()) ?? 0;
    if (_member == null || amount <= 0) {
      setState(() => _error = 'Choose a member and enter the amount received.');
      return;
    }
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await context.read<AppState>().api.recordPayment({
        'memberId': _member!.id,
        'amount': amount,
        'method': _method,
        if (_note.text.trim().isNotEmpty) 'note': _note.text.trim(),
      });
      if (mounted) Navigator.pop(context, true);
    } catch (err) {
      if (mounted) setState(() => _error = err.toString());
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const ForgeLoading(label: 'Loading members');
    final dues = _members.where((m) => m.feeDue > 0).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Money received against a member. Their dues are reduced automatically.',
          style: ForgeTheme.body(12, color: ForgeColors.mute),
        ),
        if (_error != null) ...[
          const SizedBox(height: 10),
          Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
        ],
        const SizedBox(height: 16),
        ForgeField(
          label: 'Member',
          child: _MemberSelect(
            members: _members,
            selected: _member,
            onSelected: (member) {
              setState(() {
                _member = member;
                if (member.feeDue > 0) _amount.text = '${member.feeDue}';
              });
            },
          ),
        ),
        if (_member != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(
              '${_member!.memberCode} · ${_member!.planName} · dues ${inr(_member!.feeDue)}',
              style: ForgeTheme.mono(9.5, letterSpacing: 0.4),
            ),
          ),
        if (dues.isNotEmpty && _member == null) ...[
          const SizedBox(height: 12),
          Text('MEMBERS WITH DUES', style: ForgeTheme.mono(9, letterSpacing: 1.3)),
          const SizedBox(height: 7),
          Wrap(
            spacing: 7,
            runSpacing: 7,
            children: dues.take(6).map((m) {
              return GestureDetector(
                onTap: () {
                  setState(() {
                    _member = m;
                    _amount.text = '${m.feeDue}';
                  });
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                  decoration: BoxDecoration(
                    color: ForgeColors.ink2,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: ForgeColors.line),
                  ),
                  child: Text('${m.name} · ${inr(m.feeDue)}', style: ForgeTheme.body(10.5, color: ForgeColors.boneDim)),
                ),
              );
            }).toList(),
          ),
        ],
        const SizedBox(height: 16),
        ForgeField(
          label: 'Amount received (₹)',
          child: TextField(
            controller: _amount,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(hintText: '1500'),
          ),
        ),
        const SizedBox(height: 14),
        ForgeField(
          label: 'Method',
          child: ChoiceRow<(String, String)>(
            values: payMethods,
            selected: payMethods.firstWhere((m) => m.$1 == _method),
            label: (m) => m.$2,
            onSelected: (m) => setState(() => _method = m.$1),
          ),
        ),
        const SizedBox(height: 14),
        ForgeField(
          label: 'Note (optional)',
          child: TextField(
            controller: _note,
            decoration: const InputDecoration(hintText: 'Monthly fee, part payment…'),
          ),
        ),
        const SizedBox(height: 20),
        LoadingButton(
          label: 'Record ${_amount.text.trim().isEmpty ? 'payment' : inr(int.tryParse(_amount.text.trim()) ?? 0)}',
          loading: _saving,
          onPressed: _save,
        ),
      ],
    );
  }
}

class _MemberSelect extends StatelessWidget {
  const _MemberSelect({required this.members, required this.selected, required this.onSelected});

  final List<Member> members;
  final Member? selected;
  final ValueChanged<Member> onSelected;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: () async {
        final picked = await showForgeSheet<Member>(
          context: context,
          title: 'Choose a member',
          child: _MemberList(members: members),
        );
        if (picked != null) onSelected(picked);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: ForgeColors.ink2,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: ForgeColors.line),
        ),
        child: Row(
          children: [
            const Icon(Icons.search, size: 17, color: ForgeColors.mute),
            const SizedBox(width: 9),
            Expanded(
              child: Text(
                selected == null ? 'Search name, phone or member code' : '${selected!.name} · ${selected!.memberCode}',
                style: ForgeTheme.body(13, color: selected == null ? ForgeColors.mute : ForgeColors.bone),
              ),
            ),
            const Icon(Icons.unfold_more, size: 16, color: ForgeColors.mute),
          ],
        ),
      ),
    );
  }
}

class _MemberList extends StatefulWidget {
  const _MemberList({required this.members});

  final List<Member> members;

  @override
  State<_MemberList> createState() => _MemberListState();
}

class _MemberListState extends State<_MemberList> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final q = _query.toLowerCase();
    final rows = widget.members.where((m) {
      if (q.isEmpty) return true;
      return m.name.toLowerCase().contains(q) || m.phone.contains(q) || m.memberCode.toLowerCase().contains(q);
    }).toList();
    return Column(
      children: [
        TextField(
          autofocus: true,
          onChanged: (v) => setState(() => _query = v),
          decoration: const InputDecoration(hintText: 'Search members', prefixIcon: Icon(Icons.search, size: 18)),
        ),
        const SizedBox(height: 10),
        if (rows.isEmpty)
          const EmptyPanel(title: 'No member matches', icon: Icons.search_off)
        else
          for (final m in rows)
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: AvatarCircle(name: m.name, size: 36),
              title: Text(
                m.name,
                style: ForgeTheme.body(13, weight: FontWeight.w600, color: ForgeColors.bone),
              ),
              subtitle: Text(
                '${m.memberCode} · ${m.phone} · dues ${inr(m.feeDue)}',
                style: ForgeTheme.body(10.5, color: ForgeColors.mute),
              ),
              trailing: StatusPill(label: m.status, dense: true),
              onTap: () => Navigator.pop(context, m),
            ),
      ],
    );
  }
}
