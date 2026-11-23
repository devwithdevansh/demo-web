typedef Json = Map<String, dynamic>;

Json asMap(dynamic value) => value is Map<String, dynamic> ? value : <String, dynamic>{};
List<Json> asList(dynamic value) =>
    value is List ? value.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList() : const [];
String str(dynamic value, [String fallback = '']) => value == null ? fallback : '$value';
int intOf(dynamic value, [int fallback = 0]) => value is num ? value.toInt() : int.tryParse('$value') ?? fallback;
double doubleOf(dynamic value, [double fallback = 0]) =>
    value is num ? value.toDouble() : double.tryParse('$value') ?? fallback;
bool boolOf(dynamic value, [bool fallback = false]) => value is bool ? value : fallback;

class ForgeUser {
  final String id;
  final String name;
  final String role;
  final String title;

  const ForgeUser({required this.id, required this.name, required this.role, required this.title});

  factory ForgeUser.fromJson(Json j) => ForgeUser(
    id: str(j['id']),
    name: str(j['name'], 'Member'),
    role: str(j['role'], 'member'),
    title: str(j['title']),
  );

  Json toJson() => {
    'id': id,
    'name': name,
    'role': role,
    'title': title,
  };

  bool get isOwner => role == 'owner';
  bool get isStaff => role == 'staff';
  bool get isTrainer => role == 'trainer';
  bool get isMember => role == 'member';
  bool get isDesk => role == 'owner' || role == 'staff';
}

class GymSession {
  final String name;
  final String package;
  final Map<String, bool> addons;
  final bool isDemo;

  const GymSession({required this.name, required this.package, required this.addons, required this.isDemo});

  factory GymSession.fromJson(Json j) => GymSession(
    name: str(j['name'], 'Your gym'),
    package: str(j['package'], 'growth'),
    addons: asMap(j['addons']).map((k, v) => MapEntry(k, boolOf(v))),
    isDemo: boolOf(j['isDemo']),
  );

  Json toJson() => {
    'name': name,
    'package': package,
    'addons': addons,
    'isDemo': isDemo,
  };

  bool addon(String key) => addons[key] ?? false;
}

class ForgeSession {
  final String token;
  final String? sandboxKey;
  final ForgeUser user;
  final GymSession gym;

  const ForgeSession({required this.token, this.sandboxKey, required this.user, required this.gym});

  factory ForgeSession.fromJson(Json j) => ForgeSession(
    token: str(j['token']),
    sandboxKey: j['sandboxKey'] == null ? null : str(j['sandboxKey']),
    user: ForgeUser.fromJson(asMap(j['user'])),
    gym: GymSession.fromJson(asMap(j['gym'])),
  );

  Json toJson() => {
    'token': token,
    'sandboxKey': sandboxKey,
    'user': {'id': user.id, 'name': user.name, 'role': user.role, 'title': user.title},
    'gym': {'name': gym.name, 'package': gym.package, 'addons': gym.addons, 'isDemo': gym.isDemo},
  };
}

class Plan {
  final String id;
  final String name;
  final int price;
  final int durationMonths;
  final int? durationDays;
  final bool active;

  const Plan({
    required this.id,
    required this.name,
    required this.price,
    required this.durationMonths,
    this.durationDays,
    required this.active,
  });

  factory Plan.fromJson(Json j) => Plan(
    id: str(j['id']),
    name: str(j['name'], 'Plan'),
    price: intOf(j['price']),
    durationMonths: intOf(j['durationMonths']),
    durationDays: j['durationDays'] == null ? null : intOf(j['durationDays']),
    active: boolOf(j['active'], true),
  );
}

class Exercise {
  final String name;
  final String sets;
  final String reps;
  final String note;
  final String videoUrl;

  const Exercise({required this.name, this.sets = '', this.reps = '', this.note = '', this.videoUrl = ''});

  factory Exercise.fromJson(Json j) => Exercise(
    name: str(j['name']),
    sets: str(j['sets']),
    reps: str(j['reps']),
    note: str(j['note']),
    videoUrl: str(j['videoUrl']),
  );

