import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/api.dart';
import '../../core/app_state.dart';
import '../../core/theme.dart';
import '../../ui/widgets.dart';
import '../admin_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _identifier = TextEditingController();
  final _password = TextEditingController();
  bool _busy = false;
  bool _obscure = true;
  String? _error;

  @override
  void dispose() {
    _identifier.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _signIn() async {
    final identifier = _identifier.text.trim();
    final password = _password.text;
    if (identifier.isEmpty || password.isEmpty) {
      setState(() => _error = 'Enter your member ID/phone/email and password.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await context.read<AppState>().signIn(identifier: identifier, password: password);
    } on ApiException catch (err) {
      if (mounted) setState(() => _error = err.message);
    } catch (err) {
      if (mounted) setState(() => _error = 'Could not sign in. Check your connection and try again.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _openDemo() async {
    await showForgeSheet<void>(context: context, title: 'Enter the demo', maxWidth: 560, child: const DemoPicker());
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final wide = MediaQuery.sizeOf(context).width >= 960;

    return ForgeBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(22),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1180),
                child: wide
                    ? IntrinsicHeight(
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Expanded(flex: 11, child: _BrandPanel()),
                            const SizedBox(width: 34),
                            Expanded(
                              flex: 9,
                              child: _LoginCard(
                                identifier: _identifier,
                                password: _password,
                                obscure: _obscure,
                                busy: _busy,
                                error: _error,
                                onToggleObscure: () => setState(() => _obscure = !_obscure),
                                onSubmit: _signIn,
                                onDemo: _openDemo,
                                onServer: () => showServerDialog(context),
                                onAdmin: () => openAdminLogin(context),
                              ),
                            ),
                          ],
                        ),
                      )
                    : Column(
                        children: [
                          const _MobileBrand(),
                          const SizedBox(height: 22),
                          _LoginCard(
                            identifier: _identifier,
                            password: _password,
                            obscure: _obscure,
                            busy: _busy,
                            error: _error,
                            onToggleObscure: () => setState(() => _obscure = !_obscure),
                            onSubmit: _signIn,
                            onDemo: _openDemo,
                            onServer: () => showServerDialog(context),
                            onAdmin: () => openAdminLogin(context),
                          ),
                        ],
                      ),
              ),
            ),
          ),
        ),
        bottomNavigationBar: _ServerStrip(baseUrl: state.baseUrl, onTap: () => showServerDialog(context)),
      ),
    );
  }
}

class _BrandPanel extends StatelessWidget {
  const _BrandPanel();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(38),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [ForgeColors.panel.withValues(alpha: 0.88), ForgeColors.ink2.withValues(alpha: 0.7)],
        ),
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: ForgeColors.line),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const ForgeLogo(size: 44, subtitle: 'Gym Operating System'),
          const Spacer(),
          const Eyebrow('Built for the floor'),
          const SizedBox(height: 16),
          Text('RUN THE GYM.\nNOT THE SPREADSHEETS.', style: ForgeTheme.display(60, height: 0.92, letterSpacing: 0.5)),
          const SizedBox(height: 18),
          Text(
            'Members, attendance, payments, leads, coaching and the member app — '
            'one system, built to be used at the front desk, not admired from a distance.',
            style: ForgeTheme.body(14, color: ForgeColors.boneDim, height: 1.55),
          ),
          const SizedBox(height: 26),
          const Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _FeatureChip(icon: Icons.groups_2_outlined, label: 'Members & renewals'),
              _FeatureChip(icon: Icons.qr_code_2, label: 'QR attendance'),
              _FeatureChip(icon: Icons.receipt_long_outlined, label: 'Dues & payments'),
              _FeatureChip(icon: Icons.fitness_center, label: 'Coaching plans'),
            ],
          ),
          const Spacer(),
          Wrap(
            spacing: 26,
            runSpacing: 14,
            children: const [
              _MiniStat(value: '4', label: 'Role portals'),
              _MiniStat(value: '3', label: 'Packages'),
              _MiniStat(value: '1', label: 'Live gym database'),
            ],
          ),
        ],
      ),
    );
  }
}

