import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/widgets.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  String _day = todayKey();
  late Future<AttendanceData> _future;
  bool _checkingIn = false;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<AttendanceData> _load() => context.read<AppState>().api.attendance(date: _day);

  void _reload() {
    setState(() {
      _future = _load();
    });
  }

  void _move(int days) {
    final current = parseDay(_day) ?? DateTime.now();
    final next = current.add(Duration(days: days));
    final key = next.toIso8601String().substring(0, 10);
    if (key.compareTo(todayKey()) > 0) return;
    setState(() {
      _day = key;
      _future = _load();
    });
  }

  Future<void> _checkIn(Member member) async {
    setState(() => _checkingIn = true);
    try {
      final result = await context.read<AppState>().api.checkIn({'memberId': member.id, 'method': 'manual'});
      final warning = result['warning'];
      if (mounted) {
        showSnack(context, warning == null ? '${member.name} checked in.' : '$warning', error: warning != null);
        _reload();
      }
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    } finally {
      if (mounted) setState(() => _checkingIn = false);
    }
  }

  Future<void> _scanPass(AttendanceData data) async {
    final saved = await showForgeSheet<bool>(
      context: context,
      title: 'Check in by pass code',
      child: const _CodeSheet(),
    );
    if (saved == true && mounted) {
      showSnack(context, 'Checked in successfully.');
      _reload();
    }
  }

  Future<void> _removeEntry(CheckinRow entry) async {
    final ok = await showConfirm(
      context,
      title: 'Remove check-in?',
      message: 'Remove ${entry.name} from ${dayLabel(_day)}. They can be checked in again afterwards.',
      confirmLabel: 'Remove',
      danger: true,
    );
    if (!ok) return;
    if (!mounted) return;
    try {
      await context.read<AppState>().api.removeCheckin(entry.id);
      if (mounted) _reload();
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    }
  }

  Future<void> _showGymCode(AttendanceData data) async {
    await showDialog<void>(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: ForgeColors.panel,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 390),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    const Expanded(child: SectionHeader(title: 'Gym check-in code')),
                    IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close, size: 19)),
                  ],
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                  child: QrImageView(
                    data: data.gymCheckinCode,
                    version: QrVersions.auto,
                    size: 220,
                    backgroundColor: Colors.white,
                    eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: ForgeColors.ink),
                    dataModuleStyle: const QrDataModuleStyle(
                      dataModuleShape: QrDataModuleShape.square,
                      color: ForgeColors.ink,
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                Text(data.gymName, style: ForgeTheme.display(24, letterSpacing: 0.4)),
                const SizedBox(height: 4),
                Text('PRINT AND PIN AT RECEPTION', style: ForgeTheme.mono(8.5, letterSpacing: 1.5)),
                const SizedBox(height: 12),
                Text(
                  'Members scan this from the member app to check themselves in. Keep it at the front desk, not online.',
                  textAlign: TextAlign.center,
                  style: ForgeTheme.body(11, color: ForgeColors.mute),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ForgePage(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            eyebrow: 'Front desk',
            title: 'Attendance.',
            subtitle: 'Check people in, or print the code members scan themselves.',
            actions: [IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19))],
          ),
          const SizedBox(height: 16),
          FutureBuilder<AttendanceData>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const ForgeLoading(label: 'Loading attendance');
              }
              if (snapshot.hasError) {
                return ErrorPanel(error: snapshot.error!, onRetry: _reload);
              }
              final data = snapshot.data;
              if (data == null) return ErrorPanel(error: 'No attendance returned.', onRetry: _reload);
              final expected = data.entries.length + data.notCheckedIn.length;
              final ratio = expected == 0 ? 0.0 : data.entries.length / expected;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _DayBar(
                    day: _day,
                    isToday: data.isToday,
                    onPrev: () => _move(-1),
                    onNext: data.isToday ? null : () => _move(1),
                    onToday: () => setState(() {
                      _day = todayKey();
                      _future = _load();
                    }),
                    onCode: () => _showGymCode(data),
                  ),
                  const SizedBox(height: 14),
                  ResponsiveGrid(
                    minItemWidth: 180,
                    children: [
                      StatCard(
                        label: 'Checked in',
                        value: '${data.entries.length}',
                        sub: data.isToday ? 'today' : 'on ${shortDay(data.day)}',
                        icon: Icons.how_to_reg_outlined,
                        accent: ForgeColors.green,
                      ),
                      StatCard(
                        label: 'Expected',
                        value: '$expected',
                        sub: 'active members',
                        icon: Icons.groups_2_outlined,
                        accent: ForgeColors.blue,
                      ),
                      StatCard(
                        label: 'Turnout',
                        value: '${(ratio * 100).round()}%',
                        sub: 'of active members',
                        icon: Icons.percent,
                        accent: ForgeColors.amber,
                      ),
                      StatCard(
                        label: 'Not in yet',
                        value: '${data.notCheckedIn.length}',
                        sub: data.isToday ? 'can still arrive' : 'missed that day',
                        icon: Icons.schedule,
                        accent: ForgeColors.violet,
                        onTap: data.isToday ? () => _openPicker(data) : null,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final wide = constraints.maxWidth >= 980;
                      final present = ForgeCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SectionHeader(
                              title: 'In the gym',
                              subtitle: data.isToday ? 'Live for today' : dayLabel(data.day),
                              trailing: StatusPill(
                                label: '${data.entries.length}',
                                color: ForgeColors.green,
                                dense: true,
                              ),
                            ),
                            const SizedBox(height: 12),
                            if (data.entries.isEmpty)
                              EmptyPanel(
                                title: 'Nobody checked in yet',
                                message: data.isToday
                                    ? 'Use the button below to check in the first arrival.'
                                    : 'No attendance was recorded on this day.',
                                icon: Icons.door_front_door_outlined,
                              )
                            else
                              for (final entry in data.entries)
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 8),
                                  child: Row(
                                    children: [
                                      AvatarCircle(name: entry.name, size: 34),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              entry.name,
                                              style: ForgeTheme.body(
                                                12.5,
                                                weight: FontWeight.w600,
                                                color: ForgeColors.bone,
                                              ),
                                            ),
                                            Text(
                                              '${entry.memberCode.isEmpty ? '—' : entry.memberCode} · ${titleCase(entry.method)}',
                                              style: ForgeTheme.body(10, color: ForgeColors.mute),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Text(entry.time, style: ForgeTheme.mono(9.5, color: ForgeColors.green)),
                                      IconButton(
                                        tooltip: 'Remove',
                                        onPressed: () => _removeEntry(entry),
                                        icon: const Icon(Icons.close, size: 15, color: ForgeColors.mute),
                                      ),
                                    ],
                                  ),
                                ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Expanded(
                                  child: FilledButton.icon(
                                    onPressed: data.isToday && !_checkingIn ? () => _openPicker(data) : null,
                                    icon: const Icon(Icons.add, size: 17),
                                    label: const Text('Check someone in'),
                                  ),
                                ),
                                const SizedBox(width: 9),
                                OutlinedButton.icon(
                                  onPressed: data.isToday ? () => _scanPass(data) : null,
                                  icon: const Icon(Icons.qr_code_scanner, size: 16),
                                  label: const Text('Pass'),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                      final expectedPanel = ForgeCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            SectionHeader(
                              title: data.isToday ? 'Not in yet' : 'Missed that day',
                              trailing: StatusPill(
                                label: '${data.notCheckedIn.length}',
                                color: ForgeColors.amber,
                                dense: true,
                              ),
                            ),
                            const SizedBox(height: 12),
                            if (data.notCheckedIn.isEmpty)
                              const EmptyPanel(
                                title: 'Everyone is in',
                                message: 'Every active member has been checked in.',
                                icon: Icons.verified_outlined,
                              )
                            else
                              for (final member in data.notCheckedIn.take(12))
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 7),
                                  child: Row(
                                    children: [
                                      AvatarCircle(name: member.name, size: 30),
                                      const SizedBox(width: 9),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              member.name,
                                              style: ForgeTheme.body(
                                                11.5,
                                                weight: FontWeight.w600,
                                                color: ForgeColors.boneDim,
                                              ),
                                            ),
                                            Text(
                                              '${member.memberCode} · ${relDays(member.daysLeft)}',
                                              style: ForgeTheme.body(9.5, color: ForgeColors.mute),
                                            ),
                                          ],
                                        ),
                                      ),
                                      if (data.isToday)
                                        TextButton(
                                          onPressed: _checkingIn ? null : () => _checkIn(member),
                                          child: const Text('IN'),
                                        )
                                      else
                                        StatusPill(label: member.status, dense: true),
                                    ],
                                  ),
                                ),
                          ],
                        ),
                      );
                      if (!wide) return Column(children: [present, const SizedBox(height: 14), expectedPanel]);
                      return Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(flex: 6, child: present),
                          const SizedBox(width: 14),
                          Expanded(flex: 5, child: expectedPanel),
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

  Future<void> _openPicker(AttendanceData data) async {
    final member = await showForgeSheet<Member>(
      context: context,
      title: 'Who is at the desk?',
      child: _MemberPicker(members: data.notCheckedIn),
    );
    if (member != null) await _checkIn(member);
  }
}

