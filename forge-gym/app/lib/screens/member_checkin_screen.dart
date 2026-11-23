import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../models.dart';
import '../ui/widgets.dart';

class MemberCheckinScreen extends StatefulWidget {
  const MemberCheckinScreen({super.key});

  @override
  State<MemberCheckinScreen> createState() => _MemberCheckinScreenState();
}

class _MemberCheckinScreenState extends State<MemberCheckinScreen> {
  late Future<MemberPortal> _future;
  final _manual = TextEditingController();
  MobileScannerController? _controller;
  bool _cameraOn = false;
  bool _busy = false;
  bool _torch = false;
  String? _error;
  Json? _result;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<MemberPortal> _load() => context.read<AppState>().api.portal();

  @override
  void dispose() {
    _manual.dispose();
    _controller?.dispose();
    super.dispose();
  }

  void _startCamera() {
    final controller = MobileScannerController(detectionSpeed: DetectionSpeed.noDuplicates);
    setState(() {
      _controller = controller;
      _cameraOn = true;
      _error = null;
    });
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      try {
        await controller.start();
      } catch (err) {
        if (mounted) {
          setState(() {
            _cameraOn = false;
            _error = 'The camera could not start. Type the gym code below instead.';
          });
        }
      }
    });
  }

  Future<void> _stopCamera() async {
    final controller = _controller;
    setState(() {
      _cameraOn = false;
      _controller = null;
      _torch = false;
    });
    try {
      await controller?.stop();
    } catch (_) {}
    await controller?.dispose();
  }

  Future<void> _toggleTorch() async {
    try {
      await _controller?.toggleTorch();
      if (mounted) setState(() => _torch = !_torch);
    } catch (_) {
      if (mounted) showSnack(context, 'This camera has no torch.', error: true);
    }
  }

  Future<void> _submit(String raw) async {
    final code = raw.trim();
    if (code.isEmpty || _busy) return;
    FocusScope.of(context).unfocus();
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final result = await context.read<AppState>().api.memberCheckin(code);
      if (!mounted) return;
      setState(() {
        _result = result;
        _manual.clear();
      });
      if (_cameraOn) await _stopCamera();
    } catch (err) {
      if (mounted) setState(() => _error = '$err');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _reset() {
    setState(() {
      _result = null;
      _error = null;
      _manual.clear();
    });
    _future = _load();
  }

  @override
  Widget build(BuildContext context) {
    final isDemo = context.watch<AppState>().session?.gym.isDemo ?? false;
    return ForgePage(
      maxWidth: 960,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const PageHeader(
            eyebrow: 'At the door',
            title: 'Check in.',
            subtitle: 'Scan the gym QR code at reception. One check-in per day.',
          ),
          const SizedBox(height: 16),
          FutureBuilder<MemberPortal>(
            future: _future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                return const ForgeLoading(label: 'Finding your gym');
              }
              if (snapshot.hasError) return ErrorPanel(error: snapshot.error!, onRetry: _reset);
              final data = snapshot.data;
              if (data == null) return ErrorPanel(error: 'No portal data returned.', onRetry: _reset);

              if (_result != null) {
                return _ResultCard(result: _result!, gymName: data.gymName, visits: data.visits.length, onDone: _reset);
              }

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ForgeCard(
                    padding: EdgeInsets.zero,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(17),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          AspectRatio(
                            aspectRatio: 16 / 10,
                            child: Container(
                              color: ForgeColors.ink,
                              child: _cameraOn && _controller != null
                                  ? Stack(
                                      fit: StackFit.expand,
                                      children: [
                                        MobileScanner(
                                          controller: _controller,
                                          fit: BoxFit.cover,
                                          errorBuilder: (context, error) => _CameraFallback(
                                            error: '$error',
                                            onManual: () => setState(() => _cameraOn = false),
                                          ),
                                          onDetect: (capture) {
                                            final barcode = capture.barcodes.isEmpty ? null : capture.barcodes.first;
                                            final value = barcode?.rawValue;
                                            if (value != null && value.trim().isNotEmpty) _submit(value);
                                          },
                                        ),
                                        const _ScanFrame(),
                                        Positioned(
                                          top: 10,
                                          right: 10,
                                          child: Row(
                                            children: [
                                              _ScannerButton(
                                                icon: _torch ? Icons.flash_on : Icons.flash_off,
                                                onTap: _toggleTorch,
                                                label: 'Torch',
                                              ),
                                              const SizedBox(width: 8),
                                              _ScannerButton(icon: Icons.close, onTap: _stopCamera, label: 'Close'),
                                            ],
                                          ),
                                        ),
                                      ],
                                    )
                                  : _CameraIdle(onStart: _startCamera, busy: _busy),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.storefront_outlined, size: 17, color: ForgeColors.mute),
                                    const SizedBox(width: 7),
                                    Expanded(
                                      child: Text(
                                        data.gymName,
                                        style: ForgeTheme.body(12.5, weight: FontWeight.w600, color: ForgeColors.bone),
                                      ),
                                    ),
                                    StatusPill(label: data.weekday, color: ForgeColors.blue, dense: true),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  _cameraOn
                                      ? 'Point the camera at the gym QR code. It is usually printed at reception.'
                                      : 'Use the camera, or type the code printed at reception.',
                                  style: ForgeTheme.body(11.5, color: ForgeColors.mute),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  ForgeCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionHeader(
                          title: 'Type the code instead',
                          subtitle: 'Useful when the camera is unavailable.',
                        ),
                        const SizedBox(height: 13),
                        if (_error != null) ...[
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(11),
                            decoration: BoxDecoration(
                              color: ForgeColors.red.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: ForgeColors.redDeep),
                            ),
                            child: Text(_error!, style: ForgeTheme.body(11.5, color: ForgeColors.redHi)),
                          ),
                          const SizedBox(height: 12),
                        ],
                        ForgeField(
                          label: 'Gym check-in code',
                          hint: isDemo
                              ? 'Demo: tap the button below to fill the gym code.'
                              : 'Ask the front desk if you cannot find it.',
                          child: TextField(
                            controller: _manual,
                            textInputAction: TextInputAction.done,
                            onSubmitted: _submit,
                            decoration: const InputDecoration(hintText: 'FORGE_CHECKIN:…'),
                          ),
                        ),
                        if (isDemo) ...[
                          const SizedBox(height: 8),
                          Align(
                            alignment: Alignment.centerLeft,
                            child: TextButton.icon(
                              onPressed: () => _manual.text = data.gymCheckinCode,
                              icon: const Icon(Icons.auto_fix_high, size: 15),
                              label: const Text('Use the demo gym code'),
                            ),
                          ),
                        ],
                        const SizedBox(height: 14),
                        LoadingButton(
                          label: _busy ? 'Checking you in' : 'Check in',
                          icon: Icons.login,
                          loading: _busy,
                          onPressed: _manual.text.trim().isEmpty ? null : () => _submit(_manual.text),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  ForgeCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SectionHeader(
                          title: 'Your last 30 days',
                          subtitle: 'Every visit is counted from your check-ins.',
                        ),
                        const SizedBox(height: 12),
                        if (data.visits.isEmpty)
                          const EmptyPanel(
                            title: 'No visits recorded yet',
                            message: 'Your first check-in will show here.',
                            icon: Icons.how_to_reg_outlined,
                          )
                        else
                          Wrap(
                            spacing: 7,
                            runSpacing: 7,
                            children: [
                              for (final day in data.visits.reversed.take(30))
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: ForgeColors.green.withValues(alpha: 0.09),
                                    borderRadius: BorderRadius.circular(7),
                                    border: Border.all(color: ForgeColors.green.withValues(alpha: 0.28)),
                                  ),
                                  child: Text(
                                    shortDay(day),
                                    style: ForgeTheme.mono(8.5, color: ForgeColors.green, letterSpacing: 0.2),
                                  ),
                                ),
                            ],
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

class _CameraIdle extends StatelessWidget {
  const _CameraIdle({required this.onStart, required this.busy});

  final VoidCallback onStart;
  final bool busy;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: ForgeColors.red.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: ForgeColors.red.withValues(alpha: 0.3)),
            ),
            child: const Icon(Icons.qr_code_scanner, size: 31, color: ForgeColors.redHi),
          ),
          const SizedBox(height: 13),
          Text('Scan the gym QR', style: ForgeTheme.display(20, letterSpacing: 0.6)),
          const SizedBox(height: 4),
          Text('The camera opens only when you ask.', style: ForgeTheme.body(10.5, color: ForgeColors.mute)),
          const SizedBox(height: 13),
          FilledButton.icon(
            onPressed: busy ? null : onStart,
            icon: const Icon(Icons.camera_alt_outlined, size: 16),
            label: const Text('Open camera'),
          ),
        ],
      ),
    );
  }
}