class _FeatureChip extends StatelessWidget {
  const _FeatureChip({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 8),
      decoration: BoxDecoration(
        color: ForgeColors.ink2.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: ForgeColors.line),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: ForgeColors.redHi),
          const SizedBox(width: 7),
          Text(label, style: ForgeTheme.body(11.5, color: ForgeColors.boneDim)),
        ],
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  const _MiniStat({required this.value, required this.label});

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: ForgeTheme.display(26, color: ForgeColors.bone)),
        Text(label.toUpperCase(), style: ForgeTheme.mono(8.5, letterSpacing: 1.4)),
      ],
    );
  }
}

class _MobileBrand extends StatelessWidget {
  const _MobileBrand();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const ForgeLogo(size: 44, subtitle: 'Gym Operating System'),
        const SizedBox(height: 22),
        Text('RUN THE GYM.', textAlign: TextAlign.center, style: ForgeTheme.display(40)),
        Text(
          'NOT THE SPREADSHEETS.',
          textAlign: TextAlign.center,
          style: ForgeTheme.display(40, color: ForgeColors.redHi),
        ),
        const SizedBox(height: 8),
        Text(
          'Members, payments, attendance and coaching in one place.',
          textAlign: TextAlign.center,
          style: ForgeTheme.body(12.5, color: ForgeColors.mute),
        ),
      ],
    );
  }
}

class _LoginCard extends StatelessWidget {
  const _LoginCard({
    required this.identifier,
    required this.password,
    required this.obscure,
    required this.busy,
    required this.error,
    required this.onToggleObscure,
    required this.onSubmit,
    required this.onDemo,
    required this.onServer,
    required this.onAdmin,
  });

  final TextEditingController identifier;
  final TextEditingController password;
  final bool obscure;
  final bool busy;
  final String? error;
  final VoidCallback onToggleObscure;
  final VoidCallback onSubmit;
  final VoidCallback onDemo;
  final VoidCallback onServer;
  final VoidCallback onAdmin;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      padding: const EdgeInsets.all(28),
      child: AutofillGroup(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Eyebrow('Sign in'),
            const SizedBox(height: 10),
            Text('Welcome back.', style: ForgeTheme.display(36, letterSpacing: 0.4)),
            const SizedBox(height: 5),
            Text(
              'Use your gym account, or open a live demo sandbox.',
              style: ForgeTheme.body(12.5, color: ForgeColors.mute),
            ),
            if (error != null) ...[
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: ForgeColors.red.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(11),
                  border: Border.all(color: ForgeColors.red.withValues(alpha: 0.4)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.error_outline, color: ForgeColors.redHi, size: 17),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 20),
            ForgeField(
              label: 'Member ID · phone · email',
              child: TextField(
                controller: identifier,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.username],
                decoration: const InputDecoration(
                  hintText: 'e.g. IP-1001 or you@example.com',
                  prefixIcon: Icon(Icons.person_outline, size: 18),
                ),
              ),
            ),
            const SizedBox(height: 14),
            ForgeField(
              label: 'Password',
              child: TextField(
                controller: password,
                obscureText: obscure,
                autofillHints: const [AutofillHints.password],
                onSubmitted: (_) => onSubmit(),
                decoration: InputDecoration(
                  hintText: '••••••••',
                  prefixIcon: const Icon(Icons.lock_outline, size: 18),
                  suffixIcon: IconButton(
                    onPressed: onToggleObscure,
                    icon: Icon(obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined, size: 18),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Text('Quick demo:', style: ForgeTheme.mono(10, color: ForgeColors.mute)),
                _DemoChip(label: 'Owner 1', email: 'owner1@forge.demo', onTap: (e) {
                  identifier.text = e;
                  password.text = 'forge1234';
                  onSubmit();
                }),
                _DemoChip(label: 'Owner 2', email: 'owner2@forge.demo', onTap: (e) {
                  identifier.text = e;
                  password.text = 'forge1234';
                  onSubmit();
                }),
                _DemoChip(label: 'Staff 1', email: 'staff1@forge.demo', onTap: (e) {
                  identifier.text = e;
                  password.text = 'forge1234';
                  onSubmit();
                }),
                _DemoChip(label: 'Staff 2', email: 'staff2@forge.demo', onTap: (e) {
                  identifier.text = e;
                  password.text = 'forge1234';
                  onSubmit();
                }),
                _DemoChip(label: 'Trainer 1', email: 'trainer1@forge.demo', onTap: (e) {
                  identifier.text = e;
                  password.text = 'forge1234';
                  onSubmit();
                }),
                _DemoChip(label: 'Trainer 2', email: 'trainer2@forge.demo', onTap: (e) {
                  identifier.text = e;
                  password.text = 'forge1234';
                  onSubmit();
                }),
                _DemoChip(label: 'Member 1', email: 'member1@forge.demo', onTap: (e) {
                  identifier.text = e;
                  password.text = 'forge1234';
                  onSubmit();
                }),
                _DemoChip(label: 'Member 2', email: 'member2@forge.demo', onTap: (e) {
                  identifier.text = e;
                  password.text = 'forge1234';
                  onSubmit();
                }),
              ],
            ),
            const SizedBox(height: 16),
            LoadingButton(label: 'Sign in', loading: busy, onPressed: onSubmit, icon: Icons.arrow_forward),
            const SizedBox(height: 11),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: busy ? null : onDemo,
                icon: const Icon(Icons.play_circle_outline, size: 18),
                label: const Text('Explore the live demo'),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: Container(height: 1, color: ForgeColors.line)),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Text('OR', style: ForgeTheme.mono(9)),
                ),
                Expanded(child: Container(height: 1, color: ForgeColors.line)),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: TextButton.icon(
                    onPressed: () =>
                        Navigator.of(context).push(MaterialPageRoute(builder: (_) => const ActivateScreen())),
                    icon: const Icon(Icons.key_outlined, size: 15),
                    label: const FittedBox(fit: BoxFit.scaleDown, child: Text('Activation link')),
                  ),
                ),
                Expanded(
                  child: TextButton.icon(
                    onPressed: onServer,
                    icon: const Icon(Icons.dns_outlined, size: 15),
                    label: const FittedBox(fit: BoxFit.scaleDown, child: Text('Server')),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Center(
              child: TextButton(
                onPressed: onAdmin,
                child: Text(
                  'Installation admin',
                  style: ForgeTheme.mono(9.5, letterSpacing: 1.2, color: ForgeColors.mute),
                ),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              'Demo accounts have no passwords. Live gyms sign in with the account created by their invite.',
              textAlign: TextAlign.center,
              style: ForgeTheme.body(10.5, color: ForgeColors.mute),
            ),
          ],
        ),
      ),
    );
  }
}

