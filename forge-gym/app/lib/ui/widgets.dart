import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../core/api.dart';
import '../core/format.dart';
import '../core/theme.dart';

class ForgeLogo extends StatelessWidget {
  const ForgeLogo({super.key, this.size = 34, this.showWordmark = true, this.subtitle});

  final double size;
  final bool showWordmark;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [ForgeColors.redHi, ForgeColors.redDeep],
            ),
            borderRadius: BorderRadius.circular(size * 0.22),
            boxShadow: [
              BoxShadow(color: ForgeColors.red.withValues(alpha: 0.35), blurRadius: 18, offset: const Offset(0, 6)),
            ],
          ),
          child: CustomPaint(painter: _ForgeMarkPainter()),
        ),
        if (showWordmark) ...[
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('FORGE', style: ForgeTheme.display(size * 0.72, letterSpacing: 3.2, height: 0.95)),
              if (subtitle != null)
                Text(subtitle!.toUpperCase(), style: ForgeTheme.mono(size * 0.22, letterSpacing: 2.2)),
            ],
          ),
        ],
      ],
    );
  }
}

class _ForgeMarkPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white
      ..strokeWidth = size.width * 0.16
      ..strokeCap = StrokeCap.square;
    final left = size.width * 0.28;
    final top = size.height * 0.24;
    final bottom = size.height * 0.76;
    canvas.drawLine(Offset(left, top), Offset(left, bottom), paint);
    canvas.drawLine(Offset(left, top), Offset(size.width * 0.7, top), paint);
    canvas.drawLine(Offset(left, size.height * 0.5), Offset(size.width * 0.58, size.height * 0.5), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class ForgeBackground extends StatelessWidget {
  const ForgeBackground({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        const Positioned.fill(child: ColoredBox(color: ForgeColors.ink)),
        Positioned(
          top: -220,
          right: -160,
          child: Container(
            width: 520,
            height: 520,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [ForgeColors.red.withValues(alpha: 0.14), ForgeColors.red.withValues(alpha: 0)],
              ),
            ),
          ),
        ),
        Positioned(
          bottom: -260,
          left: -200,
          child: Container(
            width: 620,
            height: 620,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [ForgeColors.blue.withValues(alpha: 0.07), ForgeColors.blue.withValues(alpha: 0)],
              ),
            ),
          ),
        ),
        Positioned.fill(child: child),
      ],
    );
  }
}

class ForgeCard extends StatelessWidget {
  const ForgeCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.onTap,
    this.accent,
    this.highlight = false,
  });

  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color? accent;
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    final content = Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [highlight ? ForgeColors.panelHi : ForgeColors.panel, ForgeColors.ink2.withValues(alpha: 0.92)],
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: accent?.withValues(alpha: 0.45) ?? ForgeColors.line),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.24), blurRadius: 24, offset: const Offset(0, 12)),
        ],
      ),
      padding: padding,
      child: child,
    );
    if (onTap == null) return content;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: onTap,
        hoverColor: ForgeColors.panelHi.withValues(alpha: 0.5),
        child: content,
      ),
    );
  }
}

class Eyebrow extends StatelessWidget {
  const Eyebrow(this.text, {super.key, this.color});

  final String text;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 18, height: 2, color: color ?? ForgeColors.red),
        const SizedBox(width: 8),
        Text(text.toUpperCase(), style: ForgeTheme.mono(10, color: color ?? ForgeColors.mute, letterSpacing: 2.4)),
      ],
    );
  }
}

class PageHeader extends StatelessWidget {
  const PageHeader({super.key, required this.title, this.eyebrow, this.subtitle, this.actions = const []});

  final String title;
  final String? eyebrow;
  final String? subtitle;
  final List<Widget> actions;

  @override
  Widget build(BuildContext context) {
    final narrow = MediaQuery.sizeOf(context).width < 720;
    final titleBlock = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (eyebrow != null) ...[Eyebrow(eyebrow!), const SizedBox(height: 10)],
        Text(title, style: ForgeTheme.display(narrow ? 34 : 42, letterSpacing: 0.4)),
        if (subtitle != null) ...[
          const SizedBox(height: 6),
          Text(subtitle!, style: ForgeTheme.body(13.5, color: ForgeColors.mute)),
        ],
      ],
    );
    if (actions.isEmpty) return titleBlock;
    return Wrap(
      alignment: WrapAlignment.spaceBetween,
      crossAxisAlignment: WrapCrossAlignment.end,
      runSpacing: 14,
      spacing: 14,
      children: [
        titleBlock,
        Wrap(spacing: 10, runSpacing: 10, children: actions),
      ],
    );
  }
}