  Json toJson() => {'name': name, 'sets': sets, 'reps': reps, 'note': note, 'videoUrl': videoUrl};
}

class WorkoutDay {
  final String day;
  final String focus;
  final List<Exercise> exercises;

  const WorkoutDay({required this.day, this.focus = '', this.exercises = const []});

  factory WorkoutDay.fromJson(Json j) => WorkoutDay(
    day: str(j['day']),
    focus: str(j['focus']),
    exercises: asList(j['exercises']).map(Exercise.fromJson).toList(),
  );

  Json toJson() => {'day': day, 'focus': focus, 'exercises': exercises.map((e) => e.toJson()).toList()};
}

class Workout {
  final String title;
  final String updatedBy;
  final String updatedAt;
  final List<WorkoutDay> days;

  const Workout({this.title = '', this.updatedBy = '', this.updatedAt = '', this.days = const []});

  factory Workout.fromJson(Json j) => Workout(
    title: str(j['title']),
    updatedBy: str(j['updatedBy']),
    updatedAt: str(j['updatedAt']),
    days: asList(j['days']).map(WorkoutDay.fromJson).toList(),
  );

  Json toJson() => {'title': title, 'days': days.map((d) => d.toJson()).toList()};
}

class DietMeal {
  final String label;
  final String items;

  const DietMeal({required this.label, required this.items});

  factory DietMeal.fromJson(Json j) => DietMeal(label: str(j['label']), items: str(j['items']));
  Json toJson() => {'label': label, 'items': items};
}

class Diet {
  final String title;
  final String note;
  final String updatedBy;
  final List<DietMeal> meals;

  const Diet({this.title = '', this.note = '', this.updatedBy = '', this.meals = const []});

  factory Diet.fromJson(Json j) => Diet(
    title: str(j['title']),
    note: str(j['note']),
    updatedBy: str(j['updatedBy']),
    meals: asList(j['meals']).map(DietMeal.fromJson).toList(),
  );

  Json toJson() => {'title': title, 'note': note, 'meals': meals.map((m) => m.toJson()).toList()};
}

class Member {
  final String id;
  final String memberCode;
  final String name;
  final String phone;
  final String email;
  final String category;
  final String planId;
  final String planName;
  final int planPrice;
  final String startDate;
  final String expiryDate;
  final int feeDue;
  final String? trainerId;
  final String? trainerName;
  final String notes;
  final int ptTotal;
  final int ptUsed;
  final String autopayStatus;
  final int autopayAmount;
  final String status;
  final int daysLeft;
  final bool hasAppAccess;
  final String createdAt;
  final Workout? workout;
  final Diet? diet;
  final List<ClassSlot> slots;

  const Member({
    required this.id,
    required this.memberCode,
    required this.name,
    required this.phone,
    this.email = '',
    this.category = 'General fitness',
    this.planId = '',
    this.planName = '',
    this.planPrice = 0,
    this.startDate = '',
    this.expiryDate = '',
    this.feeDue = 0,
    this.trainerId,
    this.trainerName,
    this.notes = '',
    this.ptTotal = 0,
    this.ptUsed = 0,
    this.autopayStatus = 'none',
    this.autopayAmount = 0,
    this.status = 'active',
    this.daysLeft = 0,
    this.hasAppAccess = false,
    this.createdAt = '',
    this.workout,
    this.diet,
    this.slots = const [],
  });

