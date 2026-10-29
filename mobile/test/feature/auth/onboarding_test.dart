import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/service/onboarding_store.dart';
import 'package:mobile/feature/auth/presentation/screens/onboarding_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// The welcome screen with stand-in pages for Sign in and Sign up, which
/// need the whole app behind them.
Future<OnboardingStore> pumpOnboarding(WidgetTester tester) async {
  SharedPreferences.setMockInitialValues({});
  final store = OnboardingStore(await SharedPreferences.getInstance());
  await tester.pumpWidget(
    MaterialApp(
      onGenerateRoute: (settings) => MaterialPageRoute<void>(
        settings: settings,
        builder: (_) => Scaffold(body: Text('page ${settings.name}')),
      ),
      home: OnboardingScreen(store: store),
    ),
  );
  return store;
}

void main() {
  test('remembers that the welcome screen was seen', () async {
    SharedPreferences.setMockInitialValues({});
    final store = OnboardingStore(await SharedPreferences.getInstance());
    expect(store.isSeen, isFalse);
    await store.markSeen();
    expect(store.isSeen, isTrue);
  });

  testWidgets('shows what the app does', (tester) async {
    await pumpOnboarding(tester);
    expect(find.text('ParkEasy'), findsOneWidget);
    expect(find.text('Find nearby spots'), findsOneWidget);
    expect(find.text('Reserve in advance'), findsOneWidget);
    expect(find.text('Pay seamlessly'), findsOneWidget);
  });

  testWidgets('Get started opens sign-up, with sign-in behind it', (
    tester,
  ) async {
    final store = await pumpOnboarding(tester);
    await tester.tap(find.text('Get started'));
    await tester.pumpAndSettle();

    expect(store.isSeen, isTrue);
    expect(find.text('page /register'), findsOneWidget);
    tester.state<NavigatorState>(find.byType(Navigator)).pop();
    await tester.pumpAndSettle();
    expect(find.text('page /login'), findsOneWidget);
  });

  testWidgets('Sign in goes straight to sign-in', (tester) async {
    final store = await pumpOnboarding(tester);
    await tester.tap(find.text('Sign in'));
    await tester.pumpAndSettle();

    expect(store.isSeen, isTrue);
    expect(find.text('page /login'), findsOneWidget);
  });
}