class ForgePage extends StatelessWidget {
  const ForgePage({super.key, required this.child, this.maxWidth = 1280, this.padding});

  final Widget child;
  final double maxWidth;
  final EdgeInsetsGeometry? padding;

  @override
  Widget build(BuildContext context) {
    final narrow = MediaQuery.sizeOf(context).width < 700;
    return SingleChildScrollView(
      padding: padding ?? EdgeInsets.fromLTRB(narrow ? 16 : 30, narrow ? 18 : 28, narrow ? 16 : 30, 44),
      child: Center(
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: maxWidth),
          child: child,
        ),
      ),
    );
  }
}

class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.title, this.trailing, this.subtitle});

  final String title;
  final String? subtitle;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: ForgeTheme.display(21, letterSpacing: 0.8)),
              if (subtitle != null) ...[
                const SizedBox(height: 2),
                Text(subtitle!, style: ForgeTheme.body(12, color: ForgeColors.mute)),
              ],
            ],
          ),
        ),
        ?trailing,
      ],
    );
  }
}

class StatCard extends StatelessWidget {
  const StatCard({
    super.key,
    required this.label,
    required this.value,
    this.sub,
    this.icon,
    this.accent = ForgeColors.red,
    this.onTap,
  });

  final String label;
  final String value;
  final String? sub;
  final IconData? icon;
  final Color accent;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      onTap: onTap,
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (icon != null)
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: accent.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(9),
                    border: Border.all(color: accent.withValues(alpha: 0.3)),
                  ),
                  child: Icon(icon, size: 17, color: accent),
                ),
              if (icon != null) const Spacer(),
              if (icon == null) const Spacer(),
              Text(label.toUpperCase(), style: ForgeTheme.mono(9.5, letterSpacing: 1.4)),
            ],
          ),
          const SizedBox(height: 14),
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Text(value, style: ForgeTheme.display(30, letterSpacing: 0.3)),
          ),
          if (sub != null) ...[
            const SizedBox(height: 4),
            Text(sub!, style: ForgeTheme.body(11.5, color: ForgeColors.mute)),
          ],
        ],
      ),
    );
  }
}

class StatusPill extends StatelessWidget {
  const StatusPill({super.key, required this.label, this.color, this.dense = false});

  final String label;
  final Color? color;
  final bool dense;

  static Color colorFor(String value) => switch (value) {
    'active' || 'joined' || 'paid' || 'delivered' || 'read' || 'sent' || 'accepted' => ForgeColors.green,
    'expiring' || 'trial' || 'contacted' || 'requested' || 'pending' || 'new' => ForgeColors.amber,
    'expired' || 'lost' || 'failed' || 'cancelled' || 'inactive' => ForgeColors.redHi,
    'paused' || 'simulated' => ForgeColors.mute,
    _ => ForgeColors.blue,
  };

  @override
  Widget build(BuildContext context) {
    final tone = color ?? colorFor(label.toLowerCase());
    return Container(
      padding: EdgeInsets.symmetric(horizontal: dense ? 8 : 10, vertical: dense ? 3 : 5),
      decoration: BoxDecoration(
        color: tone.withValues(alpha: 0.11),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: tone.withValues(alpha: 0.35)),
      ),
      child: Text(
        label.toUpperCase(),
        style: ForgeTheme.mono(dense ? 8.5 : 9.5, color: tone, weight: FontWeight.w600, letterSpacing: 1.1),
      ),
    );
  }
}

class AvatarCircle extends StatelessWidget {
  const AvatarCircle({super.key, required this.name, this.size = 42, this.color});

  final String name;
  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final tone = color ?? _tone(name);
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [tone.withValues(alpha: 0.32), tone.withValues(alpha: 0.1)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(size * 0.3),
        border: Border.all(color: tone.withValues(alpha: 0.4)),
      ),
      child: Text(initials(name), style: ForgeTheme.display(size * 0.4, color: tone, letterSpacing: 1)),
    );
  }

  Color _tone(String value) {
    const palette = [ForgeColors.blue, ForgeColors.green, ForgeColors.amber, ForgeColors.violet, ForgeColors.redHi];
    final hash = value.codeUnits.fold<int>(0, (a, b) => a + b);
    return palette[hash % palette.length];
  }
}

