import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/widgets.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  late final TextEditingController _keyField;
  String _key = '';
  Future<List<AdminGym>>? _future;
  bool _connecting = false;

  @override
  void initState() {
    super.initState();
    _key = context.read<AppState>().adminKey;
    _keyField = TextEditingController(text: _key);
    if (_key.isNotEmpty) _future = _load();
  }

  @override
  void dispose() {
    _keyField.dispose();
    super.dispose();
  }

  Future<List<AdminGym>> _load() => context.read<AppState>().api.adminGyms(_key);

  void _reload() {
    if (_key.isEmpty) return;
    setState(() {
      _future = _load();
    });
  }

  Future<void> _connect() async {
    final key = _keyField.text.trim();
    if (key.isEmpty) {
      showSnack(context, 'Paste the admin key from the server settings.', error: true);
      return;
    }
    setState(() => _connecting = true);
    try {
      await context.read<AppState>().api.adminGyms(key);
      if (!mounted) return;
      await context.read<AppState>().setAdminKey(key);
      if (!mounted) return;
      setState(() {
        _key = key;
        _future = _load();
      });
      showSnack(context, 'Admin key accepted.');
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    } finally {
      if (mounted) setState(() => _connecting = false);
    }
  }

  Future<void> _forgetKey() async {
    await context.read<AppState>().setAdminKey('');
    if (!mounted) return;
    setState(() {
      _key = '';
      _keyField.clear();
      _future = null;
    });
  }

  Future<void> _create() async {
    final result = await showForgeSheet<Json>(
      context: context,
      title: 'Create a live gym',
      maxWidth: 620,
      child: const _GymSheet(),
    );
    if (result == null || !mounted) return;
    _reload();
    final token = str(result['inviteToken']);
    if (token.isNotEmpty) await _showInvite(token, str(asMap(result['gym'])['name'], 'New gym'));
  }

  Future<void> _edit(AdminGym gym) async {
    final saved = await showForgeSheet<bool>(
      context: context,
      title: 'Edit ${gym.name}',
      maxWidth: 620,
      child: _GymSheet(gym: gym),
    );
    if (saved == true && mounted) _reload();
  }

  Future<void> _invite(AdminGym gym) async {
    try {
      final token = await context.read<AppState>().api.adminInvite(_key, gym.id);
      if (mounted) await _showInvite(token, gym.name);
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    }
  }

  Future<void> _delete(AdminGym gym) async {
    final ok = await showConfirm(
      context,
      title: 'Delete ${gym.name}?',
      message: 'This removes the gym, its owner, members, payments and every other record. It cannot be undone.',
      confirmLabel: 'Delete gym',
      danger: true,
    );
    if (!ok) return;
    if (!mounted) return;
    try {
      await context.read<AppState>().api.adminDeleteGym(_key, gym.id);
      if (mounted) {
        _reload();
        showSnack(context, '${gym.name} was removed.');
      }
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    }
  }

  Future<void> _showInvite(String token, String name) {
    return showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Activation link for $name', style: ForgeTheme.display(22)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'The owner opens the app, chooses "Activation link" on the sign-in screen, and pastes this token. It is valid for 7 days.',
              style: ForgeTheme.body(12, color: ForgeColors.mute),
            ),
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: ForgeColors.ink2,
                borderRadius: BorderRadius.circular(11),
                border: Border.all(color: ForgeColors.line),
              ),
              child: SelectableText(token, style: ForgeTheme.mono(9.5, color: ForgeColors.bone, letterSpacing: 0.3)),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
          FilledButton.icon(
            onPressed: () async {
              await Clipboard.setData(ClipboardData(text: token));
              if (context.mounted) Navigator.pop(context);
            },
            icon: const Icon(Icons.copy, size: 16),
            label: const Text('Copy token'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ForgeBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: ForgeColors.ink.withValues(alpha: 0.92),
          surfaceTintColor: Colors.transparent,
          elevation: 0,
          title: Row(
            children: [
              const Icon(Icons.admin_panel_settings_outlined, size: 19, color: ForgeColors.violet),
              const SizedBox(width: 9),
              Text('INSTALLATION ADMIN', style: ForgeTheme.mono(10, letterSpacing: 2)),
            ],
          ),
          actions: [
            if (_key.isNotEmpty) ...[
              IconButton(tooltip: 'Refresh', onPressed: _reload, icon: const Icon(Icons.refresh, size: 19)),
              IconButton(
                tooltip: 'Forget this key',
                onPressed: _forgetKey,
                icon: const Icon(Icons.lock_outline, size: 19),
              ),
              const SizedBox(width: 6),
            ],
          ],
        ),
        body: _key.isEmpty ? _KeyGate(field: _keyField, busy: _connecting, onConnect: _connect) : _content(),
      ),
    );
  }

  Widget _content() {
    return ForgePage(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PageHeader(
            eyebrow: 'This server',
            title: 'Live gyms.',
            subtitle:
                'Every non-demo gym running on this FORGE installation. Create one, invite its owner, or remove it.',
            actions: [
              FilledButton.icon(
                onPressed: _create,
                icon: const Icon(Icons.add_business_outlined, size: 17),
                label: const Text('New gym'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          FutureBuilder<List<AdminGym>>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const ForgeLoading(label: 'Loading gyms');
              }
              if (snapshot.hasError) {
                return Column(
                  children: [
                    ErrorPanel(error: snapshot.error!, onRetry: _reload),
                    OutlinedButton.icon(
                      onPressed: _forgetKey,
                      icon: const Icon(Icons.key_off, size: 16),
                      label: const Text('Use a different admin key'),
                    ),
                  ],
                );
              }
              final gyms = snapshot.data ?? const <AdminGym>[];
              final members = gyms.fold<int>(0, (sum, gym) => sum + gym.memberCount);
              final performance = gyms.where((gym) => gym.package == 'performance').length;
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ResponsiveGrid(
                    minItemWidth: 200,
                    children: [
                      StatCard(
                        label: 'Live gyms',
                        value: '${gyms.length}',
                        sub: 'demo sandboxes excluded',
                        icon: Icons.storefront_outlined,
                        accent: ForgeColors.violet,
                      ),
                      StatCard(
                        label: 'Members',
                        value: '$members',
                        sub: 'across every live gym',
                        icon: Icons.groups_2_outlined,
                        accent: ForgeColors.blue,
                      ),
                      StatCard(
                        label: 'Performance plan',
                        value: '$performance',
                        sub: '${gyms.length - performance} on growth',
                        icon: Icons.workspace_premium_outlined,
                        accent: ForgeColors.green,
                      ),
                      StatCard(
                        label: 'Need setup',
                        value: '${gyms.where((gym) => !gym.ownerHasPassword).length}',
                        sub: 'owners without a password',
                        icon: Icons.key_outlined,
                        accent: ForgeColors.amber,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  if (gyms.isEmpty)
                    EmptyPanel(
                      title: 'No live gyms yet',
                      message:
                          'Create a gym and send its owner an activation link. The demo sandbox is separate and never listed here.',
                      icon: Icons.storefront_outlined,
                      action: FilledButton(onPressed: _create, child: const Text('Create the first gym')),
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
                            for (final gym in gyms)
                              SizedBox(
                                width: width,
                                child: _GymCard(
                                  gym: gym,
                                  onInvite: () => _invite(gym),
                                  onEdit: () => _edit(gym),
                                  onDelete: () => _delete(gym),
                                ),
                              ),
                          ],
                        );
                      },
                    ),
                  const SizedBox(height: 18),
                  ForgeCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionHeader(
                          title: 'How this works',
                          subtitle: 'Installation access is separate from every gym account.',
                        ),
                        const SizedBox(height: 10),
                        const InfoRow(
                          label: 'Admin key',
                          value: 'Set ADMIN_KEY (16+ characters) on the server; paste it here once',
                          icon: Icons.key_outlined,
                        ),
                        const InfoRow(
                          label: 'New gym',
                          value: 'Creates the gym, starter plans and an owner account',
                          icon: Icons.add_business_outlined,
                        ),
                        const InfoRow(
                          label: 'Activation',
                          value: 'The owner sets their own password from the invite token',
                          icon: Icons.how_to_reg_outlined,
                        ),
                        const InfoRow(
                          label: 'Demo gyms',
                          value: 'Sandboxes are never listed or touched by this page',
                          icon: Icons.science_outlined,
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

class _KeyGate extends StatelessWidget {
  const _KeyGate({required this.field, required this.busy, required this.onConnect});

  final TextEditingController field;
  final bool busy;
  final VoidCallback onConnect;

  @override
  Widget build(BuildContext context) {
    return ForgePage(
      maxWidth: 560,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 26),
          const ForgeLogo(size: 40, subtitle: 'Installation admin'),
          const SizedBox(height: 22),
          Text('This area is for the person who runs FORGE.', style: ForgeTheme.display(30, letterSpacing: 0.3)),
          const SizedBox(height: 8),
          Text(
            'Enter the admin key from the server environment. Gym owners and staff never need this; their accounts only see their own gym.',
            style: ForgeTheme.body(12.5, color: ForgeColors.mute, height: 1.55),
          ),
          const SizedBox(height: 20),
          ForgeCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ForgeField(
                  label: 'Admin key',
                  hint: 'At least 16 characters. Stored on this device only.',
                  child: TextField(
                    controller: field,
                    obscureText: true,
                    autocorrect: false,
                    enableSuggestions: false,
                    onSubmitted: (_) => onConnect(),
                    decoration: const InputDecoration(hintText: 'ADMIN_KEY'),
                  ),
                ),
                const SizedBox(height: 15),
                LoadingButton(
                  label: 'Open installation admin',
                  icon: Icons.lock_open,
                  loading: busy,
                  onPressed: onConnect,
                ),
                const SizedBox(height: 12),
                Text(
                  'If the server has no ADMIN_KEY, these routes do not exist and will answer "not found". That is intentional.',
                  style: ForgeTheme.mono(8.5, letterSpacing: 0.3),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _GymCard extends StatelessWidget {
  const _GymCard({required this.gym, required this.onInvite, required this.onEdit, required this.onDelete});

  final AdminGym gym;
  final VoidCallback onInvite;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final enabledAddons = gym.addons.entries.where((e) => e.value).map((e) => titleCase(e.key)).toList();
    return ForgeCard(
      padding: const EdgeInsets.all(16),
      accent: gym.package == 'performance' ? ForgeColors.violet : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              AvatarCircle(
                name: gym.name,
                size: 42,
                color: gym.package == 'performance' ? ForgeColors.violet : ForgeColors.blue,
              ),
              const SizedBox(width: 11),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      gym.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: ForgeTheme.body(14, weight: FontWeight.w700, color: ForgeColors.bone),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${gym.memberCount} member${gym.memberCount == 1 ? '' : 's'} · created ${shortDay(gym.createdAt)}',
                      style: ForgeTheme.body(10, color: ForgeColors.mute),
                    ),
                  ],
                ),
              ),
              PopupMenuButton<String>(
                tooltip: 'Gym actions',
                color: ForgeColors.panel,
                onSelected: (value) {
                  if (value == 'edit') onEdit();
                  if (value == 'delete') onDelete();
                },
                itemBuilder: (_) => const [
                  PopupMenuItem(value: 'edit', child: Text('Edit gym and owner')),
                  PopupMenuItem(value: 'delete', child: Text('Delete gym')),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              StatusPill(
                label: gym.package,
                color: gym.package == 'performance' ? ForgeColors.violet : ForgeColors.blue,
                dense: true,
              ),
              const SizedBox(width: 7),
              StatusPill(
                label: gym.ownerHasPassword ? 'owner active' : 'awaiting activation',
                color: gym.ownerHasPassword ? ForgeColors.green : ForgeColors.amber,
                dense: true,
              ),
            ],
          ),
          const SizedBox(height: 10),
          InfoRow(label: 'Owner', value: gym.ownerName.isEmpty ? '—' : gym.ownerName, icon: Icons.person_outline),
          InfoRow(label: 'Phone', value: gym.ownerPhone.isEmpty ? '—' : gym.ownerPhone, icon: Icons.phone_outlined),
          if (gym.ownerEmail.isNotEmpty) InfoRow(label: 'Email', value: gym.ownerEmail, icon: Icons.mail_outline),
          InfoRow(
            label: 'Last used',
            value: gym.lastUsedAt.isEmpty ? '—' : stampLabel(gym.lastUsedAt),
            icon: Icons.schedule,
          ),
          const SizedBox(height: 4),
          Wrap(
            spacing: 5,
            runSpacing: 5,
            children: [
              if (enabledAddons.isEmpty)
                Text('No add-ons on', style: ForgeTheme.mono(8, letterSpacing: 0.3))
              else
                for (final addon in enabledAddons) StatusPill(label: addon, color: ForgeColors.mute, dense: true),
            ],
          ),
          const SizedBox(height: 13),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onInvite,
                  icon: const Icon(Icons.link, size: 16),
                  label: const Text('Activation link'),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(tooltip: 'Edit', onPressed: onEdit, icon: const Icon(Icons.edit_outlined, size: 18)),
            ],
          ),
        ],
      ),
    );
  }
}

