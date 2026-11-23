import '../models.dart';

/// Complete, self-contained mock demo data for the FORGE Gym mobile app.
/// Powers all screens (Dashboard, Members, Attendance, Coaching, Payments,
/// Member Portal, Settings, Videos, Reports) when running offline or without an active backend.
class MockData {
  static final GymSession sampleGym = GymSession(
    name: 'Ironpeak Fitness (Sample Gym)',
    package: 'performance',
    addons: {
      'whatsapp': true,
      'upiLinks': true,
      'autopay': true,
      'leadFollowup': true,
      'trainerPlus': true,
    },
    isDemo: true,
  );

  static final Map<String, ForgeUser> demoUsers = {
    'owner': const ForgeUser(
      id: 'usr_owner_1',
      name: 'Test Owner 1',
      role: 'owner',
      title: 'Gym Owner & Head Coach',
    ),
    'owner2': const ForgeUser(
      id: 'usr_owner_2',
      name: 'Test Owner 2',
      role: 'owner',
      title: 'Co-Owner',
    ),
    'staff': const ForgeUser(
      id: 'usr_staff_1',
      name: 'Test Staff 1',
      role: 'staff',
      title: 'Front Desk & Operations',
    ),
    'staff2': const ForgeUser(
      id: 'usr_staff_2',
      name: 'Test Staff 2',
      role: 'staff',
      title: 'Front Desk',
    ),
    'trainer': const ForgeUser(
      id: 'usr_trainer_1',
      name: 'Test Trainer 1',
      role: 'trainer',
      title: 'Senior Strength Coach',
    ),
    'trainer2': const ForgeUser(
      id: 'usr_trainer_2',
      name: 'Test Trainer 2',
      role: 'trainer',
      title: 'Fitness Coach',
    ),
    'member': const ForgeUser(
      id: 'usr_member_1',
      name: 'Test Member 1',
      role: 'member',
      title: 'Member',
    ),
    'member2': const ForgeUser(
      id: 'usr_member_2',
      name: 'Test Member 2',
      role: 'member',
      title: 'Member',
    ),
  };

  static ForgeSession demoSession([String role = 'owner']) {
    final user = demoUsers[role.toLowerCase()] ?? demoUsers['owner']!;
    return ForgeSession(
      token: 'demo-token-${user.role}',
      sandboxKey: 'demo-sandbox-1',
      user: user,
      gym: sampleGym,
    );
  }

  // In-memory collections that support additions/updates during the app session
  static final List<Json> _members = _initMembers();
  static final List<Json> _plans = _initPlans();
  static final List<Json> _checkins = _initCheckins();
  static final List<Json> _payments = _initPayments();
  static final List<Json> _leads = _initLeads();
  static final List<Json> _team = _initTeam();
  static final List<Json> _announcements = _initAnnouncements();
  static final List<Json> _videos = _initVideos();
  static final List<Json> _slots = _initSlots();

  static String activeRole = 'owner';

