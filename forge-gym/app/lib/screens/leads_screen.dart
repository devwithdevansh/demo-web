import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/widgets.dart';

class LeadsScreen extends StatefulWidget {
  const LeadsScreen({super.key});

  @override
  State<LeadsScreen> createState() => _LeadsScreenState();
}

class _LeadsScreenState extends State<LeadsScreen> {
  late Future<Json> _future;
  String _status = 'All';

  static const _statuses = ['new', 'contacted', 'trial', 'joined', 'lost'];
  static const _sources = ['website', 'walk-in', 'referral', 'instagram', 'phone'];

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<Json> _load() => context.read<AppState>().api.leads();

  void _reload() {
    setState(() {
      _future = _load();
    });
  }

  Future<void> _edit({Lead? lead}) async {
    final saved = await showForgeSheet<bool>(
      context: context,
      title: lead == null ? 'New enquiry' : 'Edit ${firstName(lead.name)}',
      child: _LeadSheet(lead: lead, sources: _sources, statuses: _statuses),
    );
    if (saved == true && mounted) {
      _reload();
      showSnack(context, lead == null ? 'Enquiry added.' : 'Enquiry updated.');
    }
  }

  Future<void> _setStatus(Lead lead, String status) async {
    try {
      await context.read<AppState>().api.updateLead(lead.id, {'status': status});
      if (mounted) _reload();
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    }
  }

  Future<void> _call(String phone) async {
    final uri = Uri(scheme: 'tel', path: phone.replaceAll(RegExp(r'[^\d+]'), ''));
    if (!await launchUrl(uri)) {
      if (mounted) showSnack(context, 'Could not open the dialer.', error: true);
    }
  }