class ForgeField extends StatelessWidget {
  const ForgeField({super.key, required this.label, required this.child, this.hint});

  final String label;
  final Widget child;
  final String? hint;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label.toUpperCase(), style: ForgeTheme.mono(9.5, letterSpacing: 1.4)),
        const SizedBox(height: 7),
        child,
        if (hint != null) ...[
          const SizedBox(height: 5),
          Text(hint!, style: ForgeTheme.body(10.5, color: ForgeColors.mute)),
        ],
      ],
    );
  }
}

class AsyncBuilder<T> extends StatefulWidget {
  const AsyncBuilder({
    super.key,
    required this.load,
    required this.builder,
    this.loading,
    this.retryLabel = 'Try again',
  });

  final Future<T> Function() load;
  final Widget Function(BuildContext context, T data, VoidCallback reload) builder;
  final Widget? loading;
  final String retryLabel;

  @override
  State<AsyncBuilder<T>> createState() => _AsyncBuilderState<T>();
}

class _AsyncBuilderState<T> extends State<AsyncBuilder<T>> {
  late Future<T> _future;

  @override
  void initState() {
    super.initState();
    _future = widget.load();
  }

  void _reload() {
    setState(() {
      _future = widget.load();
    });
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<T>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
          return widget.loading ?? const ForgeLoading();
        }
        if (snapshot.hasError) {
          return ErrorPanel(error: snapshot.error!, onRetry: _reload, retryLabel: widget.retryLabel);
        }
        if (!snapshot.hasData) {
          return ErrorPanel(error: 'No data was returned.', onRetry: _reload);
        }
        return widget.builder(context, snapshot.data as T, _reload);
      },
    );
  }
}

class ForgeLoading extends StatelessWidget {
  const ForgeLoading({super.key, this.label = 'Loading'});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 48),
      child: Column(
        children: [
          const SizedBox(width: 26, height: 26, child: CircularProgressIndicator(strokeWidth: 2.4)),
          const SizedBox(height: 14),
          Text(label.toUpperCase(), style: ForgeTheme.mono(9.5, letterSpacing: 2)),
        ],
      ),
    );
  }
}

class ErrorPanel extends StatelessWidget {
  const ErrorPanel({super.key, required this.error, this.onRetry, this.retryLabel = 'Try again'});

  final Object error;
  final VoidCallback? onRetry;
  final String retryLabel;

  @override
  Widget build(BuildContext context) {
    final isApi = error is ApiException;
    final api = isApi ? error as ApiException : null;
    final title = api?.isUnreachable == true ? 'Cannot reach the gym server' : 'Something needs attention';
    final message = api?.message ?? '$error';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 28),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 460),
          child: ForgeCard(
            accent: ForgeColors.red,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.error_outline, color: ForgeColors.redHi, size: 20),
                    const SizedBox(width: 8),
                    Text(title, style: ForgeTheme.display(18, letterSpacing: 1)),
                  ],
                ),
                const SizedBox(height: 10),
                Text(message, style: ForgeTheme.body(13, color: ForgeColors.boneDim)),
                if (api?.isUnreachable == true) ...[
                  const SizedBox(height: 8),
                  Text(
                    'TIP · Check the server address in Settings, then try again.',
                    style: ForgeTheme.mono(9.5, letterSpacing: 0.4),
                  ),
                ],
                if (onRetry != null) ...[
                  const SizedBox(height: 16),
                  OutlinedButton(onPressed: onRetry, child: Text(retryLabel)),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class EmptyPanel extends StatelessWidget {
  const EmptyPanel({super.key, required this.title, this.message, this.icon = Icons.inbox_outlined, this.action});

  final String title;
  final String? message;
  final IconData icon;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 34),
      decoration: BoxDecoration(
        color: ForgeColors.ink2.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ForgeColors.line),
      ),
      child: Column(
        children: [
          Icon(icon, color: ForgeColors.mute, size: 28),
          const SizedBox(height: 10),
          Text(
            title,
            style: ForgeTheme.body(14, weight: FontWeight.w600, color: ForgeColors.boneDim),
          ),
          if (message != null) ...[
            const SizedBox(height: 4),
            Text(
              message!,
              textAlign: TextAlign.center,
              style: ForgeTheme.body(12, color: ForgeColors.mute),
            ),
          ],
          if (action != null) ...[const SizedBox(height: 14), action!],
        ],
      ),
    );
  }
}