class _CameraFallback extends StatelessWidget {
  const _CameraFallback({required this.error, required this.onManual});

  final String error;
  final VoidCallback onManual;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.no_photography_outlined, size: 26, color: ForgeColors.mute),
            const SizedBox(height: 8),
            Text(
              'Camera unavailable',
              style: ForgeTheme.body(12.5, weight: FontWeight.w600, color: ForgeColors.bone),
            ),
            const SizedBox(height: 3),
            Text('Type the gym code below instead.', style: ForgeTheme.body(10.5, color: ForgeColors.mute)),
            const SizedBox(height: 10),
            OutlinedButton(onPressed: onManual, child: const Text('Use the code entry')),
          ],
        ),
      ),
    );
  }
}

class _ScanFrame extends StatelessWidget {
  const _ScanFrame();

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Center(
        child: Container(
          width: 190,
          height: 190,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: ForgeColors.redHi.withValues(alpha: 0.85), width: 2.2),
            boxShadow: [BoxShadow(color: ForgeColors.red.withValues(alpha: 0.25), blurRadius: 30)],
          ),
        ),
      ),
    );
  }
}

class _ScannerButton extends StatelessWidget {
  const _ScannerButton({required this.icon, required this.onTap, required this.label});

  final IconData icon;
  final VoidCallback onTap;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: label,
      child: Material(
        color: Colors.black.withValues(alpha: 0.55),
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: Icon(icon, size: 18, color: Colors.white),
          ),
        ),
      ),
    );
  }
}

