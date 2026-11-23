import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../core/format.dart';
import '../core/theme.dart';
import '../ui/widgets.dart';

// ==============================================================================
// 1. IN-WORKOUT REST TIMER & PLANK STOPWATCH
// ==============================================================================

class InWorkoutRestTimer extends StatefulWidget {
  const InWorkoutRestTimer({super.key});

  @override
  State<InWorkoutRestTimer> createState() => _InWorkoutRestTimerState();
}

class _InWorkoutRestTimerState extends State<InWorkoutRestTimer> {
  Timer? _timer;
  int _secondsLeft = 60;
  int _totalDuration = 60;
  bool _running = false;
  bool _isStopwatch = false; // true for Plank stopwatch (counts up)
  int _stopwatchSeconds = 0;

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer(int seconds, {bool stopwatch = false}) {
    _timer?.cancel();
    HapticFeedback.selectionClick();
    setState(() {
      _isStopwatch = stopwatch;
      if (stopwatch) {
        _stopwatchSeconds = 0;
      } else {
        _totalDuration = seconds;
        _secondsLeft = seconds;
      }
      _running = true;
    });

    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      if (_isStopwatch) {
        setState(() => _stopwatchSeconds++);
        // Subtle tick haptic every 15s on plank
        if (_stopwatchSeconds % 15 == 0) {
          HapticFeedback.lightImpact();
        }
      } else {
        if (_secondsLeft > 1) {
          setState(() => _secondsLeft--);
          if (_secondsLeft <= 3) {
            HapticFeedback.lightImpact();
            SystemSound.play(SystemSoundType.click);
          }
        } else {
          t.cancel();
          setState(() {
            _secondsLeft = 0;
            _running = false;
          });
          HapticFeedback.heavyImpact();
          SystemSound.play(SystemSoundType.alert);
          if (mounted) {
            showSnack(context, '⏰ Rest completed! Time for the next set.');
          }
        }
      }
    });
  }

  void _pauseResume() {
    if (!_running) {
      if (_isStopwatch) {
        _startTimer(0, stopwatch: true);
      } else {
        if (_secondsLeft <= 0) _secondsLeft = _totalDuration;
        _startTimer(_secondsLeft);
      }
      return;
    }
    _timer?.cancel();
    HapticFeedback.selectionClick();
    setState(() => _running = false);
  }

  void _reset() {
    _timer?.cancel();
    HapticFeedback.selectionClick();
    setState(() {
      _running = false;
      _secondsLeft = _totalDuration;
      _stopwatchSeconds = 0;
    });
  }

  String _formatTime(int totalSecs) {
    final m = (totalSecs ~/ 60).toString().padLeft(2, '0');
    final s = (totalSecs % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final currentDisplay = _isStopwatch ? _stopwatchSeconds : _secondsLeft;
    final progress = _isStopwatch
        ? (_stopwatchSeconds % 60) / 60.0
        : (_totalDuration <= 0 ? 0.0 : (_secondsLeft / _totalDuration).clamp(0.0, 1.0));

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: ForgeColors.ink2,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: _running ? ForgeColors.redHi.withValues(alpha: 0.5) : ForgeColors.line,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                _isStopwatch ? Icons.timer_outlined : Icons.hourglass_top_rounded,
                size: 16,
                color: _running ? ForgeColors.redHi : ForgeColors.mute,
              ),
              const SizedBox(width: 8),
              Text(
                _isStopwatch ? 'PLANK / TIME TRACKER' : 'IN-WORKOUT REST TIMER',
                style: ForgeTheme.mono(9, color: _running ? ForgeColors.redHi : ForgeColors.mute, letterSpacing: 1.2),
              ),
              const Spacer(),
              if (_running)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: ForgeColors.green.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(5),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(width: 6, height: 6, decoration: const BoxDecoration(color: ForgeColors.green, shape: BoxShape.circle)),
                      const SizedBox(width: 4),
                      Text('Ticking', style: ForgeTheme.mono(8.5, color: ForgeColors.green)),
                    ],
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),
          // Timer readout & Controls
          Row(
            children: [
              // Digital Readout
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: ForgeColors.panel,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: ForgeColors.lineHi),
                ),
                child: Text(
                  _formatTime(currentDisplay),
                  style: ForgeTheme.mono(24, color: _running ? ForgeColors.bone : ForgeColors.boneDim, letterSpacing: 1.2),
                ),
              ),
              const SizedBox(width: 12),
              // Play/Pause button
              IconButton.filled(
                style: IconButton.styleFrom(
                  backgroundColor: _running ? ForgeColors.amber : ForgeColors.redHi,
                  foregroundColor: Colors.white,
                ),
                onPressed: _pauseResume,
                icon: Icon(_running ? Icons.pause_rounded : Icons.play_arrow_rounded, size: 20),
              ),
              const SizedBox(width: 6),
              // Reset button
              IconButton.outlined(
                style: IconButton.styleFrom(
                  side: const BorderSide(color: ForgeColors.line),
                  foregroundColor: ForgeColors.mute,
                ),
                onPressed: _reset,
                icon: const Icon(Icons.refresh_rounded, size: 18),
              ),
            ],
          ),
          const SizedBox(height: 10),
          // Progress Bar
          ClipRRect(
            borderRadius: BorderRadius.circular(3),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 4,
              backgroundColor: ForgeColors.line,
              valueColor: AlwaysStoppedAnimation(
                _isStopwatch ? ForgeColors.blue : (_secondsLeft <= 5 ? ForgeColors.redHi : ForgeColors.green),
              ),
            ),
          ),
          const SizedBox(height: 12),
          // Presets: 30s, 60s, 90s, 120s, Plank
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _TimerPreset(label: '30s', onTap: () => _startTimer(30)),
                const SizedBox(width: 6),
                _TimerPreset(label: '60s', onTap: () => _startTimer(60)),
                const SizedBox(width: 6),
                _TimerPreset(label: '90s', onTap: () => _startTimer(90)),
                const SizedBox(width: 6),
                _TimerPreset(label: '120s', onTap: () => _startTimer(120)),
                const SizedBox(width: 6),
                _TimerPreset(
                  label: 'Plank Hold',
                  icon: Icons.timer,
                  tone: ForgeColors.blue,
                  onTap: () => _startTimer(0, stopwatch: true),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TimerPreset extends StatelessWidget {
  const _TimerPreset({required this.label, required this.onTap, this.icon, this.tone});

  final String label;
  final VoidCallback onTap;
  final IconData? icon;
  final Color? tone;

  @override
  Widget build(BuildContext context) {
    final activeColor = tone ?? ForgeColors.boneDim;
    return OutlinedButton(
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        minimumSize: const Size(40, 30),
        side: const BorderSide(color: ForgeColors.line),
        backgroundColor: ForgeColors.panel,
      ),
      onPressed: onTap,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[Icon(icon, size: 13, color: activeColor), const SizedBox(width: 4)],
          Text(label, style: ForgeTheme.mono(10.5, color: activeColor)),
        ],
      ),
    );
  }
}

