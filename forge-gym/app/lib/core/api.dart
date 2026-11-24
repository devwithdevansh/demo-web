import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models.dart';

/// Where the app talks to by default. Override with
/// `--dart-define=API_BASE_URL=http://localhost:4000` when running locally.
const _compiledApi = String.fromEnvironment('API_BASE_URL', defaultValue: '');
const defaultApiOrigin = _compiledApi != '' ? _compiledApi : 'http://127.0.0.1:4000';

class ApiException implements Exception {
  final int status;
  final String message;
  final String code;
  final Map<String, String> fields;

  const ApiException(this.status, this.message, {this.code = 'error', this.fields = const {}});

  bool get isAuth => status == 401 || code == 'no_session' || code == 'session_expired';
  bool get isUnreachable => status == 0 || code == 'offline' || code == 'waking';

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({String? baseUrl, this.token}) : _baseUrl = _clean(baseUrl ?? defaultApiOrigin);

  String _baseUrl;
  String? token;

  String get baseUrl => _baseUrl;
  set baseUrl(String value) => _baseUrl = _clean(value);

  static String _clean(String value) {
    var v = value.trim();
    while (v.endsWith('/')) {
      v = v.substring(0, v.length - 1);
    }
    if (v.isNotEmpty && !v.startsWith('http')) v = 'https://$v';
    return v;
  }

  Map<String, String> _headers({bool body = false, Map<String, String>? extra}) => {
    if (body) 'Content-Type': 'application/json',
    if (token != null && token!.isNotEmpty) 'Authorization': 'Bearer $token',
    'Accept': 'application/json',
    ...?extra,
  };

  Future<Json> request(
    String path, {
    String method = 'GET',
    Object? body,
    Map<String, String>? headers,
    bool retry = true,
  }) async {
    final uri = Uri.parse('$_baseUrl/api$path');

    final http.Response response;
    try {
      response = await _send(
        uri,
        method: method,
        body: body,
        headers: headers,
      ).timeout(const Duration(seconds: 12));
    } on TimeoutException {
      throw const ApiException(0, 'The gym server did not respond. Check the API address and try again.', code: 'offline');
    } catch (_) {
      throw const ApiException(0, 'Could not reach the gym server. Check the API address and try again.', code: 'offline');
    }

    return _decode(response);
  }

  Future<http.Response> _send(Uri uri, {required String method, Object? body, Map<String, String>? headers}) async {
    final client = http.Client();
    try {
      final request = http.Request(method, uri)..headers.addAll(_headers(body: body != null, extra: headers));
      if (body != null) request.body = jsonEncode(body);
      final streamed = await client.send(request);
      return http.Response.fromStream(streamed);
    } finally {
      client.close();
    }
  }

