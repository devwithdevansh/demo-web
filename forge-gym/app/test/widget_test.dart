import 'package:flutter_test/flutter_test.dart';
import 'package:forge_gym/core/format.dart';

void main() {
  group('money formatting', () {
    test('inr formats whole rupees', () {
      expect(inr(1500), contains('1,500'));
      expect(inr(null), contains('0'));
    });

    test('inrShort compacts large values', () {
      expect(inrShort(1500), contains('1,500'));
      expect(inrShort(250000), contains('2.5'));
    });
  });

  group('date formatting', () {
    test('dayLabel handles missing and valid dates', () {
      expect(dayLabel(null), '—');
      expect(dayLabel('2026-03-04T10:00:00.000Z'), '4 Mar 2026');
    });

    test('monthLabel parses yyyy-MM', () {
      expect(monthLabel('2026-11'), 'Nov');
    });

    test('timeLabel converts 24h to 12h', () {
      expect(timeLabel('06:30'), '6:30 AM');
      expect(timeLabel('18:05:00'), '6:05 PM');
    });
  });

  group('labels', () {
    test('titleCase splits separators', () {
      expect(titleCase('in_progress'), 'In Progress');
      expect(titleCase(''), '');
    });

    test('initials and firstName', () {
      expect(initials('Aarav Shah'), 'AS');
      expect(initials('Rhea'), 'R');
      expect(firstName('  Imran Shaikh '), 'Imran');
    });

    test('relDays describes remaining days', () {
      expect(relDays(0), 'Ends today');
      expect(relDays(1), '1 day left');
      expect(relDays(-3), 'Lapsed 3 days ago');
    });

    test('durationLabel prefers explicit days', () {
      expect(durationLabel(1, 15), '15 days');
      expect(durationLabel(12, null), '1 year');
      expect(durationLabel(3, null), '3 months');
    });
  });
}