  factory Member.fromJson(Json j) {
    final pt = asMap(j['pt']);
    final autopay = asMap(j['autopay']);
    return Member(
      id: str(j['id']),
      memberCode: str(j['memberCode'], '—'),
      name: str(j['name'], 'Member'),
      phone: str(j['phone']),
      email: str(j['email']),
      category: str(j['category'], 'General fitness'),
      planId: str(j['planId']),
      planName: str(j['planName'], 'Plan'),
      planPrice: intOf(j['planPrice']),
      startDate: str(j['startDate']),
      expiryDate: str(j['expiryDate']),
      feeDue: intOf(j['feeDue']),
      trainerId: j['trainerId'] == null ? null : str(j['trainerId']),
      trainerName: j['trainerName'] == null ? null : str(j['trainerName']),
      notes: str(j['notes']),
      ptTotal: intOf(pt['total']),
      ptUsed: intOf(pt['used']),
      autopayStatus: str(autopay['status'], 'none'),
      autopayAmount: intOf(autopay['amount']),
      status: str(j['status'], 'active'),
      daysLeft: intOf(j['daysLeft']),
      hasAppAccess: boolOf(j['hasAppAccess']),
      createdAt: str(j['createdAt']),
      workout: j['workout'] == null ? null : Workout.fromJson(asMap(j['workout'])),
      diet: j['diet'] == null ? null : Diet.fromJson(asMap(j['diet'])),
      slots: asList(j['slots']).map(ClassSlot.fromJson).toList(),
    );
  }

  int get ptLeft => (ptTotal - ptUsed).clamp(0, 999);
  bool get isExpired => status == 'expired';
  bool get isExpiring => status == 'expiring';
}

class Payment {
  final String id;
  final String memberId;
  final String memberName;
  final int amount;
  final String method;
  final String paidOn;
  final String note;
  final String recordedBy;
  final bool simulated;
  final String gateway;
  final String createdAt;

  const Payment({
    required this.id,
    required this.memberId,
    this.memberName = '',
    required this.amount,
    required this.method,
    required this.paidOn,
    this.note = '',
    this.recordedBy = '',
    this.simulated = false,
    this.gateway = '',
    this.createdAt = '',
  });

  factory Payment.fromJson(Json j) => Payment(
    id: str(j['id']),
    memberId: str(j['memberId']),
    memberName: str(j['memberName']),
    amount: intOf(j['amount']),
    method: str(j['method'], 'cash'),
    paidOn: str(j['paidOn']),
    note: str(j['note']),
    recordedBy: str(j['recordedBy']),
    simulated: boolOf(j['simulated']),
    gateway: str(j['gateway']),
    createdAt: str(j['createdAt']),
  );
}

class Lead {
  final String id;
  final String name;
  final String phone;
  final String interest;
  final String source;
  final String status;
  final String followUpOn;
  final String notes;
  final String createdAt;

  const Lead({
    required this.id,
    required this.name,
    required this.phone,
    this.interest = '',
    this.source = 'walk-in',
    this.status = 'new',
    this.followUpOn = '',
    this.notes = '',
    this.createdAt = '',
  });

  factory Lead.fromJson(Json j) => Lead(
    id: str(j['id']),
    name: str(j['name'], 'Lead'),
    phone: str(j['phone']),
    interest: str(j['interest']),
    source: str(j['source'], 'walk-in'),
    status: str(j['status'], 'new'),
    followUpOn: str(j['followUpOn']),
    notes: str(j['notes']),
    createdAt: str(j['createdAt']),
  );
}

class DashboardCounts {
  final int activeMembers;
  final int expiringSoon;
  final int lapsed;
  final int checkinsToday;
  final int collectedToday;
  final int? collectedMonth;
  final int duesTotal;
  final int duesMembers;
  final int openLeads;
  final int followUpsDue;

  const DashboardCounts({
    this.activeMembers = 0,
    this.expiringSoon = 0,
    this.lapsed = 0,
    this.checkinsToday = 0,
    this.collectedToday = 0,
    this.collectedMonth,
    this.duesTotal = 0,
    this.duesMembers = 0,
    this.openLeads = 0,
    this.followUpsDue = 0,
  });

  factory DashboardCounts.fromJson(Json j) => DashboardCounts(
    activeMembers: intOf(j['activeMembers']),
    expiringSoon: intOf(j['expiringSoon']),
    lapsed: intOf(j['lapsed']),
    checkinsToday: intOf(j['checkinsToday']),
    collectedToday: intOf(j['collectedToday']),
    collectedMonth: j['collectedMonth'] == null ? null : intOf(j['collectedMonth']),
    duesTotal: intOf(j['duesTotal']),
    duesMembers: intOf(j['duesMembers']),
    openLeads: intOf(j['openLeads']),
    followUpsDue: intOf(j['followUpsDue']),
  );
}

