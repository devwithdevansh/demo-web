import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/app_state.dart';
import '../core/format.dart';
import '../core/theme.dart';
import '../screens/addons_screen.dart';
import '../screens/attendance_screen.dart';
import '../screens/coaching_screen.dart';
import '../screens/dashboard_screen.dart';
import '../screens/leads_screen.dart';
import '../screens/member_checkin_screen.dart';
import '../screens/member_home_screen.dart';
import '../screens/member_progress_screen.dart';
import '../screens/members_screen.dart';
import '../screens/payments_screen.dart';
import '../screens/plans_screen.dart';
import '../screens/reports_screen.dart';
import '../screens/renewals_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/team_screen.dart';
import '../screens/trainer_screen.dart';
import '../screens/videos_screen.dart';
import 'widgets.dart';

class NavItem {
  const NavItem({required this.label, required this.icon, required this.builder, this.badge});

  final String label;
  final IconData icon;
  final WidgetBuilder builder;
  final String? badge;
}

class ShellScope extends InheritedWidget {
  const ShellScope({super.key, required this.go, required this.items, required super.child});

  final void Function(int index) go;
  final List<NavItem> items;

  static ShellScope of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<ShellScope>();
    assert(scope != null, 'ShellScope is only available inside AppShell');
    return scope!;
  }

  @override
  bool updateShouldNotify(ShellScope oldWidget) => oldWidget.items != items;
}

class AppShell extends StatefulWidget {
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;

  List<NavItem> _itemsFor(AppState state) {
    final session = state.session;
    if (session == null) return const [];
    final user = session.user;
    final gym = session.gym;

    if (user.isMember) {
      return [
        NavItem(label: 'Pass', icon: Icons.qr_code_2, builder: (_) => const MemberHomeScreen()),
        NavItem(label: 'Check in', icon: Icons.qr_code_scanner, builder: (_) => const MemberCheckinScreen()),
        NavItem(
          label: 'Workout',
          icon: Icons.fitness_center,
          builder: (_) => const MemberProgressScreen(initialTab: 0),
        ),
        NavItem(label: 'Progress', icon: Icons.insights, builder: (_) => const MemberProgressScreen(initialTab: 1)),
        NavItem(label: 'Diet', icon: Icons.restaurant_menu, builder: (_) => const MemberProgressScreen(initialTab: 2)),
        NavItem(label: 'Videos', icon: Icons.play_circle_outline, builder: (_) => const VideosScreen(showAdmin: false)),
        NavItem(label: 'Autopay', icon: Icons.autorenew, builder: (_) => const MemberProgressScreen(initialTab: 3)),
        NavItem(label: 'Settings', icon: Icons.settings_outlined, builder: (_) => const SettingsScreen()),
      ];
    }

    if (user.isTrainer) {
      return [
        NavItem(label: 'Today', icon: Icons.grid_view_rounded, builder: (_) => const TrainerScreen()),
        NavItem(
          label: 'My members',
          icon: Icons.groups_2_outlined,
          builder: (_) => const MembersScreen(coachMode: true),
        ),
        NavItem(label: 'Coaching', icon: Icons.calendar_month_outlined, builder: (_) => const CoachingScreen()),
        NavItem(label: 'Videos', icon: Icons.play_circle_outline, builder: (_) => const VideosScreen(showAdmin: false)),
        NavItem(label: 'Settings', icon: Icons.settings_outlined, builder: (_) => const SettingsScreen()),
      ];
    }

    final items = <NavItem>[
      NavItem(label: 'Dashboard', icon: Icons.grid_view_rounded, builder: (_) => const DashboardScreen()),
      NavItem(label: 'Members', icon: Icons.groups_2_outlined, builder: (_) => const MembersScreen()),
      NavItem(label: 'Attendance', icon: Icons.how_to_reg_outlined, builder: (_) => const AttendanceScreen()),
      NavItem(label: 'Payments', icon: Icons.receipt_long_outlined, builder: (_) => const PaymentsScreen()),
      NavItem(label: 'Leads', icon: Icons.person_add_alt_outlined, builder: (_) => const LeadsScreen()),
      NavItem(label: 'Renewals', icon: Icons.update, builder: (_) => const RenewalsScreen()),
      NavItem(label: 'Coaching', icon: Icons.calendar_month_outlined, builder: (_) => const CoachingScreen()),
      NavItem(label: 'Videos', icon: Icons.play_circle_outline, builder: (_) => const VideosScreen()),
      NavItem(label: 'Add-ons', icon: Icons.extension_outlined, builder: (_) => const AddonsScreen()),
      if (user.isOwner) NavItem(label: 'Reports', icon: Icons.bar_chart, builder: (_) => const ReportsScreen()),
      NavItem(label: 'Plans', icon: Icons.card_membership, builder: (_) => const PlansScreen()),
      NavItem(label: 'Team', icon: Icons.badge_outlined, builder: (_) => const TeamScreen()),
      NavItem(label: 'Settings', icon: Icons.settings_outlined, builder: (_) => const SettingsScreen()),
    ];
    // Hide add-ons for a package that does not include them.
    if (gym.package == 'essential') {
      items.removeWhere((item) => item.label == 'Add-ons' || item.label == 'Coaching');
    }
    return items;
  }