  static Json handleRequest(String path, {String method = 'GET', Object? body, String? tokenRole}) {
    if (tokenRole != null && tokenRole.isNotEmpty) {
      activeRole = tokenRole;
    }
    final cleanPath = path.split('?').first;
    final m = method.toUpperCase();
    final jsonBody = body is Map<String, dynamic> ? body : <String, dynamic>{};

    // 1. Auth & Session
    if (cleanPath == '/auth/login' || cleanPath == '/demo/session') {
      final identifier = str(jsonBody['identifier']).toLowerCase();
      final reqRole = str(jsonBody['role']).toLowerCase();

      String role = 'owner';
      if (reqRole.isNotEmpty && demoUsers.containsKey(reqRole)) {
        role = reqRole;
      } else if (identifier.contains('trainer2')) {
        role = 'trainer2';
      } else if (identifier.contains('trainer') || identifier.contains('coach') || identifier.contains('alex')) {
        role = 'trainer';
      } else if (identifier.contains('member2')) {
        role = 'member2';
      } else if (identifier.contains('member') || identifier.contains('aarav')) {
        role = 'member';
      } else if (identifier.contains('staff2')) {
        role = 'staff2';
      } else if (identifier.contains('staff') || identifier.contains('desk') || identifier.contains('imran')) {
        role = 'staff';
      } else if (identifier.contains('owner2')) {
        role = 'owner2';
      } else {
        role = 'owner';
      }
      activeRole = role;
      return demoSession(role).toJson();
    }

    if (cleanPath == '/me') {
      final session = demoSession(activeRole);
      return {'user': session.user.toJson(), 'gym': session.gym.toJson()};
    }

    if (cleanPath == '/health') {
      return {'ok': true, 'database': 'connected', 'mode': 'demo_offline'};
    }

    // 2. Dashboard
    if (cleanPath == '/dashboard') {
      final now = DateTime.now();
      final todayStr = now.toIso8601String().substring(0, 10);
      return {
        'today': todayStr,
        'counts': {
          'activeMembers': _members.where((m) => m['status'] == 'active').length,
          'expiringSoon': _members.where((m) => (m['daysLeft'] as int? ?? 99) <= 7 && (m['daysLeft'] as int? ?? 99) >= 0).length,
          'lapsed': _members.where((m) => (m['daysLeft'] as int? ?? 99) < 0).length,
          'checkinsToday': _checkins.length,
          'collectedToday': 8500,
          'collectedMonth': 185000,
          'duesTotal': 5999,
          'duesMembers': 4,
          'openLeads': _leads.length,
          'followUpsDue': 3,
        },
        'checkins': _checkins.take(8).toList(),
        'expiring': _members.where((m) => (m['daysLeft'] as int? ?? 99) <= 7 && (m['daysLeft'] as int? ?? 99) >= 0).take(5).toList(),
        'followUps': _leads.take(4).toList(),
        'payments': _payments.take(5).toList(),
      };
    }

    // 3. Members
    if (cleanPath == '/members') {
      if (m == 'POST') {
        final newId = 'mem_${DateTime.now().millisecondsSinceEpoch}';
        final planId = str(jsonBody['planId'], 'plan_quarterly');
        final matchingPlan = _plans.firstWhere((p) => p['id'] == planId, orElse: () => _plans.first);
        final planName = str(jsonBody['planName'], matchingPlan['name']);
        final planPrice = intOf(jsonBody['planPrice'], intOf(matchingPlan['price'], 3799));
        final durationDays = intOf(matchingPlan['durationDays'], intOf(matchingPlan['durationMonths'], 3) * 30);
        final startDate = str(jsonBody['startDate'], DateTime.now().toIso8601String().substring(0, 10));
        DateTime startDt;
        try {
          startDt = DateTime.parse(startDate);
        } catch (_) {
          startDt = DateTime.now();
        }
        final expiry = startDt.add(Duration(days: durationDays)).toIso8601String().substring(0, 10);
        final paidNow = intOf(jsonBody['paidNow'], 0);
        final feeDue = (planPrice - paidNow).clamp(0, 999999);

        final newMember = {
          'id': newId,
          'memberCode': 'F-${1000 + _members.length + 1}',
          'name': str(jsonBody['name'], 'New Member'),
          'phone': str(jsonBody['phone'], '+91 98765 00000'),
          'email': str(jsonBody['email'], ''),
          'category': str(jsonBody['category'], 'General fitness'),
          'planId': planId,
          'planName': planName,
          'planPrice': planPrice,
          'startDate': startDate,
          'expiryDate': expiry,
          'feeDue': feeDue,
          'trainerId': jsonBody['trainerId'] != null ? str(jsonBody['trainerId']) : null,
          'trainerName': jsonBody['trainerId'] != null ? 'Alex Rey' : null,
          'notes': str(jsonBody['notes'], ''),
          'ptTotal': intOf(jsonBody['ptTotal'], 0),
          'ptUsed': 0,
          'autopayStatus': 'inactive',
          'autopayAmount': 0,
          'status': 'active',
          'daysLeft': durationDays,
          'hasAppAccess': true,
          'createdAt': DateTime.now().toIso8601String(),
          'workout': _sampleWorkout(),
          'diet': _sampleDiet(),
        };
        _members.insert(0, newMember);
        if (paidNow > 0) {
          _payments.insert(0, {
            'id': 'pay_${DateTime.now().millisecondsSinceEpoch}',
            'memberId': newId,
            'memberName': newMember['name'],
            'memberCode': newMember['memberCode'],
            'amount': paidNow,
            'method': str(jsonBody['method'], 'cash'),
            'note': 'Joining fee / initial payment',
            'createdAt': DateTime.now().toIso8601String(),
          });
        }
        return {'ok': true, 'member': newMember, ...newMember};
      }
      return {'members': _members};
    }

    if (cleanPath.startsWith('/members/')) {
      if (cleanPath.endsWith('/renew')) {
        final id = cleanPath.replaceFirst('/members/', '').replaceFirst('/renew', '');
        final existing = _members.firstWhere((item) => item['id'] == id, orElse: () => _members.first);
        final planId = str(jsonBody['planId'], existing['planId']);
        final matchingPlan = _plans.firstWhere((p) => p['id'] == planId, orElse: () => _plans.first);
        final days = intOf(matchingPlan['durationDays'], intOf(matchingPlan['durationMonths'], 1) * 30);
        DateTime base = DateTime.now();
        try {
          final cur = DateTime.parse(str(existing['expiryDate']));
          if (cur.isAfter(base)) base = cur;
        } catch (_) {}
        final newExpiry = base.add(Duration(days: days)).toIso8601String().substring(0, 10);
        final paid = intOf(jsonBody['amount'], intOf(matchingPlan['price'], 1999));
        existing['planId'] = planId;
        existing['planName'] = matchingPlan['name'];
        existing['planPrice'] = intOf(matchingPlan['price'], 1999);
        existing['expiryDate'] = newExpiry;
        existing['status'] = 'active';
        existing['daysLeft'] = days;
        existing['feeDue'] = 0;
        _payments.insert(0, {
          'id': 'pay_${DateTime.now().millisecondsSinceEpoch}',
          'memberId': existing['id'],
          'memberName': existing['name'],
          'memberCode': existing['memberCode'],
          'amount': paid,
          'method': str(jsonBody['method'], 'upi'),
          'note': 'Renewal: ${matchingPlan['name']}',
          'createdAt': DateTime.now().toIso8601String(),
        });
        return {'ok': true, 'member': existing, ...existing};
      }

      final id = cleanPath.replaceFirst('/members/', '');
      final existing = _members.firstWhere((item) => item['id'] == id, orElse: () => _members.first);
      if (m == 'DELETE') {
        _members.removeWhere((item) => item['id'] == id);
        return {'ok': true};
      }
      if (m == 'PATCH' || m == 'PUT') {
        existing.addAll(jsonBody);
        return {'ok': true, 'member': existing, ...existing};
      }
      return {
        'member': existing,
        'payments': _payments.where((p) => p['memberId'] == id || p['memberName'] == existing['name']).toList(),
        'checkins': _checkins.where((c) => c['memberId'] == id || c['name'] == existing['name']).toList(),
        'coachLogs': _initSampleLogs(existing['name']),
        'visits': _checkins.where((c) => c['memberId'] == id).map((c) => str(c['time'])).toList(),
      };
    }

    // 4. Plans
    if (cleanPath.startsWith('/plans/')) {
      final id = cleanPath.replaceFirst('/plans/', '');
      final existing = _plans.firstWhere((p) => p['id'] == id, orElse: () => _plans.first);
      if (m == 'DELETE') {
        _plans.removeWhere((p) => p['id'] == id);
        return {'ok': true};
      }
      if (m == 'PATCH' || m == 'PUT') {
        existing.addAll(jsonBody);
        return {'ok': true, 'plan': existing, ...existing};
      }
      return {'ok': true, 'plan': existing, ...existing};
    }

    if (cleanPath == '/plans') {
      if (m == 'POST') {
        final newPlan = {
          'id': 'plan_${DateTime.now().millisecondsSinceEpoch}',
          'name': str(jsonBody['name'], 'New Plan'),
          'price': intOf(jsonBody['price'], 1999),
          'durationMonths': intOf(jsonBody['durationMonths'], 1),
          'durationDays': jsonBody['durationDays'] == null ? null : intOf(jsonBody['durationDays']),
          'active': true,
        };
        _plans.add(newPlan);
        return {'ok': true, 'plan': newPlan, ...newPlan};
      }
      return {'plans': _plans};
    }

    // 5. Attendance
    if (cleanPath.startsWith('/attendance/')) {
      final id = cleanPath.replaceFirst('/attendance/', '');
      if (m == 'DELETE') {
        _checkins.removeWhere((c) => c['id'] == id);
        return {'ok': true};
      }
    }

    if (cleanPath == '/attendance') {
      if (m == 'POST') {
        final memberId = str(jsonBody['memberId']);
        final memberCode = str(jsonBody['memberCode']);
        final match = _members.firstWhere(
          (m) => (memberId.isNotEmpty && m['id'] == memberId) || (memberCode.isNotEmpty && m['memberCode'] == memberCode),
          orElse: () => _members.first,
        );
        final newCheckin = {
          'id': 'chk_${DateTime.now().millisecondsSinceEpoch}',
          'memberId': match['id'],
          'name': match['name'],
          'memberCode': match['memberCode'],
          'time': '${DateTime.now().hour.toString().padLeft(2, '0')}:${DateTime.now().minute.toString().padLeft(2, '0')}',
          'method': str(jsonBody['method'], 'manual'),
        };
        _checkins.insert(0, newCheckin);
        return {'ok': true, 'checkin': newCheckin};
      }
      return {
        'day': DateTime.now().toIso8601String().substring(0, 10),
        'isToday': true,
        'gymId': 'gym_demo_1',
        'gymName': sampleGym.name,
        'gymCheckinCode': 'FORGE-8842',
        'entries': _checkins,
        'notCheckedIn': _members.where((m) => !_checkins.any((c) => c['name'] == m['name'])).take(10).toList(),
      };
    }

    // 6. Payments
    if (cleanPath == '/payments') {
      if (m == 'POST') {
        final memberId = str(jsonBody['memberId']);
        final amt = intOf(jsonBody['amount'], 1500);
        final mem = _members.firstWhere((m) => m['id'] == memberId, orElse: () => _members.first);
        final newPayment = {
          'id': 'pay_${DateTime.now().millisecondsSinceEpoch}',
          'memberId': mem['id'],
          'memberName': mem['name'],
          'memberCode': mem['memberCode'],
          'amount': amt,
          'method': str(jsonBody['method'], 'cash'),
          'note': str(jsonBody['note'], 'Fee payment'),
          'createdAt': DateTime.now().toIso8601String(),
        };
        _payments.insert(0, newPayment);
        if (mem['feeDue'] != null) {
          final curDue = intOf(mem['feeDue']);
          mem['feeDue'] = (curDue - amt).clamp(0, 999999);
        }
        return {'ok': true, 'payment': newPayment};
      }
      return {
        'totals': {
          'today': 8500,
          'month': 185000,
          'dues': 5999,
        },
        'payments': _payments,
        'dues': _members.where((m) => (m['feeDue'] as int? ?? 0) > 0).toList(),
      };
    }

    // 7. Renewals
    if (cleanPath == '/renewals') {
      return {
        'expiring': _members.where((m) => (m['daysLeft'] as int? ?? 99) <= 7 && (m['daysLeft'] as int? ?? 99) >= 0).toList(),
        'lapsed': _members.where((m) => (m['daysLeft'] as int? ?? 99) < 0).toList(),
      };
    }

    // 8. Leads
    if (cleanPath.startsWith('/leads/')) {
      final id = cleanPath.replaceFirst('/leads/', '');
      final existing = _leads.firstWhere((l) => l['id'] == id, orElse: () => _leads.first);
      if (m == 'DELETE') {
        _leads.removeWhere((l) => l['id'] == id);
        return {'ok': true};
      }
      if (m == 'PATCH' || m == 'PUT') {
        existing.addAll(jsonBody);
        return {'ok': true, 'lead': existing, ...existing};
      }
      return {'ok': true, 'lead': existing, ...existing};
    }

    if (cleanPath == '/leads') {
      if (m == 'POST') {
        final newLead = {
          'id': 'lead_${DateTime.now().millisecondsSinceEpoch}',
          'name': str(jsonBody['name'], 'New Lead'),
          'phone': str(jsonBody['phone'], '+91 99999 00000'),
          'status': str(jsonBody['status'], 'trial'),
          'notes': str(jsonBody['notes'], 'Inquired about training'),
          'followUpDate': str(jsonBody['followUpDate'], DateTime.now().add(const Duration(days: 2)).toIso8601String().substring(0, 10)),
          'createdAt': DateTime.now().toIso8601String(),
        };
        _leads.insert(0, newLead);
        return {'ok': true, 'lead': newLead, ...newLead};
      }
      return {'leads': _leads};
    }

    // 9. Team
    if (cleanPath.startsWith('/team/')) {
      final id = cleanPath.replaceFirst('/team/', '');
      final existing = _team.firstWhere((t) => t['id'] == id, orElse: () => _team.first);
      if (m == 'DELETE') {
        _team.removeWhere((t) => t['id'] == id);
        return {'ok': true};
      }
      if (m == 'PATCH' || m == 'PUT') {
        existing.addAll(jsonBody);
        return {'ok': true, 'member': existing, ...existing};
      }
      return {'ok': true, 'member': existing, ...existing};
    }

    if (cleanPath == '/team') {
      if (m == 'POST') {
        final newTeam = {
          'id': 'usr_team_${DateTime.now().millisecondsSinceEpoch}',
          'name': str(jsonBody['name'], 'New Team Member'),
          'role': str(jsonBody['role'], 'trainer'),
          'title': str(jsonBody['title'], 'Fitness Coach'),
          'phone': str(jsonBody['phone'], '+91 98765 00000'),
          'email': str(jsonBody['email'], ''),
          'active': boolOf(jsonBody['active'], true),
          'members': 0,
        };
        _team.add(newTeam);
        return {'ok': true, 'member': newTeam, ...newTeam};
      }
      return {'team': _team};
    }

    // 10. Coach routes
    if (cleanPath == '/coach/overview') {
      final trainerName = activeRole == 'trainer2' ? 'Test Trainer 2' : 'Test Trainer 1';
      final trainerTitle = activeRole == 'trainer2' ? 'Fitness Coach' : 'Senior Strength Coach';
      final now = DateTime.now();
      const weekdaysShort = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      const weekdaysFull = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      final shortDay = weekdaysShort[now.weekday - 1];
      final fullDay = weekdaysFull[now.weekday - 1];

      // Filter classes today for this trainer or general today's classes
      final todayClasses = _slots.where((s) {
        final dayStr = str(s['day']).toLowerCase();
        final matchesDay = dayStr.contains(shortDay) || dayStr.contains(fullDay) || dayStr.contains('daily');
        final tName = str(s['trainerName']).toLowerCase();
        final matchesTrainer = tName.isEmpty || tName.contains(trainerName.toLowerCase());
        return matchesDay && matchesTrainer;
      }).toList();

      return {
        'today': now.toIso8601String().substring(0, 10),
        'trainerName': trainerName,
        'trainerTitle': trainerTitle,
        'members': _members.map((m) => {
          'id': m['id'],
          'name': m['name'],
          'category': m['category'],
          'ptRemaining': m['ptTotal'] != null ? (m['ptTotal'] as int) - (m['ptUsed'] as int? ?? 0) : 0,
          'lastLog': 'Bench Press 80kg x 6 reps · RPE 8',
        }).toList(),
        'tasks': [
          {'id': 't1', 'title': 'Review Test Member 1 workout log', 'done': false, 'memberId': 'mem_1'},
          {'id': 't2', 'title': 'Send new diet recommendations to Test Member 2', 'done': true, 'memberId': 'mem_2'},
        ],
        'classesToday': todayClasses.isNotEmpty ? todayClasses : _slots.take(2).toList(),
      };
    }

    if (cleanPath.startsWith('/coach/members/')) {
      if (cleanPath.endsWith('/workout')) {
        final id = cleanPath.replaceFirst('/coach/members/', '').replaceFirst('/workout', '');
        final mem = _members.firstWhere((m) => m['id'] == id, orElse: () => _members.first);
        mem['workout'] = jsonBody;
        return {'ok': true, 'workout': jsonBody};
      }
      if (cleanPath.endsWith('/diet')) {
        final id = cleanPath.replaceFirst('/coach/members/', '').replaceFirst('/diet', '');
        final mem = _members.firstWhere((m) => m['id'] == id, orElse: () => _members.first);
        mem['diet'] = jsonBody;
        return {'ok': true, 'diet': jsonBody};
      }
      if (cleanPath.endsWith('/timetable')) {
        final id = cleanPath.replaceFirst('/coach/members/', '').replaceFirst('/timetable', '');
        final mem = _members.firstWhere((m) => m['id'] == id, orElse: () => _members.first);
        mem['slots'] = jsonBody['slots'];
        return {'ok': true, 'slots': jsonBody['slots']};
      }
      if (cleanPath.endsWith('/logs')) {
        return {'ok': true, 'log': jsonBody};
      }
      if (cleanPath.endsWith('/pt-session')) {
        final id = cleanPath.replaceFirst('/coach/members/', '').replaceFirst('/pt-session', '');
        final mem = _members.firstWhere((m) => m['id'] == id, orElse: () => _members.first);
        mem['ptUsed'] = (intOf(mem['ptUsed']) + 1).clamp(0, 999);
        return {'ok': true};
      }
      if (cleanPath.endsWith('/assignment')) {
        final id = cleanPath.replaceFirst('/coach/members/', '').replaceFirst('/assignment', '');
        final mem = _members.firstWhere((m) => m['id'] == id, orElse: () => _members.first);
        final tId = str(jsonBody['trainerId']);
        mem['trainerId'] = tId.isEmpty ? null : tId;
        final t = _team.firstWhere((item) => item['id'] == tId, orElse: () => <String, dynamic>{});
        mem['trainerName'] = t['name'];
        return {'ok': true};
      }

      final id = cleanPath.replaceFirst('/coach/members/', '').split('/').first;
      final mem = _members.firstWhere((m) => m['id'] == id, orElse: () => _members.first);
      return {
        'member': mem,
        'logs': _initSampleLogs(mem['name']),
      };
    }

    if (cleanPath.startsWith('/coach/timetable/')) {
      final id = cleanPath.replaceFirst('/coach/timetable/', '');
      if (m == 'DELETE') {
        _slots.removeWhere((s) => s['id'] == id);
        return {'ok': true};
      }
    }

    if (cleanPath == '/coach/timetable') {
      if (m == 'POST') {
        final tId = str(jsonBody['trainerId'], 'usr_trainer_1');
        final tMatch = _team.firstWhere((t) => t['id'] == tId, orElse: () => <String, dynamic>{});
        final tName = str(tMatch['name'], 'Test Trainer 1');
        final newSlot = {
          'id': 'slot_${DateTime.now().millisecondsSinceEpoch}',
          'name': str(jsonBody['name'], 'New Class'),
          'title': str(jsonBody['name'], 'New Class'),
          'day': str(jsonBody['day'], 'MON'),
          'time': str(jsonBody['time'], '07:00 AM'),
          'durationMin': intOf(jsonBody['durationMin'], 45),
          'trainerId': tId,
          'trainerName': tName,
          'spots': 20,
          'enrolled': 1,
        };
        _slots.add(newSlot);
        return {'ok': true, 'slot': newSlot};
      }
      final now = DateTime.now();
      const weekdaysShort = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      final todayShort = weekdaysShort[now.weekday - 1];
      return {'slots': _slots, 'today': todayShort};
    }

    if (cleanPath.startsWith('/coach/announcements/')) {
      final id = cleanPath.replaceFirst('/coach/announcements/', '');
      if (m == 'DELETE') {
        _announcements.removeWhere((a) => a['id'] == id);
        return {'ok': true};
      }
    }

    if (cleanPath == '/coach/announcements') {
      if (m == 'POST') {
        final newAnn = {
          'id': 'ann_${DateTime.now().millisecondsSinceEpoch}',
          'title': str(jsonBody['title'], 'New Announcement'),
          'body': str(jsonBody['body'], str(jsonBody['message'], '')),
          'postedBy': activeRole.contains('trainer') ? 'Test Trainer 1' : 'Test Owner 1',
          'date': 'Today',
          'createdAt': DateTime.now().toIso8601String(),
        };
        _announcements.insert(0, newAnn);
        return {'ok': true, 'announcement': newAnn};
      }
      return {'announcements': _announcements};
    }

    if (cleanPath == '/coach/assignments') {
      return {
        'assignments': {
          'mem_1': 'usr_trainer_1',
          'mem_2': 'usr_trainer_2',
        }
      };
    }

    // 11. Member Portal
    if (cleanPath == '/portal') {
      final now = DateTime.now();
      const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      final weekdayName = weekdays[now.weekday - 1];
      final targetName = activeRole == 'member2' ? 'Test Member 2' : 'Test Member 1';
      final member = _members.firstWhere((m) => m['name'] == targetName, orElse: () => _members.first);

      return {
        'today': now.toIso8601String().substring(0, 10),
        'weekday': weekdayName,
        'gymName': sampleGym.name,
        'member': member,
        'logs': _initSampleLogs(member['name']),
        'visits': [
          now.subtract(const Duration(days: 1)).toIso8601String().substring(0, 10),
          now.subtract(const Duration(days: 3)).toIso8601String().substring(0, 10),
        ],
        'announcements': _announcements,
        'slots': member['slots'] != null ? member['slots'] : _slots,
        'videos': _videos,
        'gymCheckinCode': 'FORGE-8842',
        'autopayAddon': true,
        'addons': {'autopay': true},
      };
    }

    if (cleanPath == '/portal/checkin') {
      final targetName = activeRole == 'member2' ? 'Test Member 2' : 'Test Member 1';
      return {'ok': true, 'member': targetName, 'time': 'Just now'};
    }

    if (cleanPath == '/portal/autopay') {
      return {'ok': true};
    }

    // 12. Videos
    if (cleanPath.startsWith('/videos/')) {
      final id = cleanPath.replaceFirst('/videos/', '');
      final existing = _videos.firstWhere((v) => v['id'] == id, orElse: () => _videos.first);
      if (m == 'DELETE') {
        _videos.removeWhere((v) => v['id'] == id);
        return {'ok': true};
      }
      if (m == 'PATCH' || m == 'PUT') {
        existing.addAll(jsonBody);
        return {'ok': true, 'video': existing};
      }
    }

    if (cleanPath == '/videos') {
      if (m == 'POST') {
        final newVid = {
          'id': 'vid_${DateTime.now().millisecondsSinceEpoch}',
          'title': str(jsonBody['title'], 'New Video'),
          'category': str(jsonBody['category'], 'Workout Form'),
          'duration': str(jsonBody['duration'], '5:00'),
          'description': str(jsonBody['description'], ''),
          'videoUrl': str(jsonBody['videoUrl'], 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'),
          'pinned': boolOf(jsonBody['pinned']),
        };
        _videos.insert(0, newVid);
        return {'ok': true, 'video': newVid};
      }
      return {'videos': _videos};
    }

    if (cleanPath == '/videos/categories') {
      return {'categories': ['Warmup', 'Strength', 'Conditioning', 'Mobility', 'Recovery']};
    }

    if (cleanPath == '/coach/templates') {
      return {
        'templates': [
          {'id': 'tmpl_push', 'name': 'Push Hypertrophy', 'type': 'workout'},
          {'id': 'tmpl_pull', 'name': 'Pull & Posterior Chain', 'type': 'workout'},
          {'id': 'tmpl_legs', 'name': 'Squat & Quad Focus', 'type': 'workout'},
          {'id': 'tmpl_diet_cut', 'name': '2200 kcal High Protein Cut', 'type': 'diet'},
        ]
      };
    }

    // 13. Reports
    if (cleanPath == '/reports') {
      final now = DateTime.now();
      return {
        'today': now.toIso8601String().substring(0, 10),
        'revenueByMonth': [
          {'label': 'Jan', 'value': 142000},
          {'label': 'Feb', 'value': 158000},
          {'label': 'Mar', 'value': 175000},
          {'label': 'Apr', 'value': 168000},
          {'label': 'May', 'value': 190000},
          {'label': 'Jun', 'value': 185000},
        ],
        'attendanceByDay': [
          {'label': 'Mon', 'value': 48},
          {'label': 'Tue', 'value': 52},
          {'label': 'Wed', 'value': 45},
          {'label': 'Thu', 'value': 49},
          {'label': 'Fri', 'value': 58},
          {'label': 'Sat', 'value': 64},
          {'label': 'Sun', 'value': 30},
        ],
        'membersByStatus': [
          {'label': 'Active', 'value': _members.where((m) => m['status'] == 'active').length},
          {'label': 'Expiring', 'value': _members.where((m) => (m['daysLeft'] as int? ?? 99) <= 7 && (m['daysLeft'] as int? ?? 99) >= 0).length},
          {'label': 'Lapsed', 'value': _members.where((m) => (m['daysLeft'] as int? ?? 99) < 0).length},
        ],
        'membersByPlan': [
          {'label': 'Quarterly Fit', 'value': 12},
          {'label': 'Annual Peak', 'value': 6},
          {'label': 'Single Month', 'value': 4},
          {'label': 'PT Package', 'value': 2},
        ],
        'leadsByStatus': [
          {'label': 'Trial', 'value': _leads.where((l) => l['status'] == 'trial').length},
          {'label': 'Interested', 'value': _leads.where((l) => l['status'] == 'contacted' || l['status'] == 'new').length},
          {'label': 'Converted', 'value': 8},
        ],
        'revenueByMethod': [
          {'label': 'UPI / QR', 'value': 120000},
          {'label': 'Cards', 'value': 45000},
          {'label': 'Cash', 'value': 20000},
        ],
      };
    }

    // 14. Addons
    if (cleanPath == '/addons') {
      if (m == 'PATCH') {
        final key = str(jsonBody['key']);
        final enabled = boolOf(jsonBody['enabled']);
        sampleGym.addons[key] = enabled;
        return {'ok': true, 'addons': sampleGym.addons};
      }
      return {
        'addons': sampleGym.addons,
        'providers': {
          'whatsapp': {'status': 'connected', 'phone': '+91 98765 43210'},
          'upi': {'status': 'active', 'vpa': 'forgegym@upi'},
          'autopay': {'status': 'active'},
        },
        'activity': [
          {'action': 'WhatsApp renewal reminder sent to Test Member 2', 'time': '10:30 AM', 'status': 'delivered'},
          {'action': 'UPI payment link created for Test Member 1 (₹1,499)', 'time': '09:15 AM', 'status': 'sent'},
          {'action': 'Autopay mandate approved for Test Member 1', 'time': 'Yesterday', 'status': 'success'},
        ],
      };
    }

    if (cleanPath == '/addons/message') {
      return {'ok': true, 'status': 'sent'};
    }

    if (cleanPath == '/addons/upi-link') {
      return {'ok': true, 'url': 'https://pay.forgegym.demo/upi123', 'link': 'upi://pay?pa=forgegym@upi&pn=FORGE+Gym&am=1499'};
    }

    if (cleanPath == '/addons/autopay/request') {
      return {'ok': true, 'status': 'mandate_requested'};
    }

    // 15. Admin
    if (cleanPath == '/admin/gyms') {
      if (m == 'POST') {
        return {
          'ok': true,
          'gym': {
            'id': 'gym_${DateTime.now().millisecondsSinceEpoch}',
            'name': str(jsonBody['name'], 'New Gym'),
            'package': str(jsonBody['package'], 'performance'),
            'memberCount': 0,
            'createdAt': DateTime.now().toIso8601String().substring(0, 10),
            'lastUsedAt': 'Just now',
            'owner': {'name': str(jsonBody['ownerName'], 'Test Owner 1'), 'email': str(jsonBody['ownerEmail'], '')},
            'addons': sampleGym.addons,
          }
        };
      }
      return {
        'gyms': [
          {
            'id': 'gym_demo_1',
            'name': 'Ironpeak Fitness',
            'package': 'performance',
            'memberCount': _members.length,
            'createdAt': '2026-01-15',
            'lastUsedAt': 'Just now',
            'owner': {'name': 'Test Owner 1', 'email': 'owner1@forge.demo'},
            'addons': sampleGym.addons,
          }
        ]
      };
    }

    if (cleanPath.startsWith('/admin/gyms/')) {
      if (cleanPath.endsWith('/invite')) {
        return {'ok': true, 'token': 'inv_${DateTime.now().millisecondsSinceEpoch}', 'inviteUrl': 'https://forgegym.demo/activate'};
      }
      return {'ok': true};
    }

    // Default fallback
    return {'ok': true, 'message': 'Simulated demo response'};
  }

  // --- Seed Initializers ---

  static List<Json> _initPlans() => [
    {'id': 'plan_monthly', 'name': 'Single Month', 'price': 1499, 'durationMonths': 1, 'active': true},
    {'id': 'plan_quarterly', 'name': 'Quarterly Fit', 'price': 3799, 'durationMonths': 3, 'active': true},
    {'id': 'plan_halfyear', 'name': 'Half-Year Transformation', 'price': 6499, 'durationMonths': 6, 'active': true},
    {'id': 'plan_annual', 'name': 'Annual Peak', 'price': 10999, 'durationMonths': 12, 'active': true},
    {'id': 'plan_pt12', 'name': 'Personal Training (12 Sessions)', 'price': 7999, 'durationMonths': 3, 'active': true},
  ];

  static List<Json> _initMembers() {
    final now = DateTime.now();
    final start = now.subtract(const Duration(days: 60)).toIso8601String().substring(0, 10);
    return [
      {
        'id': 'mem_1',
        'memberCode': 'F-1001',
        'name': 'Test Member 1',
        'phone': '+91 98000 00001',
        'email': 'member1@forge.demo',
        'category': 'Strength',
        'planId': 'plan_quarterly',
        'planName': 'Quarterly Fit',
        'planPrice': 3799,
        'startDate': start,
        'expiryDate': now.add(const Duration(days: 18)).toIso8601String().substring(0, 10),
        'feeDue': 0,
        'trainerId': 'usr_trainer_1',
        'trainerName': 'Test Trainer 1',
        'notes': 'Consistent attendee, training goals progressing well.',
        'ptTotal': 12,
        'ptUsed': 7,
        'autopayStatus': 'active',
        'autopayAmount': 3799,
        'status': 'active',
        'daysLeft': 18,
        'hasAppAccess': true,
        'createdAt': start,
        'workout': _sampleWorkout(),
        'diet': _sampleDiet(),
      },
      {
        'id': 'mem_2',
        'memberCode': 'F-1002',
        'name': 'Test Member 2',
        'phone': '+91 98000 00002',
        'email': 'member2@forge.demo',
        'category': 'Weight loss',
        'planId': 'plan_monthly',
        'planName': 'Single Month',
        'planPrice': 1499,
        'startDate': start,
        'expiryDate': now.add(const Duration(days: 3)).toIso8601String().substring(0, 10),
        'feeDue': 1499,
        'trainerId': 'usr_trainer_2',
        'trainerName': 'Test Trainer 2',
        'notes': 'Renewal due soon, focus on weight loss.',
        'ptTotal': 0,
        'ptUsed': 0,
        'autopayStatus': 'inactive',
        'autopayAmount': 1499,
        'status': 'active',
        'daysLeft': 3,
        'hasAppAccess': true,
        'createdAt': start,
        'workout': _sampleWorkout(),
        'diet': _sampleDiet(),
      },
    ];
  }

  static Json _sampleWorkout() => {
    'title': 'Strength & Hypertrophy Block',
    'days': [
      {
        'day': 'Monday',
        'focus': 'Chest & Triceps (Push)',
        'exercises': [
          {'name': 'Barbell Bench Press', 'sets': '4', 'reps': '6-8', 'note': 'Controlled 2s eccentric descent'},
          {'name': 'Incline Dumbbell Press', 'sets': '3', 'reps': '10-12', 'note': '30 degree bench angle'},
          {'name': 'Standing Overhead Press', 'sets': '3', 'reps': '8', 'note': 'Full lockout overhead'},
          {'name': 'Cable Triceps Pushdown', 'sets': '3', 'reps': '15', 'note': 'Squeeze triceps at contraction'},
        ],
      },
      {
        'day': 'Wednesday',
        'focus': 'Back & Biceps (Pull)',
        'exercises': [
          {'name': 'Deadlift', 'sets': '3', 'reps': '5', 'note': 'Brace core, push the floor away'},
          {'name': 'Bent-Over Barbell Row', 'sets': '4', 'reps': '8', 'note': 'Pull towards lower abdomen'},
          {'name': 'Lat Pulldown', 'sets': '3', 'reps': '10-12', 'note': 'Wide grip, pull with elbows'},
          {'name': 'Incline Dumbbell Curl', 'sets': '3', 'reps': '12', 'note': 'Full stretch at bottom'},
        ],
      },
      {
        'day': 'Friday',
        'focus': 'Legs & Core',
        'exercises': [
          {'name': 'Barbell Back Squat', 'sets': '4', 'reps': '6-8', 'note': 'Hit parallel depth cleanly'},
          {'name': 'Romanian Deadlift', 'sets': '3', 'reps': '10', 'note': 'Hinge at the hips with soft knees'},
          {'name': 'Walking Lunges', 'sets': '3', 'reps': '12 / leg', 'note': 'Keep torso upright'},
          {'name': 'Hanging Knee Raises', 'sets': '3', 'reps': '15', 'note': 'Avoid swinging'},
        ],
      },
    ],
  };

  static Json _sampleDiet() => {
    'title': 'High Protein Muscle Gain',
    'calories': '2,400 kcal',
    'protein': '160g',
    'carbs': '250g',
    'fats': '65g',
    'meals': [
      {'title': 'Breakfast (08:00)', 'items': '4 Egg whites + 2 whole eggs, 60g oats with almonds & berries'},
      {'title': 'Lunch (13:30)', 'items': '180g Grilled chicken breast / paneer, 150g steamed rice, mixed green salad'},
      {'title': 'Pre-Workout (17:00)', 'items': '1 Banana + black coffee, 1 scoop whey protein in water'},
      {'title': 'Dinner (20:30)', 'items': '180g Fish / Tofu, 2 multigrain rotis, dal tadka & steamed broccoli'},
    ],
  };

  static List<Json> _initCheckins() {
    final now = DateTime.now();
    String timeAgo(int mins) {
      final t = now.subtract(Duration(minutes: mins));
      return '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';
    }

    return [
      {'id': 'chk_1', 'memberId': 'mem_1', 'name': 'Test Member 1', 'memberCode': 'F-1001', 'time': timeAgo(15), 'method': 'qr'},
      {'id': 'chk_2', 'memberId': 'mem_2', 'name': 'Test Member 2', 'memberCode': 'F-1002', 'time': timeAgo(45), 'method': 'manual'},
    ];
  }

  static List<Json> _initPayments() {
    final now = DateTime.now();
    return [
      {'id': 'pay_1', 'memberId': 'mem_1', 'memberName': 'Test Member 1', 'memberCode': 'F-1001', 'amount': 3799, 'method': 'upi', 'note': 'Quarterly Fit', 'createdAt': now.toIso8601String()},
      {'id': 'pay_2', 'memberId': 'mem_2', 'memberName': 'Test Member 2', 'memberCode': 'F-1002', 'amount': 1499, 'method': 'cash', 'note': 'Single Month Renewal', 'createdAt': now.subtract(const Duration(days: 1)).toIso8601String()},
    ];
  }

  static List<Json> _initLeads() => [
    {'id': 'lead_1', 'name': 'Test Lead 1', 'phone': '+91 98000 00011', 'status': 'trial', 'notes': 'Attended trial today, interested in Annual plan', 'followUpDate': 'Tomorrow', 'createdAt': '2026-11-18'},
    {'id': 'lead_2', 'name': 'Test Lead 2', 'phone': '+91 98000 00012', 'status': 'contacted', 'notes': 'Wants morning slot personal training', 'followUpDate': 'In 2 days', 'createdAt': '2026-11-17'},
  ];

  static List<Json> _initTeam() => [
    {'id': 'usr_owner_1', 'name': 'Test Owner 1', 'role': 'owner', 'title': 'Founder & Head Coach', 'phone': '+91 98000 11111', 'email': 'owner1@forge.demo', 'active': true},
    {'id': 'usr_owner_2', 'name': 'Test Owner 2', 'role': 'owner', 'title': 'Co-Owner', 'phone': '+91 98000 11112', 'email': 'owner2@forge.demo', 'active': true},
    {'id': 'usr_staff_1', 'name': 'Test Staff 1', 'role': 'staff', 'title': 'Front Desk & Operations', 'phone': '+91 98000 22221', 'email': 'staff1@forge.demo', 'active': true},
    {'id': 'usr_staff_2', 'name': 'Test Staff 2', 'role': 'staff', 'title': 'Front Desk', 'phone': '+91 98000 22222', 'email': 'staff2@forge.demo', 'active': true},
    {'id': 'usr_trainer_1', 'name': 'Test Trainer 1', 'role': 'trainer', 'title': 'Senior Strength Coach', 'phone': '+91 98000 33331', 'email': 'trainer1@forge.demo', 'active': true},
    {'id': 'usr_trainer_2', 'name': 'Test Trainer 2', 'role': 'trainer', 'title': 'Fitness & Nutrition Coach', 'phone': '+91 98000 33332', 'email': 'trainer2@forge.demo', 'active': true},
  ];

  static List<Json> _initAnnouncements() => [
    {'id': 'ann_1', 'title': 'New Eleiko Olympic Barbells Arrived!', 'body': '3 new competition barbells and bumper plates have been added to platforms 1-3.', 'postedBy': 'Test Owner 1', 'createdAt': 'Today'},
    {'id': 'ann_2', 'title': 'Strength Workshop: Clean & Jerk Masterclass', 'body': 'Saturday at 10:00 AM with Test Trainer 1. Free entry for all active members.', 'postedBy': 'Test Trainer 1', 'createdAt': 'Yesterday'},
    {'id': 'ann_3', 'title': 'Holiday Timings Reminder', 'body': 'Gym open from 06:00 AM to 01:00 PM on Sunday. Evening slots closed.', 'postedBy': 'Test Staff 1', 'createdAt': '3 days ago'},
  ];

  static List<Json> _initVideos() => [
    {'id': 'vid_1', 'title': 'Flawless Barbell Squat Form', 'category': 'Workout Form', 'duration': '5:24', 'description': 'Hip drive, bracing and knee tracking breakdown.', 'videoUrl': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'},
    {'id': 'vid_2', 'title': 'Bench Press Arch & Shoulder Safety', 'category': 'Workout Form', 'duration': '4:10', 'description': 'Protect your rotator cuffs while pressing heavy.', 'videoUrl': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'},
    {'id': 'vid_3', 'title': 'Conventional Deadlift Setup', 'category': 'Workout Form', 'duration': '6:45', 'description': 'Bar path, hip hinge and lats engagement.', 'videoUrl': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'},
    {'id': 'vid_4', 'title': '10-Minute Full Body Mobility Flow', 'category': 'Workout Form', 'duration': '10:00', 'description': 'Hip flexors, thoracic spine and ankle mobility routine.', 'videoUrl': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'},
  ];

  static List<Json> _initSlots() => [
    {'id': 'slot_1', 'name': 'Morning HIIT & Conditioning', 'title': 'Morning HIIT & Conditioning', 'trainer': 'Test Trainer 1', 'trainerName': 'Test Trainer 1', 'time': '07:00 AM - 08:00 AM', 'day': 'Mon, Wed, Fri', 'spots': 15, 'enrolled': 12, 'durationMin': 60},
    {'id': 'slot_2', 'name': 'Olympic Lifting Foundations', 'title': 'Olympic Lifting Foundations', 'trainer': 'Test Trainer 2', 'trainerName': 'Test Trainer 2', 'time': '09:00 AM - 10:30 AM', 'day': 'Tue, Thu, Sat', 'spots': 8, 'enrolled': 8, 'durationMin': 90},
    {'id': 'slot_3', 'name': 'Evening Power Strength Hour', 'title': 'Evening Power Strength Hour', 'trainer': 'Test Trainer 1', 'trainerName': 'Test Trainer 1', 'time': '06:00 PM - 07:00 PM', 'day': 'Daily', 'spots': 20, 'enrolled': 16, 'durationMin': 60},
    {'id': 'slot_4', 'name': 'Mobility & Recovery Flow', 'title': 'Mobility & Recovery Flow', 'trainer': 'Test Trainer 2', 'trainerName': 'Test Trainer 2', 'time': '07:30 PM - 08:15 PM', 'day': 'Tue, Thu', 'spots': 12, 'enrolled': 9, 'durationMin': 45},
  ];

  static List<Json> _initSampleLogs(String memberName) => [
    {
      'id': 'log_1',
      'date': 'Yesterday',
      'author': 'Test Trainer 1',
      'note': 'Bench press hit 80kg x 6 cleanly (RPE 8). Form on overhead press was much tighter.',
      'metrics': {'weight': '74.2 kg', 'bodyFat': '14.8%'},
    },
    {
      'id': 'log_2',
      'date': 'Last week',
      'author': 'Test Trainer 1',
      'note': 'Squat depth was spot on. Increased working weight to 105kg for 4 sets of 6.',
      'metrics': {'weight': '74.5 kg'},
    },
  ];
}