class _ServerStrip extends StatelessWidget {
  const _ServerStrip({required this.baseUrl, required this.onTap});

  final String baseUrl;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: ForgeColors.ink2,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 7,
              height: 7,
              decoration: const BoxDecoration(color: ForgeColors.green, shape: BoxShape.circle),
            ),
            const SizedBox(width: 7),
            Flexible(
              child: Text(
                'API · ${Uri.tryParse(baseUrl)?.host ?? baseUrl}',
                overflow: TextOverflow.ellipsis,
                style: ForgeTheme.mono(9, letterSpacing: 0.6, color: ForgeColors.mute),
              ),
            ),
            TextButton(onPressed: onTap, child: const Text('change')),
          ],
        ),
      ),
    );
  }
}

class DemoPicker extends StatefulWidget {
  const DemoPicker({super.key});

  @override
  State<DemoPicker> createState() => _DemoPickerState();
}

class _DemoPickerState extends State<DemoPicker> {
  String? _busyRole;
  String? _error;

  static const _roles = [
    (
      'owner',
      'Owner (Owner 1)',
      'The whole gym: money, members, leads, reports, staff.',
      Icons.admin_panel_settings_outlined,
      ForgeColors.red,
    ),
    (
      'staff',
      'Front desk (Staff 1)',
      'Check-ins, payments, dues, enquiries and renewals.',
      Icons.badge_outlined,
      ForgeColors.amber,
    ),
    (
      'trainer',
      'Trainer (Trainer 1)',
      'Assigned members, workouts, measurements and PT sessions.',
      Icons.fitness_center,
      ForgeColors.green,
    ),
    (
      'member',
      'Member (Member 1)',
      'Digital pass, check-in, workout, diet and gym videos.',
      Icons.qr_code_2,
      ForgeColors.blue,
    ),
  ];

