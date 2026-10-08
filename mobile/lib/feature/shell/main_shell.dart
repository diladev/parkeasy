import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/connection/connectivity_wrapper.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/profile/presentation/bloc/profile_bloc.dart';
import 'package:mobile/feature/profile/presentation/bloc/profile_event.dart';
import 'package:mobile/feature/profile/presentation/screens/profile_screen.dart';
import 'package:mobile/feature/stub/stub_screen.dart';

/// The signed-in app: the four tabs of the bottom navigation bar.
///
/// IndexedStack keeps every tab alive, so switching tabs doesn't reload them
/// or lose their scroll position. Home, Map and Bookings are placeholders
/// until those features are built.
class MainShell extends StatefulWidget {
  const MainShell({super.key, this.initialIndex = 0});

  final int initialIndex;

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  late int _index = widget.initialIndex;

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
          children: const [
            StubScreen(routeName: 'Home', showBack: false),
            StubScreen(routeName: 'Map', showBack: false),
            StubScreen(routeName: 'Bookings', showBack: false),
            ProfileScreen(),
          ],
        ),
        bottomNavigationBar: AppBottomNav(
          currentIndex: _index,
          onTap: (index) => setState(() => _index = index),
        ),
      ),
    );
  }
}