class _DayBar extends StatelessWidget {
  const _DayBar({
    required this.day,
    required this.isToday,
    required this.onPrev,
    required this.onNext,
    required this.onToday,
    required this.onCode,
  });

  final String day;
  final bool isToday;
  final VoidCallback onPrev;
  final VoidCallback? onNext;
  final VoidCallback onToday;
  final VoidCallback onCode;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      child: Row(
        children: [
          IconButton(
            constraints: const BoxConstraints(),
            padding: const EdgeInsets.all(6),
            onPressed: onPrev,
            icon: const Icon(Icons.chevron_left, size: 20),
          ),
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  isToday ? 'TODAY' : weekday(day).toUpperCase(),
                  style: ForgeTheme.mono(8.5, color: ForgeColors.redHi, letterSpacing: 1.4),
                ),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(dayLabel(day), style: ForgeTheme.display(20)),
                ),
              ],
            ),
          ),
          IconButton(
            constraints: const BoxConstraints(),
            padding: const EdgeInsets.all(6),
            onPressed: onNext,
            icon: const Icon(Icons.chevron_right, size: 20),
          ),
          const SizedBox(width: 4),
          if (!isToday) ...[
            TextButton(
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                minimumSize: const Size(40, 32),
              ),
              onPressed: onToday,
              child: const Text('Today'),
            ),
            const SizedBox(width: 4),
          ],
          OutlinedButton(
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              minimumSize: const Size(40, 32),
            ),
            onPressed: onCode,
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.qr_code_2, size: 14),
                SizedBox(width: 4),
                Text('Code'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MemberPicker extends StatefulWidget {
  const _MemberPicker({required this.members});

  final List<Member> members;

  @override
  State<_MemberPicker> createState() => _MemberPickerState();
}

class _MemberPickerState extends State<_MemberPicker> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final q = _query.trim().toLowerCase();
    final rows = widget.members.where((m) {
      if (q.isEmpty) return true;
      return m.name.toLowerCase().contains(q) || m.memberCode.toLowerCase().contains(q) || m.phone.contains(q);
    }).toList();
    return Column(
      children: [
        TextField(
          autofocus: true,
          onChanged: (v) => setState(() => _query = v),
          decoration: const InputDecoration(
            hintText: 'Search the people not in yet',
            prefixIcon: Icon(Icons.search, size: 18),
          ),
        ),
        const SizedBox(height: 10),
        if (rows.isEmpty)
          const EmptyPanel(title: 'Nobody matches', icon: Icons.search_off)
        else
          for (final member in rows)
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: AvatarCircle(name: member.name, size: 36),
              title: Text(
                member.name,
                style: ForgeTheme.body(13, weight: FontWeight.w600, color: ForgeColors.bone),
              ),
              subtitle: Text(
                '${member.memberCode} · ${member.phone} · ${relDays(member.daysLeft)}',
                style: ForgeTheme.body(10.5, color: ForgeColors.mute),
              ),
              trailing: StatusPill(label: member.status, dense: true),
              onTap: () => Navigator.pop(context, member),
            ),
      ],
    );
  }
}