// ==============================================================================
// 2. STREAK & MONTHLY CONSISTENCY HEATMAP
// ==============================================================================

class StreakHeatmapCard extends StatelessWidget {
  const StreakHeatmapCard({super.key, this.streakDays = 14, this.visits = const []});

  final int streakDays;
  final List<String> visits;

  @override
  Widget build(BuildContext context) {
    // Generate last 28 days for consistency matrix (4 weeks x 7 days)
    final now = DateTime.now();
    final days = List.generate(28, (i) => now.subtract(Duration(days: 27 - i)));

    return ForgeCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: ForgeColors.red.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: ForgeColors.red.withValues(alpha: 0.3)),
                ),
                child: const Center(child: Text('🔥', style: TextStyle(fontSize: 19))),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          '$streakDays-DAY STREAK',
                          style: ForgeTheme.display(18, letterSpacing: 0.4),
                        ),
                        const SizedBox(width: 8),
                        const StatusPill(label: 'TOP 5%', color: ForgeColors.red, dense: true),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Personal best: 21 days · 18 workouts in the last 30 days',
                      style: ForgeTheme.body(11, color: ForgeColors.mute),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Day labels header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              Text('MON', style: TextStyle(fontSize: 8, color: ForgeColors.mute)),
              Text('TUE', style: TextStyle(fontSize: 8, color: ForgeColors.mute)),
              Text('WED', style: TextStyle(fontSize: 8, color: ForgeColors.mute)),
              Text('THU', style: TextStyle(fontSize: 8, color: ForgeColors.mute)),
              Text('FRI', style: TextStyle(fontSize: 8, color: ForgeColors.mute)),
              Text('SAT', style: TextStyle(fontSize: 8, color: ForgeColors.mute)),
              Text('SUN', style: TextStyle(fontSize: 8, color: ForgeColors.mute)),
            ],
          ),
          const SizedBox(height: 6),
          // Heatmap grid (4 weeks of 7 squares)
          Column(
            children: [
              for (var week = 0; week < 4; week++) ...[
                Padding(
                  padding: const EdgeInsets.only(bottom: 5),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      for (var col = 0; col < 7; col++) ...[
                        _buildHeatmapCell(days[week * 7 + col], week, col),
                      ],
                    ],
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 6),
          // Legend
          Row(
            children: [
              Text('Rest day', style: ForgeTheme.mono(8.5, color: ForgeColors.mute)),
              const SizedBox(width: 6),
              Container(width: 9, height: 9, decoration: BoxDecoration(color: ForgeColors.ink2, borderRadius: BorderRadius.circular(2))),
              const SizedBox(width: 4),
              Container(width: 9, height: 9, decoration: BoxDecoration(color: ForgeColors.green.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2))),
              const SizedBox(width: 4),
              Container(width: 9, height: 9, decoration: BoxDecoration(color: ForgeColors.green, borderRadius: BorderRadius.circular(2))),
              const SizedBox(width: 6),
              Text('Consistent', style: ForgeTheme.mono(8.5, color: ForgeColors.green)),
              const Spacer(),
              Text('64% monthly score', style: ForgeTheme.mono(9, color: ForgeColors.boneDim)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHeatmapCell(DateTime date, int week, int col) {
    // Realistic consistency pattern: training on Mon, Tue, Thu, Fri, Sat
    final weekday = date.weekday;
    final isTrained = weekday == 1 || weekday == 2 || weekday == 4 || weekday == 5 || (weekday == 6 && week % 2 == 0);
    final isDouble = isTrained && (weekday == 1 || weekday == 5);
    final isToday = date.day == DateTime.now().day && date.month == DateTime.now().month;

    Color cellColor = ForgeColors.ink2;
    if (isTrained) {
      cellColor = isDouble ? ForgeColors.green : ForgeColors.green.withValues(alpha: 0.45);
    }

    return Container(
      width: 38,
      height: 24,
      decoration: BoxDecoration(
        color: cellColor,
        borderRadius: BorderRadius.circular(5),
        border: isToday ? Border.all(color: ForgeColors.bone, width: 1.2) : null,
      ),
      alignment: Alignment.center,
      child: Text(
        '${date.day}',
        style: TextStyle(
          fontSize: 8.5,
          fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
          color: isTrained ? Colors.white : ForgeColors.mute,
        ),
      ),
    );
  }
}

// ==============================================================================
// 3. PERSONAL RECORDS (PRS) & 1RM CALCULATOR
// ==============================================================================

class PrCalculatorView extends StatefulWidget {
  const PrCalculatorView({super.key});

  @override
  State<PrCalculatorView> createState() => _PrCalculatorViewState();
}

class _PrCalculatorViewState extends State<PrCalculatorView> {
  final _weight = TextEditingController(text: '80');
  int _reps = 6;

  // PR Records stored in-memory
  final Map<String, (double weight, String badge)> _prs = {
    'Bench Press': (100.0, '🥇 Club 100'),
    'Barbell Squat': (140.0, '🔥 Heavy Hitter'),
    'Deadlift': (180.0, '👑 Beast Mode'),
    'Overhead Press': (65.0, '⚡ Iron Shoulder'),
  };

  @override
  void dispose() {
    _weight.dispose();
    super.dispose();
  }

  double get _calculated1RM {
    final w = double.tryParse(_weight.text) ?? 0.0;
    if (w <= 0 || _reps <= 0) return 0.0;
    // Epley Formula: 1RM = Weight * (1 + Reps / 30)
    return w * (1 + _reps / 30.0);
  }

  void _logPr(String exercise, double weight) {
    HapticFeedback.heavyImpact();
    setState(() {
      _prs[exercise] = (weight, '🔥 New Record');
    });
    showSnack(context, '🏆 Congratulations! New $exercise record logged: ${weight.toStringAsFixed(1)} kg!');
  }

  @override
  Widget build(BuildContext context) {
    final oneRm = _calculated1RM;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1RM Calculator Box
        ForgeCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.calculate_outlined, size: 18, color: ForgeColors.blue),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '1-REP MAX (1RM) CALCULATOR',
                      style: ForgeTheme.mono(9.5, color: ForgeColors.blue, letterSpacing: 1.2),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    flex: 5,
                    child: ForgeField(
                      label: 'Weight lifted (kg)',
                      child: TextField(
                        controller: _weight,
                        keyboardType: TextInputType.number,
                        onChanged: (_) => setState(() {}),
                        style: ForgeTheme.mono(16, color: ForgeColors.bone),
                        decoration: const InputDecoration(suffixText: 'kg'),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 5,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Reps ($_reps)', style: ForgeTheme.mono(9, color: ForgeColors.mute)),
                        const SizedBox(height: 4),
                        Slider(
                          value: _reps.toDouble(),
                          min: 1,
                          max: 12,
                          divisions: 11,
                          activeColor: ForgeColors.redHi,
                          onChanged: (v) => setState(() => _reps = v.round()),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Estimated 1RM Readout
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [ForgeColors.red.withValues(alpha: 0.15), ForgeColors.ink2],
                  ),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: ForgeColors.red.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('ESTIMATED 1RM', style: ForgeTheme.mono(9, color: ForgeColors.redHi, letterSpacing: 1.2)),
                        const SizedBox(height: 2),
                        Text('${oneRm.toStringAsFixed(1)} kg', style: ForgeTheme.display(24, color: ForgeColors.bone)),
                      ],
                    ),
                    // Percentage breakdowns
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('90% · ${(oneRm * 0.9).toStringAsFixed(1)} kg (3-4 reps)', style: ForgeTheme.mono(9, color: ForgeColors.boneDim)),
                        Text('80% · ${(oneRm * 0.8).toStringAsFixed(1)} kg (7-8 reps)', style: ForgeTheme.mono(9, color: ForgeColors.mute)),
                        Text('70% · ${(oneRm * 0.7).toStringAsFixed(1)} kg (10-12 reps)', style: ForgeTheme.mono(9, color: ForgeColors.mute)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // PR Trophy Shelf
        const SectionHeader(
          title: 'Personal Records',
          subtitle: 'Your all-time lifetime best lifts.',
        ),
        const SizedBox(height: 12),
        for (final entry in _prs.entries) ...[
          Padding(
            padding: const EdgeInsets.only(bottom: 9),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: ForgeColors.ink2,
                borderRadius: BorderRadius.circular(11),
                border: Border.all(color: ForgeColors.line),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                      color: ForgeColors.amber.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.emoji_events_outlined, size: 18, color: ForgeColors.amber),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(entry.key, style: ForgeTheme.body(13, weight: FontWeight.w600, color: ForgeColors.bone)),
                        Text(entry.value.$2, style: ForgeTheme.mono(9.5, color: ForgeColors.mute)),
                      ],
                    ),
                  ),
                  Text('${entry.value.$1.toStringAsFixed(1)} kg', style: ForgeTheme.mono(15, color: ForgeColors.bone, letterSpacing: 0.6)),
                  const SizedBox(width: 8),
                  IconButton(
                    tooltip: 'Update PR',
                    onPressed: () => _logPr(entry.key, entry.value.$1 + 2.5),
                    icon: const Icon(Icons.add_circle_outline, size: 18, color: ForgeColors.redHi),
                  ),
                ],
              ),
            ),
          ),
        ],
      ],
    );
  }
}