class CheckinRow {
  final String id;
  final String memberId;
  final String name;
  final String memberCode;
  final String time;
  final String method;

  const CheckinRow({
    required this.id,
    this.memberId = '',
    required this.name,
    this.memberCode = '',
    required this.time,
    this.method = 'manual',
  });

  factory CheckinRow.fromJson(Json j) => CheckinRow(
    id: str(j['id']),
    memberId: str(j['memberId']),
    name: str(j['name'], 'Member'),
    memberCode: str(j['memberCode']),
    time: str(j['time']),
    method: str(j['method'], 'manual'),
  );
}

class DashboardData {
  final String today;
  final DashboardCounts counts;
  final List<CheckinRow> checkins;
  final List<Member> expiring;
  final List<Lead> followUps;
  final List<Payment> payments;

  const DashboardData({
    required this.today,
    required this.counts,
    this.checkins = const [],
    this.expiring = const [],
    this.followUps = const [],
    this.payments = const [],
  });

  factory DashboardData.fromJson(Json j) => DashboardData(
    today: str(j['today']),
    counts: DashboardCounts.fromJson(asMap(j['counts'])),
    checkins: asList(j['checkins']).map(CheckinRow.fromJson).toList(),
    expiring: asList(j['expiring']).map(Member.fromJson).toList(),
    followUps: asList(j['followUps']).map(Lead.fromJson).toList(),
    payments: asList(j['payments']).map(Payment.fromJson).toList(),
  );
}

class AttendanceData {
  final String day;
  final bool isToday;
  final String gymId;
  final String gymName;
  final String gymCheckinCode;
  final List<CheckinRow> entries;
  final List<Member> notCheckedIn;

  const AttendanceData({
    required this.day,
    required this.isToday,
    required this.gymId,
    required this.gymName,
    required this.gymCheckinCode,
    this.entries = const [],
    this.notCheckedIn = const [],
  });

  factory AttendanceData.fromJson(Json j) => AttendanceData(
    day: str(j['day']),
    isToday: boolOf(j['isToday']),
    gymId: str(j['gymId']),
    gymName: str(j['gymName']),
    gymCheckinCode: str(j['gymCheckinCode']),
    entries: asList(j['entries']).map(CheckinRow.fromJson).toList(),
    notCheckedIn: asList(j['notCheckedIn']).map(Member.fromJson).toList(),
  );
}

class TeamMember {
  final String id;
  final String name;
  final String role;
  final String title;
  final String phone;
  final bool active;
  final int members;

  const TeamMember({
    required this.id,
    required this.name,
    required this.role,
    this.title = '',
    this.phone = '',
    this.active = true,
    this.members = 0,
  });

  factory TeamMember.fromJson(Json j) => TeamMember(
    id: str(j['id']),
    name: str(j['name']),
    role: str(j['role']),
    title: str(j['title']),
    phone: str(j['phone']),
    active: boolOf(j['active'], true),
    members: intOf(j['members']),
  );
}

class ClassSlot {
  final String id;
  final String day;
  final String time;
  final String name;
  final int durationMin;
  final String? trainerId;
  final String? trainerName;

  const ClassSlot({
    required this.id,
    required this.day,
    required this.time,
    required this.name,
    this.durationMin = 45,
    this.trainerId,
    this.trainerName,
  });

  factory ClassSlot.fromJson(Json j) => ClassSlot(
    id: str(j['id']),
    day: str(j['day']),
    time: str(j['time']),
    name: str(j['name']),
    durationMin: intOf(j['durationMin'], 45),
    trainerId: j['trainerId'] == null ? null : str(j['trainerId']),
    trainerName: j['trainerName'] == null ? null : str(j['trainerName']),
  );
}

class Announcement {
  final String id;
  final String title;
  final String body;
  final String postedBy;
  final String createdAt;

  const Announcement({required this.id, required this.title, this.body = '', this.postedBy = '', this.createdAt = ''});

  factory Announcement.fromJson(Json j) => Announcement(
    id: str(j['id']),
    title: str(j['title']),
    body: str(j['body']),
    postedBy: str(j['postedBy']),
    createdAt: str(j['createdAt']),
  );
}