class _GymSheet extends StatefulWidget {
  const _GymSheet({this.gym});

  final AdminGym? gym;

  @override
  State<_GymSheet> createState() => _GymSheetState();
}

class _GymSheetState extends State<_GymSheet> {
  late final TextEditingController _name;
  late final TextEditingController _owner;
  late final TextEditingController _phone;
  late final TextEditingController _email;
  late String _package;
  late final Set<String> _addons;
  bool _busy = false;
  String? _error;

  static const _addonKeys = ['whatsapp', 'upiLinks', 'autopay', 'leadFollowup', 'trainerPlus'];

  bool get _editing => widget.gym != null;

  @override
  void initState() {
    super.initState();
    final gym = widget.gym;
    _name = TextEditingController(text: gym?.name ?? '');
    _owner = TextEditingController(text: gym?.ownerName ?? '');
    _phone = TextEditingController(text: gym?.ownerPhone ?? '');
    _email = TextEditingController(text: gym?.ownerEmail ?? '');
    _package = gym?.package ?? 'growth';
    _addons = {...?gym?.addons.entries.where((e) => e.value).map((e) => e.key)};
  }

  @override
  void dispose() {
    _name.dispose();
    _owner.dispose();
    _phone.dispose();
    _email.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_name.text.trim().length < 2) {
      setState(() => _error = 'Enter the gym name.');
      return;
    }
    if (_owner.text.trim().length < 2) {
      setState(() => _error = 'Enter the owner\'s name.');
      return;
    }
    if (_phone.text.trim().length < 8) {
      setState(() => _error = 'Enter the owner\'s phone number.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    final api = context.read<AppState>().api;
    final adminKey = context.read<AppState>().adminKey;
    try {
      if (_editing) {
        await api.adminUpdateGym(adminKey, widget.gym!.id, {
          'name': _name.text.trim(),
          'package': _package,
          'ownerName': _owner.text.trim(),
          'ownerPhone': _phone.text.trim(),
          'ownerEmail': _email.text.trim(),
          'addons': {for (final key in _addonKeys) key: _addons.contains(key)},
        });
        if (mounted) Navigator.pop(context, true);
      } else {
        final result = await api.adminCreateGym(adminKey, {
          'name': _name.text.trim(),
          'ownerName': _owner.text.trim(),
          'phone': _phone.text.trim(),
          'email': _email.text.trim(),
          'package': _package,
          'addons': {for (final key in _addonKeys) key: _addons.contains(key)},
        });
        if (mounted) Navigator.pop(context, result);
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
          _editing
              ? 'Change the gym, its package or its owner details. Members and payments are untouched.'
              : 'A live gym gets starter plans and an owner account. You then send the owner an activation link to set a password.',
          style: ForgeTheme.body(11.5, color: ForgeColors.mute),
        ),
        if (_error != null) ...[
          const SizedBox(height: 10),
          Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
        ],
        const SizedBox(height: 15),
        ForgeField(
          label: 'Gym name',
          child: TextField(
            controller: _name,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(hintText: 'e.g. Iron Forge Gym'),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Package',
          child: ChoiceRow<String>(
            values: const ['growth', 'performance'],
            selected: _package,
            label: (value) => value == 'performance' ? 'Performance' : 'Growth',
            onSelected: (value) => setState(() => _package = value),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Owner name',
          child: TextField(
            controller: _owner,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(hintText: 'Their full name'),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Owner phone',
          child: TextField(
            controller: _phone,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(hintText: 'For signing in'),
          ),
        ),
        const SizedBox(height: 13),
        ForgeField(
          label: 'Owner email (optional)',
          child: TextField(
            controller: _email,
            keyboardType: TextInputType.emailAddress,
            decoration: const InputDecoration(hintText: 'name@example.com'),
          ),
        ),
        const SizedBox(height: 15),
        ForgeField(
          label: 'Add-ons',
          hint: 'Turn on only what this gym has paid for.',
          child: Wrap(
            spacing: 7,
            runSpacing: 7,
            children: [
              for (final key in _addonKeys)
                GestureDetector(
                  onTap: () => setState(() {
                    if (!_addons.add(key)) _addons.remove(key);
                  }),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                    decoration: BoxDecoration(
                      color: _addons.contains(key) ? ForgeColors.violet.withValues(alpha: 0.14) : ForgeColors.ink2,
                      borderRadius: BorderRadius.circular(9),
                      border: Border.all(color: _addons.contains(key) ? ForgeColors.violet : ForgeColors.line),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          _addons.contains(key) ? Icons.check_box : Icons.check_box_outline_blank,
                          size: 14,
                          color: _addons.contains(key) ? ForgeColors.violet : ForgeColors.mute,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          titleCase(key),
                          style: ForgeTheme.body(
                            10.5,
                            color: _addons.contains(key) ? ForgeColors.bone : ForgeColors.mute,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 18),
        LoadingButton(
          label: _editing ? 'Save changes' : 'Create gym',
          icon: _editing ? Icons.save_outlined : Icons.add_business_outlined,
          loading: _busy,
          onPressed: _save,
        ),
      ],
    );
  }
}
