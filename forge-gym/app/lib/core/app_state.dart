import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models.dart';
import 'api.dart';

class AppState extends ChangeNotifier {
  AppState._(this._prefs, this.api);

  static const _sessionKey = 'forge.session';
  static const _sandboxKey = 'forge.sandboxKey';
  static const _apiKey = 'forge.apiBase';
  static const _adminKey = 'forge.adminKey';
  static const _exercisePrefix = 'forge.exercise.';

  final SharedPreferences _prefs;
  final ApiClient api;

  ForgeSession? session;
  bool booting = true;
  String? lastError;
  bool fromDemo = false;

  static Future<AppState> bootstrap() async {
    final prefs = await SharedPreferences.getInstance();
    final storedBase = prefs.getString(_apiKey);
    final api = ApiClient(baseUrl: storedBase);

    ForgeSession? session;
    final raw = prefs.getString(_sessionKey);
    if (raw != null && raw.isNotEmpty) {
      try {
        final decoded = jsonDecode(raw);
        session = ForgeSession.fromJson(asMap(decoded));
        if (session.token.isEmpty) session = null;
      } catch (_) {
        session = null;
      }
    }

    final state = AppState._(prefs, api);
    state.session = session;
    state.fromDemo = session?.gym.isDemo ?? false;
    if (session != null) api.token = session.token;
    state.booting = false;

    // Refresh quietly. An expired session is cleared, a network failure keeps it.
    if (session != null) {
      unawaited(state._validateSession());
    }
    return state;
  }

  Future<void> _validateSession() async {
    try {
      final data = await api.request('/me', retry: false);
      final current = session;
      if (current == null) return;
      session = ForgeSession(
        token: current.token,
        sandboxKey: current.sandboxKey,
        user: ForgeUser.fromJson(asMap(data['user'])),
        gym: GymSession.fromJson(asMap(data['gym'])),
      );
      fromDemo = session!.gym.isDemo;
      await _persist();
      notifyListeners();
    } on ApiException catch (err) {
      if (err.isAuth && !(session?.gym.isDemo ?? false) && !(session?.token.startsWith('demo-') ?? false)) {
        await signOut();
      }
    } catch (_) {
      // Offline: keep the cached session.
    }
  }

  String get baseUrl => api.baseUrl;
  String get adminKey => _prefs.getString(_adminKey) ?? '';

  Future<void> setBaseUrl(String value) async {
    api.baseUrl = value;
    await _prefs.setString(_apiKey, api.baseUrl);
    notifyListeners();
  }

  Future<void> setAdminKey(String value) async {
    await _prefs.setString(_adminKey, value.trim());
    notifyListeners();
  }

  Future<void> _persist() async {
    final current = session;
    if (current == null) {
      await _prefs.remove(_sessionKey);
      return;
    }
    await _prefs.setString(_sessionKey, jsonEncode(current.toJson()));
    if (current.sandboxKey != null) {
      await _prefs.setString(_sandboxKey, current.sandboxKey!);
    }
  }

  Future<void> _useSession(ForgeSession fresh) async {
    session = fresh;
    fromDemo = fresh.gym.isDemo;
    api.token = fresh.token;
    await _persist();
    notifyListeners();
  }

  Future<void> signIn({required String identifier, required String password}) async {
    final fresh = await api.login(identifier: identifier, password: password);
    await _useSession(fresh);
  }

  Future<void> activate({required String invite, required String password, String? name}) async {
    final fresh = await api.activate(invite: invite, password: password, name: name);
    await _useSession(fresh);
  }

  Future<void> enterDemo({String role = 'owner', String tier = 'performance'}) async {
    final fresh = await api.demoSession(role: role, tier: tier, sandboxKey: _prefs.getString(_sandboxKey));
    await _useSession(fresh);
  }

  Future<void> resetDemo() async {
    final fresh = await api.resetDemo();
    await _useSession(fresh);
  }

  Future<void> refreshSession() async {
    final current = session;
    if (current == null) return;
    final data = await api.request('/me');
    final fresh = ForgeSession(
      token: current.token,
      sandboxKey: current.sandboxKey,
      user: ForgeUser.fromJson(asMap(data['user'])),
      gym: GymSession.fromJson(asMap(data['gym'])),
    );
    await _useSession(fresh);
  }

  Future<void> signOut() async {
    session = null;
    fromDemo = false;
    api.token = null;
    await _prefs.remove(_sessionKey);
    notifyListeners();
  }

  // Local exercise ticks for the member workout screen.
  bool exerciseDone(String key) => _prefs.getBool('$_exercisePrefix$key') ?? false;

  Future<void> toggleExercise(String key) async {
    final next = !exerciseDone(key);
    await _prefs.setBool('$_exercisePrefix$key', next);
    notifyListeners();
  }
}