class CoachLog {
  final String id;
  final String day;
  final String type;
  final String trainerName;
  final double? weightKg;
  final double? waistCm;
  final String note;
  final String createdAt;

  const CoachLog({
    required this.id,
    required this.day,
    required this.type,
    this.trainerName = '',
    this.weightKg,
    this.waistCm,
    this.note = '',
    this.createdAt = '',
  });

  factory CoachLog.fromJson(Json j) => CoachLog(
    id: str(j['id']),
    day: str(j['day']),
    type: str(j['type'], 'checkin'),
    trainerName: str(j['trainerName']),
    weightKg: j['weightKg'] == null ? null : doubleOf(j['weightKg']),
    waistCm: j['waistCm'] == null ? null : doubleOf(j['waistCm']),
    note: str(j['note']),
    createdAt: str(j['createdAt']),
  );
}

class FitnessVideo {
  final String id;
  final String title;
  final String category;
  final String videoUrl;
  final String? youtubeId;
  final String? thumbnailUrl;
  final String description;
  final bool pinned;
  final String postedBy;
  final String createdAt;

  const FitnessVideo({
    required this.id,
    required this.title,
    this.category = 'Workout Form',
    required this.videoUrl,
    this.youtubeId,
    this.thumbnailUrl,
    this.description = '',
    this.pinned = false,
    this.postedBy = '',
    this.createdAt = '',
  });

  factory FitnessVideo.fromJson(Json j) => FitnessVideo(
    id: str(j['id']),
    title: str(j['title']),
    category: str(j['category'], 'Workout Form'),
    videoUrl: str(j['videoUrl']),
    youtubeId: j['youtubeId'] == null ? null : str(j['youtubeId']),
    thumbnailUrl: j['thumbnailUrl'] == null ? null : str(j['thumbnailUrl']),
    description: str(j['description']),
    pinned: boolOf(j['pinned']),
    postedBy: str(j['postedBy']),
    createdAt: str(j['createdAt']),
  );
}

class ActionLog {
  final String id;
  final String kind;
  final String title;
  final String detail;
  final String status;
  final String reason;
  final String gateway;
  final int? amount;
  final bool simulated;
  final String createdAt;

  const ActionLog({
    required this.id,
    required this.kind,
    required this.title,
    this.detail = '',
    this.status = '',
    this.reason = '',
    this.gateway = '',
    this.amount,
    this.simulated = true,
    this.createdAt = '',
  });

  factory ActionLog.fromJson(Json j) => ActionLog(
    id: str(j['id']),
    kind: str(j['kind']),
    title: str(j['title']),
    detail: str(j['detail']),
    status: str(j['status']),
    reason: str(j['reason']),
    gateway: str(j['gateway']),
    amount: j['amount'] == null ? null : intOf(j['amount']),
    simulated: boolOf(j['simulated'], true),
    createdAt: str(j['createdAt']),
  );
}

class AddonsData {
  final Map<String, bool> addons;
  final Map<String, dynamic> providers;
  final List<ActionLog> activity;

  const AddonsData({required this.addons, required this.providers, this.activity = const []});

  factory AddonsData.fromJson(Json j) => AddonsData(
    addons: asMap(j['addons']).map((k, v) => MapEntry(k, boolOf(v))),
    providers: asMap(j['providers']),
    activity: asList(j['activity']).map(ActionLog.fromJson).toList(),
  );
}

class MemberDetailData {
  final Member member;
  final List<Payment> payments;
  final List<String> visits;

  const MemberDetailData({required this.member, this.payments = const [], this.visits = const []});

  factory MemberDetailData.fromJson(Json j) => MemberDetailData(
    member: Member.fromJson(asMap(j['member'])),
    payments: asList(j['payments']).map(Payment.fromJson).toList(),
    visits: (j['visits'] as List? ?? const []).map((e) => '$e').toList(),
  );
}

class RenewalsData {
  final List<Member> expiring;
  final List<Member> lapsed;

  const RenewalsData({this.expiring = const [], this.lapsed = const []});

