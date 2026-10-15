import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/connection/connectivity_wrapper.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/booking/presentation/screens/my_bookings_screen.dart';
import 'package:mobile/feature/home/presentation/screens/home_screen.dart';
import 'package:mobile/feature/profile/presentation/bloc/profile_bloc.dart';
import 'package:mobile/feature/profile/presentation/bloc/profile_event.dart';
import 'package:mobile/feature/profile/presentation/screens/profile_screen.dart';
import 'package:mobile/feature/stub/stub_screen.dart';

/// The signed-in app: the four tabs of the bottom navigation bar.
///
/// IndexedStack keeps every tab alive, so switching tabs doesn't reload them
/// or lose their scroll position. Map is a placeholder until that feature is
/// built.
class MainShell extends StatefulWidget {
  const MainShell({super.key, this.initialIndex = 0});

  final int initialIndex;

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  static const int _mapTab = 1;
  static const int _bookingsTab = 2;

  late int _index = widget.initialIndex;

  void _selectTab(int index) => setState(() => _index = index);

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
              onOpenMap: () => _selectTab(_mapTab),
              onOpenBookings: () => _selectTab(_bookingsTab),
            ),
            const StubScreen(routeName: 'Map', showBack: false),
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
