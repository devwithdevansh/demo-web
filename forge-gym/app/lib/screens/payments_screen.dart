import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/payment_sheet.dart';
import '../ui/widgets.dart';

class PaymentsScreen extends StatefulWidget {
  const PaymentsScreen({super.key});

  @override
  State<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends State<PaymentsScreen> {
  late Future<PaymentsData> _future;
  String _tab = 'Recent';
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<PaymentsData> _load() => context.read<AppState>().api.payments();

  void _reload() {
    setState(() {
      _future = _load();
    });
  }

  Future<void> _recordPayment({Member? member, List<Member>? members}) async {
    final saved = await showRecordPaymentSheet(context, preselected: member, members: members);
    if (saved && mounted) {
      _reload();
      showSnack(context, 'Payment recorded.');
    }
  }

  Future<void> _openLink(Member member) async {
    setState(() => _busy = true);
    final saved = await showForgeSheet<bool>(
      context: context,
      title: 'Payment link',
      child: _LinkSheet(member: member),
    );
    if (mounted) setState(() => _busy = false);
    if (saved == true && mounted) {
      _reload();
      showSnack(context, 'Payment link resolved.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return ForgePage(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            eyebrow: 'Money',
            title: 'Payments.',
            subtitle: 'Fees collected, dues outstanding and links for people paying from home.',
            actions: [
              IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19)),
              FilledButton.icon(
                onPressed: _busy ? null : () => _recordPayment(),
                icon: const Icon(Icons.payments_outlined, size: 17),
                label: const Text('Record payment'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          FutureBuilder<PaymentsData>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const ForgeLoading(label: 'Loading money');
              }
              if (snapshot.hasError) return ErrorPanel(error: snapshot.error!, onRetry: _reload);
              final data = snapshot.data;
              if (data == null) return ErrorPanel(error: 'No payment data returned.', onRetry: _reload);
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ResponsiveGrid(
                    minItemWidth: 210,
                    children: [
                      StatCard(
                        label: 'Collected today',
                        value: inr(data.today),
                        sub: 'front desk and links',
                        icon: Icons.today_outlined,
                        accent: ForgeColors.green,
                      ),
                      StatCard(
                        label: 'This month',
                        value: data.month == null ? 'Owner only' : inr(data.month),
                        sub: data.month == null ? 'Front desk sees the day total' : 'all methods',
                        icon: Icons.calendar_month_outlined,
                        accent: ForgeColors.blue,
                      ),
                      StatCard(
                        label: 'Outstanding dues',
                        value: inr(data.duesTotal),
                        sub: '${data.dues.length} member${data.dues.length == 1 ? '' : 's'}',
                        icon: Icons.account_balance_wallet_outlined,
                        accent: ForgeColors.redHi,
                      ),
                      StatCard(
                        label: 'Receipts shown',
                        value: '${data.payments.length}',
                        sub: 'most recent first',
                        icon: Icons.receipt_long_outlined,
                        accent: ForgeColors.violet,
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  _Tabs(tab: _tab, dues: data.dues.length, onChanged: (value) => setState(() => _tab = value)),
                  const SizedBox(height: 14),
                  if (_tab == 'Dues')
                    _DuesPanel(
                      dues: data.dues,
                      onCollect: (member) => _recordPayment(member: member),
                      onLink: _openLink,
                      onMessage: (member) => _message(context, member),
                    )
                  else
                    _RecentPanel(payments: data.payments),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Future<void> _message(BuildContext context, Member member) async {
    final gym = context.read<AppState>().session?.gym;
    if (gym?.addon('whatsapp') != true) {
      showSnack(context, 'WhatsApp is not switched on for this gym.', error: true);
      return;
    }
    try {
      final draft = await context.read<AppState>().api.sendMessage({
        'template': 'dues',
        'memberId': member.id,
        'send': false,
      });
      if (!context.mounted) return;
      final ok = await showConfirm(
        context,
        title: 'Send a dues reminder?',
        message: '${draft['message']}\n\n${draft['note'] ?? ''}',
        confirmLabel: 'Send',
      );
      if (!ok || !context.mounted) return;
      await context.read<AppState>().api.sendMessage({'template': 'dues', 'memberId': member.id, 'send': true});
      if (context.mounted) showSnack(context, 'Reminder handed to WhatsApp.');
    } catch (err) {
      if (context.mounted) showSnack(context, '$err', error: true);
    }
  }
}

class _Tabs extends StatelessWidget {
  const _Tabs({required this.tab, required this.dues, required this.onChanged});

  final String tab;
  final int dues;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final tabs = [('Recent', 'Receipts'), ('Dues', '$dues outstanding')];
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

class _RecentPanel extends StatelessWidget {
  const _RecentPanel({required this.payments});

  final List<Payment> payments;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(title: 'Recent receipts'),
          const SizedBox(height: 12),
          if (payments.isEmpty)
            const EmptyPanel(
              title: 'No payments yet',
              message: 'Fees collected at the desk will show here.',
              icon: Icons.receipt_long_outlined,
            )
          else
            for (final payment in payments)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Row(
                  children: [
                    Container(
                      width: 34,
                      height: 34,
                      decoration: BoxDecoration(
                        color: ForgeColors.green.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(9),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        titleCase(payment.method).substring(0, 1),
                        style: ForgeTheme.display(17, color: ForgeColors.green),
                      ),
                    ),
                    const SizedBox(width: 11),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            payment.memberName.isEmpty ? 'Member' : payment.memberName,
                            style: ForgeTheme.body(12.5, weight: FontWeight.w600, color: ForgeColors.bone),
                          ),
                          Text(
                            '${titleCase(payment.method)} · ${dayLabel(payment.paidOn)}${payment.note.isEmpty ? '' : ' · ${payment.note}'}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: ForgeTheme.body(10.5, color: ForgeColors.mute),
                          ),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          inr(payment.amount),
                          style: ForgeTheme.body(13, weight: FontWeight.w700, color: ForgeColors.bone),
                        ),
                        if (payment.simulated)
                          Text('SIMULATED', style: ForgeTheme.mono(7.5, color: ForgeColors.mute, letterSpacing: 0.8))
                        else
                          Text(
                            payment.recordedBy.toUpperCase(),
                            style: ForgeTheme.mono(7.5, color: ForgeColors.mute, letterSpacing: 0.5),
                          ),
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

class _DuesPanel extends StatelessWidget {
  const _DuesPanel({required this.dues, required this.onCollect, required this.onLink, required this.onMessage});

  final List<Member> dues;
  final ValueChanged<Member> onCollect;
  final ValueChanged<Member> onLink;
  final ValueChanged<Member> onMessage;

  @override
  Widget build(BuildContext context) {
    if (dues.isEmpty) {
      return const EmptyPanel(
        title: 'Nothing outstanding',
        message: 'Every member is paid up. Nice.',
        icon: Icons.verified_outlined,
      );
    }
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(
            title: 'Members with dues',
            trailing: StatusPill(label: inr(dues.fold<int>(0, (sum, m) => sum + m.feeDue)), color: ForgeColors.amber),
          ),
          const SizedBox(height: 12),
          for (final member in dues)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                children: [
                  AvatarCircle(name: member.name, size: 36),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          member.name,
                          style: ForgeTheme.body(12.5, weight: FontWeight.w600, color: ForgeColors.bone),
                        ),
                        Text(
                          '${member.memberCode} · ${member.phone} · ${member.planName}',
                          style: ForgeTheme.body(10, color: ForgeColors.mute),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  Text(inr(member.feeDue), style: ForgeTheme.display(19, color: ForgeColors.amber)),
                  const SizedBox(width: 8),
                  FilledButton(onPressed: () => onCollect(member), child: const Text('Collect')),
                  PopupMenuButton<String>(
                    tooltip: 'More',
                    onSelected: (value) {
                      if (value == 'link') onLink(member);
                      if (value == 'message') onMessage(member);
                    },
                    itemBuilder: (_) => const [
                      PopupMenuItem(value: 'link', child: Text('Create payment link')),
                      PopupMenuItem(value: 'message', child: Text('Send WhatsApp reminder')),
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

class _LinkSheet extends StatefulWidget {
  const _LinkSheet({required this.member});

  final Member member;

  @override
  State<_LinkSheet> createState() => _LinkSheetState();
}

class _LinkSheetState extends State<_LinkSheet> {
  late final TextEditingController _amount = TextEditingController(text: '${widget.member.feeDue}');
  PaymentLink? _link;
  String? _token;
  bool _busy = false;
  bool _resolving = false;
  String? _error;

  @override
  void dispose() {
    _amount.dispose();
    super.dispose();
  }

  Future<void> _create() async {
    final amount = int.tryParse(_amount.text.trim()) ?? 0;
    if (amount <= 0) {
      setState(() => _error = 'Enter an amount to collect.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final result = await context.read<AppState>().api.createPaymentLink({
        'memberId': widget.member.id,
        'amount': amount,
      });
      final token = str(result['token']);
      if (!mounted) return;
      final link = await context.read<AppState>().api.paymentLink(token);
      if (mounted) {
        setState(() {
          _token = token;
          _link = link;
        });
      }
    } catch (err) {
      if (mounted) setState(() => _error = '$err');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _resolve(String outcome) async {
    if (_token == null) return;
    setState(() {
      _resolving = true;
      _error = null;
    });
    try {
      final result = await context.read<AppState>().api.resolvePaymentLink(_token!, outcome);
      if (mounted) {
        setState(() => _link = result);
        if (outcome == 'success') Navigator.pop(context, true);
      }
    } catch (err) {
      if (mounted) setState(() => _error = '$err');
    } finally {
      if (mounted) setState(() => _resolving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final link = _link;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'A link the member can pay from home. The link is single use and belongs to this gym only.',
          style: ForgeTheme.body(12, color: ForgeColors.mute),
        ),
        if (_error != null) ...[
          const SizedBox(height: 10),
          Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
        ],
        const SizedBox(height: 15),
        if (link == null) ...[
          ForgeField(
            label: 'Amount (₹)',
            child: TextField(
              controller: _amount,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(hintText: '${widget.member.feeDue}'),
            ),
          ),
          const SizedBox(height: 16),
          LoadingButton(label: 'Create payment link', icon: Icons.link, loading: _busy, onPressed: _create),
        ] else ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: ForgeColors.ink2,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: ForgeColors.line),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(link.gymName.toUpperCase(), style: ForgeTheme.mono(9, letterSpacing: 1.4)),
                const SizedBox(height: 6),
                Text(link.payer, style: ForgeTheme.body(12.5, color: ForgeColors.boneDim)),
                const SizedBox(height: 4),
                Text(inr(link.amount), style: ForgeTheme.display(34)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    StatusPill(label: link.status),
                    const SizedBox(width: 8),
                    if (link.simulated) const StatusPill(label: 'simulated', color: ForgeColors.mute, dense: true),
                    if (link.gateway != null) StatusPill(label: link.gateway!, color: ForgeColors.violet, dense: true),
                  ],
                ),
                const SizedBox(height: 12),
                SelectableText('forge://pay/${_token ?? ''}', style: ForgeTheme.mono(8.5, color: ForgeColors.mute)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Text(
            link.simulated
                ? 'No payment provider is connected, so this is a practice page. Mark it paid to record a simulated UPI receipt.'
                : 'This link is connected to a payment provider. Send it to the member to complete payment.',
            style: ForgeTheme.body(11, color: ForgeColors.mute),
          ),
          if (link.status == 'pending') ...[
            const SizedBox(height: 15),
            Row(
              children: [
                Expanded(
                  child: LoadingButton(
                    label: 'Mark paid',
                    icon: Icons.check,
                    loading: _resolving,
                    onPressed: () => _resolve('success'),
                  ),
                ),
                const SizedBox(width: 9),
                Expanded(
                  child: OutlinedButton(
                    onPressed: _resolving ? null : () => _resolve('failure'),
                    child: const Text('Mark failed'),
                  ),
                ),
              ],
            ),
          ] else ...[
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.pop(context, link.status == 'paid'),
                child: const Text('Done'),
              ),
            ),
          ],
        ],
      ],
    );
  }
}