class _ResultCard extends StatelessWidget {
  const _ResultCard({required this.result, required this.gymName, required this.visits, required this.onDone});

  final Json result;
  final String gymName;
  final int visits;
  final VoidCallback onDone;

  @override
  Widget build(BuildContext context) {
    final already = boolOf(result['alreadyCheckedIn']);
    final visitsMonth = result['visitsMonth'] == null ? visits : intOf(result['visitsMonth']);
    return ForgeCard(
      accent: already ? ForgeColors.amber : ForgeColors.green,
      child: Column(
        children: [
          Container(
            width: 66,
            height: 66,
            decoration: BoxDecoration(
              color: (already ? ForgeColors.amber : ForgeColors.green).withValues(alpha: 0.12),
              shape: BoxShape.circle,
              border: Border.all(color: (already ? ForgeColors.amber : ForgeColors.green).withValues(alpha: 0.35)),
            ),
            child: Icon(
              already ? Icons.info_outline : Icons.check_rounded,
              size: 34,
              color: already ? ForgeColors.amber : ForgeColors.green,
            ),
          ),
          const SizedBox(height: 15),
          Text(already ? 'Already checked in' : 'You are in.', style: ForgeTheme.display(32, letterSpacing: 0.4)),
          const SizedBox(height: 7),
          Text(
            str(result['message'], already ? 'You are already checked in today.' : 'Checked in successfully.'),
            textAlign: TextAlign.center,
            style: ForgeTheme.body(13, color: ForgeColors.boneDim),
          ),
          const SizedBox(height: 18),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            alignment: WrapAlignment.center,
            children: [
              _ResultStat(label: 'Time', value: str(result['time'], '—')),
              _ResultStat(label: 'Visits this month', value: '$visitsMonth'),
              _ResultStat(label: 'Gym', value: gymName),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: 240,
            child: FilledButton.icon(
              onPressed: onDone,
              icon: const Icon(Icons.done, size: 17),
              label: const Text('Done'),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Show your pass at the desk if the team needs to confirm your membership.',
            textAlign: TextAlign.center,
            style: ForgeTheme.mono(8.5, letterSpacing: 0.3),
          ),
        ],
      ),
    );
  }
}

class _ResultStat extends StatelessWidget {
  const _ResultStat({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 9),
      decoration: BoxDecoration(
        color: ForgeColors.ink2,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: ForgeColors.line),
      ),
      child: Column(
        children: [
          Text(label.toUpperCase(), style: ForgeTheme.mono(8, letterSpacing: 1)),
          const SizedBox(height: 3),
          Text(
            value,
            style: ForgeTheme.body(11.5, weight: FontWeight.w700, color: ForgeColors.bone),
          ),
        ],
      ),
    );
  }
}
