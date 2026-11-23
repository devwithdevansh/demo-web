import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/payment_sheet.dart';
import '../ui/renew_sheet.dart';
import '../ui/widgets.dart';
import 'coach_member_screen.dart';
import 'member_form.dart';

class MemberDetailScreen extends StatefulWidget {
  const MemberDetailScreen({super.key, required this.memberId});

  final String memberId;

  @override
  State<MemberDetailScreen> createState() => _MemberDetailScreenState();
}

class _MemberDetailScreenState extends State<MemberDetailScreen> {
  late Future<MemberDetailData> _future;
  bool _changed = false;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<MemberDetailData> _load() => context.read<AppState>().api.member(widget.memberId);

  void _reload() {
    setState(() {
      _future = _load();
    });
  }

  Future<void> _recordPayment(Member member) async {
    final saved = await showRecordPaymentSheet(context, preselected: member);
    if (saved && mounted) {
      _changed = true;
      _reload();
      showSnack(context, 'Payment recorded for ${member.name}.');
    }
  }

  Future<void> _renew(Member member) async {
    final saved = await showRenewSheet(context, member);
    if (saved && mounted) {
      _changed = true;
      _reload();
      showSnack(context, 'Membership extended.');
    }
  }

  Future<void> _edit(Member member) async {
    final saved = await Navigator.of(
      context,
    ).push<bool>(MaterialPageRoute(builder: (_) => MemberFormScreen(member: member)));
    if (saved == true && mounted) {
      _changed = true;
      _reload();
    }
  }

  Future<void> _showPass(Member member) async {
    await showDialog<void>(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: ForgeColors.panel,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 380),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    const ForgeLogo(size: 30),
                    const Spacer(),
                    IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close, size: 19)),
                  ],
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                  child: QrImageView(
                    data: member.memberCode,
                    version: QrVersions.auto,
                    size: 210,
                    backgroundColor: Colors.white,
                    eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: ForgeColors.ink),
                    dataModuleStyle: const QrDataModuleStyle(
                      dataModuleShape: QrDataModuleShape.square,
                      color: ForgeColors.ink,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text(member.memberCode, style: ForgeTheme.display(28, letterSpacing: 2)),
                const SizedBox(height: 3),
                Text(member.name.toUpperCase(), style: ForgeTheme.mono(9, letterSpacing: 1.6)),
                const SizedBox(height: 14),
                Text(
                  'The front desk scans this pass to check them in. It only contains their member code.',
                  textAlign: TextAlign.center,
                  style: ForgeTheme.body(11, color: ForgeColors.mute),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () async {
                    await Clipboard.setData(ClipboardData(text: member.memberCode));
                    if (context.mounted) showSnack(context, 'Member code copied.');
                  },
                  icon: const Icon(Icons.copy, size: 15),
                  label: const Text('Copy member code'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _openMessage(Member member) async {
    final sent = await showForgeSheet<bool>(
      context: context,
      title: 'WhatsApp ${firstName(member.name)}',
      child: _MessageSheet(member: member),
    );
    if (sent == true && mounted) showSnack(context, 'Message handled.');
  }

  Future<void> _requestAutopay(Member member) async {
    final ok = await showConfirm(
      context,
      title: 'Ask for Autopay?',
      message: '${member.name} will see the request in their member app. Nothing is charged until they approve it.',
      confirmLabel: 'Send request',
    );
    if (!ok) return;
    if (!mounted) return;
    try {
      await context.read<AppState>().api.requestAutopay(member.id);
      if (mounted) {
        _reload();
        showSnack(context, 'Autopay request sent to ${firstName(member.name)}.');
      }
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final gym = context.watch<AppState>().session?.gym;
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) Navigator.of(context).pop(_changed);
      },
      child: ForgeBackground(
        child: Scaffold(
          backgroundColor: Colors.transparent,
          appBar: AppBar(
            backgroundColor: Colors.transparent,
            surfaceTintColor: Colors.transparent,
            title: Text('Member record', style: ForgeTheme.body(14, weight: FontWeight.w600)),
            actions: [
              IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19)),
              const SizedBox(width: 6),
            ],
          ),
          body: FutureBuilder<MemberDetailData>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const Center(child: ForgeLoading(label: 'Opening record'));
              }
              if (snapshot.hasError) {
                return ForgePage(
                  child: ErrorPanel(error: snapshot.error!, onRetry: _reload),
                );
              }
              final data = snapshot.data;
              if (data == null) {
                return ForgePage(
                  child: ErrorPanel(error: 'No record returned.', onRetry: _reload),
                );
              }
              final member = data.member;
              return ForgePage(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _Hero(
                      member: member,
                      onPass: () => _showPass(member),
                      onRenew: () => _renew(member),
                      onPay: () => _recordPayment(member),
                      onEdit: () => _edit(member),
                      onMessage: () => _openMessage(member),
                      showMessage: gym?.addon('whatsapp') ?? false,
                    ),
                    const SizedBox(height: 16),
                    LayoutBuilder(
                      builder: (context, constraints) {
                        final wide = constraints.maxWidth >= 980;
                        final left = Column(
                          children: [
                            _DetailsCard(member: member),
                            const SizedBox(height: 14),
                            _TrainingCard(member: member),
                          ],
                        );
                        final right = Column(
                          children: [
                            _MoneyCard(
                              member: member,
                              onPay: () => _recordPayment(member),
                              onRenew: () => _renew(member),
                              onAutopay: () => _requestAutopay(member),
                              autopayAddon: gym?.addon('autopay') ?? false,
                            ),
                            const SizedBox(height: 14),
                            _VisitsCard(data: data),
                          ],
                        );
                        if (!wide) return Column(children: [left, const SizedBox(height: 14), right]);
                        return Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(flex: 6, child: left),
                            const SizedBox(width: 14),
                            Expanded(flex: 5, child: right),
                          ],
                        );
                      },
                    ),
                    const SizedBox(height: 14),
                    _PaymentsCard(payments: data.payments),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}