  Future<void> _whatsapp(Lead lead) async {
    try {
      final draft = await context.read<AppState>().api.sendMessage({
        'template': 'lead_followup',
        'leadId': lead.id,
        'send': false,
      });
      if (!mounted) return;
      final ok = await showConfirm(
        context,
        title: 'Send a follow-up?',
        message: '${draft['message']}\n\n${draft['note'] ?? ''}',
        confirmLabel: 'Send',
      );
      if (!ok || !mounted) return;
      await context.read<AppState>().api.sendMessage({'template': 'lead_followup', 'leadId': lead.id, 'send': true});
      if (mounted) showSnack(context, 'Follow-up handed to WhatsApp.');
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final whatsapp = context.watch<AppState>().session?.gym.addon('leadFollowup') ?? false;
    return ForgePage(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            eyebrow: 'Growth',
            title: 'Enquiries.',
            subtitle: 'Website leads and walk-ins, with the follow-up that turns them into members.',
            actions: [
              IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19)),
              FilledButton.icon(
                onPressed: () => _edit(),
                icon: const Icon(Icons.person_add_alt_1, size: 17),
                label: const Text('New enquiry'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          FutureBuilder<Json>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const ForgeLoading(label: 'Loading enquiries');
              }
              if (snapshot.hasError) return ErrorPanel(error: snapshot.error!, onRetry: _reload);
              final data = snapshot.data ?? <String, dynamic>{};
              final leads = asList(data['leads']).map(Lead.fromJson).toList();
              final today = str(data['today'], todayKey());
              final visible = _status == 'All' ? leads : leads.where((l) => l.status == _status).toList();
              final open = leads.where((l) => ['new', 'contacted', 'trial'].contains(l.status)).length;
              final due = leads
                  .where(
                    (l) =>
                        ['new', 'contacted', 'trial'].contains(l.status) &&
                        l.followUpOn.isNotEmpty &&
                        l.followUpOn.compareTo(today) <= 0,
                  )
                  .length;
              final joined = leads.where((l) => l.status == 'joined').length;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ResponsiveGrid(
                    minItemWidth: 190,
                    children: [
                      StatCard(
                        label: 'Open enquiries',
                        value: '$open',
                        sub: 'not joined or lost',
                        icon: Icons.person_search_outlined,
                        accent: ForgeColors.violet,
                      ),
                      StatCard(
                        label: 'Follow-ups due',
                        value: '$due',
                        sub: 'today or overdue',
                        icon: Icons.notifications_active_outlined,
                        accent: ForgeColors.amber,
                      ),
                      StatCard(
                        label: 'Joined',
                        value: '$joined',
                        sub: 'converted enquiries',
                        icon: Icons.check_circle_outline,
                        accent: ForgeColors.green,
                      ),
                      StatCard(
                        label: 'All enquiries',
                        value: '${leads.length}',
                        sub: 'in this gym',
                        icon: Icons.list_alt,
                        accent: ForgeColors.blue,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      for (final filter in ['All', ..._statuses])
                        GestureDetector(
                          onTap: () => setState(() => _status = filter),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: filter == _status ? ForgeColors.red.withValues(alpha: 0.14) : ForgeColors.ink2,
                              borderRadius: BorderRadius.circular(999),
                              border: Border.all(color: filter == _status ? ForgeColors.red : ForgeColors.line),
                            ),
                            child: Text(
                              filter.toUpperCase(),
                              style: ForgeTheme.mono(
                                9,
                                letterSpacing: 1.1,
                                color: filter == _status ? ForgeColors.bone : ForgeColors.mute,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  if (visible.isEmpty)
                    const EmptyPanel(
                      title: 'No enquiries here',
                      message: 'New website enquiries and walk-ins land in this list.',
                      icon: Icons.person_search_outlined,
                    )
                  else
                    LayoutBuilder(
                      builder: (context, constraints) {
                        final columns = (constraints.maxWidth / 360).floor().clamp(1, 3);
                        final width = (constraints.maxWidth - 12 * (columns - 1)) / columns;
                        return Wrap(
                          spacing: 12,
                          runSpacing: 12,
                          children: [
                            for (final lead in visible)
                              SizedBox(
                                width: width,
                                child: _LeadCard(
                                  lead: lead,
                                  overdue:
                                      lead.followUpOn.isNotEmpty &&
                                      lead.followUpOn.compareTo(today) <= 0 &&
                                      ['new', 'contacted', 'trial'].contains(lead.status),
                                  whatsapp: whatsapp,
                                  onCall: () => _call(lead.phone),
                                  onWhatsApp: () => _whatsapp(lead),
                                  onEdit: () => _edit(lead: lead),
                                  onStatus: (status) => _setStatus(lead, status),
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

class _LeadCard extends StatelessWidget {
  const _LeadCard({
    required this.lead,
    required this.overdue,
    required this.whatsapp,
    required this.onCall,
    required this.onWhatsApp,
    required this.onEdit,
    required this.onStatus,
  });

  final Lead lead;
  final bool overdue;
  final bool whatsapp;
  final VoidCallback onCall;
  final VoidCallback onWhatsApp;
  final VoidCallback onEdit;
  final ValueChanged<String> onStatus;

  static const _statuses = ['new', 'contacted', 'trial', 'joined', 'lost'];

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      padding: const EdgeInsets.all(16),
      accent: overdue ? ForgeColors.amber : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              AvatarCircle(name: lead.name, size: 40),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lead.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: ForgeTheme.body(14, weight: FontWeight.w700, color: ForgeColors.bone),
                    ),
                    Text('${lead.phone} · ${titleCase(lead.source)}', style: ForgeTheme.mono(9, letterSpacing: 0.3)),
                  ],
                ),
              ),
              PopupMenuButton<String>(
                tooltip: 'Change status',
                icon: const Icon(Icons.more_horiz, size: 18, color: ForgeColors.mute),
                onSelected: onStatus,
                itemBuilder: (_) => [
                  for (final status in _statuses)
                    PopupMenuItem(value: status, child: Text('Mark ${titleCase(status)}')),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 7,
            runSpacing: 7,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              StatusPill(label: lead.status, dense: true),
              if (lead.interest.isNotEmpty) StatusPill(label: lead.interest, color: ForgeColors.blue, dense: true),
              if (lead.followUpOn.isNotEmpty)
                StatusPill(
                  label: '${overdue ? 'Follow up' : 'Follow up'} ${shortDay(lead.followUpOn)}',
                  color: overdue ? ForgeColors.amber : ForgeColors.mute,
                  dense: true,
                ),
            ],
          ),
          if (lead.notes.isNotEmpty) ...[
            const SizedBox(height: 9),
            Text(
              lead.notes,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: ForgeTheme.body(11, color: ForgeColors.mute),
            ),
          ],
          const SizedBox(height: 12),
          Row(
            children: [
              IconButton.filledTonal(
                tooltip: 'Call',
                onPressed: onCall,
                icon: const Icon(Icons.call_outlined, size: 17),
              ),
              const SizedBox(width: 7),
              if (whatsapp)
                IconButton.filledTonal(
                  tooltip: 'WhatsApp follow-up',
                  onPressed: onWhatsApp,
                  icon: const Icon(Icons.chat_bubble_outline, size: 17),
                ),
              const Spacer(),
              TextButton.icon(
                onPressed: onEdit,
                icon: const Icon(Icons.edit_outlined, size: 15),
                label: const Text('Open'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _LeadSheet extends StatefulWidget {
  const _LeadSheet({this.lead, required this.sources, required this.statuses});

  final Lead? lead;
  final List<String> sources;
  final List<String> statuses;

  @override
  State<_LeadSheet> createState() => _LeadSheetState();
}

class _LeadSheetState extends State<_LeadSheet> {
  late final TextEditingController _name = TextEditingController(text: widget.lead?.name ?? '');
  late final TextEditingController _phone = TextEditingController(text: widget.lead?.phone ?? '');
  late final TextEditingController _interest = TextEditingController(text: widget.lead?.interest ?? '');
  late final TextEditingController _notes = TextEditingController(text: widget.lead?.notes ?? '');
  late String _source = widget.lead?.source ?? widget.sources.first;
  late String _status = widget.lead?.status ?? 'new';
  late String _followUp = widget.lead?.followUpOn ?? '';
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _interest.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: parseDay(_followUp) ?? DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) {
      setState(() => _followUp = picked.toIso8601String().substring(0, 10));
    }
  }

  Future<void> _save() async {
    if (_name.text.trim().length < 2 || _phone.text.trim().length < 8) {
      setState(() => _error = 'Enter a name and a valid phone number.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    final body = <String, dynamic>{
      'name': _name.text.trim(),
      'phone': _phone.text.trim(),
      'interest': _interest.text.trim(),
      'source': _source,
      'status': _status,
      'followUpOn': _followUp,
      'notes': _notes.text.trim(),
    };
    try {
      final api = context.read<AppState>().api;
      if (widget.lead == null) {
        await api.createLead(body);
      } else {
        await api.updateLead(widget.lead!.id, body);
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
          label: 'Name',
          child: TextField(
            controller: _name,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(hintText: 'Their name'),
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: ForgeField(
                label: 'Phone',
                child: TextField(
                  controller: _phone,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(hintText: '10-digit number'),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: ForgeField(
                label: 'Interested in',
                child: TextField(
                  controller: _interest,
                  decoration: const InputDecoration(hintText: 'e.g. weight loss'),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Source',
          child: ChoiceRow<String>(
            values: widget.sources,
            selected: _source,
            label: titleCase,
            onSelected: (v) => setState(() => _source = v),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Status',
          child: ChoiceRow<String>(
            values: widget.statuses,
            selected: _status,
            label: titleCase,
            onSelected: (v) => setState(() => _status = v),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Follow up on',
          child: InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap: _pickDate,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 15),
              decoration: BoxDecoration(
                color: ForgeColors.ink2,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: ForgeColors.line),
              ),
              child: Row(
                children: [
                  const Icon(Icons.event_outlined, size: 17, color: ForgeColors.mute),
                  const SizedBox(width: 9),
                  Expanded(
                    child: Text(
                      _followUp.isEmpty ? 'No date set' : dayLabel(_followUp),
                      style: ForgeTheme.body(13, color: _followUp.isEmpty ? ForgeColors.mute : ForgeColors.bone),
                    ),
                  ),
                  if (_followUp.isNotEmpty)
                    IconButton(
                      onPressed: () => setState(() => _followUp = ''),
                      icon: const Icon(Icons.close, size: 15, color: ForgeColors.mute),
                    )
                  else
                    const Icon(Icons.expand_more, size: 17, color: ForgeColors.mute),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Notes',
          child: TextField(
            controller: _notes,
            maxLines: 3,
            decoration: const InputDecoration(hintText: 'What did they say?'),
          ),
        ),
        const SizedBox(height: 18),
        LoadingButton(label: widget.lead == null ? 'Add enquiry' : 'Save enquiry', loading: _busy, onPressed: _save),
      ],
    );
  }
}