  int get _mobilePrimaryCount {
    final user = context.read<AppState>().session?.user;
    if (user == null) return 4;
    if (user.isMember) return 4;
    if (user.isTrainer) return 4;
    return 4;
  }

  void _go(int index) {
    setState(() => _index = index.clamp(0, _itemsFor(context.read<AppState>()).length - 1));
  }

  void _openMore(List<NavItem> items) {
    final state = context.read<AppState>();
    final user = state.session?.user;
    if (user == null) return;
    showForgeSheet<void>(
      context: context,
      title: 'Everything else',
      child: Column(
        children: [
          for (var i = _mobilePrimaryCount; i < items.length; i++)
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Icon(items[i].icon, size: 20, color: ForgeColors.boneDim),
              title: Text(
                items[i].label,
                style: ForgeTheme.body(14, color: ForgeColors.bone, weight: FontWeight.w600),
              ),
              trailing: const Icon(Icons.chevron_right, size: 18, color: ForgeColors.mute),
              onTap: () {
                Navigator.pop(context);
                _go(i);
              },
            ),
          const Divider(height: 26),
          if (user.isOwner)
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.admin_panel_settings_outlined, size: 20, color: ForgeColors.mute),
              title: Text('Installation admin', style: ForgeTheme.body(13, color: ForgeColors.mute)),
              onTap: () {
                Navigator.pop(context);
                Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SettingsScreen(startAdmin: true)));
              },
            ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final session = state.session;
    if (session == null) return const SizedBox.shrink();
    final items = _itemsFor(state);
    if (items.isEmpty) return const SizedBox.shrink();
    if (_index >= items.length) _index = 0;
    final width = MediaQuery.sizeOf(context).width;
    final desktopRail = width >= 1024;
    final bottomBar = width < 720;

    final content = IndexedStack(index: _index, children: items.map((item) => item.builder(context)).toList());

    return ShellScope(
      go: _go,
      items: items,
      child: ForgeBackground(
        child: Scaffold(
          backgroundColor: Colors.transparent,
          drawer: desktopRail
              ? null
              : _ForgeDrawer(items: items, active: _index, onSelect: _go, showAdmin: session.user.isOwner),
          appBar: desktopRail
              ? null
              : AppBar(
                  backgroundColor: ForgeColors.ink.withValues(alpha: 0.92),
                  surfaceTintColor: Colors.transparent,
                  elevation: 0,
                  titleSpacing: 16,
                  title: Row(
                    children: [
                      const ForgeLogo(size: 30, showWordmark: true),
                      const SizedBox(width: 12),
                      if (session.gym.isDemo) const StatusPill(label: 'Demo', color: ForgeColors.amber, dense: true),
                    ],
                  ),
                  actions: [
                    IconButton(
                      tooltip: 'Settings',
                      onPressed: () =>
                          Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SettingsScreen())),
                      icon: const Icon(Icons.settings_outlined, size: 20),
                    ),
                    const SizedBox(width: 6),
                  ],
                ),
          body: desktopRail
              ? Row(
                  children: [
                    _SideRail(items: items, active: _index, onSelect: _go, showAdmin: session.user.isOwner),
                    Expanded(child: content),
                  ],
                )
              : content,
          bottomNavigationBar: bottomBar
              ? _BottomBar(
                  items: items.take(_mobilePrimaryCount).toList(),
                  active: _index,
                  onSelect: _go,
                  onMore: () => _openMore(items),
                )
              : null,
          floatingActionButton: _fabFor(items),
        ),
      ),
    );
  }

  Widget? _fabFor(List<NavItem> items) {
    // Keep the shell quiet; each screen owns its own primary action.
    return null;
  }
}

class _SideRail extends StatelessWidget {
  const _SideRail({required this.items, required this.active, required this.onSelect, required this.showAdmin});