class InfoRow extends StatelessWidget {
  const InfoRow({super.key, required this.label, required this.value, this.valueColor, this.icon});

  final String label;
  final String value;
  final Color? valueColor;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (icon != null) ...[Icon(icon, size: 14, color: ForgeColors.mute), const SizedBox(width: 7)],
          Expanded(
            child: Text(label, style: ForgeTheme.body(12.5, color: ForgeColors.mute)),
          ),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: ForgeTheme.body(12.5, weight: FontWeight.w600, color: valueColor ?? ForgeColors.bone),
            ),
          ),
        ],
      ),
    );
  }
}

class ResponsiveGrid extends StatelessWidget {
  const ResponsiveGrid({super.key, required this.children, this.minItemWidth = 230, this.spacing = 14});

  final List<Widget> children;
  final double minItemWidth;
  final double spacing;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = constraints.maxWidth;
        final columns = (width / minItemWidth).floor().clamp(1, 6);
        final itemWidth = (width - spacing * (columns - 1)) / columns;
        return Wrap(
          spacing: spacing,
          runSpacing: spacing,
          children: children.map((child) => SizedBox(width: itemWidth, child: child)).toList(),
        );
      },
    );
  }
}

Future<T?> showForgeSheet<T>({
  required BuildContext context,
  required Widget child,
  String? title,
  double maxWidth = 560,
}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    barrierColor: Colors.black.withValues(alpha: 0.7),
    builder: (context) {
      final bottom = MediaQuery.viewInsetsOf(context).bottom;
      return Padding(
        padding: EdgeInsets.only(bottom: bottom),
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: maxWidth),
            child: Container(
              margin: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: ForgeColors.panel,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: ForgeColors.line),
              ),
              child: ConstrainedBox(
                constraints: BoxConstraints(maxHeight: MediaQuery.sizeOf(context).height * 0.88),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (title != null)
                      Padding(
                        padding: const EdgeInsets.fromLTRB(22, 18, 14, 10),
                        child: Row(
                          children: [
                            Expanded(child: Text(title, style: ForgeTheme.display(22, letterSpacing: 0.8))),
                            IconButton(
                              onPressed: () => Navigator.of(context).pop(),
                              icon: const Icon(Icons.close, size: 19),
                            ),
                          ],
                        ),
                      ),
                    Flexible(
                      child: SingleChildScrollView(padding: const EdgeInsets.fromLTRB(22, 8, 22, 24), child: child),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
    },
  );
}

void showSnack(BuildContext context, String message, {bool error = false}) {
  messengerOf(context).showSnackBar(
    SnackBar(
      content: Row(
        children: [
          Icon(
            error ? Icons.error_outline : Icons.check_circle_outline,
            color: error ? ForgeColors.redHi : ForgeColors.green,
            size: 18,
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(message)),
        ],
      ),
    ),
  );
}

ScaffoldMessengerState messengerOf(BuildContext context) => ScaffoldMessenger.of(context);

Future<bool> showConfirm(
  BuildContext context, {
  required String title,
  required String message,
  String confirmLabel = 'Confirm',
  bool danger = false,
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(title, style: ForgeTheme.display(22, letterSpacing: 0.6)),
      content: Text(message, style: ForgeTheme.body(13)),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        FilledButton(
          style: FilledButton.styleFrom(
            backgroundColor: danger ? ForgeColors.red : ForgeColors.bone,
            foregroundColor: danger ? Colors.white : ForgeColors.ink,
          ),
          onPressed: () => Navigator.pop(context, true),
          child: Text(confirmLabel),
        ),
      ],
    ),
  );
  return result ?? false;
}

Future<String?> showTextPrompt(
  BuildContext context, {
  required String title,
  String? hint,
  String? initial,
  String confirmLabel = 'Save',
  int maxLines = 1,
}) {
  final controller = TextEditingController(text: initial);
  return showDialog<String>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(title, style: ForgeTheme.display(22)),
      content: TextField(
        controller: controller,
        autofocus: true,
        maxLines: maxLines,
        decoration: InputDecoration(hintText: hint),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: Text(confirmLabel)),
      ],
    ),
  );
}

class LoadingButton extends StatelessWidget {
  const LoadingButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.loading = false,
    this.icon,
    this.expand = true,
    this.danger = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool loading;
  final IconData? icon;
  final bool expand;
  final bool danger;