  factory RenewalsData.fromJson(Json j) => RenewalsData(
    expiring: asList(j['expiring']).map(Member.fromJson).toList(),
    lapsed: asList(j['lapsed']).map(Member.fromJson).toList(),
  );
}

class PaymentsData {
  final List<Payment> payments;
  final List<Member> dues;
  final int today;
  final int? month;
  final int duesTotal;

  const PaymentsData({this.payments = const [], this.dues = const [], this.today = 0, this.month, this.duesTotal = 0});

  factory PaymentsData.fromJson(Json j) {
    final totals = asMap(j['totals']);
    return PaymentsData(
      payments: asList(j['payments']).map(Payment.fromJson).toList(),
      dues: asList(j['dues']).map(Member.fromJson).toList(),
      today: intOf(totals['today']),
      month: totals['month'] == null ? null : intOf(totals['month']),
      duesTotal: intOf(totals['dues']),
    );
  }
}

class TrainerMember {
  final Member member;
  final String? lastCheckin;
  final int? sinceCheckin;
  final bool hasWorkout;

  const TrainerMember({required this.member, this.lastCheckin, this.sinceCheckin, this.hasWorkout = false});

  factory TrainerMember.fromJson(Json j) => TrainerMember(
    member: Member.fromJson(j),
    lastCheckin: j['lastCheckin'] == null ? null : str(j['lastCheckin']),
    sinceCheckin: j['sinceCheckin'] == null ? null : intOf(j['sinceCheckin']),
    hasWorkout: boolOf(j['hasWorkout']),
  );
}

class CoachTask {
  final String id;
  final String kind;
  final String memberId;
  final String text;

  const CoachTask({required this.id, required this.kind, required this.memberId, required this.text});

  factory CoachTask.fromJson(Json j) =>
      CoachTask(id: str(j['id']), kind: str(j['kind']), memberId: str(j['memberId']), text: str(j['text']));
}

class TrainerOverview {
  final String today;
  final String trainerName;
  final String trainerTitle;
  final List<TrainerMember> members;
  final List<CoachTask> tasks;
  final List<ClassSlot> classesToday;

  const TrainerOverview({
    required this.today,
    this.trainerName = '',
    this.trainerTitle = '',
    this.members = const [],
    this.tasks = const [],
    this.classesToday = const [],
  });

  factory TrainerOverview.fromJson(Json j) {
    final trainer = asMap(j['trainer']);
    return TrainerOverview(
      today: str(j['today']),
      trainerName: str(trainer['name']),
      trainerTitle: str(trainer['title']),
      members: asList(j['members']).map(TrainerMember.fromJson).toList(),
      tasks: asList(j['tasks']).map(CoachTask.fromJson).toList(),
      classesToday: asList(j['classesToday']).map(ClassSlot.fromJson).toList(),
    );
  }
}

class CoachMemberData {
  final Member member;
  final List<CoachLog> logs;

  const CoachMemberData({required this.member, this.logs = const []});

  factory CoachMemberData.fromJson(Json j) => CoachMemberData(
    member: Member.fromJson(asMap(j['member'])),
    logs: asList(j['logs']).map(CoachLog.fromJson).toList(),
  );
}

class MemberPortal {
  final String today;
  final String weekday;
  final String gymName;
  final Member member;
  final List<CoachLog> logs;
  final List<String> visits;
  final List<Announcement> announcements;
  final List<ClassSlot> slots;
  final List<FitnessVideo> videos;
  final String gymCheckinCode;
  final bool autopayAddon;

  const MemberPortal({
    required this.today,
    this.weekday = '',
    required this.gymName,
    required this.member,
    this.logs = const [],
    this.visits = const [],
    this.announcements = const [],
    this.slots = const [],
    this.videos = const [],
    this.gymCheckinCode = '',
    this.autopayAddon = false,
  });

