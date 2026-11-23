import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'core/app_state.dart';
import 'core/theme.dart';
import 'screens/auth/login_screen.dart';
import 'ui/shell.dart';
import 'ui/widgets.dart';

// ==============================================================================
// DEMO MODE CONFIGURATION:
// ------------------------------------------------------------------------------
// • When `isDemo = true`:
//     - Bypasses the login screen! Directly enters the app with a demo account.
//     - All mobile app screens (Dashboard, Members, Attendance, Coaching, etc.)
//       are immediately accessible.
//
// • When `isDemo = false`:
//     - The LOGIN SCREEN IS VISIBLE on launch.
//     - You can log in with demo accounts (e.g. owner1@forge.demo / forge1234)
//       or tap the "Demo" role picker.
//
// Change or toggle between true/false below:
// ==============================================================================
const bool isDemo = true;  // <-- Automatically enters the app directly as Admin/Owner!
// const bool isDemo = false;

class ForgeApp extends StatelessWidget {
  const ForgeApp({super.key, required this.state});

  final AppState state;

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<AppState>.value(
      value: state,
      child: MaterialApp(
        title: 'FORGE Gym',
        debugShowCheckedModeBanner: false,
        theme: ForgeTheme.dark(),
        scrollBehavior: const _ForgeScrollBehavior(),
        home: const _Root(),
      ),
    );
  }
}

class _Root extends StatelessWidget {
  const _Root();

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();

    // When isDemo is true and no session exists, automatically sign in with demo account
    if (isDemo && state.session == null && !state.booting) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        state.enterDemo(role: 'owner');
      });
    }

    final Widget child;
    if (state.booting || (isDemo && state.session == null)) {
      child = const SplashScreen();
    } else if (state.session == null) {
      // Login screen is visible
      child = const LoginScreen();
    } else {
      // Main mobile application shell
      child = const AppShell();
    }
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 320),
      switchInCurve: Curves.easeOutCubic,
      switchOutCurve: Curves.easeInCubic,
      child: KeyedSubtree(key: ValueKey(child.runtimeType), child: child),
    );
  }
}

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ForgeBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const ForgeLogo(size: 52, subtitle: 'Gym Operating System'),
              const SizedBox(height: 28),
              SizedBox(
                width: 160,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(99),
                  child: LinearProgressIndicator(
                    minHeight: 2.5,
                    backgroundColor: ForgeColors.line,
                    valueColor: const AlwaysStoppedAnimation(ForgeColors.red),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text('LOADING YOUR GYM', style: ForgeTheme.mono(9, letterSpacing: 2.4)),
            ],
          ),
        ),
      ),
    );
  }
}

class _ForgeScrollBehavior extends MaterialScrollBehavior {
  const _ForgeScrollBehavior();

  @override
  Set<PointerDeviceKind> get dragDevices => {
    PointerDeviceKind.touch,
    PointerDeviceKind.mouse,
    PointerDeviceKind.trackpad,
    PointerDeviceKind.stylus,
  };
}
