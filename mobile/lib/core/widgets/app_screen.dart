import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile/core/connection/connectivity_wrapper.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// The frame every regular screen is built in, instead of Scaffold + SafeArea.
///
/// - The background is painted edge to edge, behind the status bar and the
///   navigation area (gesture bar, 3-button bar or iOS home indicator), so
///   no black strip shows there.
/// - [topBar] and the content stay below the status bar and notch.
/// - The content stays above the navigation area, unless [safeBottom] is off.
/// - The status bar icons are made readable on this screen's background.
///
/// Full-screen screens (splash, onboarding, location permission) don't use it:
/// they handle the system bars themselves.
class AppScreen extends StatelessWidget {
  const AppScreen({
    super.key,
    required this.body,
    this.topBar,
    this.bottomBar,
    this.safeTop = true,
    this.safeBottom = true,
    this.backgroundColor,
    this.statusBarIcons,
    this.showConnectivity = true,
    this.resizeToAvoidBottomInset = true,
  });

  final Widget body;

  /// Shown under the status bar, e.g. [AppTopBar]. Its background extends up
  /// behind the status bar.
  final PreferredSizeWidget? topBar;

  /// Shown at the bottom, e.g. [AppBottomNav]. It must keep itself above the
  /// navigation area: BottomNavigationBar does; wrap a custom bar in
  /// `SafeArea(top: false, child: ...)`.
  final Widget? bottomBar;

  /// Keep [body] below the status bar. Ignored with a [topBar], which does it.
  final bool safeTop;

  /// Keep [body] above the navigation area. Ignored with a [bottomBar].
  final bool safeBottom;

  /// Defaults to the theme's background.
  final Color? backgroundColor;

  /// The colour of the status bar and navigation bar icons:
  /// [Brightness.light] for light icons (on a dark screen). Defaults to
  /// whatever reads well on the theme's background.
  final Brightness? statusBarIcons;

  /// Covers the screen with the "No internet" message while offline.
  final bool showConnectivity;

  /// Shrinks the body when the keyboard opens, like [Scaffold].
  final bool resizeToAvoidBottomInset;

  @override
  Widget build(BuildContext context) {
    final background = backgroundColor ?? context.palette.bg;
    final icons =
        statusBarIcons ??
        (Theme.of(context).brightness == Brightness.dark
            ? Brightness.light
            : Brightness.dark);

    final bar = topBar;
    Widget screen = Scaffold(
      backgroundColor: background,
      resizeToAvoidBottomInset: resizeToAvoidBottomInset,
      appBar: bar == null ? null : _TopBarSlot(bar: bar, color: background),
      body: SafeArea(
        top: safeTop && bar == null,
        bottom: safeBottom && bottomBar == null,
        child: body,
      ),
      bottomNavigationBar: bottomBar,
    );

    if (showConnectivity) screen = ConnectivityWrapper(child: screen);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: _systemBarsStyle(icons),
      child: screen,
    );
  }

  /// Transparent bars, so this screen's background shows through them.
  static SystemUiOverlayStyle _systemBarsStyle(Brightness icons) {
    return SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      // Android names the icon colour; iOS names the background behind them.
      statusBarIconBrightness: icons,
      statusBarBrightness: icons == Brightness.light
          ? Brightness.dark
          : Brightness.light,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarDividerColor: Colors.transparent,
      systemNavigationBarIconBrightness: icons,
      // Without this, Android draws a dark see-through bar behind the
      // 3-button navigation.
      systemNavigationBarContrastEnforced: false,
    );
  }
}

/// Puts the top bar below the status bar and paints the screen's background
/// behind the status bar above it.
///
/// Scaffold makes room for the status bar above an AppBar, but [AppTopBar] is
/// a plain widget that doesn't add that space itself.
class _TopBarSlot extends StatelessWidget implements PreferredSizeWidget {
  const _TopBarSlot({required this.bar, required this.color});

  final PreferredSizeWidget bar;
  final Color color;

  @override
  Size get preferredSize => bar.preferredSize;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: color,
      child: SafeArea(bottom: false, child: bar),
    );
  }
}
