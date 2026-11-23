import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/api.dart';
import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/widgets.dart';
import 'admin_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key, this.startAdmin = false});

  final bool startAdmin;

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late final TextEditingController _baseUrl;
  bool _savingUrl = false;
  bool _testing = false;
  bool _resetting = false;

  @override
  void initState() {
    super.initState();
    _baseUrl = TextEditingController(text: context.read<AppState>().baseUrl);
  }

  @override
  void dispose() {
    _baseUrl.dispose();
    super.dispose();
  }

  Future<void> _saveUrl() async {
    final value = _baseUrl.text.trim();
    if (value.isEmpty) {
      showSnack(context, 'Enter the address of your gym server.', error: true);
      return;
    }
    setState(() => _savingUrl = true);
    try {
      await context.read<AppState>().setBaseUrl(value);
      if (!mounted) return;
      _baseUrl.text = context.read<AppState>().baseUrl;
      showSnack(context, 'Server address saved.');
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    } finally {
      if (mounted) setState(() => _savingUrl = false);
    }
  }

  Future<void> _test() async {
    final state = context.read<AppState>();
    setState(() => _testing = true);
    try {
      final data = await state.api.health();
      final name = str(data['name'], 'FORGE');
      final version = str(data['version'], '');
      if (mounted) {
        showSnack(context, '$name answered${version.isEmpty ? '' : ' · v$version'}. The server is reachable.');
      }
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    } finally {
      if (mounted) setState(() => _testing = false);
    }
  }

  Future<void> _resetDemo() async {
    final ok = await showConfirm(
      context,
      title: 'Reset the demo sandbox?',
      message: 'Every change you made in the demo is removed and the sample gym is rebuilt. You stay signed in.',
      confirmLabel: 'Reset demo',
      danger: true,
    );
    if (!ok) return;
    if (!mounted) return;
    setState(() => _resetting = true);
    try {
      await context.read<AppState>().resetDemo();
      if (mounted) showSnack(context, 'The demo sandbox was reset.');
    } catch (err) {
      if (mounted) showSnack(context, '$err', error: true);
    } finally {
      if (mounted) setState(() => _resetting = false);
    }
  }

  Future<void> _signOut() async {
    final ok = await showConfirm(
      context,
      title: 'Sign out?',
      message: 'You will need your member ID or phone and password to come back in.',
      confirmLabel: 'Sign out',
      danger: true,
    );
    if (!ok || !mounted) return;
    await context.read<AppState>().signOut();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.startAdmin) return const AdminScreen();

    final state = context.watch<AppState>();
    final session = state.session;
    if (session == null) return const SizedBox.shrink();
    final user = session.user;
    final gym = session.gym;

    return ForgePage(
      maxWidth: 980,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(
            eyebrow: 'Your account',
            title: 'Settings.',
            subtitle: 'Your profile, the server this app talks to, and the demo sandbox.',
          ),
          const SizedBox(height: 16),
          LayoutBuilder(
            builder: (context, constraints) {
              final wide = constraints.maxWidth >= 820;
              final profile = ForgeCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        AvatarCircle(name: user.name, size: 54),
                        const SizedBox(width: 13),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(user.name, style: ForgeTheme.display(24, letterSpacing: 0.3)),
                              const SizedBox(height: 2),
                              Text(
                                user.title.isEmpty ? roleLabel(user.role) : '${user.title} · ${roleLabel(user.role)}',
                                style: ForgeTheme.body(11.5, color: ForgeColors.mute),
                              ),
                            ],
                          ),
                        ),
                        StatusPill(label: roleLabel(user.role), dense: true),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(13),
                      decoration: BoxDecoration(
                        color: ForgeColors.ink2,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: ForgeColors.line),
                      ),
                      child: Column(
                        children: [
                          InfoRow(label: 'Gym', value: gym.name, icon: Icons.storefront_outlined),
                          InfoRow(
                            label: 'Package',
                            value: '${titleCase(gym.package)} plan',
                            icon: Icons.workspace_premium_outlined,
                          ),
                          InfoRow(
                            label: 'Add-ons on',
                            value: gym.addons.values.where((v) => v).isEmpty
                                ? '—'
                                : gym.addons.entries.where((e) => e.value).map((e) => titleCase(e.key)).join(', '),
                            icon: Icons.extension_outlined,
                          ),
                          if (gym.isDemo)
                            const InfoRow(
                              label: 'Sandbox',
                              value: 'Demo · isolated copy',
                              icon: Icons.science_outlined,
                              valueColor: ForgeColors.amber,
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              );

              final connection = ForgeCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionHeader(
                      title: 'Server connection',
                      subtitle: 'Where this app reads and writes your gym data.',
                    ),
                    const SizedBox(height: 14),
                    ForgeField(
                      label: 'API address',
                      hint: 'Leave blank to use the built-in FORGE server. Local development: http://localhost:4000',
                      child: TextField(
                        controller: _baseUrl,
                        keyboardType: TextInputType.url,
                        autocorrect: false,
                        decoration: InputDecoration(
                          hintText: defaultApiOrigin,
                          suffixIcon: IconButton(
                            tooltip: 'Use the default server',
                            onPressed: () => _baseUrl.text = defaultApiOrigin,
                            icon: const Icon(Icons.restart_alt, size: 18),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 9,
                      runSpacing: 9,
                      children: [
                        FilledButton.icon(
                          onPressed: _savingUrl ? null : _saveUrl,
                          icon: _savingUrl
                              ? const SizedBox(
                                  width: 15,
                                  height: 15,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : const Icon(Icons.save_outlined, size: 16),
                          label: const Text('Save address'),
                        ),
                        OutlinedButton.icon(
                          onPressed: _testing ? null : _test,
                          icon: _testing
                              ? const SizedBox(width: 15, height: 15, child: CircularProgressIndicator(strokeWidth: 2))
                              : const Icon(Icons.wifi_tethering, size: 16),
                          label: const Text('Test connection'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Changing the address keeps this session. If the new server does not know it, you will be asked to sign in again.',
                      style: ForgeTheme.body(10.5, color: ForgeColors.mute),
                    ),
                  ],
                ),
              );

              if (!wide) {
                return Column(children: [profile, const SizedBox(height: 12), connection]);
              }
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: profile),
                  const SizedBox(width: 12),
                  Expanded(child: connection),
                ],
              );
            },
          ),
          const SizedBox(height: 12),
          ForgeCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionHeader(title: 'This device', subtitle: 'Demo tools and installation access.'),
                const SizedBox(height: 6),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.science_outlined, size: 20, color: ForgeColors.amber),
                  title: Text(
                    'Reset the demo sandbox',
                    style: ForgeTheme.body(12.5, weight: FontWeight.w600, color: ForgeColors.bone),
                  ),
                  subtitle: Text(
                    gym.isDemo
                        ? 'Rebuild the sample gym and remove your demo changes.'
                        : 'Only available inside a demo sandbox.',
                    style: ForgeTheme.body(10.5, color: ForgeColors.mute),
                  ),
                  trailing: gym.isDemo
                      ? TextButton(
                          onPressed: _resetting ? null : _resetDemo,
                          child: Text(_resetting ? 'Resetting…' : 'Reset'),
                        )
                      : null,
                  enabled: gym.isDemo,
                ),
                const Divider(height: 1),
                if (user.isOwner)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.admin_panel_settings_outlined, size: 20, color: ForgeColors.violet),
                    title: Text(
                      'Installation admin',
                      style: ForgeTheme.body(12.5, weight: FontWeight.w600, color: ForgeColors.bone),
                    ),
                    subtitle: Text(
                      state.adminKey.isEmpty
                          ? 'Manage every live gym on this server. Needs the admin key.'
                          : 'Manage every live gym on this server.',
                      style: ForgeTheme.body(10.5, color: ForgeColors.mute),
                    ),
                    trailing: const Icon(Icons.chevron_right, size: 18, color: ForgeColors.mute),
                    onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AdminScreen())),
                  ),
                if (user.isOwner) const Divider(height: 1),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.logout, size: 20, color: ForgeColors.redHi),
                  title: Text(
                    'Sign out',
                    style: ForgeTheme.body(12.5, weight: FontWeight.w600, color: ForgeColors.redHi),
                  ),
                  subtitle: Text(
                    'Leave this session on this device.',
                    style: ForgeTheme.body(10.5, color: ForgeColors.mute),
                  ),
                  trailing: const Icon(Icons.chevron_right, size: 18, color: ForgeColors.mute),
                  onTap: _signOut,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Center(
            child: Column(
              children: [
                const ForgeLogo(size: 28, subtitle: 'Gym Operating System'),
                const SizedBox(height: 8),
                Text(
                  'FORGE 0.1.0 · Flutter client\nMembers, money, coaching and the front desk in one place.',
                  textAlign: TextAlign.center,
                  style: ForgeTheme.mono(8.5, letterSpacing: 0.5),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