class _CodeSheet extends StatefulWidget {
  const _CodeSheet();

  @override
  State<_CodeSheet> createState() => _CodeSheetState();
}

class _CodeSheetState extends State<_CodeSheet> {
  final _controller = TextEditingController();
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final code = _controller.text.trim().toUpperCase();
    if (code.isEmpty) {
      setState(() => _error = 'Enter the code printed under the QR.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await context.read<AppState>().api.checkIn({'memberCode': code, 'method': 'qr'});
      if (mounted) {
        Navigator.pop(context, true);
      }
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
          'Students\' passes carry their member code (for example IP-1001). Type it if the scanner is not available.',
          style: ForgeTheme.body(12, color: ForgeColors.mute),
        ),
        const SizedBox(height: 14),
        ForgeField(
          label: 'Member code',
          child: TextField(
            controller: _controller,
            autofocus: true,
            textCapitalization: TextCapitalization.characters,
            style: ForgeTheme.mono(15, color: ForgeColors.bone, letterSpacing: 1.5),
            decoration: const InputDecoration(hintText: 'IP-1001'),
            onSubmitted: (_) => _submit(),
          ),
        ),
        if (_error != null) ...[
          const SizedBox(height: 10),
          Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
        ],
        const SizedBox(height: 18),
        LoadingButton(label: 'Check in', icon: Icons.how_to_reg_outlined, loading: _busy, onPressed: _submit),
      ],
    );
  }
}
