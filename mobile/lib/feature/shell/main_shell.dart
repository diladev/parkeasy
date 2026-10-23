import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/connection/connectivity_wrapper.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/booking/presentation/screens/my_bookings_screen.dart';
import 'package:mobile/feature/home/presentation/screens/home_screen.dart';
import 'package:mobile/feature/map/presentation/screens/map_screen.dart';
import 'package:mobile/feature/profile/presentation/bloc/profile_bloc.dart';
import 'package:mobile/feature/profile/presentation/bloc/profile_event.dart';
import 'package:mobile/feature/profile/presentation/screens/profile_screen.dart';

/// The signed-in app: the four tabs of the bottom navigation bar.
///
/// IndexedStack keeps every tab alive, so switching tabs doesn't reload them
/// or lose their scroll position. The map is only built the first time its
/// tab is opened, so it doesn't load tiles or read the location before that.
class MainShell extends StatefulWidget {
  const MainShell({super.key, this.initialIndex = 0});

  final int initialIndex;

  static const int mapTab = 1;
  static const int bookingsTab = 2;

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  late int _index = widget.initialIndex;
  late bool _hasOpenedMap = widget.initialIndex == MainShell.mapTab;

  void _selectTab(int index) => setState(() {
    _index = index;
    if (index == MainShell.mapTab) _hasOpenedMap = true;
  });

  @override
  void initState() {
    super.initState();
    // Fill in the profile from the device right away, then from the API.
    context.read<ProfileBloc>().add(ProfileRequested());
  }

  @override
  Widget build(BuildContext context) {
    return BaseScreenWrapper(
      child: Scaffold(
        body: IndexedStack(
          index: _index,
          children: [
            HomeScreen(
              onOpenMap: () => _selectTab(MainShell.mapTab),
              onOpenBookings: () => _selectTab(MainShell.bookingsTab),
            ),
            if (_hasOpenedMap) const MapScreen() else const SizedBox.shrink(),
            const MyBookingsScreen(),
            const ProfileScreen(),
          ],
        ),
        bottomNavigationBar: AppBottomNav(
          currentIndex: _index,
          onTap: _selectTab,
        ),
      ),
    );
  }
}