  @override
  Widget build(BuildContext context) {
    final child = loading
        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[Icon(icon, size: 17), const SizedBox(width: 8)],
              Text(label),
            ],
          );
    final button = danger
        ? OutlinedButton(
            onPressed: loading ? null : onPressed,
            style: OutlinedButton.styleFrom(
              foregroundColor: ForgeColors.redHi,
              side: const BorderSide(color: ForgeColors.redDeep),
            ),
            child: child,
          )
        : FilledButton(onPressed: loading ? null : onPressed, child: child);
    return expand ? SizedBox(width: double.infinity, child: button) : button;
  }
}

class ChoiceRow<T> extends StatelessWidget {
  const ChoiceRow({
    super.key,
    required this.values,
    required this.selected,
    required this.label,
    required this.onSelected,
  });

  final List<T> values;
  final T selected;
  final String Function(T) label;
  final ValueChanged<T> onSelected;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: values.map((v) {
        final active = v == selected;
        return GestureDetector(
          onTap: () => onSelected(v),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: active ? ForgeColors.red.withValues(alpha: 0.14) : ForgeColors.ink2,
              borderRadius: BorderRadius.circular(9),
              border: Border.all(color: active ? ForgeColors.red : ForgeColors.line),
            ),
            child: Text(
              label(v),
              style: ForgeTheme.body(
                11.5,
                weight: active ? FontWeight.w600 : FontWeight.w500,
                color: active ? ForgeColors.bone : ForgeColors.mute,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class VerticalBar extends StatelessWidget {
  const VerticalBar({super.key, required this.value, this.max = 1, this.height = 42, this.color});

  final double value;
  final double max;
  final double height;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final ratio = max <= 0 ? 0.0 : (value / max).clamp(0.0, 1.0);
    return Align(
      alignment: Alignment.bottomCenter,
      child: Container(
        height: height * ratio + 3,
        decoration: BoxDecoration(color: color ?? ForgeColors.red, borderRadius: BorderRadius.circular(3)),
      ),
    );
  }
}

class LiveGymClockBanner extends StatefulWidget {
  const LiveGymClockBanner({
    super.key,
    this.gymName,
    this.noticeCount = 0,
    this.onTapNotices,
  });

  final String? gymName;
  final int noticeCount;
  final VoidCallback? onTapNotices;

  @override
  State<LiveGymClockBanner> createState() => _LiveGymClockBannerState();
}

class _LiveGymClockBannerState extends State<LiveGymClockBanner> {
  late DateTime _now;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _now = DateTime.now();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final open = GymSchedule.isOpen(_now);
    final statusTitle = GymSchedule.statusTitle(_now);
    final statusSubtitle = GymSchedule.statusSubtitle(_now);
    final dayStr = DateFormat('EEEE').format(_now).toUpperCase();
    final dateStr = DateFormat('d MMM yyyy').format(_now);
    final timeStr = DateFormat('hh:mm:ss a').format(_now);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: ForgeColors.panel,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: ForgeColors.line),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isNarrow = constraints.maxWidth < 360;
          final statusBadge = Container(
            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
            decoration: BoxDecoration(
              color: open
                  ? ForgeColors.green.withValues(alpha: 0.12)
                  : ForgeColors.red.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: open
                    ? ForgeColors.green.withValues(alpha: 0.35)
                    : ForgeColors.red.withValues(alpha: 0.35),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: BoxDecoration(
                        color: open ? ForgeColors.green : ForgeColors.redHi,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      statusTitle,
                      style: ForgeTheme.mono(
                        9,
                        color: open ? ForgeColors.green : ForgeColors.redHi,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  statusSubtitle,
                  style: ForgeTheme.body(9, color: ForgeColors.boneDim),
                ),
              ],
            ),
          );

          if (isNarrow) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      dayStr,
                      style: ForgeTheme.mono(9.5, color: ForgeColors.redHi, letterSpacing: 1.2),
                    ),
                    statusBadge,
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.access_time_rounded, size: 15, color: ForgeColors.bone),
                    const SizedBox(width: 5),
                    Text(
                      timeStr,
                      style: ForgeTheme.mono(15, color: ForgeColors.bone, letterSpacing: 0.8),
                    ),
                    const Spacer(),
                    Text(
                      dateStr,
                      style: ForgeTheme.mono(9, color: ForgeColors.mute),
                    ),
                    if (widget.onTapNotices != null) ...[
                      const SizedBox(width: 4),
                      _noticeBell(),
                    ],
                  ],
                ),
              ],
            );
          }

          return Row(
            children: [
              // Left: Day, Date & Live Clock
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerLeft,
                      child: Row(
                        children: [
                          Text(
                            dayStr,
                            style: ForgeTheme.mono(9.5, color: ForgeColors.redHi, letterSpacing: 1.2),
                          ),
                          Text(
                            ' · $dateStr',
                            style: ForgeTheme.mono(9.5, color: ForgeColors.mute, letterSpacing: 0.8),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 3),
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      alignment: Alignment.centerLeft,
                      child: Row(
                        children: [
                          const Icon(Icons.access_time_rounded, size: 16, color: ForgeColors.bone),
                          const SizedBox(width: 6),
                          Text(
                            timeStr,
                            style: ForgeTheme.mono(15.5, color: ForgeColors.bone, letterSpacing: 0.8),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              // Right: Gym Open/Closed status badge
              statusBadge,
              if (widget.onTapNotices != null) ...[
                const SizedBox(width: 4),
                _noticeBell(),
              ],
            ],
          );
        },
      ),
    );
  }

  Widget _noticeBell() {
    return IconButton(
      constraints: const BoxConstraints(),
      padding: const EdgeInsets.all(6),
      tooltip: 'Notices & Alerts',
      onPressed: widget.onTapNotices,
      icon: Stack(
        clipBehavior: Clip.none,
        children: [
          const Icon(Icons.notifications_outlined, size: 19, color: ForgeColors.bone),
          if (widget.noticeCount > 0)
            Positioned(
              top: -2,
              right: -2,
              child: Container(
                padding: const EdgeInsets.all(3),
                decoration: const BoxDecoration(
                  color: ForgeColors.redHi,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '${widget.noticeCount}',
                  style: const TextStyle(fontSize: 8, color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class NoticeBar extends StatelessWidget {
  const NoticeBar({
    super.key,
    required this.title,
    required this.body,
    this.date,
    this.isUrgent = false,
    this.onTap,
  });

  final String title;
  final String body;
  final String? date;
  final bool isUrgent;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final tone = isUrgent ? ForgeColors.redHi : ForgeColors.amber;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
          decoration: BoxDecoration(
            color: tone.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: tone.withValues(alpha: 0.35)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(isUrgent ? Icons.campaign_rounded : Icons.info_outline, size: 19, color: tone),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            title,
                            style: ForgeTheme.body(12, weight: FontWeight.w700, color: ForgeColors.bone),
                          ),
                        ),
                        if (date != null && date!.isNotEmpty)
                          Text(
                            date!,
                            style: ForgeTheme.mono(9, color: ForgeColors.mute),
                          ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      body,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: ForgeTheme.body(11, color: ForgeColors.boneDim),
                    ),
                  ],
                ),
              ),
              if (onTap != null) ...[
                const SizedBox(width: 6),
                const Icon(Icons.chevron_right, size: 16, color: ForgeColors.mute),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

Future<void> showNoticesSheet(BuildContext context, List<dynamic> announcements) async {
  await showForgeSheet<void>(
    context: context,
    title: 'Gym Notices & Announcements',
    child: announcements.isEmpty
        ? const EmptyPanel(
            title: 'No current notices',
            message: 'All gym operations and classes are running normally.',
            icon: Icons.notifications_none,
          )
        : Column(
            children: [
              for (final ann in announcements) ...[
                ForgeCard(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                            decoration: BoxDecoration(
                              color: ForgeColors.red.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              (ann is Map ? ann['createdAt'] ?? 'Notice' : (ann as dynamic).createdAt ?? 'Notice').toString().toUpperCase(),
                              style: ForgeTheme.mono(8.5, color: ForgeColors.redHi, letterSpacing: 1),
                            ),
                          ),
                          const Spacer(),
                          Text(
                            (ann is Map ? ann['postedBy'] ?? '' : (ann as dynamic).postedBy ?? '').toString(),
                            style: ForgeTheme.mono(9, color: ForgeColors.mute),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        (ann is Map ? ann['title'] ?? '' : (ann as dynamic).title ?? '').toString(),
                        style: ForgeTheme.body(13, weight: FontWeight.w700, color: ForgeColors.bone),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        (ann is Map ? (ann['body'] ?? ann['message'] ?? '') : (ann as dynamic).body ?? '').toString(),
                        style: ForgeTheme.body(11.5, color: ForgeColors.boneDim),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
              ],
            ],
          ),
  );
}
