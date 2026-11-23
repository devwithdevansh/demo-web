import 'package:intl/intl.dart';

final _inr = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);
final _inrCompact = NumberFormat.compactCurrency(locale: 'en_IN', symbol: '₹', decimalDigits: 1);

String inr(num? amount) => _inr.format(amount ?? 0);
String inrShort(num? amount) {
  final value = amount ?? 0;
  if (value.abs() < 100000) return _inr.format(value);
  return _inrCompact.format(value);
}

DateTime? parseDay(String? value) {
  if (value == null || value.isEmpty) return null;
  final raw = value.length >= 10 ? value.substring(0, 10) : value;
  return DateTime.tryParse(raw);
}

String dayLabel(String? value) {
  final d = parseDay(value);
  if (d == null) return '—';
  return DateFormat('d MMM yyyy').format(d);
}

String shortDay(String? value) {
  final d = parseDay(value);
  if (d == null) return '—';
  return DateFormat('d MMM').format(d);
}

String monthLabel(String value) {
  // value is yyyy-MM
  final d = DateTime.tryParse('$value-01');
  if (d == null) return value;
  return DateFormat('MMM').format(d);
}

String stampLabel(String? iso) {
  if (iso == null || iso.isEmpty) return '—';
  final d = DateTime.tryParse(iso)?.toLocal();
  if (d == null) return '—';
  return DateFormat('d MMM · h:mm a').format(d);
}

String timeLabel(String? value) {
  if (value == null || value.isEmpty) return '—';
  final match = RegExp(r'^(\d{1,2}):(\d{2})').firstMatch(value);
  if (match != null) {
    final h = int.parse(match.group(1)!);
    final m = match.group(2)!;
    final suffix = h >= 12 ? 'PM' : 'AM';
    final hour = ((h + 11) % 12) + 1;
    return '$hour:$m $suffix';
  }
  return value;
}

String todayKey() => DateFormat('yyyy-MM-dd').format(DateTime.now());

String weekday(String? dayKey) {
  final d = parseDay(dayKey);
  if (d == null) return '';
  return DateFormat('EEEE').format(d);
}

String greeting() {
  final hour = DateTime.now().hour;
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

String initials(String name) {
  final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
  if (parts.isEmpty) return '?';
  if (parts.length == 1) return parts.first.substring(0, 1).toUpperCase();
  return (parts.first.substring(0, 1) + parts.last.substring(0, 1)).toUpperCase();
}

String firstName(String name) => name.trim().split(RegExp(r'\s+')).first;

String roleLabel(String role) => switch (role) {
  'owner' => 'Owner',
  'staff' => 'Front desk',
  'trainer' => 'Trainer',
  'member' => 'Member',
  _ => role,
};

String titleCase(String value) {
  if (value.isEmpty) return value;
  return value.split(RegExp(r'[_\s-]+')).map((w) => w.isEmpty ? w : w[0].toUpperCase() + w.substring(1)).join(' ');
}

String relDays(int daysLeft) {
  if (daysLeft == 0) return 'Ends today';
  final n = daysLeft.abs();
  final word = '$n day${n == 1 ? '' : 's'}';
  return daysLeft > 0 ? '$word left' : 'Lapsed $word ago';
}

String durationLabel(int months, int? days) {
  if (days != null && days > 0) return '$days days';
  if (months <= 0) return '—';
  if (months == 12) return '1 year';
  return '$months month${months == 1 ? '' : 's'}';
}

class GymSchedule {
  static bool isOpen([DateTime? time]) {
    final now = time ?? DateTime.now();
    final totalMins = now.hour * 60 + now.minute;
    if (now.weekday == DateTime.sunday) {
      return totalMins >= 6 * 60 && totalMins < 13 * 60; // 06:00 AM - 01:00 PM
    }
    return totalMins >= 6 * 60 && totalMins < 22 * 60; // 06:00 AM - 10:00 PM
  }

  static String statusTitle([DateTime? time]) {
    final now = time ?? DateTime.now();
    return isOpen(now) ? 'OPEN NOW' : 'CLOSED NOW';
  }

  static String statusSubtitle([DateTime? time]) {
    final now = time ?? DateTime.now();
    final open = isOpen(now);
    final totalMins = now.hour * 60 + now.minute;
    if (open) {
      final closesAt = now.weekday == DateTime.sunday ? '01:00 PM' : '10:00 PM';
      return 'Closes at $closesAt';
    } else {
      if (totalMins < 6 * 60) return 'Opens today at 06:00 AM';
      return 'Opens tomorrow at 06:00 AM';
    }
  }

  static String todaysHours([DateTime? time]) {
    final now = time ?? DateTime.now();
    if (now.weekday == DateTime.sunday) return '06:00 AM – 01:00 PM';
    return '06:00 AM – 10:00 PM';
  }
}