  final List<NavItem> items;
  final int active;
  final ValueChanged<int> onSelect;
  final bool showAdmin;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final session = state.session!;
    return Container(
      width: 252,
      decoration: BoxDecoration(
        color: ForgeColors.ink2.withValues(alpha: 0.78),
        border: const Border(right: BorderSide(color: ForgeColors.line)),
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 24, 18, 18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const ForgeLogo(size: 36, subtitle: 'Gym OS'),
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: ForgeColors.panel,
                    borderRadius: BorderRadius.circular(13),
                    border: Border.all(color: ForgeColors.line),
                  ),
                  child: Row(
                    children: [
                      AvatarCircle(name: session.gym.name, size: 34),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              session.gym.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: ForgeTheme.body(12, weight: FontWeight.w700, color: ForgeColors.bone),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${titleCase(session.gym.package)} plan${session.gym.isDemo ? ' · demo' : ''}',
                              style: ForgeTheme.mono(8.5, letterSpacing: 0.8),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: items.length,
              itemBuilder: (context, i) => _RailItem(item: items[i], active: i == active, onTap: () => onSelect(i)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              children: [
                if (showAdmin)
                  TextButton.icon(
                    onPressed: () => Navigator.of(
                      context,
                    ).push(MaterialPageRoute(builder: (_) => const SettingsScreen(startAdmin: true))),
                    icon: const Icon(Icons.admin_panel_settings_outlined, size: 16),
                    label: const Text('Installation admin'),
                  ),
                const SizedBox(height: 4),
                _UserTile(
                  user: session.user,
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SettingsScreen())),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RailItem extends StatelessWidget {
  const _RailItem({required this.item, required this.active, required this.onTap});

  final NavItem item;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 3),
      child: Material(
        color: active ? ForgeColors.red.withValues(alpha: 0.12) : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: onTap,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
            decoration: BoxDecoration(
              border: Border(left: BorderSide(color: active ? ForgeColors.red : Colors.transparent, width: 2)),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                Icon(item.icon, size: 18, color: active ? ForgeColors.redHi : ForgeColors.mute),
                const SizedBox(width: 11),
                Expanded(
                  child: Text(
                    item.label,
                    style: ForgeTheme.body(
                      13,
                      weight: active ? FontWeight.w600 : FontWeight.w500,
                      color: active ? ForgeColors.bone : ForgeColors.mute,
                    ),
                  ),
                ),
                if (item.badge != null) StatusPill(label: item.badge!, dense: true),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _UserTile extends StatelessWidget {
  const _UserTile({required this.user, required this.onTap});

  final dynamic user;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
          child: Row(
            children: [
              AvatarCircle(name: user.name, size: 34),
              const SizedBox(width: 9),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      user.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: ForgeTheme.body(12, weight: FontWeight.w600, color: ForgeColors.bone),
                    ),
                    Text(
                      user.title.isEmpty ? roleLabel(user.role) : user.title,
                      style: ForgeTheme.body(10, color: ForgeColors.mute),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.expand_more, size: 16, color: ForgeColors.mute),
            ],
          ),
        ),
      ),
    );
  }
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({required this.items, required this.active, required this.onSelect, required this.onMore});

  final List<NavItem> items;
  final int active;
  final ValueChanged<int> onSelect;
  final VoidCallback onMore;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: ForgeColors.ink2,
        border: Border(top: BorderSide(color: ForgeColors.line)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            for (var i = 0; i < items.length; i++)
              Expanded(
                child: InkWell(
                  onTap: () => onSelect(i),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 9),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(items[i].icon, size: 20, color: i == active ? ForgeColors.redHi : ForgeColors.mute),
                        const SizedBox(height: 3),
                        Text(
                          items[i].label,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: ForgeTheme.body(
                            9.5,
                            weight: i == active ? FontWeight.w700 : FontWeight.w500,
                            color: i == active ? ForgeColors.bone : ForgeColors.mute,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            Expanded(
              child: InkWell(
                onTap: onMore,
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 9),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.menu, size: 20, color: ForgeColors.mute),
                      const SizedBox(height: 3),
                      Text('More', style: ForgeTheme.body(9.5, color: ForgeColors.mute)),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ForgeDrawer extends StatelessWidget {
  const _ForgeDrawer({required this.items, required this.active, required this.onSelect, required this.showAdmin});

  final List<NavItem> items;
  final int active;
  final ValueChanged<int> onSelect;
  final bool showAdmin;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final session = state.session!;
    return Drawer(
      backgroundColor: ForgeColors.ink2,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const ForgeLogo(size: 32, subtitle: 'Gym OS'),
                  const SizedBox(height: 14),
                  Text(
                    session.gym.name,
                    style: ForgeTheme.body(13, weight: FontWeight.w700, color: ForgeColors.bone),
                  ),
                  Text(
                    '${titleCase(session.gym.package)} plan${session.gym.isDemo ? ' · demo sandbox' : ''}',
                    style: ForgeTheme.mono(9),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                itemCount: items.length,
                itemBuilder: (context, i) => ListTile(
                  dense: true,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(9)),
                  selected: i == active,
                  selectedTileColor: ForgeColors.red.withValues(alpha: 0.12),
                  leading: Icon(items[i].icon, size: 19, color: i == active ? ForgeColors.redHi : ForgeColors.mute),
                  title: Text(
                    items[i].label,
                    style: ForgeTheme.body(13, color: i == active ? ForgeColors.bone : ForgeColors.mute),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    onSelect(i);
                  },
                ),
              ),
            ),
            if (showAdmin)
              ListTile(
                leading: const Icon(Icons.admin_panel_settings_outlined, size: 18, color: ForgeColors.mute),
                title: Text('Installation admin', style: ForgeTheme.body(12, color: ForgeColors.mute)),
                onTap: () {
                  Navigator.pop(context);
                  Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SettingsScreen(startAdmin: true)));
                },
              ),
            const Divider(height: 1),
            _UserTile(
              user: session.user,
              onTap: () {
                Navigator.pop(context);
                Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SettingsScreen()));
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