class _Hero extends StatelessWidget {
  const _Hero({
    required this.member,
    required this.onPass,
    required this.onRenew,
    required this.onPay,
    required this.onEdit,
    required this.onMessage,
    required this.showMessage,
  });

  final Member member;
  final VoidCallback onPass;
  final VoidCallback onRenew;
  final VoidCallback onPay;
  final VoidCallback onEdit;
  final VoidCallback onMessage;
  final bool showMessage;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [ForgeColors.panelHi, ForgeColors.redDeep.withValues(alpha: 0.22)],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: ForgeColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AvatarCircle(name: member.name, size: 58),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(member.name, style: ForgeTheme.display(30, letterSpacing: 0.4)),
                        StatusPill(label: member.status),
                        if (member.autopayStatus == 'active')
                          const StatusPill(label: 'autopay', color: ForgeColors.green, dense: true),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${member.memberCode} Â· ${member.phone}${member.email.isEmpty ? '' : ' Â· ${member.email}'}',
                      style: ForgeTheme.body(12, color: ForgeColors.mute),
                    ),
                    const SizedBox(height: 7),
                    Wrap(
                      spacing: 8,
                      runSpacing: 6,
                      children: [
                        StatusPill(label: member.category, color: ForgeColors.blue, dense: true),
                        if (member.trainerName != null && member.trainerName!.isNotEmpty)
                          StatusPill(label: 'Coach Â· ${member.trainerName}', color: ForgeColors.violet, dense: true),
                        if (member.hasAppAccess)
                          const StatusPill(label: 'app access', color: ForgeColors.green, dense: true),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 9,
            runSpacing: 9,
            children: [
              FilledButton.icon(
                onPressed: onRenew,
                icon: const Icon(Icons.update, size: 17),
                label: const Text('Renew'),
              ),
              OutlinedButton.icon(
                onPressed: onPay,
                icon: const Icon(Icons.payments_outlined, size: 16),
                label: const Text('Collect'),
              ),
              OutlinedButton.icon(
                onPressed: onPass,
                icon: const Icon(Icons.qr_code_2, size: 16),
                label: const Text('QR pass'),
              ),
              OutlinedButton.icon(
                onPressed: onEdit,
                icon: const Icon(Icons.edit_outlined, size: 16),
                label: const Text('Edit'),
              ),
              if (showMessage)
                OutlinedButton.icon(
                  onPressed: onMessage,
                  icon: const Icon(Icons.chat_bubble_outline, size: 16),
                  label: const Text('WhatsApp'),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _DetailsCard extends StatelessWidget {
  const _DetailsCard({required this.member});

  final Member member;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(title: 'Membership'),
          const SizedBox(height: 10),
          InfoRow(label: 'Plan', value: member.planName),
          InfoRow(label: 'Plan fee', value: inr(member.planPrice)),
          InfoRow(label: 'Started', value: dayLabel(member.startDate)),
          InfoRow(
            label: 'Expires',
            value: dayLabel(member.expiryDate),
            valueColor: member.daysLeft < 7 ? ForgeColors.amber : null,
          ),
          InfoRow(label: 'Remaining', value: relDays(member.daysLeft)),
          InfoRow(label: 'Member since', value: member.createdAt.isEmpty ? 'â€”' : dayLabel(member.createdAt)),
          if (member.notes.isNotEmpty) ...[
            const Divider(height: 24),
            Text('STAFF NOTES', style: ForgeTheme.mono(9, letterSpacing: 1.3)),
            const SizedBox(height: 5),
            Text(member.notes, style: ForgeTheme.body(12, color: ForgeColors.boneDim)),
          ],
        ],
      ),
    );
  }
}