  Json _decode(http.Response response) {
    final contentType = response.headers['content-type'] ?? '';
    final isJson = contentType.contains('application/json');
    if (!isJson) {
      if ([500, 502, 503, 504].contains(response.statusCode)) {
        throw const ApiException(503, 'The gym server is starting up. Please try again in a moment.', code: 'waking');
      }
      throw ApiException(
        response.statusCode,
        'This address did not answer like a FORGE server (${response.statusCode}).',
        code: 'no_server',
      );
    }
    dynamic data;
    try {
      data = jsonDecode(response.body);
    } catch (_) {
      data = null;
    }
    final map = asMap(data);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final fields = asMap(map['fields']).map((k, v) => MapEntry(k, '$v'));
      throw ApiException(
        response.statusCode,
        str(map['error'], 'That did not work. Please try again.'),
        code: str(map['code'], 'error'),
        fields: fields,
      );
    }
    return map;
  }

  Future<Json> health() => request('/health', retry: false);

  // ---- Sessions -----------------------------------------------------------

  Future<ForgeSession> login({required String identifier, required String password}) async {
    final data = await request(
      '/auth/login',
      method: 'POST',
      body: {'identifier': identifier, 'password': password},
      retry: false,
    );
    return ForgeSession.fromJson(data);
  }

  Future<ForgeSession> demoSession({String tier = 'performance', required String role, String? sandboxKey}) async {
    final data = await request(
      '/demo/session',
      method: 'POST',
      body: {'tier': tier, 'role': role, if (sandboxKey != null && sandboxKey.isNotEmpty) 'sandboxKey': sandboxKey},
    );
    return ForgeSession.fromJson(data);
  }

  Future<ForgeSession> activate({required String invite, required String password, String? name}) async {
    final data = await request(
      '/auth/activate',
      method: 'POST',
      body: {'token': invite, 'password': password, if (name != null && name.isNotEmpty) 'name': name},
      retry: false,
    );
    return ForgeSession.fromJson(data);
  }

  Future<ForgeSession> resetDemo() async {
    final data = await request('/demo/reset', method: 'POST');
    return ForgeSession.fromJson(data);
  }

  // ---- Desk: dashboard, members, plans ------------------------------------

  Future<DashboardData> dashboard() async => DashboardData.fromJson(await request('/dashboard'));

  Future<List<Member>> members({String query = '', String status = ''}) async {
    final params = <String, String>{
      if (query.trim().isNotEmpty) 'q': query.trim(),
      if (status.isNotEmpty) 'status': status,
    };
    final suffix = params.isEmpty ? '' : '?${Uri(queryParameters: params).query}';
    final data = await request('/members$suffix');
    return asList(data['members']).map(Member.fromJson).toList();
  }

  Future<List<Plan>> plans() async {
    final data = await request('/plans');
    return asList(data['plans']).map(Plan.fromJson).toList();
  }

  Future<Member> createMember(Json body) async {
    final data = await request('/members', method: 'POST', body: body);
    final map = asMap(data['member']).isNotEmpty ? asMap(data['member']) : data;
    return Member.fromJson(map);
  }

  Future<MemberDetailData> member(String id) async => MemberDetailData.fromJson(await request('/members/$id'));

  Future<Member> updateMember(String id, Json body) async {
    final data = await request('/members/$id', method: 'PATCH', body: body);
    final map = asMap(data['member']).isNotEmpty ? asMap(data['member']) : data;
    return Member.fromJson(map);
  }

  Future<Member> renewMember(String id, Json body) async {
    final data = await request('/members/$id/renew', method: 'POST', body: body);
    final map = asMap(data['member']).isNotEmpty ? asMap(data['member']) : data;
    return Member.fromJson(map);
  }

  Future<RenewalsData> renewals() async => RenewalsData.fromJson(await request('/renewals'));

  Future<Plan> createPlan(Json body) async {
    final data = await request('/plans', method: 'POST', body: body);
    final map = asMap(data['plan']).isNotEmpty ? asMap(data['plan']) : data;
    return Plan.fromJson(map);
  }

  Future<void> updatePlan(String id, Json body) => request('/plans/$id', method: 'PATCH', body: body);

  // ---- Attendance ---------------------------------------------------------

  Future<AttendanceData> attendance({String? date}) async {
    final suffix = date == null || date.isEmpty ? '' : '?date=$date';
    return AttendanceData.fromJson(await request('/attendance$suffix'));
  }

  Future<Json> checkIn(Json body) => request('/attendance', method: 'POST', body: body, retry: false);

  Future<void> removeCheckin(String id) => request('/attendance/$id', method: 'DELETE');

  // ---- Payments -----------------------------------------------------------

  Future<PaymentsData> payments() async => PaymentsData.fromJson(await request('/payments'));

  Future<void> recordPayment(Json body) => request('/payments', method: 'POST', body: body);

  // ---- Leads --------------------------------------------------------------

  Future<Json> leads() => request('/leads');

  Future<Lead> createLead(Json body) async {
    final data = await request('/leads', method: 'POST', body: body);
    final map = asMap(data['lead']).isNotEmpty ? asMap(data['lead']) : data;
    return Lead.fromJson(map);
  }

  Future<Lead> updateLead(String id, Json body) async {
    final data = await request('/leads/$id', method: 'PATCH', body: body);
    final map = asMap(data['lead']).isNotEmpty ? asMap(data['lead']) : data;
    return Lead.fromJson(map);
  }

  // ---- Team ---------------------------------------------------------------

  Future<List<TeamMember>> team() async {
    final data = await request('/team');
    return asList(data['team']).map(TeamMember.fromJson).toList();
  }

  Future<void> createTeam(Json body) => request('/team', method: 'POST', body: body);

  Future<void> updateTeam(String id, Json body) => request('/team/$id', method: 'PATCH', body: body);

  // ---- Coaching -----------------------------------------------------------

  Future<Json> timetable() => request('/coach/timetable');

  Future<void> addClass(Json body) => request('/coach/timetable', method: 'POST', body: body);

  Future<void> editClass(String id, Json body) => request('/coach/timetable/$id', method: 'PUT', body: body);

  Future<void> deleteClass(String id) => request('/coach/timetable/$id', method: 'DELETE');

  Future<List<Announcement>> announcements() async {
    final data = await request('/coach/announcements');
    return asList(data['announcements']).map(Announcement.fromJson).toList();
  }

  Future<void> addAnnouncement(Json body) => request('/coach/announcements', method: 'POST', body: body);

  Future<void> deleteAnnouncement(String id) => request('/coach/announcements/$id', method: 'DELETE');

  Future<Map<String, dynamic>> assignments() => request('/coach/assignments');

  Future<void> assign(String memberId, Json body) =>
      request('/coach/members/$memberId/assignment', method: 'PATCH', body: body);

  Future<TrainerOverview> coachOverview() async => TrainerOverview.fromJson(await request('/coach/overview'));

  Future<CoachMemberData> coachMember(String id) async => CoachMemberData.fromJson(await request('/coach/members/$id'));

  Future<void> saveWorkout(String id, Json body) => request('/coach/members/$id/workout', method: 'PUT', body: body);

  Future<void> saveDiet(String id, Json body) => request('/coach/members/$id/diet', method: 'PUT', body: body);

  Future<void> saveMemberTimetable(String id, Json body) =>
      request('/coach/members/$id/timetable', method: 'PUT', body: body);

  Future<void> addLog(String id, Json body) => request('/coach/members/$id/logs', method: 'POST', body: body);

  Future<void> addPtSession(String id, Json body) =>
      request('/coach/members/$id/pt-session', method: 'POST', body: body);

  Future<List<Json>> templates() async {
    final data = await request('/coach/templates');
    return asList(data['templates']);
  }

  // ---- Videos -------------------------------------------------------------

  Future<Json> videos() => request('/videos');

  Future<void> addVideo(Json body) => request('/videos', method: 'POST', body: body);

  Future<void> updateVideo(String id, Json body) => request('/videos/$id', method: 'PATCH', body: body);

  Future<void> deleteVideo(String id) => request('/videos/$id', method: 'DELETE');

  // ---- Reports ------------------------------------------------------------

  Future<ReportData> reports() async => ReportData.fromJson(await request('/reports'));

  // ---- Add-ons ------------------------------------------------------------

  Future<AddonsData> addons() async => AddonsData.fromJson(await request('/addons'));

  Future<void> setAddon(String key, bool enabled) =>
      request('/addons', method: 'PATCH', body: {'key': key, 'enabled': enabled});

  Future<Json> sendMessage(Json body) => request('/addons/message', method: 'POST', body: body);

  Future<Json> createPaymentLink(Json body) => request('/addons/upi-link', method: 'POST', body: body);

  Future<void> requestAutopay(String memberId) =>
      request('/addons/autopay/request', method: 'POST', body: {'memberId': memberId});

  Future<PaymentLink> paymentLink(String token) async => PaymentLink.fromJson(await request('/public/pay/$token'));

  Future<PaymentLink> resolvePaymentLink(String token, String outcome) async {
    final data = await request('/public/pay/$token', method: 'POST', body: {'outcome': outcome}, retry: false);
    return PaymentLink.fromJson(data);
  }

  // ---- Member portal ------------------------------------------------------

  Future<MemberPortal> portal() async => MemberPortal.fromJson(await request('/portal'));

  Future<Json> memberCheckin(String qrCode) =>
      request('/portal/checkin', method: 'POST', body: {'qrCode': qrCode}, retry: false);

  Future<void> memberAutopay(String action, {bool consent = false}) =>
      request('/portal/autopay', method: 'POST', body: {'action': action, 'consent': consent});

  // ---- Installation admin -------------------------------------------------

  Future<List<AdminGym>> adminGyms(String adminKey) async {
    final data = await request('/admin/gyms', headers: {'X-Admin-Key': adminKey}, retry: false);
    return asList(data['gyms']).map(AdminGym.fromJson).toList();
  }

  Future<Json> adminCreateGym(String adminKey, Json body) =>
      request('/admin/gyms', method: 'POST', headers: {'X-Admin-Key': adminKey}, body: body, retry: false);

  Future<String> adminInvite(String adminKey, String gymId) async {
    final data = await request(
      '/admin/gyms/$gymId/invite',
      method: 'POST',
      headers: {'X-Admin-Key': adminKey},
      retry: false,
    );
    return str(data['inviteToken']);
  }

  Future<void> adminUpdateGym(String adminKey, String gymId, Json body) =>
      request('/admin/gyms/$gymId', method: 'PATCH', headers: {'X-Admin-Key': adminKey}, body: body, retry: false);

  Future<void> adminDeleteGym(String adminKey, String gymId) =>
      request('/admin/gyms/$gymId', method: 'DELETE', headers: {'X-Admin-Key': adminKey}, retry: false);
}