  Future<void> _enter(String role) async {
    setState(() {
      _busyRole = role;
      _error = null;
    });
    try {
      await context.read<AppState>().enterDemo(role: role);
      if (mounted) Navigator.of(context).pop();
    } on ApiException catch (err) {
      if (mounted) setState(() => _error = err.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Could not start the demo. Check your connection.');
    } finally {
      if (mounted) setState(() => _busyRole = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'A private sandbox of Iron Forge Gym is created for you. Reset it any time; it never touches a real gym.',
          style: ForgeTheme.body(12.5, color: ForgeColors.mute),
        ),
        const SizedBox(height: 16),
        if (_error != null) ...[
          Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
          const SizedBox(height: 10),
        ],
        for (final role in _roles) ...[
          ForgeCard(
            onTap: _busyRole == null ? () => _enter(role.$1) : null,
            padding: const EdgeInsets.all(15),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: role.$5.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(11),
                    border: Border.all(color: role.$5.withValues(alpha: 0.32)),
                  ),
                  child: Icon(role.$4, color: role.$5, size: 21),
                ),
                const SizedBox(width: 13),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        role.$2,
                        style: ForgeTheme.body(13.5, weight: FontWeight.w700, color: ForgeColors.bone),
                      ),
                      const SizedBox(height: 2),
                      Text(role.$3, style: ForgeTheme.body(11.5, color: ForgeColors.mute)),
                    ],
                  ),
                ),
                _busyRole == role.$1
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.arrow_forward, size: 17, color: ForgeColors.mute),
              ],
            ),
          ),
          const SizedBox(height: 9),
        ],
        const SizedBox(height: 6),
        Text(
          'The demo runs on the live FORGE API. Nothing you type is shown to another visitor.',
          style: ForgeTheme.mono(9, letterSpacing: 0.4),
        ),
      ],
    );
  }
}

class ActivateScreen extends StatefulWidget {
  const ActivateScreen({super.key});

  @override
  State<ActivateScreen> createState() => _ActivateScreenState();
}