Future<void> showPrCalculatorSheet(BuildContext context) async {
  await showForgeSheet<void>(
    context: context,
    title: '1RM Calculator & PRs',
    child: const PrCalculatorView(),
  );
}

// ==============================================================================
// 4. BEFORE & AFTER TRANSFORMATION PHOTO SLIDER
// ==============================================================================

class BeforeAfterSliderCard extends StatefulWidget {
  const BeforeAfterSliderCard({super.key});

  @override
  State<BeforeAfterSliderCard> createState() => _BeforeAfterSliderCardState();
}

class _BeforeAfterSliderCardState extends State<BeforeAfterSliderCard> {
  double _dividerPosition = 0.5; // 0.0 (all before) to 1.0 (all after)

  @override
  Widget build(BuildContext context) {
    return ForgeCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: ForgeColors.violet.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: ForgeColors.violet.withValues(alpha: 0.3)),
                ),
                child: const Icon(Icons.compare_rounded, size: 18, color: ForgeColors.violet),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('BODY TRANSFORMATION', style: ForgeTheme.mono(9, color: ForgeColors.violet, letterSpacing: 1.2)),
                    const SizedBox(height: 2),
                    Text('90-Day Progress Reveal', style: ForgeTheme.display(18, letterSpacing: 0.3)),
                  ],
                ),
              ),
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4)),
                onPressed: () => showSnack(context, 'Photo upload opened. Select front/side check-in pictures.'),
                icon: const Icon(Icons.camera_alt_outlined, size: 14),
                label: const Text('Add photo', style: TextStyle(fontSize: 11)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Interactive Split Slider Box
          LayoutBuilder(
            builder: (context, constraints) {
              final w = constraints.maxWidth;
              const h = 230.0;
              final splitX = (w * _dividerPosition).clamp(20.0, w - 20.0);

              return GestureDetector(
                onHorizontalDragUpdate: (details) {
                  setState(() {
                    _dividerPosition = (details.localPosition.dx / w).clamp(0.05, 0.95);
                  });
                },
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: w,
                    height: h,
                    color: ForgeColors.ink2,
                    child: Stack(
                      children: [
                        // AFTER LAYER (Right side reveal)
                        Positioned.fill(
                          child: Container(
                            decoration: const BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [Color(0xFF1B2838), Color(0xFF0F1A24)],
                              ),
                            ),
                            child: Stack(
                              children: [
                                Center(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.fitness_center_rounded, size: 48, color: ForgeColors.green),
                                      const SizedBox(height: 8),
                                      Text('AFTER · 74.2 KG', style: ForgeTheme.display(16, color: ForgeColors.green)),
                                      Text('Body fat 14.8% · Lean muscle block', style: ForgeTheme.mono(9, color: ForgeColors.mute)),
                                    ],
                                  ),
                                ),
                                Positioned(
                                  top: 10,
                                  right: 10,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.8), borderRadius: BorderRadius.circular(6)),
                                    child: const Text('CURRENT (90 DAYS)', style: TextStyle(fontSize: 9, color: ForgeColors.green, fontWeight: FontWeight.bold)),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        // BEFORE LAYER (Left side reveal, clipped by width)
                        Positioned(
                          top: 0,
                          bottom: 0,
                          left: 0,
                          width: splitX,
                          child: ClipRect(
                            child: Container(
                              width: w,
                              decoration: const BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                  colors: [Color(0xFF2A1F1D), Color(0xFF1C1413)],
                                ),
                              ),
                              child: Stack(
                                children: [
                                  Center(
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const Icon(Icons.person_outline_rounded, size: 48, color: ForgeColors.amber),
                                        const SizedBox(height: 8),
                                        Text('BEFORE · 84.5 KG', style: ForgeTheme.display(16, color: ForgeColors.amber)),
                                        Text('Body fat 22.4% · Day 1 baseline', style: ForgeTheme.mono(9, color: ForgeColors.mute)),
                                      ],
                                    ),
                                  ),
                                  Positioned(
                                    top: 10,
                                    left: 10,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.8), borderRadius: BorderRadius.circular(6)),
                                      child: const Text('DAY 1 BASELINE', style: TextStyle(fontSize: 9, color: ForgeColors.amber, fontWeight: FontWeight.bold)),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        // DRAGGABLE DIVIDER LINE & HANDLE
                        Positioned(
                          top: 0,
                          bottom: 0,
                          left: splitX - 1.5,
                          child: Container(
                            width: 3,
                            color: Colors.white,
                          ),
                        ),
                        Positioned(
                          top: h / 2 - 16,
                          left: splitX - 16,
                          child: Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(color: Colors.black.withValues(alpha: 0.5), blurRadius: 6, spreadRadius: 1),
                              ],
                            ),
                            child: Icon(Icons.code_rounded, size: 16, color: Colors.black.withValues(alpha: 0.8)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 8),
          Center(
            child: Text(
              '◀ Drag slider horizontally to compare before vs after ▶',
              style: ForgeTheme.mono(8.5, color: ForgeColors.mute),
            ),
          ),
        ],
      ),
    );
  }
}

Future<void> showBeforeAfterSheet(BuildContext context) async {
  await showForgeSheet<void>(
    context: context,
    title: 'Transformation Gallery',
    child: const BeforeAfterSliderCard(),
  );
}
