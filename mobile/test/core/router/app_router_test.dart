import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/feature/stub/stub_screen.dart';
import 'package:mobile/feature/support/presentation/screens/help_support_screen.dart';
import 'package:mobile/feature/wallet/presentation/screens/payment_methods_screen.dart';

/// The screen a route would show, or null when the route needs arguments
/// (a booking, a lot id...) and refused to open without them: those routes
/// have their own case, so they can't be the stub.
Widget? screenFor(BuildContext context, String name) {
  try {
    final route = AppRouter.onGenerateRoute(RouteSettings(name: name));
    return (route as MaterialPageRoute<dynamic>).builder(context);
  } catch (_) {
    return null;
  }
}

void main() {
  late BuildContext context;

  Future<void> pumpContext(WidgetTester tester) => tester.pumpWidget(
    MaterialApp(
      home: Builder(
        builder: (ctx) {
          context = ctx;
          return const SizedBox();
        },
      ),
    ),
  );

  testWidgets('every route opens its own screen, never the stub', (
    tester,
  ) async {
    await pumpContext(tester);
    final stubs = [
      for (final name in AppRouter.routes)
        if (screenFor(context, name) is StubScreen) name,
    ];
    expect(stubs, isEmpty, reason: 'These routes show the stub: $stubs');
  });

  test('lists each route once', () {
    expect(AppRouter.routes.toSet(), hasLength(AppRouter.routes.length));
  });

  testWidgets('opens Help & support and Payment methods', (tester) async {
    await pumpContext(tester);
    expect(
      screenFor(context, AppRouter.helpSupport),
      isA<HelpSupportScreen>(),
    );
    expect(
      screenFor(context, AppRouter.paymentMethods),
      isA<PaymentMethodsScreen>(),
    );
  });

  testWidgets('still shows the stub for an unknown name', (tester) async {
    await pumpContext(tester);
    expect(screenFor(context, '/no-such-screen'), isA<StubScreen>());
  });
}