class _TrainingCard extends StatelessWidget {
  const _TrainingCard({required this.member});

  final Member member;

  @override
  Widget build(BuildContext context) {
    final workout = member.workout;
    final diet = member.diet;
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const SectionHeader(title: 'Coaching & Timetable'),
              TextButton.icon(
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => CoachMemberScreen(memberId: member.id)),
                ),
                icon: const Icon(Icons.edit_calendar_outlined, size: 14),
                label: const Text('Open Coaching'),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _Slot(
                  label: 'PT PACK',
                  value: member.ptTotal == 0 ? 'None' : '${member.ptLeft} of ${member.ptTotal} left',
                  icon: Icons.timer_outlined,
                  color: ForgeColors.green,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _Slot(
                  label: 'WORKOUT',
                  value: workout == null || workout.days.isEmpty ? 'Not set' : workout.title,
                  icon: Icons.fitness_center,
                  color: ForgeColors.blue,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _Slot(
                  label: 'DIET',
                  value: diet == null || diet.meals.isEmpty ? 'Not set' : diet.title,
                  icon: Icons.restaurant_menu,
                  color: ForgeColors.amber,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _Slot(
                  label: 'AUTOPAY',
                  value: titleCase(member.autopayStatus),
                  icon: Icons.autorenew,
                  color: member.autopayStatus == 'active' ? ForgeColors.green : ForgeColors.mute,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Slot extends StatelessWidget {
  const _Slot({required this.label, required this.value, required this.icon, required this.color});

  final String label;
  final String value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: ForgeColors.ink2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: ForgeColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: color),
              const SizedBox(width: 6),
              Text(label, style: ForgeTheme.mono(8, letterSpacing: 1.2)),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: ForgeTheme.body(11.5, weight: FontWeight.w600, color: ForgeColors.bone),
          ),
        ],
      ),
    );
  }
}

class _MoneyCard extends StatelessWidget {
  const _MoneyCard({
    required this.member,
    required this.onPay,
    required this.onRenew,
    required this.onAutopay,
    required this.autopayAddon,
  });

  final Member member;
  final VoidCallback onPay;
  final VoidCallback onRenew;
  final VoidCallback onAutopay;
  final bool autopayAddon;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(title: 'Account'),
          const SizedBox(height: 12),
          Text(
            inr(member.feeDue),
            style: ForgeTheme.display(34, color: member.feeDue > 0 ? ForgeColors.amber : ForgeColors.green),
          ),
          Text('OUTSTANDING', style: ForgeTheme.mono(9, letterSpacing: 1.5)),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: onPay,
                  icon: const Icon(Icons.payments_outlined, size: 16),
                  label: const Text('Collect'),
                ),
              ),
              const SizedBox(width: 9),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onRenew,
                  icon: const Icon(Icons.update, size: 16),
                  label: const Text('Renew'),
                ),
              ),
            ],
          ),
          if (autopayAddon && member.autopayStatus != 'active') ...[
            const SizedBox(height: 9),
            SizedBox(
              width: double.infinity,
              child: TextButton.icon(
                onPressed: member.autopayStatus == 'requested' ? null : onAutopay,
                icon: const Icon(Icons.autorenew, size: 16),
                label: Text(member.autopayStatus == 'requested' ? 'Autopay requested' : 'Ask for Autopay'),
              ),
            ),
          ],
          const Divider(height: 26),
          InfoRow(label: 'Autopay', value: titleCase(member.autopayStatus)),
          InfoRow(label: 'Mandate', value: member.autopayAmount == 0 ? 'â€”' : inr(member.autopayAmount)),
        ],
      ),
    );
  }
}

class _VisitsCard extends StatelessWidget {
  const _VisitsCard({required this.data});

  final MemberDetailData data;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(
            title: 'Last 30 days',
            trailing: StatusPill(label: '${data.visits.length} visits', color: ForgeColors.green, dense: true),
          ),
          const SizedBox(height: 12),
          if (data.visits.isEmpty)
            const EmptyPanel(
              title: 'No visits in 30 days',
              message: 'The front desk log will appear here.',
              icon: Icons.event_busy,
            )
          else
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                for (final day in data.visits.take(30))
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                    decoration: BoxDecoration(
                      color: ForgeColors.ink2,
                      borderRadius: BorderRadius.circular(7),
                      border: Border.all(color: ForgeColors.line),
                    ),
                    child: Text(shortDay(day), style: ForgeTheme.mono(8.5, color: ForgeColors.boneDim)),
                  ),
              ],
            ),
        ],
      ),
    );
  }
}