class _ActivateScreenState extends State<ActivateScreen> {
  final _invite = TextEditingController();
  final _password = TextEditingController();
  final _name = TextEditingController();
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _invite.dispose();
    _password.dispose();
    _name.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_invite.text.trim().isEmpty || _password.text.length < 6) {
      setState(() => _error = 'Paste the invite token and choose a password of at least 6 characters.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await context.read<AppState>().activate(
        invite: _invite.text.trim(),
        password: _password.text,
        name: _name.text.trim(),
      );
      if (mounted) Navigator.of(context).popUntil((route) => route.isFirst);
    } on ApiException catch (err) {
      if (mounted) setState(() => _error = err.message);
    } catch (_) {
      if (mounted) setState(() => _error = 'Could not activate this invite. Check the token and connection.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ForgeBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          surfaceTintColor: Colors.transparent,
          title: const ForgeLogo(size: 28),
        ),
        body: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: ForgeCard(
                padding: const EdgeInsets.all(26),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Eyebrow('Owner activation'),
                    const SizedBox(height: 9),
                    Text('Set up your gym.', style: ForgeTheme.display(34)),
                    const SizedBox(height: 6),
                    Text(
                      'Your FORGE invite token is single use. Choose the password you will sign in with.',
                      style: ForgeTheme.body(12.5, color: ForgeColors.mute),
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 14),
                      Text(_error!, style: ForgeTheme.body(12, color: ForgeColors.redHi)),
                    ],
                    const SizedBox(height: 18),
                    ForgeField(
                      label: 'Invite token',
                      child: TextField(
                        controller: _invite,
                        maxLines: 3,
                        style: ForgeTheme.mono(11, color: ForgeColors.boneDim),
                        decoration: const InputDecoration(hintText: 'Paste the token from your invite'),
                      ),
                    ),
                    const SizedBox(height: 14),
                    ForgeField(
                      label: 'Your name',
                      child: TextField(
                        controller: _name,
                        textCapitalization: TextCapitalization.words,
                        decoration: const InputDecoration(hintText: 'Optional if the invite already has it'),
                      ),
                    ),
                    const SizedBox(height: 14),
                    ForgeField(
                      label: 'New password',
                      child: TextField(
                        controller: _password,
                        obscureText: true,
                        decoration: const InputDecoration(hintText: 'At least 6 characters'),
                      ),
                    ),
                    const SizedBox(height: 20),
                    LoadingButton(label: 'Activate my gym', loading: _busy, onPressed: _submit),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

Future<void> showServerDialog(BuildContext context) async {
  final state = context.read<AppState>();
  final controller = TextEditingController(text: state.baseUrl);
  String? message;
  bool busy = false;

  await showDialog<void>(
    context: context,
    builder: (context) => StatefulBuilder(
      builder: (context, setDialogState) => AlertDialog(
        title: Text('Gym server', style: ForgeTheme.display(24)),
        content: SizedBox(
          width: 460,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Point the app at your FORGE API. The demo server is pre-filled.',
                style: ForgeTheme.body(12, color: ForgeColors.mute),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: controller,
                keyboardType: TextInputType.url,
                decoration: const InputDecoration(hintText: 'https://your-api.example.com'),
              ),
              if (message != null) ...[
                const SizedBox(height: 10),
                Text(
                  message!,
                  style: ForgeTheme.body(
                    11.5,
                    color: message!.startsWith('Connected') ? ForgeColors.green : ForgeColors.redHi,
                  ),
                ),
              ],
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
          TextButton(
            onPressed: busy
                ? null
                : () async {
                    setDialogState(() {
                      busy = true;
                      message = null;
                    });
                    try {
                      final test = ApiClient(baseUrl: controller.text);
                      final health = await test.health();
                      setDialogState(
                        () => message = health['database'] == 'connected'
                            ? 'Connected. Database online.'
                            : 'Connected, but the database is unavailable.',
                      );
                    } on ApiException catch (err) {
                      setDialogState(() => message = err.message);
                    } catch (_) {
                      setDialogState(() => message = 'Could not reach that address.');
                    } finally {
                      setDialogState(() => busy = false);
                    }
                  },
            child: const Text('Test'),
          ),
          FilledButton(
            onPressed: () async {
              await state.setBaseUrl(controller.text);
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    ),
  );
}

Future<void> openAdminLogin(BuildContext context) async {
  final key = TextEditingController();
  String? error;
  bool busy = false;
  await showDialog<void>(
    context: context,
    builder: (context) => StatefulBuilder(
      builder: (context, setDialogState) => AlertDialog(
        title: Text('Installation admin', style: ForgeTheme.display(24)),
        content: SizedBox(
          width: 440,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'For the person running this FORGE installation. Gym owners use their normal sign-in.',
                style: ForgeTheme.body(12, color: ForgeColors.mute),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: key,
                obscureText: true,
                decoration: const InputDecoration(hintText: 'ADMIN_KEY'),
              ),
              if (error != null) ...[
                const SizedBox(height: 9),
                Text(error!, style: ForgeTheme.body(11.5, color: ForgeColors.redHi)),
              ],
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(
            onPressed: busy
                ? null
                : () async {
                    setDialogState(() {
                      busy = true;
                      error = null;
                    });
                    try {
                      await context.read<AppState>().setAdminKey(key.text);
                      if (!context.mounted) return;
                      Navigator.pop(context);
                      await Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AdminScreen()));
                    } on ApiException catch (err) {
                      setDialogState(() => error = err.message);
                    } catch (_) {
                      setDialogState(() => error = 'Could not open the admin console.');
                    } finally {
                      setDialogState(() => busy = false);
                    }
                  },
            child: Text(busy ? 'Opening…' : 'Open console'),
          ),
        ],
      ),
    ),
  );
}

class _DemoChip extends StatelessWidget {
  const _DemoChip({required this.label, required this.email, required this.onTap});

  final String label;
  final String email;
  final void Function(String email) onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => onTap(email),
        borderRadius: BorderRadius.circular(6),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: ForgeColors.panel,
            border: Border.all(color: ForgeColors.line),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            label,
            style: ForgeTheme.mono(10.5, color: ForgeColors.boneDim),
          ),
        ),
      ),
    );
  }
}