  factory MemberPortal.fromJson(Json j) => MemberPortal(
    today: str(j['today']),
    weekday: str(j['weekday']),
    gymName: str(j['gymName']),
    member: Member.fromJson(asMap(j['member'])),
    logs: asList(j['logs']).map(CoachLog.fromJson).toList(),
    visits: (j['visits'] as List? ?? const []).map((e) => '$e').toList(),
    announcements: asList(j['announcements']).map(Announcement.fromJson).toList(),
    slots: asList(j['slots']).map(ClassSlot.fromJson).toList(),
    videos: asList(j['videos']).map(FitnessVideo.fromJson).toList(),
    gymCheckinCode: str(j['gymCheckinCode']),
    autopayAddon: boolOf(asMap(j['addons'])['autopay']),
  );
}

class ChartPoint {
  final String label;
  final double value;

  const ChartPoint(this.label, this.value);
}

class ReportData {
  final String today;
  final List<ChartPoint> revenueByMonth;
  final List<ChartPoint> attendanceByDay;
  final List<ChartPoint> membersByStatus;
  final List<ChartPoint> membersByPlan;
  final List<ChartPoint> leadsByStatus;
  final List<ChartPoint> revenueByMethod;

  const ReportData({
    required this.today,
    this.revenueByMonth = const [],
    this.attendanceByDay = const [],
    this.membersByStatus = const [],
    this.membersByPlan = const [],
    this.leadsByStatus = const [],
    this.revenueByMethod = const [],
  });

  factory ReportData.fromJson(Json j) => ReportData(
    today: str(j['today']),
    revenueByMonth: asList(j['revenueByMonth']).map((e) => ChartPoint(str(e['month']), doubleOf(e['total']))).toList(),
    attendanceByDay: asList(j['attendanceByDay']).map((e) => ChartPoint(str(e['day']), doubleOf(e['count']))).toList(),
    membersByStatus: asList(
      j['membersByStatus'],
    ).map((e) => ChartPoint(str(e['status']), doubleOf(e['count']))).toList(),
    membersByPlan: asList(j['membersByPlan']).map((e) => ChartPoint(str(e['plan']), doubleOf(e['count']))).toList(),
    leadsByStatus: asList(j['leadsByStatus']).map((e) => ChartPoint(str(e['status']), doubleOf(e['count']))).toList(),
    revenueByMethod: asList(
      j['revenueByMethod'],
    ).map((e) => ChartPoint(str(e['method']), doubleOf(e['total']))).toList(),
  );
}

class AdminGym {
  final String id;
  final String name;
  final String package;
  final Map<String, bool> addons;
  final int memberCount;
  final String createdAt;
  final String lastUsedAt;
  final String ownerName;
  final String ownerEmail;
  final String ownerPhone;
  final bool ownerHasPassword;

  const AdminGym({
    required this.id,
    required this.name,
    required this.package,
    this.addons = const {},
    this.memberCount = 0,
    this.createdAt = '',
    this.lastUsedAt = '',
    this.ownerName = '',
    this.ownerEmail = '',
    this.ownerPhone = '',
    this.ownerHasPassword = false,
  });

  factory AdminGym.fromJson(Json j) {
    final owner = asMap(j['owner']);
    return AdminGym(
      id: str(j['id']),
      name: str(j['name']),
      package: str(j['package']),
      addons: asMap(j['addons']).map((k, v) => MapEntry(k, boolOf(v))),
      memberCount: intOf(j['memberCount']),
      createdAt: str(j['createdAt']),
      lastUsedAt: str(j['lastUsedAt']),
      ownerName: str(owner['name']),
      ownerEmail: str(owner['email']),
      ownerPhone: str(owner['phone']),
      ownerHasPassword: boolOf(owner['hasPassword']),
    );
  }
}

class PaymentLink {
  final String gymName;
  final String payer;
  final int amount;
  final String status;
  final String? gateway;
  final bool simulated;

  const PaymentLink({
    required this.gymName,
    required this.payer,
    required this.amount,
    required this.status,
    this.gateway,
    this.simulated = false,
  });

  factory PaymentLink.fromJson(Json j) => PaymentLink(
    gymName: str(j['gymName']),
    payer: str(j['payer']),
    amount: intOf(j['amount']),
    status: str(j['status']),
    gateway: j['gateway'] == null ? null : str(j['gateway']),
    simulated: boolOf(j['simulated']),
  );
}