class _PaymentsCard extends StatelessWidget {
  const _PaymentsCard({required this.payments});

  final List<Payment> payments;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(title: 'Fee history'),
          const SizedBox(height: 10),
          if (payments.isEmpty)
            const EmptyPanel(
              title: 'No payments yet',
              message: 'Collected fees are listed here.',
              icon: Icons.receipt_long_outlined,
            )
          else
            for (final payment in payments)
              Padding(
                padding: const EdgeInsets.only(bottom: 9),
                child: Row(
                  children: [
                    Container(
                      width: 30,
                      height: 30,
                      decoration: BoxDecoration(
                        color: ForgeColors.green.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.south_west, size: 14, color: ForgeColors.green),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            inr(payment.amount),
                            style: ForgeTheme.body(12.5, weight: FontWeight.w600, color: ForgeColors.bone),
                          ),
                          Text(
                            '${titleCase(payment.method)} Â· ${shortDay(payment.paidOn)}${payment.note.isEmpty ? '' : ' Â· ${payment.note}'}',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: ForgeTheme.body(10.5, color: ForgeColors.mute),
                          ),
                        ],
                      ),
                    ),
                    if (payment.simulated) const StatusPill(label: 'simulated', dense: true),
                  ],
                ),
              ),
        ],
      ),
    );
  }
}

class _MessageSheet extends StatefulWidget {
  const _MessageSheet({required this.member});

  final Member member;

  @override
  State<_MessageSheet> createState() => _MessageSheetState();
}

class _MessageSheetState extends State<_MessageSheet> {
  String _template = 'renewal';
  Map<String, dynamic>? _preview;
  bool _busy = false;
  bool _sending = false;
  String? _error;

  static const _templates = [
    ('renewal', 'Renewal reminder'),
    ('dues', 'Payment reminder'),
    ('welcome', 'Welcome message'),
  ];

  @override
  void initState() {
    super.initState();
    _draft();
  }

  Future<void> _draft() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final result = await context.read<AppState>().api.sendMessage({
        'template': _template,
        'memberId': widget.member.id,
        'send': false,
      });
      if (mounted) setState(() => _preview = result);
    } catch (err) {
      if (mounted) setState(() => _error = '$err');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _send() async {
    setState(() {
      _sending = true;
      _error = null;
    });
    try {
      await context.read<AppState>().api.sendMessage({
        'template': _template,
        'memberId': widget.member.id,
        'send': true,
      });
      if (mounted) {
        Navigator.pop(context, true);
        showSnack(context, 'WhatsApp message handed to the provider.');
      }
    } catch (err) {
      if (mounted) setState(() => _error = '$err');
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final message = str(_preview?['message']);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ForgeField(
          label: 'Template',
          child: ChoiceRow<(String, String)>(
            values: _templates,
            selected: _templates.firstWhere((t) => t.$1 == _template),
            label: (t) => t.$2,
            onSelected: (t) {
              setState(() {
                _template = t.$1;
                _preview = null;
              });
              _draft();
            },
          ),
        ),
        const SizedBox(height: 16),
        if (_error != null) ...[
          Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
          const SizedBox(height: 10),
        ],
        if (_busy)
          const ForgeLoading(label: 'Drafting message')
        else if (message.isNotEmpty) ...[
          Text('DRAFT', style: ForgeTheme.mono(9, letterSpacing: 1.4)),
          const SizedBox(height: 7),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: ForgeColors.ink2,
              borderRadius: BorderRadius.circular(13),
              border: Border.all(color: ForgeColors.line),
            ),
            child: Text(message, style: ForgeTheme.body(12.5, color: ForgeColors.boneDim, height: 1.5)),
          ),
          const SizedBox(height: 10),
          Text(
            str(_preview?['note'], 'No provider is connected, so this is recorded as simulated.'),
            style: ForgeTheme.mono(9, color: ForgeColors.mute, letterSpacing: 0.3),
          ),
          const SizedBox(height: 8),
          Text('TO Â· ${str(_preview?['to'], widget.member.phone)}', style: ForgeTheme.mono(9, letterSpacing: 1)),
        ],
        const SizedBox(height: 18),
        LoadingButton(
          label: 'Send on WhatsApp',
          icon: Icons.send_outlined,
          loading: _sending,
          onPressed: message.isEmpty ? null : _send,
        ),
      ],
    );
  }
}
